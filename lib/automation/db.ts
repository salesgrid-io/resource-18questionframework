import { ObjectId } from "mongodb"
import { getDb } from "@/lib/mongodb"
import type { AutomationRunStatus, AutomationStepStatus, BlueprintContent, BlueprintDocument, FunnelEventPayload, LeadRecord } from "@/lib/automation/types"

type MaybeId = string | null | undefined

const COLLECTIONS = {
  leads: "leads",
  sessions: "funnel_sessions",
  events: "funnel_events",
  runs: "automation_runs",
  steps: "automation_steps",
  logs: "automation_logs",
  blueprints: "blueprints",
} as const

export async function ensureIndexes() {
  const db = await getDb()
  await Promise.all([
    db.collection(COLLECTIONS.leads).createIndex({ email: 1 }),
    db.collection(COLLECTIONS.leads).createIndex({ sessionId: 1 }),
    db.collection(COLLECTIONS.sessions).createIndex({ sessionId: 1 }, { unique: true }),
    db.collection(COLLECTIONS.events).createIndex({ sessionId: 1, occurredAt: -1 }),
    db.collection(COLLECTIONS.runs).createIndex({ leadId: 1, startedAt: -1 }),
    db.collection(COLLECTIONS.steps).createIndex({ runId: 1, startedAt: 1 }),
    db.collection(COLLECTIONS.blueprints).createIndex({ publicId: 1 }, { unique: true }),
  ])
}

export async function upsertSession(payload: FunnelEventPayload) {
  const db = await getDb()
  const now = new Date()
  await db.collection(COLLECTIONS.sessions).updateOne(
    { sessionId: payload.sessionId },
    {
      $set: {
        browserId: payload.browserId,
        leadId: payload.leadId ?? null,
        currentScreen: payload.screen,
        currentStep: payload.stepIndex ?? null,
        resumedAt: payload.eventType === "quiz_resumed" ? now : null,
        updatedAt: now,
        abandoned: false,
      },
      $setOnInsert: {
        sessionId: payload.sessionId,
        startedAt: now,
      },
    },
    { upsert: true },
  )
}

export async function saveEvent(payload: FunnelEventPayload) {
  const db = await getDb()
  const doc = {
    sessionId: payload.sessionId,
    browserId: payload.browserId,
    leadId: payload.leadId ?? null,
    eventType: payload.eventType,
    screen: payload.screen,
    stepKey: payload.stepKey ?? null,
    stepIndex: payload.stepIndex ?? null,
    status: payload.status ?? null,
    utm: payload.utm ?? null,
    quiz: payload.quiz ?? null,
    optIn: payload.optIn ?? null,
    booking: payload.booking ?? null,
    resultId: payload.resultId ?? null,
    resultUrl: payload.resultUrl ?? null,
    metadata: payload.metadata ?? null,
    source: "client",
    occurredAt: new Date(),
  }
  const result = await db.collection(COLLECTIONS.events).insertOne(doc)
  return result.insertedId.toString()
}

export async function upsertLeadFromEvent(payload: FunnelEventPayload) {
  const db = await getDb()
  const now = new Date()
  const email = payload.optIn?.email?.trim().toLowerCase() || ""
  const filter = email ? { email } : { sessionId: payload.sessionId }

  const update = {
    $set: {
      sessionId: payload.sessionId,
      browserId: payload.browserId,
      firstName: payload.optIn?.firstName ?? "",
      lastName: payload.optIn?.lastName ?? "",
      email,
      phone: payload.optIn?.phone ?? "",
      countryCode: payload.optIn?.countryCode ?? "",
      status: payload.status ?? null,
      currentScreen: payload.screen,
      utm: payload.utm ?? {
        utm_source: "",
        utm_medium: "",
        utm_campaign: "",
        utm_content: "",
      },
      quiz: payload.quiz ?? {},
      booking: payload.booking ?? {},
      updatedAt: now,
    },
    $setOnInsert: {
      createdAt: now,
      blueprintStatus: null,
      emailStatus: null,
      closeSyncStatus: null,
      closeLeadId: null,
      closeContactId: null,
    },
  }

  const result = await db.collection<LeadRecord>(COLLECTIONS.leads).findOneAndUpdate(filter, update, {
    upsert: true,
    returnDocument: "after",
  })

  return result?._id?.toString() ?? null
}

export async function createAutomationRun(leadId: MaybeId, triggerEvent: string) {
  const db = await getDb()
  const now = new Date()
  const result = await db.collection(COLLECTIONS.runs).insertOne({
    leadId: leadId ?? null,
    triggerEvent,
    status: "running" satisfies AutomationRunStatus,
    startedAt: now,
    finishedAt: null,
    createdAt: now,
    updatedAt: now,
  })
  return result.insertedId.toString()
}

export async function finalizeAutomationRun(runId: string, status: AutomationRunStatus, extra?: Record<string, unknown>) {
  const db = await getDb()
  await db.collection(COLLECTIONS.runs).updateOne(
    { _id: new ObjectId(runId) },
    {
      $set: {
        status,
        finishedAt: new Date(),
        updatedAt: new Date(),
        ...extra,
      },
    },
  )
}

