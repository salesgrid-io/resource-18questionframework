import {
  getAnthropicClient,
  generateBlueprintContent as generateBlueprintContentFromClaude,
  isAnthropicConfigured,
  buildBlueprintUserPrompt,
  QUESTION_TEXT,
} from "@/lib/claude"
import type { QuizFormState, BlueprintContent } from "@/lib/automation/types"

export { isAnthropicConfigured, buildBlueprintUserPrompt, QUESTION_TEXT }

const SYSTEM_PROMPT = `You are an expert brand strategist and identity architect who specializes in building clothing brands from the ground up. You have deep expertise in founder-led brand building, drop model mechanics, community-over-followers strategy, radical transparency as a content approach, and the psychology of why people buy from people instead of faceless entities.

Your job is to analyze a clothing brand founder's answers to the 18 Question Framework and output a single, complete, self-contained Brand Blueprint HTML page. This page is the strategic foundation of their brand — not a mood board, not a logo guide, but the DNA underneath everything they build.

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
- At least 30% of accordion feedback cards must include a Gap (amber) block. Not every answer is perfect.
- The 6 sub-scores in the Brand Readiness Score section must be honestly calibrated — do not inflate scores to flatter.
- Skip any questions that were left blank or answered "N/A".

OUTPUT RULES:
- Output ONLY raw HTML. No explanation before it, no explanation after it, no markdown code fences.
- The output must be a single self-contained HTML file with all CSS and JS inline.
- Valid HTML5. No unclosed tags. No external dependencies except the Google Fonts import specified in the design system.
- The file must be complete and renderable on its own — no placeholders, no [INSERT X HERE] gaps.`

