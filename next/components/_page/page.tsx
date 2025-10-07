// next/components/_page/page.tsx
'use client'

import { ThemeProvider } from '@/components/theme-provider' // <- изменил на именованный импорт для консистентности
import { EventAnalysisProvider } from '@/components/event-analysis-provider'
import { EventAnalysisApp } from '@/components/event-analysis-app' // <- ГЛАВНОЕ ИСПРАВЛЕНИЕ ЗДЕСЬ

export default function PageAdapter() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <EventAnalysisApp />
    </ThemeProvider>
  )
}
