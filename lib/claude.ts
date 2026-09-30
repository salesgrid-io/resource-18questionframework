import Anthropic from "@anthropic-ai/sdk"
import { env } from "@/lib/env"
import type { QuizFormState, BlueprintContent } from "@/lib/automation/types"

let anthropicClient: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    if (!env.anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured")
    }
    anthropicClient = new Anthropic({
      apiKey: env.anthropicApiKey,
    })
  }
  return anthropicClient
}

export function isAnthropicConfigured(): boolean {
  return Boolean(env.anthropicApiKey)
}

/**
 * System prompt for Claude to generate structured blueprint content
 * Based on brand_blueprint_api_prompts.md but modified for JSON output
 */
const BLUEPRINT_SYSTEM_PROMPT = `You are an expert brand strategist and identity architect who specializes in building clothing brands from the ground up. You have deep expertise in founder-led brand building, drop model mechanics, community-over-followers strategy, radical transparency as a content approach, and the psychology of why people buy from people instead of faceless entities.

Your job is to analyze a clothing brand founder's answers to the 18 Question Framework and output structured JSON content for their Brand Blueprint. This content is the strategic foundation of their brand — not a mood board, not a logo guide, but the DNA underneath everything they build.

VOICE AND TONE RULES:
- Write like a mentor, not a consultant. Use contractions. Be direct. No corporate-speak.
- Sound like someone who has built brands and seen founders succeed and fail — because you have.
- Be honest. If an answer has a gap or a contradiction, name it. Flattery doesn't build brands.
- Never be harsh — be constructive. The tone is "I'm in your corner and I'm telling you the truth."
- Do not mention any program, course, or company name anywhere in the output. The feedback reads as pure expert coaching.
- Do not use phrases like "as an AI" or reference any tool or platform.

CONTENT RULES:
- Every strategic recommendation must be grounded in real brand-building principles: Founder-Led Advantage (people buy from people, not faceless entities), Radical Transparency (document everything, build trust), Drop Model mechanics (tease → collect → drop → post-drop), Community Over Followers (10K diehards beat 1M surface-level), the 70/30 content split (70% value/story, 30% product), and validation before investment.
- All feedback must be derived directly from the founder's actual answers. Do not invent characteristics they didn't express.
- At least 30% of feedback items must include a "gap" type block. Not every answer is perfect.
- The 6 sub-scores in the scores section must be honestly calibrated — do not inflate scores to flatter.
- Skip any questions that were left blank or answered "N/A" from the answerFeedback array.

LOW-EFFORT ANSWER DETECTION:
- If an answer is vague, deflecting, a single word, or clearly not engaging with what the question is actually asking — call it out directly. Examples: "a lot of things", "I don't know", "quality and different", "young people who like fashion", "inauthenticity", one-word answers, answers that could apply to literally any brand.
- For these answers, do NOT give a Strength block. Lead with a Gap block that names exactly why the answer doesn't hold up — be direct but not cruel.
- Follow the Gap with a Coaching Note that invites them to go back and resubmit the form with a real answer. Something like: "This answer didn't give us enough to work with. The founders who get the most out of this framework are the ones who sit with the hard questions. Go back, resubmit with a real answer, and your blueprint will actually reflect who you are."
- Vary the language — don't use the same phrasing for every low-effort answer. Make it feel personal to what they specifically failed to answer.
- Low-effort answers must tank the relevant sub-scores. A vague origin story drops originStoryStrength. A generic audience answer drops audienceDefinition. A weak "quality and different" differentiator drops competitiveMoat. Score these honestly in the 1–4 range, not the 6–8 range. The score should tell the truth.

OUTPUT RULES:
- Output ONLY valid JSON matching the BlueprintContent schema. No explanation before it, no explanation after it, no markdown code fences.
- The JSON must be complete — no placeholders, no [INSERT X HERE] gaps.
- All string values should be plain text (no HTML tags).`

/**
 * Question text mapping for quiz answers
 */
