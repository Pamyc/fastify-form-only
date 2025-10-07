"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react"
import {
  ReferenceStats,
  fetchLeadTimeline,
  fetchReferenceStats,
  requestGemini,
} from "../lib/event-analysis-client"

export type SimplifiedEvent = {
  id: string
  typeCode: number | null
  title: string
  description: string
  createdAtSec: number | null
  createdAtLabel: string
  author?: string
  icon: "call-incoming" | "call-outgoing" | "call-missed" | "email" | "location" | "note" | "system"
  raw: any
  ocrText?: string | null
  asrText?: string | null
}

export type EventFilters = {
  type: "all" | "incoming" | "outgoing" | "missed" | "email" | "note" | "system"
  query: string
  sort: "old" | "new"
}

type EventAnalysisContextValue = {
  leadId: string
  setLeadId: (value: string) => void
  events: SimplifiedEvent[]
  filteredEvents: SimplifiedEvent[]
  loading: boolean
  error: string | null
  stats: {
    total: number
    imagesRecognized: number
    audioRecognized: number
    audioFailed: number
  }
  references: ReferenceStats | null
  filters: EventFilters
  setFilters: Dispatch<SetStateAction<EventFilters>>
  load: (leadId?: string) => Promise<void>
  sendPrompt: (prompt: string, attachData: boolean) => Promise<{ text: string; finalPrompt: string; eventCount: number }>
  getPromptPreview: (prompt: string, attachData: boolean) => { charCount: number; eventCount: number }
}

const EventAnalysisContext = createContext<EventAnalysisContextValue | undefined>(undefined)

function ensureEventId(raw: any): string {
  const candidates = [raw?.id, raw?.note_id, raw?.uuid]
  for (const candidate of candidates) {
    if (candidate == null) continue
    const value = String(candidate)
    if (value) return value
  }
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `event-${Math.random().toString(36).slice(2, 11)}`
}

function extractNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function extractCreatedAtSec(raw: any): number | null {
  const candidates = [raw?.created_at, raw?.date_create, raw?.msec_created_at, raw?.created_at_ts]
  for (const candidate of candidates) {
    const num = extractNumber(candidate)
    if (num == null) continue
    if (num > 1_000_000_000_000) return Math.round(num / 1000)
    if (num > 0) return Math.round(num)
  }
  return null
}

function formatDateTimeLabel(sec: number | null): string {
  if (!sec) return ""
  const date = new Date(sec * 1000)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleString("ru-RU", {
    dateStyle: "short",
    timeStyle: "medium",
  })
}

const CALL_OUTGOING = new Set([11, 30])
const CALL_INCOMING = new Set([10, 17])
const CALL_MISSED = new Set([12, 13])

function inferIcon(typeCode: number | null, raw: any): SimplifiedEvent["icon"] {
  if (typeCode != null) {
    if (CALL_OUTGOING.has(typeCode)) return "call-outgoing"
    if (CALL_INCOMING.has(typeCode)) return "call-incoming"
    if (CALL_MISSED.has(typeCode)) return "call-missed"
    if (typeCode === 27) return "email"
  }

  const params = raw?.data?.params ?? raw?.params ?? {}
  if (params?.geo_lat && params?.geo_lng) return "location"
  return typeCode != null ? "system" : "note"
}

function extractText(raw: any): string {
  const params = raw?.data?.params ?? raw?.params ?? {}
  const candidates = [raw?.data?.text, raw?.text, params.call_text, params.text, params.note]
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim()
    }
  }
  return ""
}

function extractTitle(raw: any, fallbackType: number | null): string {
  const directTitle = raw?.data?.title ?? raw?.title ?? raw?.name
  if (typeof directTitle === "string" && directTitle.trim()) return directTitle.trim()
  const text = extractText(raw)
  if (text) return text.split("\n")[0]?.slice(0, 120) || text
  if (fallbackType === 27) return "Письмо"
  if (fallbackType != null) return `Событие #${fallbackType}`
  return "Событие"
}

