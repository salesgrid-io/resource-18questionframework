import { randomUUID } from "crypto"
import {
  createAutomationRun,
  createAutomationStep,
  createBlueprint,
  finalizeAutomationRun,
  finalizeAutomationStep,
  getLeadById,
  insertLog,
  saveEvent,
  updateLead,
} from "@/lib/automation/db"
import { logError, logInfo } from "@/lib/automation/logger"
import {
  appendMainLeadResponseToSheet,
  createCloseActivity,
  createResultIdentifiers,
  formatIntegrationError,
  generateBlueprintFromClaude,
  notifySlack,
  sendResultsEmail,
  syncLeadToClose,
} from "@/lib/automation/integrations"
import type { FunnelEventPayload } from "@/lib/automation/types"

async function runStep<T>(
  runId: string,
  stepKey: string,
  provider: string,
  handler: () => Promise<T>,
  requestSummary?: unknown,
) {
  const stepId = await createAutomationStep(runId, stepKey, provider)
  try {
    const result = await handler()
    await finalizeAutomationStep(stepId, "succeeded", {
      requestSummary,
      responseSummary: result,
    })
    return result
  } catch (error) {
    const message = formatIntegrationError(error)
    await finalizeAutomationStep(stepId, "failed", {
      requestSummary,
      errorMessage: message,
    })
    throw error
  }
}

function shouldStartAutomation(payload: FunnelEventPayload) {
  return payload.eventType === "opt_in_submitted" || payload.eventType === "disqualified_blueprint_requested"
}

export async function processAutomation(payload: FunnelEventPayload, leadId: string | null) {
  if (!leadId || !shouldStartAutomation(payload)) {
    return null
  }

  const runId = await createAutomationRun(leadId, payload.eventType)

  try {
    // Mark as generating immediately to prevent duplicate processing
    await updateLead(leadId, { blueprintStatus: "generating" })

    const lead = await getLeadById(leadId)
    if (!lead) {
      throw new Error("Lead not found for automation.")
    }

    await logInfo("automation", "Automation run started", { runId, leadId, trigger: payload.eventType })

    // Reuse pre-assigned identifiers if already set (by events route), otherwise create new ones
    const existingPublicId = lead.blueprintId as string | undefined
    const { publicId, resultUrl } = existingPublicId
      ? { publicId: existingPublicId, resultUrl: lead.blueprintUrl as string }
      : createResultIdentifiers()

    // Update lead with blueprint URL (no-op if already set, ensures consistency)
    await updateLead(leadId, {
      blueprintId: publicId,
      blueprintUrl: resultUrl,
    })

    // SEND EMAIL FIRST - user gets link immediately while blueprint generates
    const emailResult = await runStep(runId, "send_results_email", "resend", () => sendResultsEmail(lead, resultUrl))
    await updateLead(leadId, { emailStatus: "sent" })
    await saveEvent({
      ...payload,
      leadId,
      eventType: "results_emailed",
      resultId: publicId,
      resultUrl,
      metadata: typeof emailResult === "object" ? (emailResult as Record<string, unknown>) : null,
    })

    // Google Sheets - fire and forget, don't block blueprint generation
    try {
      await runStep(runId, "google_sheets_append", "google-sheets", () =>
        appendMainLeadResponseToSheet({ ...payload, leadId }),
      )
    } catch (sheetsError) {
      await logError("automation", "Google Sheets append failed but continuing", { runId, leadId, error: formatIntegrationError(sheetsError) })
    }

    // Close sync - don't let failures block blueprint generation
    try {
      const closeSync = await runStep(runId, "close_sync_initial", "close", () => syncLeadToClose(lead))
      if (!("skipped" in closeSync && closeSync.skipped)) {
        await updateLead(leadId, {
          closeLeadId: closeSync.closeLeadId,
          closeContactId: closeSync.closeContactId,
          closeSyncStatus: "synced",
        })
        await saveEvent({
          ...payload,
          leadId,
          eventType: "close_synced",
        })

        // Create custom activity (01.1 New Activity) after lead sync
        try {
          await runStep(runId, "close_create_activity", "close", () => createCloseActivity(closeSync.closeLeadId!))
          await saveEvent({
            ...payload,
            leadId,
            eventType: "close_activity_created",
          })
        } catch (activityError) {
          await logError("automation", "Close activity creation failed but continuing", { runId, leadId, error: formatIntegrationError(activityError) })
        }
      }
    } catch (closeError) {
      await logError("automation", "Close sync failed but continuing", { runId, leadId, error: formatIntegrationError(closeError) })
    }

    // Generate blueprint (slow) - email already sent, user can wait or check later
    const blueprintResult = await runStep(runId, "generate_blueprint", "anthropic", () =>
      generateBlueprintFromClaude({ lead, resultUrlPlaceholder: resultUrl }),
    )

    await runStep(runId, "store_blueprint", "mongo", async () => {
      await createBlueprint(leadId, publicId, blueprintResult.blueprint, blueprintResult.rawResponse)
      return { publicId }
    })

    await updateLead(leadId, { blueprintStatus: "generated" })

    await saveEvent({
      ...payload,
      leadId,
      eventType: "results_generated",
      resultId: publicId,
      resultUrl,
    })

    // Final Close sync - don't let failures affect success
    try {
      const closeEnrichmentLead = await getLeadById(leadId)
      if (closeEnrichmentLead) {
        await runStep(runId, "close_sync_enriched", "close", () => syncLeadToClose(closeEnrichmentLead))
        await updateLead(leadId, {
          closeSyncStatus: "synced",
        })
      }
    } catch (closeError) {
      await logError("automation", "Close enrichment sync failed", { runId, leadId, error: formatIntegrationError(closeError) })
    }

    await finalizeAutomationRun(runId, "succeeded", { resultId: publicId, resultUrl })
    return { runId, resultId: publicId, resultUrl }
  } catch (error) {
    const message = formatIntegrationError(error)
    await finalizeAutomationRun(runId, "failed", { errorMessage: message })
    await logError("automation", "Automation run failed", { runId, leadId, error: message })
    await insertLog({
      level: "error",
      scope: "automation",
      message: "Automation run failed",
      context: { runId, leadId, error: message, correlationId: randomUUID() },
    })
    await saveEvent({
      ...payload,
      leadId,
      eventType: "automation_failed",
      metadata: { message, runId },
    })
    await notifySlack(`Urban Unity automation failed\nRun: ${runId}\nLead: ${leadId}\nError: ${message}`)
    throw error
  }
}
