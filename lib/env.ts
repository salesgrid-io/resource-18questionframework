const requiredInProduction = process.env.NODE_ENV === "production"

function readEnv(name: string) {
  return process.env[name]?.trim() || ""
}

function optional(name: string) {
  return readEnv(name) || null
}

function required(name: string) {
  const value = readEnv(name)
  if (!value && requiredInProduction) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri: required("MONGODB_URI"),
  mongodbDbName: required("MONGODB_DB_NAME"),
  googleServiceAccountEmail: optional("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
  googlePrivateKey: optional("GOOGLE_PRIVATE_KEY")?.replace(/\\n/g, "\n") ?? null,
  googleSheetsId: optional("GOOGLE_SHEETS_ID"),
  slackWebhookUrl: optional("SLACK_WEBHOOK_URL"),
  anthropicApiKey: optional("ANTHROPIC_API_KEY"),
  resultsBaseUrl: optional("RESULTS_BASE_URL"),
  adminSharedPassword: required("ADMIN_SHARED_PASSWORD"),
  emailProviderApiKey: optional("EMAIL_PROVIDER_API_KEY"),
  emailFromAddress: optional("EMAIL_FROM_ADDRESS"),
  closeApiKey: optional("CLOSE_API_KEY"),
  closeApiBaseUrl: optional("CLOSE_API_BASE_URL") || "https://api.close.com/api/v1",
  closeDefaultStatusId: optional("CLOSE_DEFAULT_STATUS_ID"),
  closeCfQualificationStatus: optional("CLOSE_CF_QUALIFICATION_STATUS"),
  closeCfResultsUrl: optional("CLOSE_CF_RESULTS_URL"),
  closeCfUtmSource: optional("CLOSE_CF_UTM_SOURCE"),
  closeCfUtmMedium: optional("CLOSE_CF_UTM_MEDIUM"),
  closeCfUtmCampaign: optional("CLOSE_CF_UTM_CAMPAIGN"),
  closeCfQuizCompletedAt: optional("CLOSE_CF_QUIZ_COMPLETED_AT"),
  closeCfBookingCompletedAt: optional("CLOSE_CF_BOOKING_COMPLETED_AT"),
  closeCfLeadEntrySource: optional("CLOSE_CF_LEAD_ENTRY_SOURCE"),
  closeCfSourcePlatform: optional("CLOSE_CF_SOURCE_PLATFORM"),
  closeCfSourceFunnel: optional("CLOSE_CF_SOURCE_FUNNEL"),
  closeCfSourceContent: optional("CLOSE_CF_SOURCE_CONTENT"),
  closeActivityNewLead: optional("CLOSE_ACTIVITY_NEW_LEAD"),
  closeActivityCfDate: optional("CLOSE_ACTIVITY_CF_DATE"),
  closeActivityCfType: optional("CLOSE_ACTIVITY_CF_TYPE"),
  sendblueKeyId: optional("SENDBLUE_KEY_ID"),
  sendblueSecretKey: optional("SENDBLUE_SECRET_KEY"),
} as const

export function isConfigured(...values: Array<string | null>) {
  return values.every((value) => Boolean(value))
}
