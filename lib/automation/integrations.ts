import { google } from "googleapis"
import { randomUUID } from "crypto"
import { env, isConfigured } from "@/lib/env"
import { logWarn } from "@/lib/automation/logger"
import { sendEmail, isEmailConfigured } from "@/lib/email"
import { BlueprintEmail } from "@/components/emails/BlueprintEmail"
import { generateBlueprintContent } from "@/lib/claude"
import type { BlueprintContent, FunnelEventPayload, LeadRecord } from "@/lib/automation/types"

const CLOSE_DEFAULTS = {
  defaultStatusId: "stat_JyOefbVWUsX5gGOOn6GCJ26aFku1R8KWYdhTlobyfcI",
  leadEntrySourceFieldId: "cf_faPuz1wmtY61mrv5CEQwAqhYtAa5RME4JSyZmZ4BVaT",
  sourcePlatformFieldId: "cf_ZnIXR9jCO4pI9t0WDBT9ozvBCAA3dli1XzK2dgMVSGD",
  sourceFunnelFieldId: "cf_QHnC4lKyZaKjpIjoSoon2exp9oRWSrEMeRMbBidAS1Y",
  sourceContentFieldId: "cf_pjUMCZWvAdpTsyqiX8K3xbb3WVsDNimD3ggk5sC4Fub",
  leadEntrySourceValue: "Resource 18q Framework",
  sourceFunnelValue: "Resource 18q Framework",
  sourcePlatformValue: "18 Question Framework",
  // Custom Activity: 01.1 New Activity
  newActivityTypeId: "actitype_4qhrkF0QsXr21eK3o2qNr3",
  activityDateFieldId: "cf_dowXZCDf79QMkymHkUShoaL7fIn7QcLI6ywfIIIEpKd",
  activityTypeFieldId: "cf_QcUPqKkOHBQzp5grl1v203CBMEftfHMWNxvDc60Z5CW",
  activityTypeValue: "Resource 18q Framework",
} as const

function summarizeError(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

function extractJsonPayload(text: string) {
  const trimmed = text.trim()
  if (!trimmed.startsWith("```")) {
    return trimmed
  }

  return trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim()
}

function getResultsUrl(publicId: string) {
  const base = env.resultsBaseUrl || "http://localhost:3000"
  return `${base.replace(/\/$/, "")}/results/${publicId}`
}

export async function appendSheetRow(tabName: string, values: Array<string | number | boolean | null | undefined>) {
  if (!isConfigured(env.googleServiceAccountEmail, env.googlePrivateKey, env.googleSheetsId)) {
    return { skipped: true, reason: "Google Sheets not configured" as const }
  }

  try {
    const auth = new google.auth.JWT({
      email: env.googleServiceAccountEmail!,
      key: env.googlePrivateKey!,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })
    await sheets.spreadsheets.values.append({
      spreadsheetId: env.googleSheetsId!,
      range: `${tabName}!A:Z`,
      valueInputOption: "RAW",
      requestBody: {
        values: [values.map((value) => (value == null ? "" : String(value)))],
      },
    })

    return { skipped: false }
  } catch (error) {
    const reason = summarizeError(error)
    await logWarn("integrations.google-sheets", "Google Sheets append failed", {
      tabName,
      reason,
    })
    return { skipped: true, reason }
  }
}

export async function appendMainLeadResponseToSheet(payload: FunnelEventPayload) {
  if (payload.eventType !== "opt_in_submitted") {
    return { skipped: true, reason: "Not an opt-in submission" as const }
  }

  const firstName = payload.optIn?.firstName?.trim() ?? ""
  const lastName = payload.optIn?.lastName?.trim() ?? ""
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim() || payload.quiz?.name?.trim() || ""
  const phone = payload.optIn?.phone?.trim() ?? ""
  const countryCode = payload.optIn?.countryCode?.replace(/^\+/, "") ?? ""

  const responsesBlob = {
    lead: {
      name: fullName,
      firstName,
      lastName,
      email: payload.optIn?.email ?? "",
      phone: payload.optIn?.phone ?? "",
      countryCode: payload.optIn?.countryCode ?? "",
    },
    attribution: {
      leadEntrySource: CLOSE_DEFAULTS.leadEntrySourceValue,
      sourceFunnel: CLOSE_DEFAULTS.sourceFunnelValue,
      sourceContent: payload.utm?.utm_content ?? "",
      sourcePlatform: payload.utm?.utm_source ?? "",
      utm_source: payload.utm?.utm_source ?? "",
      utm_medium: payload.utm?.utm_medium ?? "",
      utm_campaign: payload.utm?.utm_campaign ?? "",
      utm_content: payload.utm?.utm_content ?? "",
    },
    quiz: payload.quiz ?? {},
    booking: payload.booking ?? {},
    status: payload.status ?? "",
    submittedAt: new Date().toISOString(),
    sessionId: payload.sessionId,
    leadId: payload.leadId ?? null,
  }

  return appendSheetRow("Main", [
    new Date().toLocaleString("en-US", { hour12: false }),
    randomUUID(),
    CLOSE_DEFAULTS.leadEntrySourceValue,
    fullName,
    payload.optIn?.email ?? "",
    countryCode,
    phone,
    payload.utm?.utm_source ?? "",
    payload.utm?.utm_campaign ?? "",
    CLOSE_DEFAULTS.sourceFunnelValue,
    "",
    payload.utm?.utm_content ?? "",
    JSON.stringify(responsesBlob),
  ])
}

export async function notifySlack(text: string, blocks?: unknown[]) {
  if (!env.slackWebhookUrl) {
    return { skipped: true, reason: "Slack not configured" as const }
  }
  const response = await fetch(env.slackWebhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, blocks }),
  })

  if (!response.ok) {
    throw new Error(`Slack webhook failed with ${response.status}`)
  }

  return { skipped: false }
}

