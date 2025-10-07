"use client"

import { useMemo, useState } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { ScrollArea } from "./ui/scroll-area"
import { Copy } from "lucide-react"
import { useEventAnalysis } from "./event-analysis-provider"

export type ChatMessage = {
  id: number
  role: "assistant" | "user"
  content: string
  timestamp: string
  error?: boolean
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

const PROMPTS = [
  { id: 1, label: "Проанализируй все события сделки" },
  { id: 2, label: "Покажи статистику по звонкам" },
  { id: 3, label: "Какие задачи требуют внимания?" },
]

export function ChatInterface() {
  const { filteredEvents, sendPrompt, getPromptPreview } = useEventAnalysis()
  const [message, setMessage] = useState("")
  const [selectedPrompt, setSelectedPrompt] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      content: "Привет! Я готов помочь вам с анализом событий сделки. Задайте вопрос или используйте готовый промпт.",
      timestamp: formatTime(new Date()),
    },
  ])
  const [attachData, setAttachData] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const preview = useMemo(() => getPromptPreview(message, attachData), [message, attachData, getPromptPreview])
  const wordCount = useMemo(() => {
    const trimmed = message.trim()
    if (!trimmed) return 0
    return trimmed.split(/\s+/).length
  }, [message])

  const handlePromptSelect = (promptId: number, label: string) => {
    setSelectedPrompt(promptId)
    setMessage(label)
  }

  const handleSend = async () => {
    if (!message.trim() || isSending) return

    const timestamp = formatTime(new Date())
    const newMessage: ChatMessage = {
      id: messages.length + 1,
      role: "user",
      content: message,
      timestamp,
    }
    setMessages((prev) => [...prev, newMessage])
    setMessage("")
    setSelectedPrompt(null)
    setIsSending(true)

    try {
      const { text } = await sendPrompt(newMessage.content, attachData)
      const assistantMessage: ChatMessage = {
        id: newMessage.id + 1,
        role: "assistant",
        content: text,
        timestamp: formatTime(new Date()),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("[event-analysis] Ошибка при отправке запроса в нейросеть", error)
      const assistantMessage: ChatMessage = {
        id: newMessage.id + 1,
        role: "assistant",
        content: error instanceof Error ? error.message : String(error),
        timestamp: formatTime(new Date()),
        error: true,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={
                msg.role === "assistant"
                  ? "bg-card border rounded-lg p-6 relative"
                  : "bg-primary/10 border border-primary/20 rounded-lg p-6 relative ml-12"
              }
            >
              {msg.role === "assistant" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4"
                  onClick={() => navigator.clipboard.writeText(msg.content)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              )}
              <p className={msg.error ? "text-destructive" : "text-foreground"}>{msg.content}</p>
              <div className="text-xs text-muted-foreground mt-4">{msg.timestamp}</div>
            </div>
          ))}

          <div className="space-y-4 pt-4">
            <div className="text-sm font-medium text-foreground">Ваш запрос к нейросети по текущим событиям:</div>
            <div className="flex flex-wrap gap-3">
              {PROMPTS.map((prompt) => (
                <Button
                  key={prompt.id}
                  variant={selectedPrompt === prompt.id ? "default" : "outline"}
                  onClick={() => handlePromptSelect(prompt.id, prompt.label)}
                  className="flex-1 min-w-[160px]"
                >
                  {prompt.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="border-t bg-card p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                handleSend()
              }
            }}
            placeholder="Введите ваш запрос..."
            className="min-h-[100px] resize-none"
            disabled={isSending}
          />
          <div className="flex items-center justify-between flex-wrap gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={attachData}
                onChange={(event) => setAttachData(event.target.checked)}
                className="rounded border-input"
                disabled={!filteredEvents.length}
              />
              Добавить данные событий ({filteredEvents.length})
            </label>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setMessage("")} disabled={!message}>
                Сбросить
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={handleSend}
                disabled={isSending || !message.trim()}
              >
                {isSending ? "Отправка..." : "Отправить"}
              </Button>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Будет отправлен {attachData && filteredEvents.length ? `ваш вопрос + ${preview.eventCount} событий` : "только ваш вопрос"} (всего
            {" "}
            {preview.charCount} симв., {wordCount} слов)
          </div>
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                const { charCount, eventCount } = preview
                const summary = attachData
                  ? `Добавлено событий: ${eventCount}. Итоговый размер промта: ${charCount} символов.`
                  : `Итоговый размер промта: ${charCount} символов.`
                alert(summary)
              }}
            >
              Json
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
