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
 * Generates blueprint content using Claude API
 * @param quiz - The quiz form state containing all user answers
 * @returns Structured BlueprintContent
 * @throws Error if API is not configured or request fails
 */
export async function generateBlueprintContent(
  quiz: Partial<QuizFormState>
): Promise<BlueprintContent> {
  const client = getAnthropicClient()
  const userPrompt = buildBlueprintUserPrompt(quiz)

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 16000,
    system: BLUEPRINT_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
  })

  // Detect truncated responses before attempting to parse
  if (message.stop_reason === "max_tokens") {
    throw new Error("Claude response was truncated (hit max_tokens limit). Blueprint JSON is incomplete.")
  }

  // Extract the text content from the response
  const textContent = message.content.find((block) => block.type === "text")
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text content in Claude response")
  }

  // Strip markdown code fences if present, then parse JSON
  let jsonText = textContent.text.trim()
  if (jsonText.startsWith("```")) {
    jsonText = jsonText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim()
  }

  const blueprintContent = JSON.parse(jsonText) as BlueprintContent

  return blueprintContent
}