export const QUESTION_TEXT: Record<string, string> = {
  Q2: "What's something you've been through that changed how you see the world?",
  Q3: "Do you see yourself as a person capable of creating something impactful?",
  Q4: "What's one thing about yourself that you wish people understood more?",
  Q5: "If money wasn't a factor, what would you spend your time doing?",
  Q6: "What is a niched interest that you enjoy?",
  Q7: "What is something you feel you are closest to being an expert in?",
  Q8: "List 3-5 characters you resonate with or are inspired by",
  Q9: "What past experiences shaped who you are today?",
  Q10: "What made you decide to build this brand?",
  Q11: "What are you creating and why?",
  Q12: "What do you envision for your best self in the future?",
  Q13: "What values do you hold close?",
  Q14: "What do you (your brand) stand AGAINST?",
  Q15: "Why is it so important you make impact?",
  Q16: "What type of person do you want to reach?",
  Q17: "What do you want to sell to them?",
  Q18: "Why are they going to buy from you instead of another brand?",
}

/**
 * Builds the user prompt with quiz answers injected
 */
export function buildBlueprintUserPrompt(quiz: Partial<QuizFormState>): string {
  const answersBlock = `
Q1 — Name: ${quiz.name || "N/A"}
Q1 — Age: ${quiz.age || "N/A"}
Q1 — Current situation: ${quiz.situation || "N/A"}
Q2 — What's something you've been through that changed how you see the world?
${quiz.changedWorldview || "N/A"}
Q3 — Do you see yourself as a person capable of creating something impactful?
${quiz.capableOfImpact || "N/A"}
Q4 — What's one thing about yourself that you wish people understood more?
${quiz.notUnderstood || "N/A"}
Q5 — If money wasn't a factor, what would you spend your time doing?
${quiz.moneyNoFactor || "N/A"}
Q6 — What is a niched interest that you enjoy?
${quiz.nichedInterest || "N/A"}
Q7 — What is something you feel you are closest to being an expert in?
${quiz.closestExpert || "N/A"}
Q8 — List 3-5 characters you resonate with or are inspired by
${quiz.characters?.join(", ") || "N/A"}
Q9 — What past experiences shaped who you are today?
${quiz.thePast || "N/A"}
Q10 — What made you decide to build this brand?
${quiz.theTurningPoint || "N/A"}
Q11 — What are you creating and why?
${quiz.thePresent || "N/A"}
Q12 — What do you envision for your best self in the future?
${quiz.theFuture || "N/A"}
Q13 — What values do you hold close?
${quiz.values?.join(", ") || "N/A"}
Q14 — What do you (your brand) stand AGAINST?
${quiz.against || "N/A"}
Q15 — Why is it so important you make impact?
${quiz.whyImpact || "N/A"}
Q16 — What type of person do you want to reach?
${quiz.targetPerson || "N/A"}
Q17 — What do you want to sell to them?
${quiz.whatToSell || "N/A"}
Q18 — Why are they going to buy from you instead of another brand?
${quiz.whyBuyFromYou || "N/A"}
`.trim()

  return `Analyze the following clothing brand founder's answers and generate structured JSON content for their Brand Blueprint.

Output a JSON object matching this exact TypeScript interface:

interface BlueprintContent {
  heroMeta: {
    name: string           // From Q1
    age: string            // From Q1
    stage: string          // From Q1 situation (e.g., "Starting to Build" or "Launched but Stuck")
    readinessScore: number // Overall score (will be calculated from scores section)
  }

  personas: {
    noLaunch: string  // 3-4 sentence personalized description assuming they haven't launched yet
    stalled: string   // 3-4 sentence personalized description assuming they have a brand that's stalled
  }

  answerFeedback: Array<{
    questionNumber: string  // "Q2", "Q3", etc.
    questionText: string    // The question text
    answer: string          // Their quoted answer
    feedback: Array<{
      type: "strength" | "gap" | "coaching"  // strength=green, gap=amber, coaching=blue
      content: string
    }>
  }>

  originStory: {
    pullQuote: string      // Most powerful sentence from Q2 or Q9 (their words)
    narrative: string      // 5-7 sentence brand origin synthesizing Q2 + Q9, third person
    whyItMatters: string   // 3-4 sentences on strategic value for a clothing brand
    coachingNote: string   // Actionable coaching note
  }

  missionVision: {
    mission: string        // 1-2 bold sentences from Q11 + Q15
    vision: string         // 1-2 bold sentences from Q12
    brandPurpose: string   // 4-5 sentences expanding on the deeper WHY from Q15
    coachingNote: string   // Actionable coaching note
  }

  values: Array<{
    name: string           // Value name from Q13
    definition: string     // Custom definition specific to their brand and clothing industry
  }>
  valuesCoachingNote: string  // Coaching note with the values test

  voice: {
    is: string[]           // 5 items describing what the voice IS
    isNot: string[]        // 5 items describing what the voice IS NOT
    inPractice: string     // How voice shows up in captions, product descriptions, DMs
    coachingNote: string   // Actionable coaching note
  }

  audience: {
    who: string            // Who they are
    psyche: string         // Their psychology/mindset
    behavior: string       // Their behaviors
    pain: string           // Their pain points
    desire: string         // Their desires
    dayInLife: string      // 1-2 sentence "Day in Their Life" narrative portrait
    coachingNote: string   // Go-to-market tactics grounded in drop model and founder-led strategy
  }

  positioning: {
    category: string       // Market category
    edge: string           // Competitive edge
    hook: string           // Brand hook (italic emphasis intended)
    promise: string        // Brand promise (gold emphasis intended)
    opposition: Array<{
      label: string        // What they stand against
      description: string  // Why/how
    }>
    coachingNote: string   // Operational proof points for positioning
  }

  scores: {
    clarityOfVision: number     // 1-10, from Q10, Q11, Q12
    originStoryStrength: number // 1-10, from Q2, Q9
    audienceDefinition: number  // 1-10, from Q16
    productStrategy: number     // 1-10, from Q17
    competitiveMoat: number     // 1-10, from Q18, Q7
    executionReadiness: number  // 1-10, from Q1 stage, Q3
    overall: number             // Average of 6 scores × 10, rounded
    assessment: string          // 3-4 sentences naming strongest dimension, gap dimension, and specific next action
  }
}

IMPORTANT RULES:
- Include feedback cards for Q2, Q3, Q4, Q5, Q6, Q7, Q9, Q10, Q11, Q14, Q16, Q17, Q18 (skip if N/A)
- Each feedback card should have 2-3 feedback items (not all need all three types)
- At least 30% of cards MUST include a "gap" type feedback
- Scores 8-10 = high (green), 6-7 = medium (gold), 1-5 = low (amber)
- Be honest with scores — do not inflate to flatter
- All text should be direct, mentor-like, no corporate speak

STUDENT ANSWERS:

${answersBlock}

Output ONLY the JSON object, no markdown code fences or explanations.`
}

