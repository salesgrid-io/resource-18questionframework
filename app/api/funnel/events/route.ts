import { waitUntil } from "@vercel/functions"
import { NextRequest, NextResponse } from "next/server"
import { ensureIndexes, saveEvent, upsertLeadFromEvent, upsertSession, getLeadByEmail, updateLead } from "@/lib/automation/db"
import { appendMainLeadResponseToSheet, createResultIdentifiers, notifySlack } from "@/lib/automation/integrations"
import { logError, logInfo } from "@/lib/automation/logger"
import { processAutomation } from "@/lib/automation/orchestrator"
import type { FunnelEventPayload } from "@/lib/automation/types"

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as FunnelEventPayload
    await ensureIndexes()

    // Check for duplicate opt-in submissions (prevent double-click)
    if ((payload.eventType === "opt_in_submitted" || payload.eventType === "disqualified_blueprint_requested") && payload.optIn?.email) {
      const existingLead = await getLeadByEmail(payload.optIn.email)
      if (existingLead?.blueprintStatus === "generating" || existingLead?.blueprintStatus === "generated") {
        await logInfo("api.funnel.events", "Duplicate submission blocked", {
          email: payload.optIn.email,
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

    const leadId = await upsertLeadFromEvent(payload)
    payload.leadId = leadId

    await Promise.all([upsertSession(payload), saveEvent(payload)])

    if (payload.eventType === "opt_in_submitted") {
      await appendMainLeadResponseToSheet(payload)
    }

    // Pre-assign blueprint identifiers for opt-in so client can redirect immediately
    let blueprintId: string | undefined
    let blueprintUrl: string | undefined
    if (payload.eventType === "opt_in_submitted" && leadId) {
      const identifiers = createResultIdentifiers()
      blueprintId = identifiers.publicId
      blueprintUrl = identifiers.resultUrl
      await updateLead(leadId, { blueprintId, blueprintUrl })
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
    await logError("api.funnel.events", "Failed to ingest funnel event", { error: errorMessage })
    await notifySlack(`18Q Framework API Error\nEndpoint: /api/funnel/events\nError: ${errorMessage}`)
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 })
  }
}