function serializeEventsForPrompt(events: any[]): { payload: any[]; json: string } {
  const payload = events.map((ev) => ({
    id: ev?.id ?? ev?.note_id ?? null,
    type: ev?.type ?? ev?.note_type ?? null,
    title: extractTitle(ev, ev?.type ?? ev?.note_type ?? null),
    createdAtSec: extractCreatedAtSec(ev),
    author: ev?.author_name ?? ev?.created_by_name ?? ev?.user ?? null,
    text: extractText(ev),
    params: ev?.data?.params ?? ev?.params ?? {},
    ocrText: ev?.ocrText ?? ev?.ocr_text ?? ev?.data?.ocrText ?? ev?.data?.ocr_text ?? null,
    asrText: ev?.asrText ?? ev?.asr_text ?? ev?.data?.asrText ?? ev?.data?.asr_text ?? null,
    asrChunks: ev?.asrChunks ?? ev?.asr_chunks ?? null,
  }))

  return { payload, json: JSON.stringify(payload, null, 2) }
}

function simplifyEvent(raw: any): SimplifiedEvent {
  const typeCode = extractNumber(raw?.type ?? raw?.note_type) ?? null
  const createdAtSec = extractCreatedAtSec(raw)
  const description = extractText(raw)
  const title = extractTitle(raw, typeCode)
  const author = raw?.author_name ?? raw?.created_by_name ?? raw?.user ?? undefined
  const icon = inferIcon(typeCode, raw)
  const ocrText = raw?.ocrText ?? raw?.ocr_text ?? raw?.data?.ocrText ?? raw?.data?.ocr_text ?? null
  const asrText = raw?.asrText ?? raw?.asr_text ?? raw?.data?.asrText ?? raw?.data?.asr_text ?? null

  return {
    id: ensureEventId(raw),
    typeCode,
    title,
    description,
    createdAtSec,
    createdAtLabel: formatDateTimeLabel(createdAtSec),
    author,
    icon,
    raw,
    ocrText,
    asrText,
  }
}

function computeStats(events: SimplifiedEvent[]): EventAnalysisContextValue["stats"] {
  let imagesRecognized = 0
  let audioRecognized = 0
  let audioFailed = 0

  events.forEach((ev) => {
    if (ev.ocrText) imagesRecognized += 1
    if (ev.asrText) audioRecognized += 1
    const raw = ev.raw
    if (raw?.asrAudioLoadFailed || raw?.asr_failed || raw?.data?.asr_failed) {
      audioFailed += 1
    }
  })

  return {
    total: events.length,
    imagesRecognized,
    audioRecognized,
    audioFailed,
  }
}