/**
 * Model used for blueprint generation. Env-overridable so it can be retuned
 * without a deploy.
 *
 * claude-haiku-4-5 replaces claude-sonnet-4-6 here: measured end-to-end on the
 * production prompt it is both slightly faster (~110 vs ~100 output tok/s) and
 * produces deeper feedback (~450 vs ~337 chars per item).
 */
function blueprintModel(): string {
  return process.env.BLUEPRINT_MODEL?.trim() || "claude-haiku-4-5"
}

/**
 * The 13 questions that get individual feedback cards, split into balanced
 * groups that are generated in parallel.
 *
 * WHY: measured over 1,698 production runs the single blueprint call averaged
 * 77s (max 246s) - 94% of the whole automation pipeline, which otherwise
 * totals ~4.6s. The blueprint is ~8,000-11,000 output tokens and every model
 * in this class emits ~100 tokens/sec, so a single call can't be made fast by
 * swapping models (measured: gpt-5-mini 95-119s, haiku 71s, sonnet-4-6 77s).
 * The only lever that works is generating fewer tokens per call and running
 * the calls concurrently - wall clock becomes the slowest leg, not the sum.
 * Measured 3-way: 31.8s vs 77s. These 4 balanced legs land at ~15-20s.
 */
const FEEDBACK_GROUPS: string[][] = [
  ["Q2", "Q3", "Q4", "Q5"],
  ["Q6", "Q7", "Q9"],
  ["Q10", "Q11", "Q14"],
  ["Q16", "Q17", "Q18"],
]

