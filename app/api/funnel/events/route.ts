import { waitUntil } from "@vercel/functions"
import { NextRequest, NextResponse } from "next/server"
import { ensureIndexes, saveEvent, upsertLeadFromEvent, upsertSession, getLeadByEmail, updateLead } from "@/lib/automation/db"
import { appendMainLeadResponseToSheet, createResultIdentifiers } from "@/lib/automation/integrations"
import { notifySlackThrottled } from "@/lib/automation/alerts"
import { logError, logInfo } from "@/lib/automation/logger"
import { withMongoRetry, isTransientMongoError } from "@/lib/automation/retry"
import { processAutomation } from "@/lib/automation/orchestrator"
import type { FunnelEventPayload } from "@/lib/automation/types"

export const maxDuration = 300

export async function POST(request: NextRequest) {
  // Kept outside the try so the catch block can report which event failed.
  let eventType: string | undefined
  let sessionId: string | undefined

  try {
    const payload = (await request.json()) as FunnelEventPayload
    eventType = payload.eventType
    sessionId = payload.sessionId

    // Index creation must never block a lead: the indexes already exist in
    // production, so a slow build is not a reason to reject the event.
    try {
      await ensureIndexes()
    } catch (error) {
      await logError("api.funnel.events", "ensureIndexes failed (continuing)", {
        error: error instanceof Error ? error.message : String(error),
      })
    }

    // Check for duplicate opt-in submissions (prevent double-click)
    const optInEmail = payload.optIn?.email
    if ((payload.eventType === "opt_in_submitted" || payload.eventType === "disqualified_blueprint_requested") && optInEmail) {
      const existingLead = await withMongoRetry(() => getLeadByEmail(optInEmail))
      if (existingLead?.blueprintStatus === "generating" || existingLead?.blueprintStatus === "generated") {
        await logInfo("api.funnel.events", "Duplicate submission blocked", {
          email: optInEmail,
          existingStatus: existingLead.blueprintStatus,
        })
        return NextResponse.json({
          ok: true,
          leadId: existingLead._id?.toString(),
          duplicate: true,
          message: "Blueprint already being generated",
        })
      }
    }

    const leadId = await withMongoRetry(() => upsertLeadFromEvent(payload))
    payload.leadId = leadId

    await withMongoRetry(() => Promise.all([upsertSession(payload), saveEvent(payload)]))

    if (payload.eventType === "opt_in_submitted") {
      // The lead is already persisted, so a Sheets hiccup should not cost the
      // visitor their redirect - record it and move on.
      try {
        await appendMainLeadResponseToSheet(payload)
      } catch (error) {
        await logError("api.funnel.events", "Sheet append failed", {
          leadId,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // Pre-assign blueprint identifiers for opt-in so client can redirect immediately
    let blueprintId: string | undefined
    let blueprintUrl: string | undefined
    if (payload.eventType === "opt_in_submitted" && leadId) {
      const identifiers = createResultIdentifiers()
      blueprintId = identifiers.publicId
      blueprintUrl = identifiers.resultUrl
      await withMongoRetry(() => updateLead(leadId, { blueprintId, blueprintUrl }))
    }

    // Run automation in background using Vercel waitUntil - keeps function alive
    waitUntil(
      processAutomation(payload, leadId).catch(async (error) => {
        await logError("api.funnel.events.background", "Background automation failed", {
          leadId,
          error: error instanceof Error ? error.message : String(error),
        })
      })
    )

    return NextResponse.json({
      ok: true,
      leadId,
      ...(blueprintId && { blueprintId, blueprintUrl }),
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const transient = isTransientMongoError(error)

    await logError("api.funnel.events", "Failed to ingest funnel event", {
      error: errorMessage,
      transient,
      eventType,
      sessionId,
    })
    await notifySlackThrottled(
      `18Q Framework API Error\nEndpoint: /api/funnel/events\nEvent: ${eventType ?? "unknown"}\nTransient: ${transient}\nError: ${errorMessage}`,
    )

    // 503 marks retryable infrastructure trouble rather than a malformed
    // request, keeping transient blips out of the bucket that looks like a bug.
    return NextResponse.json(
      { ok: false, error: errorMessage, retryable: transient },
      { status: transient ? 503 : 500, headers: transient ? { "Retry-After": "2" } : undefined },
    )
  }
}
