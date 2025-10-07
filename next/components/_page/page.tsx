// next/components/_page/page.tsx
'use client';

import ThemeProvider from '../theme-provider';
import { EventAnalysisProvider } from '../event-analysis-provider';
import EventAnalysisApp from '../event-analysis-app';

export default function PageAdapter() {
  return (
    <ThemeProvider>
      <EventAnalysisProvider>
        <EventAnalysisApp />
      </EventAnalysisProvider>
    </ThemeProvider>
  );
}