export async function createAutomationStep(runId: string, stepKey: string, provider: string) {
  const db = await getDb()
  const now = new Date()
  const result = await db.collection(COLLECTIONS.steps).insertOne({
    runId,
    stepKey,
    provider,
    status: "running" satisfies AutomationStepStatus,
    retryCount: 0,
    requestSummary: null,
    responseSummary: null,
    errorMessage: null,
    startedAt: now,
    finishedAt: null,
    createdAt: now,
    updatedAt: now,
  })
  return result.insertedId.toString()
}

export async function finalizeAutomationStep(
  stepId: string,
  status: AutomationStepStatus,
  data?: {
    requestSummary?: unknown
    responseSummary?: unknown
    errorMessage?: string | null
  },
) {
  const db = await getDb()
  await db.collection(COLLECTIONS.steps).updateOne(
    { _id: new ObjectId(stepId) },
    {
      $set: {
        status,
        requestSummary: data?.requestSummary ?? null,
        responseSummary: data?.responseSummary ?? null,
        errorMessage: data?.errorMessage ?? null,
        finishedAt: new Date(),
        updatedAt: new Date(),
      },
    },
  )
}

export async function insertLog(entry: {
  level: "info" | "warn" | "error"
  scope: string
  message: string
  context?: Record<string, unknown>
}) {
  const db = await getDb()
  await db.collection(COLLECTIONS.logs).insertOne({
    ...entry,
    timestamp: new Date(),
  })
}

export async function updateLead(leadId: string, patch: Record<string, unknown>) {
  const db = await getDb()
  await db.collection(COLLECTIONS.leads).updateOne(
    { _id: new ObjectId(leadId) },
    {
      $set: {
        ...patch,
        updatedAt: new Date(),
      },
    },
  )
}

export async function createBlueprint(leadId: string, publicId: string, blueprint: BlueprintDocument | BlueprintContent, rawResponse: unknown) {
  const db = await getDb()
  const now = new Date()
  const result = await db.collection(COLLECTIONS.blueprints).insertOne({
    leadId,
    publicId,
    promptVersion: "v1",
    rawResponse,
    blueprint,
    generationStatus: "generated",
    createdAt: now,
    updatedAt: now,
  })
  return result.insertedId.toString()
}

export async function getBlueprintByPublicId(publicId: string) {
  const db = await getDb()
  return db.collection(COLLECTIONS.blueprints).findOne({ publicId })
}

export async function getBlueprintWithLead(publicId: string) {
  const db = await getDb()
  const blueprintRecord = await db.collection(COLLECTIONS.blueprints).findOne({ publicId })
  if (!blueprintRecord) return null

  const lead = blueprintRecord.leadId
    ? await db.collection<LeadRecord>(COLLECTIONS.leads).findOne({ _id: new ObjectId(blueprintRecord.leadId) })
    : null

  return { blueprintRecord, lead }
}

export async function getLeadById(id: string) {
  const db = await getDb()
  return db.collection<LeadRecord>(COLLECTIONS.leads).findOne({ _id: new ObjectId(id) })
}

export async function getLeadByEmail(email: string) {
  const db = await getDb()
  return db.collection<LeadRecord>(COLLECTIONS.leads).findOne({ email: email.trim().toLowerCase() })
}

export async function getLeadByBlueprintId(blueprintId: string) {
  const db = await getDb()
  return db.collection<LeadRecord>(COLLECTIONS.leads).findOne({ blueprintId })
}

export async function getLeadBySessionId(sessionId: string) {
  const db = await getDb()
  return db.collection<LeadRecord>(COLLECTIONS.leads).findOne({ sessionId })
}

export async function listRuns(limit = 50, skip = 0) {
  const db = await getDb()
  return db.collection(COLLECTIONS.runs).find({}).sort({ startedAt: -1 }).skip(skip).limit(limit).toArray()
}

export async function countRuns() {
  const db = await getDb()
  const [total, succeeded, failed] = await Promise.all([
    db.collection(COLLECTIONS.runs).countDocuments({}),
    db.collection(COLLECTIONS.runs).countDocuments({ status: "succeeded" }),
    db.collection(COLLECTIONS.runs).countDocuments({ status: "failed" }),
  ])
  return { total, succeeded, failed }
}

export async function countLeads() {
  const db = await getDb()
  return db.collection(COLLECTIONS.leads).countDocuments({})
}

export async function getRunById(id: string) {
  const db = await getDb()
  const [run, steps, logs] = await Promise.all([
    db.collection(COLLECTIONS.runs).findOne({ _id: new ObjectId(id) }),
    db.collection(COLLECTIONS.steps).find({ runId: id }).sort({ startedAt: 1 }).toArray(),
    db.collection(COLLECTIONS.logs).find({ "context.runId": id }).sort({ timestamp: 1 }).toArray(),
  ])
  return { run, steps, logs }
}

export async function listRecentLeads(limit = 50) {
  const db = await getDb()
  return db.collection<LeadRecord>(COLLECTIONS.leads).find({}).sort({ updatedAt: -1 }).limit(limit).toArray()
}
