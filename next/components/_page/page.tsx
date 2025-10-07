import dynamic from "next/dynamic"

const EventAnalysisApp = dynamic(() => import("@/components/event-analysis-app").then((mod) => mod.EventAnalysisApp), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center text-lg">Загрузка...</div>,
})

export default function Home() {
  return <EventAnalysisApp />
}
