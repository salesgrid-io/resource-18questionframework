import { randomUUID } from "crypto"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/mongodb"
import { env } from "@/lib/env"
import type { BlueprintContent, BlueprintDocument, LeadRecord, QuizFormState, OptInFormState, UtmData } from "@/lib/automation/types"

const COLLECTIONS = {
  leads: "leads",
  blueprints: "blueprints",
} as const

/**
 * Generates a unique blueprint ID
 * Uses UUID for a URL-friendly public identifier
 */
export function generateBlueprintId(): string {
  return randomUUID()
}

/**
 * Generates the full blueprint URL for a given blueprint ID
 */
export function getBlueprintUrl(blueprintId: string): string {
  const baseUrl = env.resultsBaseUrl || "http://localhost:3000"
  return `${baseUrl.replace(/\/$/, "")}/results/${blueprintId}`
}

/**
 * Creates or generates blueprint identifiers
 */
export function createBlueprintIdentifiers() {
  const blueprintId = generateBlueprintId()
  const blueprintUrl = getBlueprintUrl(blueprintId)
  return { blueprintId, blueprintUrl }
}

export interface SubmitFormData {
  quiz: Partial<QuizFormState>
  optIn: OptInFormState
  utm: UtmData
  sessionId: string
  browserId: string
  status: "qualified" | "disqualified" | null
}

/**
 * Creates or updates a lead record with full form submission data
 * Returns the lead ID and blueprint identifiers
 */
export async function createOrUpdateLeadWithBlueprint(data: SubmitFormData): Promise<{
  leadId: string
  blueprintId: string
  blueprintUrl: string
  isNewLead: boolean
}> {
  const db = await getDb()
  const now = new Date()
  const email = data.optIn.email.trim().toLowerCase()

  // Check if lead exists by email
  const existingLead = await db.collection<LeadRecord>(COLLECTIONS.leads).findOne({ email })

  const { blueprintId, blueprintUrl } = createBlueprintIdentifiers()

  const leadData = {
    firstName: data.optIn.firstName.trim(),
    lastName: data.optIn.lastName.trim(),
    email,
    phone: data.optIn.phone.trim(),
    countryCode: data.optIn.countryCode,
    status: data.status,
    currentScreen: "complete" as const,
    sessionId: data.sessionId,
    browserId: data.browserId,
    utm: data.utm,
    quiz: data.quiz,
    booking: {},
    blueprintId,
    blueprintUrl,
    blueprintStatus: "pending",
    updatedAt: now,
  }

  if (existingLead) {
    // Update existing lead
    await db.collection<LeadRecord>(COLLECTIONS.leads).updateOne(
      { _id: existingLead._id },
      {
        $set: leadData,
      }
    )
    return {
      leadId: existingLead._id!.toString(),
      blueprintId,
      blueprintUrl,
      isNewLead: false,
    }
  }

  // Create new lead
  const result = await db.collection(COLLECTIONS.leads).insertOne({
    ...leadData,
    createdAt: now,
    emailStatus: null,
    closeSyncStatus: null,
    closeLeadId: null,
    closeContactId: null,
  })

  return {
    leadId: result.insertedId.toString(),
    blueprintId,
    blueprintUrl,
    isNewLead: true,
  }
}

/**
 * Updates blueprint status for a lead
 */
export async function updateBlueprintStatus(
  leadId: string,
  status: "pending" | "generating" | "generated" | "failed",
  extraData?: Record<string, unknown>
) {
  const db = await getDb()
  await db.collection(COLLECTIONS.leads).updateOne(
    { _id: new ObjectId(leadId) },
    {
      $set: {
        blueprintStatus: status,
        updatedAt: new Date(),
        ...extraData,
      },
    }
  )
}

/**
 * Gets a lead by blueprint ID
 */
export async function getLeadByBlueprintId(blueprintId: string): Promise<LeadRecord | null> {
  const db = await getDb()
  return db.collection<LeadRecord>(COLLECTIONS.leads).findOne({ blueprintId })
}

/**
 * Updates email status for a lead
 */
export async function updateEmailStatus(
  leadId: string,
  status: "pending" | "sent" | "failed",
  metadata?: Record<string, unknown>
) {
  const db = await getDb()
  await db.collection(COLLECTIONS.leads).updateOne(
    { _id: new ObjectId(leadId) },
    {
      $set: {
        emailStatus: status,
        emailMetadata: metadata,
        updatedAt: new Date(),
      },
    }
  )
}

/**
 * Generates a full blueprint URL for a given ID
 * Uses RESULTS_BASE_URL env var or falls back to localhost
 */
export function generateBlueprintUrl(id: string): string {
  const baseUrl = env.resultsBaseUrl || "http://localhost:3000"
  return `${baseUrl.replace(/\/$/, "")}/results/${id}`
}

/**
 * Saves blueprint content to a lead record in MongoDB
 */
export async function saveBlueprintContent(
  leadId: string,
  content: BlueprintContent | BlueprintDocument
): Promise<void> {
  const db = await getDb()
  const now = new Date()
  await db.collection(COLLECTIONS.leads).updateOne(
    { _id: new ObjectId(leadId) },
    {
      $set: {
        blueprintContent: content,
        blueprintGeneratedAt: now,
        blueprintStatus: "generated",
        updatedAt: now,
      },
    }
  )
}

/**
 * Gets blueprint content by blueprint ID (public ID)
 * Looks up either in leads collection or blueprints collection
 */
export async function getBlueprintContent(
  blueprintId: string
): Promise<BlueprintContent | BlueprintDocument | null> {
  const db = await getDb()

  // First check the leads collection for inline blueprint content
  const lead = await db.collection<LeadRecord>(COLLECTIONS.leads).findOne({ blueprintId })
  if (lead?.blueprintContent) {
    return lead.blueprintContent
  }

  // Fall back to blueprints collection
  const blueprintRecord = await db.collection(COLLECTIONS.blueprints).findOne({ publicId: blueprintId })
  if (blueprintRecord?.blueprint) {
    return blueprintRecord.blueprint as BlueprintDocument
  }

  return null
}
