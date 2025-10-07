// next/components/_page/page.tsx
'use client'

// Заменяем алиасы на относительные пути для исправления ошибки сборки
import { ThemeProvider } from '../theme-provider'
import { EventAnalysisApp } from '../event-analysis-app'

// EventAnalysisProvider уже находится внутри EventAnalysisApp, поэтому здесь он не нужен

export default function PageAdapter() {
  return (
    <ThemeProvider>
      <EventAnalysisApp />
    </ThemeProvider>
  )
}