export async function generateBlueprintFromClaude(input: {
  lead: LeadRecord
  resultUrlPlaceholder: string
}): Promise<{ blueprint: BlueprintContent; rawResponse: unknown }> {
  const blueprint = await generateBlueprintContent(input.lead.quiz)
  return { blueprint, rawResponse: { source: "lib/claude.ts", model: "claude-sonnet-4-20250514" } }
}

export async function sendResultsEmail(lead: LeadRecord, resultUrl: string) {
  if (!isEmailConfigured()) {
    return { skipped: true, reason: "Email provider not configured" as const }
  }

  const firstName = lead.firstName || lead.quiz?.name?.split(" ")[0] || "there"

  const result = await sendEmail({
    to: lead.email,
    subject: "Your 18 Question Framework Blueprint is Ready",
    react: BlueprintEmail({ firstName, blueprintUrl: resultUrl }),
  })

  if (!result.success) {
    throw new Error(`Email send failed: ${result.error}`)
  }

  return { success: true, id: result.id }
}

function closeHeaders() {
  const token = Buffer.from(`${env.closeApiKey}:`).toString("base64")
  return {
    Authorization: `Basic ${token}`,
    "Content-Type": "application/json",
  }
}

function setCloseCustomField(target: Record<string, unknown>, fieldId: string | null | undefined, value: unknown) {
  if (!fieldId || value == null || value === "") {
    return
  }
  target[`custom.${fieldId}`] = value
}