/**
 * The non-feedback sections, split into three parallel legs.
 *
 * WHY THE SPLIT: with the feedback cards parallelised, a single "everything
 * else" leg became the long pole - measured 46.8s / 3,876 output tokens while
 * all four feedback legs finished in 8-14s. Wall clock is the slowest leg, so
 * the long pole is the only thing worth cutting. These three are balanced by
 * expected output size (originStory alone is ~2,000+ chars).
 */
const NARRATIVE_LEGS: Array<{ label: string; keys: string[]; spec: string }> = [
  {
    label: "core",
    keys: ["heroMeta", "personas", "scores"],
    spec: `- heroMeta: { name (string, from Q1), age (string, from Q1), stage (string), readinessScore (number) }.
- personas.noLaunch and personas.stalled: 420-560 characters each (3-4 sentences).
- scores: numbers for clarityOfVision, originStoryStrength, audienceDefinition, productStrategy, competitiveMoat, executionReadiness and overall, plus assessment as a string. Be honest; do not inflate to flatter.`,
  },
  {
    label: "story",
    keys: ["originStory", "missionVision"],
    spec: `- originStory: a first-person narrative of at least 2,000 characters, in their voice, built from their actual answers.
- missionVision: fully populated.`,
  },
  {
    label: "values",
    keys: ["values", "valuesCoachingNote"],
    spec: `- values: exactly 4 entries, each with a name and a description of at least 200 characters.
- valuesCoachingNote: required and fully populated.`,
  },
  {
    label: "market",
    keys: ["voice", "audience", "positioning"],
    spec: `- voice, audience, positioning: all required and fully populated, each grounded in their actual answers.`,
  },
]

type AnswerFeedbackEntry = BlueprintContent["answerFeedback"][number]

/** One Anthropic call. Returns the parsed JSON object. */
async function callClaudeJson<T>(systemPrompt: string, userPrompt: string, maxTokens: number, label = "leg"): Promise<T> {
  const client = getAnthropicClient()
  const legStart = Date.now()
  const message = await client.messages.create({
    model: blueprintModel(),
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  })

  if (message.stop_reason === "max_tokens") {
    throw new Error("Claude response was truncated (hit max_tokens limit).")
  }

  const textContent = message.content.find((block) => block.type === "text")
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text content in Claude response")
  }

  const jsonText = extractFirstJsonObject(textContent.text)
  if (!jsonText) {
    throw new Error("No JSON object found in Claude response")
  }
  console.info(
    `[blueprint] leg ${label}: ${Date.now() - legStart}ms, ` +
    `${message.usage.output_tokens} output tokens`
  )
  return JSON.parse(jsonText) as T
}

/**
 * Extracts the first balanced JSON object from a model response.
 * Tolerates ``` fences and any trailing prose, so a chatty leg doesn't fail
 * the whole blueprint.
 */
