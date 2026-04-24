import { NextRequest, NextResponse } from "next/server"
import { createOrUpdateLeadWithBlueprint, type SubmitFormData } from "@/lib/blueprint"
import { ensureIndexes, saveEvent } from "@/lib/automation/db"
import { logError, logInfo } from "@/lib/automation/logger"
import { processAutomation } from "@/lib/automation/orchestrator"
import type { FunnelEventPayload, QuizFormState, OptInFormState, UtmData } from "@/lib/automation/types"

interface SubmitRequestBody {
  quiz: Partial<QuizFormState>
  optIn: OptInFormState
  utm?: Partial<UtmData>
  sessionId: string
  browserId: string
  status?: "qualified" | "disqualified" | null
}

function validateRequest(body: unknown): body is SubmitRequestBody {
  if (!body || typeof body !== "object") {
    return false
  }

  const data = body as Record<string, unknown>

  // Check required fields
  if (!data.quiz || typeof data.quiz !== "object") {
    return false
  }

  if (!data.optIn || typeof data.optIn !== "object") {
    return false
  }

  const optIn = data.optIn as Record<string, unknown>
  if (
    typeof optIn.firstName !== "string" ||
    typeof optIn.lastName !== "string" ||
    typeof optIn.email !== "string" ||
    typeof optIn.phone !== "string"
  ) {
    return false
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(optIn.email as string)) {
    return false
  }

  if (typeof data.sessionId !== "string" || !data.sessionId) {
    return false
  }

  if (typeof data.browserId !== "string" || !data.browserId) {
    return false
  }

  return true
}

function normalizeUtm(utm?: Partial<UtmData>): UtmData {
  return {
    utm_source: utm?.utm_source ?? "",
    utm_medium: utm?.utm_medium ?? "",
    utm_campaign: utm?.utm_campaign ?? "",
    utm_content: utm?.utm_content ?? "",
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    if (!validateRequest(body)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid request body. Required: quiz, optIn (firstName, lastName, email, phone), sessionId, browserId",
        },
        { status: 400 }
      )
    }

    await ensureIndexes()

    // Prepare submission data
    const submitData: SubmitFormData = {
      quiz: body.quiz,
      optIn: body.optIn,
      utm: normalizeUtm(body.utm),
      sessionId: body.sessionId,
      browserId: body.browserId,
      status: body.status ?? null,
    }

    // Create or update lead with blueprint ID
    const { leadId, blueprintId, blueprintUrl, isNewLead } = await createOrUpdateLeadWithBlueprint(submitData)

    await logInfo("api.funnel.submit", "Form submission received", {
      leadId,
      blueprintId,
      isNewLead,
      email: submitData.optIn.email,
    })

    // Create funnel event payload for automation
    const eventPayload: FunnelEventPayload = {
      sessionId: body.sessionId,
      browserId: body.browserId,
      leadId,
      eventType: "opt_in_submitted",
      screen: "optin",
      status: body.status ?? null,
      utm: submitData.utm,
      quiz: body.quiz,
      optIn: body.optIn,
      resultId: blueprintId,
      resultUrl: blueprintUrl,
    }

    // Save the submission event
    await saveEvent(eventPayload)

    // Trigger automation (blueprint generation, email, Close sync)
    // This runs asynchronously but we await it to ensure it starts
    let automationResult = null
    try {
      automationResult = await processAutomation(eventPayload, leadId)
    } catch (automationError) {
      // Log but don't fail the request - the lead is saved
      await logError("api.funnel.submit", "Automation failed but lead saved", {
        leadId,
        blueprintId,
        error: automationError instanceof Error ? automationError.message : String(automationError),
      })
    }

    // Return success with redirect info
    return NextResponse.json({
      ok: true,
      leadId,
      blueprintId,
      blueprintUrl,
      redirectUrl: `/thank-you?id=${blueprintId}`,
      automation: automationResult,
    })
  } catch (error) {
    await logError("api.funnel.submit", "Failed to process form submission", {
      error: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    )
  }
}
