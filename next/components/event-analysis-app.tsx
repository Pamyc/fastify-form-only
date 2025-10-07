// next/components/event-analysis-app.tsx
"use client"

import { EventAnalysisProvider } from "./event-analysis-provider"
import { Header } from "./header"
import { EventsList } from "./events-list"
import { ChatInterface } from "./chat-interface"

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
