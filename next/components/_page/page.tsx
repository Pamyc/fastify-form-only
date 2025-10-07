// next/components/_page/page.tsx
'use client'

import ThemeProvider from '@/components/theme-provider'
import { EventAnalysisProvider } from '@/components/event-analysis-provider'
import EventAnalysisApp from '@/components/event-analysis-app'

export default function PageAdapter() {
  return (
    <ThemeProvider>
      <EventAnalysisProvider>
        <EventAnalysisApp />
      </EventAnalysisProvider>
    </ThemeProvider>
  )
}