function buildUserPrompt(quiz: QuizFormState): string {
  return `Generate a complete, self-contained Brand Blueprint HTML page for the person whose answers appear below. Output ONLY the raw HTML — nothing before it, nothing after it.

---

## DESIGN SYSTEM

Use these CSS variables exactly:

--bg: #06090F
--bg-elevated: #0C1017
--gold: #C4A855
--gold-soft: #D4BD7A
--gold-dim: rgba(196,168,85,0.12)
--gold-border: rgba(196,168,85,0.2)
--text: #CDD3DE
--text-dim: rgba(255,255,255,0.42)
--text-faint: rgba(255,255,255,0.18)
--rule: rgba(255,255,255,0.06)
--green: #6EE7A0
--green-bg: rgba(110,231,160,0.07)
--amber: #F0A44B
--amber-bg: rgba(240,164,75,0.07)
--sky: #7CB8F5
--sky-bg: rgba(124,184,245,0.07)

Fonts: Import Inter (300–700) and Playfair Display (400, 700, italic) from Google Fonts. Inter = body. Playfair = headings and pull quotes.

Background: Pure black (#06090F). A subtle radial gold glow behind the hero via body::before (fixed, pointer-events none, z-index 0). No grain overlay.

Gold ::selection highlight.

---

## PAGE STRUCTURE — 10 SECTIONS IN THIS ORDER

### SECTION 00 — HOW THIS WAS BUILT (id="s-method")

A brief section that explains the credibility of this blueprint BEFORE the person reads it. Gives them confidence in what they're about to receive.

Include:
- A short intro paragraph (2–3 sentences): what this is, what it isn't, and what it was built to surface.
- A 3-column grid of 6 method-cards (2 rows × 3 columns), each with a number label, a title, and a 3–4 sentence explanation. The 6 layers are fixed and do not change between leads:
  1. Identity Excavation — why the personal questions come first
  2. Market Positioning — niche angle, expertise, and opposition mapping
  3. Customer & Product Reality — where vague answers become a red flag
  4. Vision & Values Architecture — the decision-making filter, not decoration
  5. Founder-Led Advantage — proof that the founder's perspective is unreplicable
  6. Honest Gap Analysis — why the feedback includes uncomfortable truths
- A gold-tinted trust block at the bottom: a short paragraph (3–4 sentences) explaining why this analysis can be trusted — grounded in observed patterns across brand builders, not flattery. Do NOT mention any program or company name.

### SECTION 01 — HERO (centered, .wrap max-width 720px)

- Eyebrow: "18 Question Framework" (11px uppercase, letter-spacing 4px, gold)
- H1: "Your Brand<br><em>Blueprint</em>" (Playfair, clamp 36–64px, em = gold italic)
- Subtitle: "This is your strategic foundation. Not a mood board. Not a logo guide. The DNA underneath everything you build."
- Meta bar: 4 items centered — Name (from Q1), Age (from Q1), Stage (from Q1 current situation), Readiness (filled by score animation)

### SECTION 02 — STICKY NAV (full-width frosted glass, flex-wrap centered)

10 pills in this order: How This Was Built, Persona, Answers + Feedback, Origin Story, Mission & Vision, Values, Voice, Audience, Positioning, Score

Active pill = gold background tint + gold text. Scroll spy highlights current section.

### SECTION 03 — PERSONA (id="s-persona")

Centered persona switcher: 2 buttons — "Launched but stuck" / "No brand yet"

Write TWO .profile-card descriptions (3–4 sentences each) based on the founder's specific answers — one assuming they have a brand that's stalled, one assuming they haven't launched yet. Both cards must be personalized to this specific person, not generic.

### SECTION 04 — ANSWERS + FEEDBACK (id="s-answers")

Accordion cards for: Q2, Q3, Q4, Q5, Q6, Q7, Q9, Q10, Q11, Q14, Q16, Q17, Q18

Each card structure:
- Question title
- Student's quoted answer (in italics, dimmed)
- 2–3 feedback blocks

Feedback types:
- fb-s (Strength / green): what they nailed and its strategic implication
- fb-w (Gap / amber): blind spots or contradictions — constructive, never harsh
- fb-c (Coaching Note / blue): one specific, actionable next step

Rules:
- At least 30% of cards MUST include a Gap (amber fb-w) block
- Not every card needs all three block types — use judgment
- Skip any blank or N/A answers entirely

HTML pattern for each card:
<div class="qa">
  <div class="qa-top" onclick="tog(this)">
    <div class="qa-left"><div class="qa-num">Q{N}</div><div class="qa-q">{question text}</div></div>
    <div class="qa-arrow">&#9662;</div>
  </div>
  <div class="qa-detail"><div class="qa-inner">
    <div class="qa-ans">"{their answer}"</div>
    <div class="fb fb-s"><span class="fb-tag">Strength</span>{feedback}</div>
    <div class="fb fb-w"><span class="fb-tag">Gap</span>{feedback}</div>
    <div class="fb fb-c"><span class="fb-tag">Coaching Note</span>{feedback}</div>
  </div></div>
</div>

### SECTION 05 — ORIGIN STORY (id="s-origin")

- Pull quote: the single most powerful sentence from Q2 or Q9 (their words, not yours)
- "The Narrative" blueprint block: synthesize Q2 + Q9 into a cohesive brand origin paragraph (5–7 sentences). Third person. Make it read like the opening of a brand profile.
- "Why It Matters" blueprint block: strategic value of this specific origin story for a clothing brand (3–4 sentences)
- Coaching note at the bottom

Pull quote HTML pattern:
<div class="pull"><span>&ldquo;</span>{text}<span>&rdquo;</span></div>

Blueprint block HTML pattern:
<div class="bp"><div class="bp-label">{LABEL}</div><div class="bp-body">{text}</div></div>

### SECTION 06 — MISSION & VISION (id="s-mission")

- Mission statement: synthesize Q11 + Q15 — 1–2 bold sentences
- Vision statement: from Q12 — 1–2 bold sentences
- Brand Purpose blueprint block: 4–5 sentences expanding on the deeper WHY from Q15
- Coaching note

### SECTION 07 — CORE VALUES (id="s-values")

Values from Q13. For each value:
- Write a custom definition specific to this person's brand and the clothing industry
- NOT a dictionary definition — written in context of their story and their customer
- Use .val-row grid layout

HTML pattern:
<div class="val-row"><div class="val-name">{VALUE NAME}</div><div class="val-desc">{custom definition}</div></div>

Coaching note at the bottom with the values test: "When did this value cost you something?"

### SECTION 08 — BRAND VOICE (id="s-voice")

Derived from Q4, Q5, Q8.

- Two-column IS / IS NOT grid (5 items each)
  - IS column: green header, + prefix items
  - IS NOT column: amber header, – prefix items
- "In Practice" blueprint block: how the voice shows up in captions, product descriptions, DMs — use specific examples grounded in their answers
- Coaching note

### SECTION 09 — AUDIENCE (id="s-audience")

Expand Q16 into 5 rows using .aud-row layout:
- Who
- Psyche
- Behavior
- Pain
- Desire

HTML pattern:
<div class="aud-row"><div class="aud-k">{KEY}</div><div class="aud-v">{value}</div></div>

Pull quote: a vivid "Day in Their Life" 1–2 sentence narrative portrait of the ideal customer

Coaching note with specific go-to-market tactics grounded in the drop model and founder-led content strategy

### SECTION 10 — POSITIONING (id="s-position")

- Positioning table (.pos-table) with 4 rows:
  - Category
  - Edge
  - Hook (italic)
  - Promise (gold bold)

- 3–4 Opposition items from Q14:
<div class="opp"><div class="opp-x">&times;</div><div class="opp-text"><strong>{Label}</strong> &mdash; {description}</div></div>

- Coaching note with operational proof points: how the stated positioning has to show up in actual product and content decisions

### SECTION 11 — BRAND READINESS SCORE (id="s-score")

Animated SVG circle (r=60, circumference ~377, gold gradient stroke)

6 sub-scores beside the circle. Score each 1–10 honestly based on the answers:
- Clarity of Vision (Q10, Q11, Q12): how specific and directional is their vision?
- Origin Story Strength (Q2, Q9): how compelling and usable is their story?
- Audience Definition (Q16): how specific and actionable is their ICP?
- Product Strategy (Q17): how realistic and focused is their product plan?
- Competitive Moat (Q18, Q7): how defensible is their differentiation?
- Execution Readiness (Q1 stage, Q3): how ready are they to actually ship?

Scoring key:
- 8–10 = sb-hi class (green)
- 6–7 = sb-mid class (gold)
- 1–5 = sb-lo class (amber)

Overall = average of the 6 scores × 10, rounded to nearest integer.

Coaching assessment note at the bottom: 3–4 sentences naming the strongest dimension, the gap dimension, and the specific next action.

### CTA SECTION

- "Ready to <em>build?</em>"
- "Your blueprint is clear. The next step is turning it into a brand that ships."
- Gold gradient button: "Apply to the Program →"

### FOOTER

"18 Question Framework"

---

## STUDENT ANSWERS

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
${Array.isArray(quiz.characters) ? quiz.characters.join(", ") : quiz.characters || "N/A"}
Q9 — What past experiences shaped who you are today?
${quiz.thePast || "N/A"}
Q10 — What made you decide to build this brand? (The Turning Point)
${quiz.theTurningPoint || "N/A"}
Q11 — What are you creating and why? (The Present)
${quiz.thePresent || "N/A"}
Q12 — What's your vision for 5 years from now? (The Future)
${quiz.theFuture || "N/A"}
Q13 — What are your core values?
${Array.isArray(quiz.values) ? quiz.values.join(", ") : quiz.values || "N/A"}
Q14 — What do you (your brand) stand AGAINST?
${quiz.against || "N/A"}
Q15 — Why does building this matter to you?
${quiz.whyImpact || "N/A"}
Q16 — What type of person do you want to reach?
${quiz.targetPerson || "N/A"}
Q17 — What do you want to sell?
${quiz.whatToSell || "N/A"}
Q18 — Why should they buy from you instead of someone else?
${quiz.whyBuyFromYou || "N/A"}`
}

