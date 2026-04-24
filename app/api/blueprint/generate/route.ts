import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/mongodb"
import { generateBlueprintUrl, saveBlueprintContent, createBlueprintIdentifiers } from "@/lib/blueprint"
import { generateBlueprintFromClaude } from "@/lib/automation/integrations"
import { logError, logInfo } from "@/lib/automation/logger"
import type { LeadRecord, QuizFormState, OptInFormState, BlueprintContent, BlueprintDocument } from "@/lib/automation/types"

interface GenerateRequestBody {
  leadId?: string
  quizData?: Partial<QuizFormState>
  optInData?: OptInFormState
}

function validateRequest(body: unknown): body is GenerateRequestBody {
  if (!body || typeof body !== "object") {
    return false
  }

  const data = body as Record<string, unknown>

  // Must have either leadId OR both quizData and optInData
  if (data.leadId && typeof data.leadId === "string") {
    return true
  }

  if (data.quizData && typeof data.quizData === "object" && data.optInData && typeof data.optInData === "object") {
    const optIn = data.optInData as Record<string, unknown>
    // Validate required opt-in fields
    if (
      typeof optIn.firstName !== "string" ||
      typeof optIn.lastName !== "string" ||
      typeof optIn.email !== "string"
    ) {
      return false
    }
    return true
  }

  return false
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!validateRequest(body)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid request body. Required: leadId OR (quizData and optInData)",
        },
        { status: 400 }
      )
    }

    const db = await getDb()
    let lead: LeadRecord | null = null
    let leadId: string

    // Fetch lead data from MongoDB if leadId provided
    if (body.leadId) {
      leadId = body.leadId
      try {
        lead = await db.collection<LeadRecord>("leads").findOne({ _id: new ObjectId(body.leadId) })
      } catch {
        return NextResponse.json(
          { ok: false, error: "Invalid leadId format" },
          { status: 400 }
        )
      }

      if (!lead) {
        return NextResponse.json(
          { ok: false, error: "Lead not found" },
          { status: 404 }
        )
      }
    } else {
      // Create a temporary lead structure from provided data
      const now = new Date()
      const { blueprintId, blueprintUrl } = createBlueprintIdentifiers()

      const newLead: Omit<LeadRecord, "_id"> = {
        firstName: body.optInData!.firstName.trim(),
        lastName: body.optInData!.lastName.trim(),
        email: body.optInData!.email.trim().toLowerCase(),
        phone: body.optInData!.phone?.trim() ?? "",
        countryCode: body.optInData!.countryCode ?? "",
        status: null,
        currentScreen: "complete",
        sessionId: "",
        browserId: "",
        utm: {
          utm_source: "",
          utm_medium: "",
          utm_campaign: "",
          utm_content: "",
        },
        quiz: body.quizData ?? {},
        booking: {},
        blueprintId,
        blueprintUrl,
        blueprintStatus: "generating",
        createdAt: now,
        updatedAt: now,
      }

      const result = await db.collection("leads").insertOne(newLead)
      leadId = result.insertedId.toString()
      lead = { ...newLead, _id: result.insertedId } as LeadRecord
    }

    // Update status to generating
    await db.collection("leads").updateOne(
      { _id: new ObjectId(leadId) },
      { $set: { blueprintStatus: "generating", updatedAt: new Date() } }
    )

    await logInfo("api.blueprint.generate", "Starting blueprint generation", {
      leadId,
      email: lead.email,
    })

    // Ensure lead has a blueprintId and blueprintUrl
    let blueprintId = lead.blueprintId
    let blueprintUrl = lead.blueprintUrl

    if (!blueprintId) {
      const identifiers = createBlueprintIdentifiers()
      blueprintId = identifiers.blueprintId
      blueprintUrl = identifiers.blueprintUrl

      await db.collection("leads").updateOne(
        { _id: new ObjectId(leadId) },
        {
          $set: {
            blueprintId,
            blueprintUrl,
            updatedAt: new Date(),
          },
        }
      )
    }

    // Call Claude API to generate blueprint content
    const { blueprint, rawResponse } = await generateBlueprintFromClaude({
      lead,
      resultUrlPlaceholder: blueprintUrl!,
    })

    // Save the generated content to the lead record
    await saveBlueprintContent(leadId, blueprint)

    // Also store in the blueprints collection for redundancy
    await db.collection("blueprints").updateOne(
      { publicId: blueprintId },
      {
        $set: {
          leadId,
          publicId: blueprintId,
          promptVersion: "v1",
          rawResponse,
          blueprint,
          generationStatus: "generated",
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    )

    await logInfo("api.blueprint.generate", "Blueprint generated successfully", {
      leadId,
      blueprintId,
    })

    return NextResponse.json({
      ok: true,
      blueprintId,
      blueprintUrl,
      content: blueprint,
    })
  } catch (error) {
    await logError("api.blueprint.generate", "Failed to generate blueprint", {
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
