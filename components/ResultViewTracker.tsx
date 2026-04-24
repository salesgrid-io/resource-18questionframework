"use client"

import { useEffect } from "react"
import { trackFunnelEvent } from "@/lib/client/tracking"

export default function ResultViewTracker({ resultId }: { resultId: string }) {
  useEffect(() => {
    const browserId = window.localStorage.getItem("urban-unity-results-browser") || crypto.randomUUID()
    const sessionId = window.localStorage.getItem("urban-unity-results-session") || crypto.randomUUID()
    window.localStorage.setItem("urban-unity-results-browser", browserId)
    window.localStorage.setItem("urban-unity-results-session", sessionId)

    void trackFunnelEvent({
      sessionId,
      browserId,
      eventType: "results_viewed",
      screen: "complete",
      resultId,
      status: "qualified",
    })
  }, [resultId])

  return null
}
