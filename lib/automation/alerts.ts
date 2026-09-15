import { notifySlack } from "@/lib/automation/integrations"

const ALERT_WINDOW_MS = 5 * 60 * 1000
const MAX_TRACKED_KEYS = 50

const lastAlertAt = new Map<string, number>()

// "connection 12 ... timed out" and "connection 8 ... closed" are the same
// incident, so collapse the volatile parts before de-duplicating.
function fingerprint(message: string) {
  return message.toLowerCase().replace(/\d+/g, "#").slice(0, 200)
}

function shouldAlert(message: string) {
  const key = fingerprint(message)
  const now = Date.now()
  const previous = lastAlertAt.get(key)

  if (previous && now - previous < ALERT_WINDOW_MS) {
    return false
  }

  if (lastAlertAt.size >= MAX_TRACKED_KEYS) {
    for (const [staleKey, seenAt] of lastAlertAt) {
      if (now - seenAt >= ALERT_WINDOW_MS) lastAlertAt.delete(staleKey)
    }
  }

  lastAlertAt.set(key, now)
  return true
}

// One alert per distinct failure per 5 minutes, and never throws - an alerting
// failure must not replace the error we were trying to report.
export async function notifySlackThrottled(text: string) {
  if (!shouldAlert(text)) {
    return { skipped: true as const, reason: "throttled" as const }
  }

  try {
    return await notifySlack(text)
  } catch (error) {
    console.error("[alerts] Slack notification failed", error)
    return { skipped: true as const, reason: "slack-failed" as const }
  }
}
