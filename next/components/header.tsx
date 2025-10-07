"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, RefreshCw, Search } from "lucide-react"
import { useEventAnalysis } from "@/components/event-analysis-provider"

export function Header() {
  const { leadId, setLeadId, load, loading, stats, references, error, filters, setFilters, filteredEvents } =
    useEventAnalysis()
  const [inputLeadId, setInputLeadId] = useState(leadId)

  useEffect(() => {
    setInputLeadId(leadId)
  }, [leadId])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setLeadId(inputLeadId)
    void load(inputLeadId)
  }

  const remainingImages = Math.max(stats.total - stats.imagesRecognized, 0)
  const remainingAudio = Math.max(stats.total - stats.audioRecognized - stats.audioFailed, 0)

  const summary = useMemo(() => {
    if (!stats.total) return "События не загружены"
    const imagesTotal = stats.imagesRecognized + remainingImages
    const audioTotal = stats.audioRecognized + remainingAudio
    const imagesDenominator = imagesTotal || stats.total || 1
    const audioDenominator = audioTotal || stats.total || 1
    return `Загружено событий: ${stats.total} • Изображений распознано ${stats.imagesRecognized}/${imagesDenominator} • Аудио распознано ${stats.audioRecognized}/${audioDenominator} (ошибок: ${stats.audioFailed})`
  }, [stats, remainingImages, remainingAudio])

  return (
    <header className="border-b bg-card">
      <div className="px-6 py-4 space-y-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <div>
              <div className="text-sm text-muted-foreground">ID сделки</div>
              <Input
                value={inputLeadId}
                onChange={(event) => setInputLeadId(event.target.value)}
                placeholder="Введите ID сделки"
                className="mt-1 w-48"
              />
            </div>
            <Button type="submit" className="mt-3 sm:mt-8" disabled={loading}>
              {loading ? "Загрузка..." : "Загрузить из API"}
            </Button>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Button type="button" variant="ghost" size="sm" disabled={loading || !stats.total}>
              Распознать изображения
            </Button>
            <div className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : "text-muted-foreground"}`} />
              <span>{loading ? "Обработка..." : "Готово"}</span>
            </div>
            <span>Осталось аудио: {remainingAudio}</span>
          </div>
        </form>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Button type="button" variant="outline" size="sm" className="gap-2 bg-transparent" disabled>
            <Download className="w-4 h-4" />
            Загрузить
            <span className="ml-1 text-muted-foreground">{stats.audioRecognized}</span>
          </Button>
          <Select
            value={filters.type}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, type: value as typeof prev.type }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Все типы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все типы</SelectItem>
              <SelectItem value="incoming">Входящие</SelectItem>
              <SelectItem value="outgoing">Исходящие</SelectItem>
              <SelectItem value="missed">Пропущенные</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={filters.query}
              onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
              placeholder="Текст, телефон, автор, ID..."
              className="pl-9"
            />
          </div>
          <Select
            value={filters.sort}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, sort: value as typeof prev.sort }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Сначала старые" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="old">Сначала старые</SelectItem>
              <SelectItem value="new">Сначала новые</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <div className="text-sm text-muted-foreground space-y-1">
          <div>
            Справочники: пользователей — {references?.users ?? "—"}, воронок — {references?.pipelines ?? "—"}, статусов —
            {references?.statuses ?? "—"}
          </div>
          <div>{summary}</div>
          <div>Отфильтровано событий: {filteredEvents.length}</div>
        </div>
      </div>
    </header>
  )
}