export function extractFirstJsonObject(input: string): string | null {
  const text = input.replace(/^\s*```json\s*/i, "").replace(/^\s*```\s*/, "").replace(/```\s*$/, "").trim()
  const start = text.indexOf("{")
  if (start < 0) return null

  let depth = 0
  let inString = false
  let escaped = false
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (escaped) { escaped = false; continue }
    if (ch === "\\") { escaped = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === "{") depth++
    else if (ch === "}") { depth--; if (depth === 0) return text.slice(start, i + 1) }
  }
  return null
}

/** Prompt for one group of feedback cards. */
function feedbackLegPrompt(userPrompt: string, questions: string[]): string {
  return `${userPrompt}

=== THIS REQUEST: FEEDBACK CARDS ONLY ===
Output ONLY a JSON object of exactly this shape and nothing else:
{"answerFeedback":[{"questionNumber":"Q2","questionText":"...","answer":"...","feedback":[{"type":"strength","content":"..."}]}]}

- Cover EXACTLY these questions, in this order: ${questions.join(", ")}. ${questions.length} entries, no more, no fewer.
- Every entry needs questionNumber, questionText (the real question), answer (their quoted answer), and 2-3 feedback items.
- Each feedback item's "content" MUST be 320-430 characters - roughly 3 full sentences. Shorter is a failure. Reference their actual answer, name the concrete consequence, and give a next action. No generic filler.
- "type" is one of "strength", "gap", or "coaching". Include at least one "gap" across this group.
- Do NOT output any other top-level key. No markdown fences, no commentary.`
}

/** Prompt for one narrative leg. */
function narrativeLegPrompt(userPrompt: string, leg: (typeof NARRATIVE_LEGS)[number]): string {
  return `${userPrompt}

=== THIS REQUEST: ONE SECTION GROUP ONLY ===
Output ONLY a JSON object with exactly these top-level keys and nothing else:
${leg.keys.join(", ")}

${leg.spec}
- Do NOT include answerFeedback or any key not listed above - they are generated separately.
- No markdown fences, no commentary.`
}

/**
 * Generates blueprint content.
 *
 * Runs the narrative section and the four feedback groups concurrently, then
 * merges them into a single BlueprintContent. Wall clock is the slowest leg
 * (~15-20s) instead of the sum (~77s).
 *
 * A failed feedback leg degrades gracefully: its cards are dropped and the rest
 * of the blueprint still renders. A failed narrative leg is fatal, because
 * heroMeta/scores drive the whole page.
 */
export async function generateBlueprintContent(
  quiz: Partial<QuizFormState>
): Promise<BlueprintContent> {
  const userPrompt = buildBlueprintUserPrompt(quiz)
  const startedAt = Date.now()

  const narrativePromises = NARRATIVE_LEGS.map((leg) =>
    callClaudeJson<Record<string, unknown>>(
      BLUEPRINT_SYSTEM_PROMPT,
      narrativeLegPrompt(userPrompt, leg),
      6000,
      leg.label
    )
  )

  const feedbackPromises = FEEDBACK_GROUPS.map((questions) =>
    callClaudeJson<{ answerFeedback?: AnswerFeedbackEntry[] }>(
      BLUEPRINT_SYSTEM_PROMPT,
      feedbackLegPrompt(userPrompt, questions),
      6000,
      questions.join("/")
    ).catch((error) => {
      // One bad group should not cost the whole blueprint.
      console.error(`[blueprint] feedback leg ${questions.join("/")} failed:`, error)
      return { answerFeedback: [] as AnswerFeedbackEntry[] }
    })
  )

  // Narrative legs are NOT caught - heroMeta/scores drive the whole page, so a
  // failure there must surface and let the caller retry.
  const [narrativeParts, groups] = await Promise.all([
    Promise.all(narrativePromises),
    Promise.all(feedbackPromises),
  ])

  const narrative = Object.assign({}, ...narrativeParts) as Omit<BlueprintContent, "answerFeedback">

  // Preserve question order across groups - the page renders them in sequence.
  const answerFeedback = groups.flatMap((g) => g.answerFeedback ?? [])

  console.info(
    `[blueprint] generated in ${Date.now() - startedAt}ms via ${blueprintModel()} ` +
    `(${NARRATIVE_LEGS.length + FEEDBACK_GROUPS.length} parallel legs, ${answerFeedback.length} cards)`
  )

  return { ...narrative, answerFeedback } as BlueprintContent
}