export function EventAnalysisProvider({
  children,
  initialLeadId,
}: {
  children: ReactNode
  initialLeadId?: string
}) {
  const [leadId, setLeadId] = useState(initialLeadId || process.env.NEXT_PUBLIC_DEFAULT_LEAD_ID || "")
  const [events, setEvents] = useState<SimplifiedEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [references, setReferences] = useState<ReferenceStats | null>(null)
  const [filters, setFilters] = useState<EventFilters>({ type: "all", query: "", sort: "old" })
  const [stats, setStats] = useState<EventAnalysisContextValue["stats"]>({
    total: 0,
    imagesRecognized: 0,
    audioRecognized: 0,
    audioFailed: 0,
  })

  const hasLoadedRefs = useRef(false)
  const abortRef = useRef<AbortController | null>(null)

  const load = useCallback(
    async (requestedId?: string) => {
      const trimmed = (requestedId ?? leadId).trim()
      if (!trimmed) {
        setError("Укажите ID сделки")
        return
      }

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      setError(null)

      try {
        const items = await fetchLeadTimeline(trimmed, 100, controller.signal)
        const simplified = items.map(simplifyEvent)
        setEvents(simplified)
        setStats(computeStats(simplified))
        setLeadId(trimmed)

        if (!hasLoadedRefs.current) {
          try {
            const refStats = await fetchReferenceStats(controller.signal)
            setReferences(refStats)
            hasLoadedRefs.current = true
          } catch (refError) {
            console.warn("Не удалось загрузить справочники", refError)
          }
        }
      } catch (e) {
        if ((e as Error)?.name === "AbortError") return
        const message = e instanceof Error ? e.message : String(e)
        console.error("[event-analysis] Не удалось загрузить события сделки", e)
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [leadId],
  )

  useEffect(() => {
    if (leadId) {
      load(leadId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => () => abortRef.current?.abort(), [])

  const filteredEvents = useMemo(() => {
    let data = [...events]
    if (filters.type !== "all") {
      data = data.filter((event) => {
        if (filters.type === "incoming") return event.icon === "call-incoming"
        if (filters.type === "outgoing") return event.icon === "call-outgoing"
        if (filters.type === "missed") return event.icon === "call-missed"
        if (filters.type === "email") return event.icon === "email"
        if (filters.type === "note") return event.icon === "note"
        if (filters.type === "system") return event.icon === "system"
        return true
      })
    }

    const query = filters.query.trim().toLowerCase()
    if (query) {
      data = data.filter((event) => {
        const haystack = [event.title, event.description, event.author].filter(Boolean).join(" ").toLowerCase()
        return haystack.includes(query)
      })
    }

    if (filters.sort === "new") {
      data = [...data].sort((a, b) => (b.createdAtSec ?? 0) - (a.createdAtSec ?? 0))
    } else {
      data = [...data].sort((a, b) => (a.createdAtSec ?? 0) - (b.createdAtSec ?? 0))
    }

    return data
  }, [events, filters])

  const sendPrompt = useCallback<EventAnalysisContextValue["sendPrompt"]>(
    async (prompt, attachData) => {
      const trimmed = prompt.trim()
      if (!trimmed) {
        throw new Error("Введите запрос")
      }

      let finalPrompt = trimmed
      let eventCount = 0

      if (attachData && filteredEvents.length > 0) {
        const { json, payload } = serializeEventsForPrompt(filteredEvents.map((event) => event.raw))
        eventCount = payload.length
        finalPrompt = `${trimmed}\n\nПроанализируй следующие данные о событиях в сделке (в формате JSON):\n\n${json}`
      }

      const text = await requestGemini(finalPrompt)
      return { text, finalPrompt, eventCount }
    },
    [filteredEvents],
  )

  const getPromptPreview = useCallback<EventAnalysisContextValue["getPromptPreview"]>(
    (prompt, attachData) => {
      const trimmed = prompt.trim()
      if (!attachData || filteredEvents.length === 0) {
        return { charCount: trimmed.length, eventCount: 0 }
      }

      const { json, payload } = serializeEventsForPrompt(filteredEvents.map((event) => event.raw))
      const final = `${trimmed}\n\nПроанализируй следующие данные о событиях в сделке (в формате JSON):\n\n${json}`
      return { charCount: final.length, eventCount: payload.length }
    },
    [filteredEvents],
  )

  const value = useMemo<EventAnalysisContextValue>(
    () => ({
      leadId,
      setLeadId,
      events,
      filteredEvents,
      loading,
      error,
      stats,
      references,
      filters,
      setFilters,
      load,
      sendPrompt,
      getPromptPreview,
    }),
    [leadId, events, filteredEvents, loading, error, stats, references, filters, load, sendPrompt, getPromptPreview],
  )

  return <EventAnalysisContext.Provider value={value}>{children}</EventAnalysisContext.Provider>
}

export function useEventAnalysis() {
  const ctx = useContext(EventAnalysisContext)
  if (!ctx) {
    throw new Error("useEventAnalysis должен использоваться внутри EventAnalysisProvider")
  }
  return ctx
}