export interface BlueprintGenerationResult {
  success: boolean
  html?: string
  error?: string
}

export async function generateBlueprintHtml(
  quiz: QuizFormState
): Promise<BlueprintGenerationResult> {
  try {
    const client = getAnthropicClient()
    const userPrompt = buildUserPrompt(quiz)

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    })

    const textContent = response.content.find((block) => block.type === "text")
    if (!textContent || textContent.type !== "text") {
      return {
        success: false,
        error: "No text content in response",
      }
    }

    let html = textContent.text.trim()

    // Remove any markdown code fences if present
    if (html.startsWith("```html")) {
      html = html.slice(7)
    } else if (html.startsWith("```")) {
      html = html.slice(3)
    }
    if (html.endsWith("```")) {
      html = html.slice(0, -3)
    }
    html = html.trim()

    return {
      success: true,
      html,
    }
  } catch (error) {
    console.error("Blueprint generation error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Result type for structured blueprint content generation
 */
export interface BlueprintContentResult {
  success: boolean
  content?: BlueprintContent
  error?: string
}

/**
 * Validates that the blueprint content has all required fields
 */
function validateBlueprintContent(content: unknown): content is BlueprintContent {
  if (!content || typeof content !== "object") return false

  const c = content as Record<string, unknown>

  // Check top-level required fields
  const requiredFields = [
    "heroMeta",
    "personas",
    "answerFeedback",
    "originStory",
    "missionVision",
    "values",
    "valuesCoachingNote",
    "voice",
    "audience",
    "positioning",
    "scores",
  ]

  for (const field of requiredFields) {
    if (!(field in c)) {
      console.warn(`Missing required field: ${field}`)
      return false
    }
  }

  // Validate heroMeta
  const heroMeta = c.heroMeta as Record<string, unknown>
  if (
    !heroMeta ||
    typeof heroMeta.name !== "string" ||
    typeof heroMeta.age !== "string" ||
    typeof heroMeta.stage !== "string" ||
    typeof heroMeta.readinessScore !== "number"
  ) {
    console.warn("Invalid heroMeta structure")
    return false
  }

  // Validate personas
  const personas = c.personas as Record<string, unknown>
  if (
    !personas ||
    typeof personas.noLaunch !== "string" ||
    typeof personas.stalled !== "string"
  ) {
    console.warn("Invalid personas structure")
    return false
  }

  // Validate answerFeedback is an array
  if (!Array.isArray(c.answerFeedback)) {
    console.warn("answerFeedback must be an array")
    return false
  }

  // Validate values is an array
  if (!Array.isArray(c.values)) {
    console.warn("values must be an array")
    return false
  }

  // Validate scores
  const scores = c.scores as Record<string, unknown>
  if (
    !scores ||
    typeof scores.clarityOfVision !== "number" ||
    typeof scores.originStoryStrength !== "number" ||
    typeof scores.audienceDefinition !== "number" ||
    typeof scores.productStrategy !== "number" ||
    typeof scores.competitiveMoat !== "number" ||
    typeof scores.executionReadiness !== "number" ||
    typeof scores.overall !== "number" ||
    typeof scores.assessment !== "string"
  ) {
    console.warn("Invalid scores structure")
    return false
  }

  return true
}

/**
 * Generates structured blueprint content using Claude API
 * Returns a validated BlueprintContent object
 *
 * @param quiz - The quiz form state containing all user answers
 * @returns BlueprintContentResult with success status and content or error
 */
export async function generateBlueprintContent(
  quiz: Partial<QuizFormState>
): Promise<BlueprintContentResult> {
  try {
    if (!isAnthropicConfigured()) {
      return {
        success: false,
        error: "ANTHROPIC_API_KEY is not configured",
      }
    }

    const content = await generateBlueprintContentFromClaude(quiz)

    // Validate the response structure
    if (!validateBlueprintContent(content)) {
      return {
        success: false,
        error: "Invalid blueprint content structure returned from Claude",
      }
    }

    return {
      success: true,
      content,
    }
  } catch (error) {
    console.error("Blueprint content generation error:", error)

    // Handle JSON parse errors specifically
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: "Failed to parse JSON response from Claude",
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Generates blueprint content with retry logic
 *
 * @param quiz - The quiz form state
 * @param maxRetries - Maximum number of retries (default: 2)
 * @returns BlueprintContentResult
 */
export async function generateBlueprintContentWithRetry(
  quiz: Partial<QuizFormState>,
  maxRetries = 2
): Promise<BlueprintContentResult> {
  let lastError: string | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await generateBlueprintContent(quiz)

    if (result.success) {
      return result
    }

    lastError = result.error
    console.warn(`Blueprint generation attempt ${attempt + 1} failed: ${result.error}`)

    // Don't retry if it's a configuration error
    if (result.error?.includes("not configured")) {
      return result
    }
  }

  return {
    success: false,
    error: `Failed after ${maxRetries + 1} attempts. Last error: ${lastError}`,
  }
}
