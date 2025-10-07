"use client"

import { useEffect, useMemo, useState } from "react"
import { Phone, PhoneIncoming, PhoneOutgoing, Mail, MapPin, FileText } from "lucide-react"
import { ScrollArea } from "./ui/scroll-area"
import { cn } from "@/lib/utils" // <-- Этот алиас скорее всего сработает, т.к. он ведет в другую папку (lib)
import { useEventAnalysis } from "./event-analysis-provider"

const ICON_MAP = {
  "call-outgoing": { icon: PhoneOutgoing, bg: "bg-blue-50", color: "text-blue-500" },
  "call-incoming": { icon: PhoneIncoming, bg: "bg-green-50", color: "text-green-500" },
  "call-missed": { icon: Phone, bg: "bg-red-50", color: "text-red-500" },
  email: { icon: Mail, bg: "bg-orange-50", color: "text-orange-500" },
  location: { icon: MapPin, bg: "bg-purple-50", color: "text-purple-500" },
  note: { icon: FileText, bg: "bg-muted", color: "text-muted-foreground" },
  system: { icon: FileText, bg: "bg-muted", color: "text-muted-foreground" },
} as const

type IconKey = keyof typeof ICON_MAP

export function EventsList() {
  const { filteredEvents, loading, error, stats } = useEventAnalysis()
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  useEffect(() => {
    if (filteredEvents.length) {
      setSelectedEventId(filteredEvents[0].id)
    } else {
      setSelectedEventId(null)
    }
  }, [filteredEvents])

  const selectedEvent = useMemo(
    () => filteredEvents.find((event) => event.id === selectedEventId) ?? null,
    [filteredEvents, selectedEventId],
  )

  return (
    <div className="w-full max-w-[420px] border-r bg-card">
      <div className="p-4 border-b space-y-1">
        <h2 className="font-semibold flex items-center gap-2">
          <span>События</span>
          <span className="text-sm text-muted-foreground">({stats.total})</span>
        </h2>
        {loading && <p className="text-xs text-muted-foreground">Загружаем события...</p>}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="divide-y">
          {filteredEvents.map((event, index) => {
            const iconKey: IconKey = event.icon in ICON_MAP ? (event.icon as IconKey) : "note"
            const IconComponent = ICON_MAP[iconKey].icon
            return (
              <button
                key={event.id}
                onClick={() => setSelectedEventId(event.id)}
                className={cn(
                  "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                  selectedEventId === event.id && "bg-muted",
                )}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", ICON_MAP[iconKey].bg)}>
                      <IconComponent className={cn("w-5 h-5", ICON_MAP[iconKey].color)} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="text-sm text-muted-foreground">{index + 1}/{stats.total}</div>
                      {event.createdAtLabel && (
                        <div className="text-xs text-muted-foreground whitespace-nowrap">{event.createdAtLabel}</div>
                      )}
                    </div>
                    <div className="font-medium text-sm mb-1 line-clamp-2">{event.title}</div>
                    {event.description && (
                      <div className="text-sm text-muted-foreground line-clamp-2 mb-2">{event.description}</div>
                    )}
                    {event.author && <div className="text-xs text-muted-foreground">Автор: {event.author}</div>}
                  </div>
                </div>
              </button>
            )
          })}

          {!loading && !filteredEvents.length && (
            <div className="p-6 text-sm text-muted-foreground">Данные по событиям не найдены. Попробуйте загрузить снова.</div>
          )}
        </div>
      </ScrollArea>

      {selectedEvent && (
        <div className="border-t p-4 space-y-2 text-sm bg-muted/50">
          <div className="font-semibold">Детали события</div>
          {selectedEvent.createdAtLabel && <div>Время: {selectedEvent.createdAtLabel}</div>}
          {selectedEvent.author && <div>Автор: {selectedEvent.author}</div>}
          {selectedEvent.description && <div className="whitespace-pre-wrap">{selectedEvent.description}</div>}
        </div>
      )}
    </div>
  )
}
