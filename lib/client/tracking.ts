"use client"

import type { FunnelEventPayload } from "@/lib/automation/types"

export async function trackFunnelEvent(payload: FunnelEventPayload) {
  const response = await fetch("/api/funnel/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Failed to track funnel event: ${response.status}`)
  }

  return response.json()
}
