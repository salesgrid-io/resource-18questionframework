export type LeadStatus = "qualified" | "disqualified"

export type FunnelScreen =
  | "landing"
  | "quiz"
  | "analyzing"
  | "goodnews"
  | "optin"
  | "disqualified"
  | "booking"
  | "complete"
  | "generating"

export type FunnelEventType =
  | "landing_viewed"
  | "quiz_started"
  | "quiz_step_completed"
  | "quiz_resumed"
  | "quiz_completed"
  | "analysis_started"
  | "analysis_completed"
  | "opt_in_submitted"
  | "qualified_path_entered"
  | "disqualified_blueprint_requested"
  | "booking_form_completed"
  | "results_generated"
  | "results_emailed"
  | "close_synced"
  | "close_activity_created"
  | "sendblue_synced"
  | "results_viewed"
  | "automation_failed"

export type AutomationRunStatus = "queued" | "running" | "succeeded" | "failed" | "partial"
export type AutomationStepStatus = "queued" | "running" | "succeeded" | "failed" | "skipped"

export interface UtmData {
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content: string
}

export interface QuizFormState {
  name: string
  age: string
  situation: string
  changedWorldview: string
  capableOfImpact: string
  notUnderstood: string
  moneyNoFactor: string
  nichedInterest: string
  closestExpert: string
  characters: string[]
  thePast: string
  theTurningPoint: string
  thePresent: string
  theFuture: string
  values: string[]
  against: string
  whyImpact: string
  targetPerson: string
  whatToSell: string
  whyBuyFromYou: string
}

export interface OptInFormState {
  firstName: string
  lastName: string
  email: string
  phone: string
  countryCode: string
}

export interface BookingFormState {
  brandFuture: string
  whyImpact: string
}

export interface BlueprintDocument {
  headline: string
  identity_summary: string
  core_story: string
  brand_dna: string
  audience_profile: string
  offer_direction: string
  positioning_angle: string
  voice_and_tone: string
  values: string[]
  what_to_stand_against: string
  next_steps: string[]
  cta: string
}

export interface BlueprintPageData {
  firstName: string
  age: string
  situation: string
  quiz: Partial<QuizFormState>
  blueprint: BlueprintDocument
}

export interface StoredBlueprintRecord {
  _id?: unknown
  leadId: string
  publicId: string
  promptVersion: string
  rawResponse: unknown
  blueprint: BlueprintDocument
  generationStatus: "generating" | "generated" | "failed"
  createdAt: Date
  updatedAt: Date
}

export interface FunnelEventPayload {
  sessionId: string
  browserId: string
  leadId?: string | null
  eventType: FunnelEventType
  screen: FunnelScreen
  stepKey?: string | null
  stepIndex?: number | null
  status?: LeadStatus | null
  utm?: UtmData | null
  quiz?: Partial<QuizFormState> | null
  optIn?: Partial<OptInFormState> | null
  booking?: Partial<BookingFormState> | null
  resultId?: string | null
  resultUrl?: string | null
  metadata?: Record<string, unknown> | null
}

export interface LeadRecord {
  _id?: unknown
  firstName: string
  lastName: string
  email: string
  phone: string
  countryCode: string
  status: LeadStatus | null
  currentScreen: FunnelScreen
  sessionId: string
  browserId: string
  utm: UtmData
  quiz: Partial<QuizFormState>
  booking: Partial<BookingFormState>
  blueprintId?: string | null
  blueprintUrl?: string | null
  blueprintStatus?: string | null
  blueprintContent?: BlueprintDocument | BlueprintContent | null
  blueprintGeneratedAt?: Date | null
  emailStatus?: string | null
  closeSyncStatus?: string | null
  closeLeadId?: string | null
  closeContactId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface BlueprintContent {
  // Hero section
  heroMeta: {
    name: string
    age: string
    stage: string
    readinessScore: number
  }

  // Persona section
  personas: {
    noLaunch: string // 3-4 sentence description
    stalled: string // 3-4 sentence description
  }

  // Answers + Feedback section
  answerFeedback: Array<{
    questionNumber: string // "Q2", "Q3", etc.
    questionText: string
    answer: string
    feedback: Array<{
      type: "strength" | "gap" | "coaching"
      content: string
    }>
  }>

  // Origin Story section
  originStory: {
    pullQuote: string
    narrative: string
    whyItMatters: string
    coachingNote: string
  }

  // Mission & Vision section
  missionVision: {
    mission: string
    vision: string
    brandPurpose: string
    coachingNote: string
  }

  // Values section
  values: Array<{
    name: string
    definition: string
  }>
  valuesCoachingNote: string

  // Voice section
  voice: {
    is: string[] // 5 items
    isNot: string[] // 5 items
    inPractice: string
    coachingNote: string
  }

  // Audience section
  audience: {
    who: string
    psyche: string
    behavior: string
    pain: string
    desire: string
    dayInLife: string // pull quote
    coachingNote: string
  }

  // Positioning section
  positioning: {
    category: string
    edge: string
    hook: string
    promise: string
    opposition: Array<{
      label: string
      description: string
    }>
    coachingNote: string
  }

  // Score section
  scores: {
    clarityOfVision: number // 1-10
    originStoryStrength: number // 1-10
    audienceDefinition: number // 1-10
    productStrategy: number // 1-10
    competitiveMoat: number // 1-10
    executionReadiness: number // 1-10
    overall: number // Average * 10
    assessment: string // 3-4 sentence coaching assessment
  }
}