export async function syncLeadToClose(lead: LeadRecord) {
  if (!env.closeApiKey) {
    return { skipped: true, reason: "Close API not configured" as const }
  }

  const searchResponse = await fetch(`${env.closeApiBaseUrl}/data/search/`, {
    method: "POST",
    headers: closeHeaders(),
    body: JSON.stringify({
      query: {
        type: "and",
        queries: [
          { type: "object_type", object_type: "contact" },
          {
            type: "has_related",
            this_object_type: "contact",
            related_object_type: "contact_email",
            related_query: {
              type: "field_condition",
              field: {
                object_type: "contact_email",
                type: "regular_field",
                field_name: "email",
              },
              condition: {
                type: "text",
                mode: "phrase",
                value: lead.email,
              },
            },
          },
        ],
      },
      _fields: {
        contact: ["id", "lead_id", "name"],
      },
      results_limit: 2,
    }),
  })

  if (!searchResponse.ok) {
    throw new Error(`Close search failed with ${searchResponse.status}: ${await searchResponse.text()}`)
  }

  const searchData = await searchResponse.json()
  const contacts = searchData?.data ?? []

  if (contacts.length > 1) {
    throw new Error("Close sync found multiple matching contacts for the same email.")
  }

  // Parse name into first/last - Close API requires first_name and last_name for contacts
  const quizNameParts = (lead.quiz?.name?.trim() || "").split(" ")
  const firstName = lead.firstName?.trim() || quizNameParts[0] || (lead.email ? lead.email.split("@")[0] : "Unknown")
  const lastName = lead.lastName?.trim() || quizNameParts.slice(1).join(" ") || ""
  const displayName = [firstName, lastName].filter(Boolean).join(" ")

  const contactData = {
    first_name: firstName,
    last_name: lastName || firstName, // Close requires last_name, use firstName as fallback
    emails: lead.email ? [{ email: lead.email, type: "office" }] : [],
    phones: lead.phone ? [{ phone: `${lead.countryCode || ""}${lead.phone}`, type: "office" }] : [],
  }
  const leadPayload: Record<string, unknown> = {
    name: displayName,
    description: `Urban Unity funnel lead (${lead.status ?? "unknown"})`,
    contacts: [contactData],
  }

  leadPayload.status_id = env.closeDefaultStatusId || CLOSE_DEFAULTS.defaultStatusId

  if (env.closeCfQualificationStatus && lead.status) {
    leadPayload[`custom.${env.closeCfQualificationStatus}`] = lead.status
  }
  if (env.closeCfResultsUrl && lead.blueprintUrl) {
    leadPayload[`custom.${env.closeCfResultsUrl}`] = lead.blueprintUrl
  }
  if (env.closeCfUtmSource) {
    leadPayload[`custom.${env.closeCfUtmSource}`] = lead.utm.utm_source
  }
  if (env.closeCfUtmMedium) {
    leadPayload[`custom.${env.closeCfUtmMedium}`] = lead.utm.utm_medium
  }
  if (env.closeCfUtmCampaign) {
    leadPayload[`custom.${env.closeCfUtmCampaign}`] = lead.utm.utm_campaign
  }

  setCloseCustomField(
    leadPayload,
    env.closeCfLeadEntrySource || CLOSE_DEFAULTS.leadEntrySourceFieldId,
    CLOSE_DEFAULTS.leadEntrySourceValue,
  )
  setCloseCustomField(
    leadPayload,
    env.closeCfSourcePlatform || CLOSE_DEFAULTS.sourcePlatformFieldId,
    lead.utm.utm_source || CLOSE_DEFAULTS.sourcePlatformValue,
  )
  setCloseCustomField(
    leadPayload,
    env.closeCfSourceFunnel || CLOSE_DEFAULTS.sourceFunnelFieldId,
    CLOSE_DEFAULTS.sourceFunnelValue,
  )
  setCloseCustomField(
    leadPayload,
    env.closeCfSourceContent || CLOSE_DEFAULTS.sourceContentFieldId,
    lead.utm.utm_content || lead.utm.utm_campaign,
  )

  if (contacts.length === 1) {
    const existing = contacts[0]
    // For updates, don't include contacts array - update contact separately
    const { contacts: _ignored, ...leadUpdatePayload } = leadPayload
    await fetch(`${env.closeApiBaseUrl}/lead/${existing.lead_id}/`, {
      method: "PUT",
      headers: closeHeaders(),
      body: JSON.stringify(leadUpdatePayload),
    })

    await fetch(`${env.closeApiBaseUrl}/contact/${existing.id}/`, {
      method: "PUT",
      headers: closeHeaders(),
      body: JSON.stringify(contactData),
    })

    return {
      closeLeadId: existing.lead_id as string,
      closeContactId: existing.id as string,
    }
  }

  const createLeadResponse = await fetch(`${env.closeApiBaseUrl}/lead/`, {
    method: "POST",
    headers: closeHeaders(),
    body: JSON.stringify(leadPayload),
  })

  if (!createLeadResponse.ok) {
    throw new Error(`Close lead create failed with ${createLeadResponse.status}: ${await createLeadResponse.text()}`)
  }

  const createdLead = await createLeadResponse.json()
  const createdContactId = createdLead.contacts?.[0]?.id || null

  return {
    closeLeadId: createdLead.id as string,
    closeContactId: createdContactId as string,
  }
}

/**
 * Gets the current authenticated user's ID from Close
 */
async function getCloseUserId(): Promise<string> {
  const response = await fetch(`${env.closeApiBaseUrl}/me/`, {
    method: "GET",
    headers: closeHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Close /me/ failed with ${response.status}: ${await response.text()}`)
  }

  const data = await response.json()
  return data.id as string
}

/**
 * Creates a custom activity (01.1 New Activity) for a lead in Close
 * This should be called after syncLeadToClose to log the opt-in event
 */
export async function createCloseActivity(closeLeadId: string) {
  if (!env.closeApiKey) {
    return { skipped: true, reason: "Close API not configured" as const }
  }

  // Get the current user ID (required for activity creation)
  const userId = await getCloseUserId()

  const activityPayload: Record<string, unknown> = {
    lead_id: closeLeadId,
    user_id: userId,
    custom_activity_type_id: CLOSE_DEFAULTS.newActivityTypeId,
    status: "published",
  }

  // Set the activity date to now in ISO format
  activityPayload[`custom.${CLOSE_DEFAULTS.activityDateFieldId}`] = new Date().toISOString()
  // Set the activity type field value
  activityPayload[`custom.${CLOSE_DEFAULTS.activityTypeFieldId}`] = CLOSE_DEFAULTS.activityTypeValue

  const response = await fetch(`${env.closeApiBaseUrl}/activity/custom/`, {
    method: "POST",
    headers: closeHeaders(),
    body: JSON.stringify(activityPayload),
  })

  if (!response.ok) {
    throw new Error(`Close activity create failed with ${response.status}: ${await response.text()}`)
  }

  const createdActivity = await response.json()
  return {
    activityId: createdActivity.id as string,
  }
}

export function createResultIdentifiers() {
  const publicId = randomUUID()
  return {
    publicId,
    resultUrl: getResultsUrl(publicId),
  }
}

export function formatIntegrationError(error: unknown) {
  return summarizeError(error)
}
