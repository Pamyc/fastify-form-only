"use client"

import { EventAnalysisProvider } from "@/components/event-analysis-provider"
import { Header } from "@/components/header"
import { EventsList } from "@/components/events-list"
import { ChatInterface } from "@/components/chat-interface"

export function EventAnalysisApp() {
  return (
    <EventAnalysisProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex">
          <EventsList />
          <ChatInterface />
        </main>
      </div>
    </EventAnalysisProvider>
  )
}
