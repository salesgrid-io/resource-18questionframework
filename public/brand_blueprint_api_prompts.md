# Brand Blueprint — Claude API Prompts
## How to use this document

There are **two things** you send to the Claude API for every new lead:

1. **`system`** — set once, never changes, goes in the `system` field of the API request
2. **`user`** — assembled dynamically per lead, goes as the first message in `messages`

The `user` prompt has a clearly marked block at the bottom where you inject each lead's answers.

---

## 1. SYSTEM PROMPT

Paste this verbatim into the `system` field of your API call.

```
You are an expert brand strategist and identity architect who specializes in building clothing brands from the ground up. You have deep expertise in founder-led brand building, drop model mechanics, community-over-followers strategy, radical transparency as a content approach, and the psychology of why people buy from people instead of faceless entities.

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
- The file must be complete and renderable on its own — no placeholders, no [INSERT X HERE] gaps.
```

---

## 2. USER PROMPT

Paste this into the `messages[0].content` field, replacing the `STUDENT ANSWERS` block at the bottom with each lead's actual answers.

```
Generate a complete, self-contained Brand Blueprint HTML page for the person whose answers appear below. Output ONLY the raw HTML — nothing before it, nothing after it.

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

## COMPONENT CSS — COPY EXACTLY

Include all of these styles inline in the <style> block:

/* body::before gold glow */
body::before {
  content: '';
  position: fixed;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 900px;
  height: 600px;
  background: radial-gradient(ellipse at center, rgba(196,168,85,0.07) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

/* .wrap */
.wrap { max-width: 720px; margin: 0 auto; padding: 0 32px; }

/* Sticky nav */
#nav {
  position: sticky; top: 0; z-index: 100;
  background: rgba(6,9,15,0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--rule);
  padding: 12px 0;
}
.nav-inner { display: flex; justify-content: center; gap: 6px; flex-wrap: wrap; padding: 0 20px; max-width: 1200px; margin: 0 auto; }
.nav-pill { padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 500; color: var(--text-dim); cursor: pointer; border: 1px solid transparent; transition: all 0.2s; white-space: nowrap; user-select: none; }
.nav-pill:hover { color: var(--text); border-color: var(--gold-border); }
.nav-pill.on { background: var(--gold-dim); border-color: var(--gold-border); color: var(--gold-soft); }

/* Sections */
section { padding: 80px 0; border-bottom: 1px solid var(--rule); position: relative; z-index: 1; }
.sec-num { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; font-weight: 500; }
.sec-title { font-family: var(--serif); font-size: clamp(28px, 4vw, 42px); color: #fff; margin-bottom: 40px; line-height: 1.2; font-weight: 700; }
.sec-title em { color: var(--gold); font-style: italic; }

/* Method section */
.method-intro { font-size: 16px; color: var(--text-dim); line-height: 1.9; max-width: 620px; margin-bottom: 48px; }
.method-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 40px; }
.method-card { background: var(--bg-elevated); border: 1px solid var(--rule); border-radius: 10px; padding: 24px 20px; transition: border-color 0.2s; }
.method-card:hover { border-color: var(--gold-border); }
.method-card-num { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); font-weight: 700; margin-bottom: 12px; }
.method-card-title { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 8px; line-height: 1.4; }
.method-card-body { font-size: 13px; color: var(--text-dim); line-height: 1.7; }
.method-trust { background: var(--gold-dim); border: 1px solid var(--gold-border); border-radius: 10px; padding: 24px 28px; display: flex; gap: 20px; align-items: flex-start; }
.method-trust-icon { font-size: 22px; flex-shrink: 0; line-height: 1; padding-top: 2px; }
.method-trust-body { font-size: 14px; color: var(--text); line-height: 1.8; }
.method-trust-body strong { color: var(--gold-soft); }

/* Hero */
#hero { padding: 100px 0 80px; text-align: center; position: relative; z-index: 1; }
.eyebrow { font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); margin-bottom: 28px; font-weight: 500; }
#hero h1 { font-family: var(--serif); font-size: clamp(36px, 6vw, 64px); line-height: 1.1; color: #fff; margin-bottom: 24px; font-weight: 700; }
#hero h1 em { color: var(--gold); font-style: italic; }
.hero-sub { color: var(--text-dim); font-size: 16px; max-width: 480px; margin: 0 auto 40px; line-height: 1.8; }
.meta-bar { display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; }
.meta-item { text-align: center; }
.meta-label { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--text-faint); display: block; margin-bottom: 4px; }
.meta-val { font-size: 15px; font-weight: 600; color: var(--gold-soft); }

/* Persona */
.persona-switcher { display: flex; gap: 12px; margin-bottom: 32px; flex-wrap: wrap; }
.ps-btn { padding: 10px 24px; border-radius: 6px; border: 1px solid var(--gold-border); background: transparent; color: var(--text-dim); font-family: var(--sans); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.ps-btn:hover { color: var(--text); }
.ps-btn.on { background: var(--gold-dim); border-color: var(--gold); color: var(--gold-soft); }
.profile-card { background: var(--bg-elevated); border: 1px solid var(--rule); border-radius: 12px; padding: 28px; display: none; }
.profile-card.on { display: block; }
.profile-card p { color: var(--text); line-height: 1.8; font-size: 15px; }

/* Accordion */
.qa { border: 1px solid var(--rule); border-radius: 10px; margin-bottom: 12px; overflow: hidden; background: var(--bg-elevated); transition: border-color 0.2s; }
.qa:hover { border-color: var(--gold-border); }
.qa.open { border-color: var(--gold-border); }
.qa-top { display: flex; align-items: flex-start; justify-content: space-between; padding: 20px 24px; cursor: pointer; gap: 16px; }
.qa-left { display: flex; gap: 16px; align-items: flex-start; }
.qa-num { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); font-weight: 600; padding-top: 2px; white-space: nowrap; }
.qa-q { font-size: 14px; font-weight: 600; color: #fff; line-height: 1.5; }
.qa-arrow { color: var(--text-faint); font-size: 14px; transition: transform 0.25s; flex-shrink: 0; padding-top: 2px; }
.qa.open .qa-arrow { transform: rotate(180deg); color: var(--gold); }
.qa-detail { max-height: 0; overflow: hidden; transition: max-height 0.35s ease; }
.qa.open .qa-detail { max-height: 2000px; }
.qa-inner { padding: 0 24px 24px; border-top: 1px solid var(--rule); }
.qa-ans { font-size: 14px; color: var(--text-dim); font-style: italic; line-height: 1.8; padding: 16px 0; border-bottom: 1px solid var(--rule); margin-bottom: 16px; }
.fb { padding: 16px; border-radius: 8px; margin-bottom: 10px; font-size: 13.5px; line-height: 1.7; }
.fb:last-child { margin-bottom: 0; }
.fb-s { background: var(--green-bg); border: 1px solid rgba(110,231,160,0.15); }
.fb-w { background: var(--amber-bg); border: 1px solid rgba(240,164,75,0.15); }
.fb-c { background: var(--sky-bg); border: 1px solid rgba(124,184,245,0.15); }
.fb-tag { display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 2px 8px; border-radius: 4px; margin-bottom: 8px; }
.fb-s .fb-tag { color: var(--green); background: rgba(110,231,160,0.12); }
.fb-w .fb-tag { color: var(--amber); background: rgba(240,164,75,0.12); }
.fb-c .fb-tag { color: var(--sky); background: rgba(124,184,245,0.12); }

/* Pull quote */
.pull { font-family: var(--serif); font-size: clamp(20px, 3vw, 28px); font-style: italic; color: var(--gold-soft); line-height: 1.6; text-align: center; padding: 40px 0; border-top: 1px solid var(--gold-border); border-bottom: 1px solid var(--gold-border); margin: 40px 0; }
.pull span { color: var(--gold); font-size: 1.5em; line-height: 0; vertical-align: -10px; }

/* Blueprint block */
.bp { background: var(--bg-elevated); border: 1px solid var(--rule); border-left: 3px solid var(--gold); border-radius: 0 10px 10px 0; padding: 20px 24px; margin-bottom: 16px; }
.bp-label { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); font-weight: 600; margin-bottom: 8px; }
.bp-body { font-size: 15px; line-height: 1.8; color: var(--text); }
.bp-body strong { color: #fff; }

/* Coaching note */
.coach-note { background: var(--sky-bg); border: 1px solid rgba(124,184,245,0.15); border-radius: 10px; padding: 20px 24px; margin-top: 24px; font-size: 14px; line-height: 1.8; color: var(--text); }
.coach-note-label { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--sky); font-weight: 700; margin-bottom: 8px; }

/* Values */
.val-row { display: grid; grid-template-columns: 180px 1fr; gap: 24px; padding: 20px 0; border-bottom: 1px solid var(--rule); align-items: start; }
.val-row:last-of-type { border-bottom: none; }
.val-name { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); font-weight: 700; padding-top: 2px; }
.val-desc { font-size: 14px; line-height: 1.8; color: var(--text); }

/* Voice grid */
.voice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
.voice-col { background: var(--bg-elevated); border: 1px solid var(--rule); border-radius: 10px; padding: 24px; }
.voice-col-hdr { font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--rule); }
.voice-col.is .voice-col-hdr { color: var(--green); }
.voice-col.isnot .voice-col-hdr { color: var(--amber); }
.voice-item { display: flex; gap: 10px; margin-bottom: 12px; font-size: 13.5px; line-height: 1.6; color: var(--text); align-items: flex-start; }
.voice-item:last-child { margin-bottom: 0; }
.vi-prefix { font-weight: 700; flex-shrink: 0; font-size: 15px; line-height: 1.3; }
.is .vi-prefix { color: var(--green); }
.isnot .vi-prefix { color: var(--amber); }

/* Audience */
.aud-row { display: grid; grid-template-columns: 140px 1fr; gap: 24px; padding: 16px 0; border-bottom: 1px solid var(--rule); align-items: start; }
.aud-row:last-of-type { border-bottom: none; }
.aud-k { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); font-weight: 700; padding-top: 2px; }
.aud-v { font-size: 14px; line-height: 1.8; color: var(--text); }

/* Positioning */
.pos-table { background: var(--bg-elevated); border: 1px solid var(--rule); border-radius: 10px; overflow: hidden; margin-bottom: 24px; }
.pos-row { display: grid; grid-template-columns: 140px 1fr; border-bottom: 1px solid var(--rule); }
.pos-row:last-child { border-bottom: none; }
.pos-key { padding: 18px 20px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); font-weight: 700; border-right: 1px solid var(--rule); display: flex; align-items: center; }
.pos-val { padding: 18px 20px; font-size: 14px; line-height: 1.7; color: var(--text); }
.pos-val em { font-style: italic; color: var(--text-dim); }
.pos-val strong { color: var(--gold-soft); font-weight: 600; }

/* Opposition */
.opp { display: flex; gap: 14px; padding: 16px 20px; background: var(--bg-elevated); border: 1px solid var(--rule); border-radius: 8px; margin-bottom: 10px; align-items: flex-start; }
.opp-x { color: var(--amber); font-size: 18px; flex-shrink: 0; line-height: 1.4; font-weight: 700; }
.opp-text { font-size: 13.5px; line-height: 1.7; color: var(--text); }

/* Score */
.score-wrap { display: flex; gap: 48px; align-items: flex-start; flex-wrap: wrap; }
.score-ring-wrap { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
.score-breakdown { flex: 1; min-width: 280px; }
.sb-item { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.sb-item:last-child { margin-bottom: 0; }
.sb-label { font-size: 13px; color: var(--text-dim); flex: 1; line-height: 1.4; }
.sb-bar-wrap { width: 80px; height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; }
.sb-bar { height: 100%; border-radius: 2px; width: 0; transition: width 1.4s ease 0.2s; }
.sb-hi .sb-bar { background: var(--green); }
.sb-mid .sb-bar { background: var(--gold); }
.sb-lo .sb-bar { background: var(--amber); }
.sb-score { font-size: 13px; font-weight: 600; width: 26px; text-align: right; }
.sb-hi .sb-score { color: var(--green); }
.sb-mid .sb-score { color: var(--gold); }
.sb-lo .sb-score { color: var(--amber); }

/* CTA */
#cta { padding: 80px 0; text-align: center; border-bottom: none; }
#cta h2 { font-family: var(--serif); font-size: clamp(28px, 4vw, 42px); color: #fff; margin-bottom: 16px; }
#cta h2 em { color: var(--gold); font-style: italic; }
#cta p { color: var(--text-dim); font-size: 16px; max-width: 420px; margin: 0 auto 36px; line-height: 1.8; }
.cta-btn { display: inline-block; background: linear-gradient(135deg, var(--gold) 0%, var(--gold-soft) 100%); color: #000; font-family: var(--sans); font-size: 14px; font-weight: 700; padding: 16px 40px; border-radius: 6px; letter-spacing: 0.5px; text-decoration: none; transition: opacity 0.2s, transform 0.2s; border: none; cursor: pointer; }
.cta-btn:hover { opacity: 0.9; transform: translateY(-2px); }

/* Footer */
footer { padding: 32px 0; text-align: center; color: var(--text-faint); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; border-top: 1px solid var(--rule); position: relative; z-index: 1; }

/* Fade in */
.fi { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
.fi.vis { opacity: 1; transform: translateY(0); }

/* Divider */
.divider { border: none; border-top: 1px solid var(--rule); margin: 32px 0; }

/* Responsive */
@media (max-width: 600px) {
  .voice-grid { grid-template-columns: 1fr; }
  .method-grid { grid-template-columns: 1fr; }
  .method-trust { flex-direction: column; gap: 12px; }
}
@media (max-width: 480px) {
  .wrap { padding: 0 20px; }
  #hero { padding: 60px 0 48px; }
  .meta-bar { gap: 20px; }
  #nav { overflow-x: auto; }
  .nav-inner { flex-wrap: nowrap; justify-content: flex-start; padding: 0 16px; }
  section { padding: 48px 0; }
  .sec-title { font-size: 24px; margin-bottom: 28px; }
  .persona-switcher { flex-direction: column; }
  .ps-btn { width: 100%; }
  .qa-top { padding: 16px; }
  .qa-inner { padding: 0 16px 16px; }
  .qa-q { font-size: 13px; }
  .fb { padding: 12px; font-size: 12.5px; }
  .pull { font-size: 18px; }
  .val-row { grid-template-columns: 1fr; gap: 8px; }
  .aud-row { grid-template-columns: 1fr; gap: 6px; }
  .score-wrap { flex-direction: column; align-items: center; }
  .score-breakdown { width: 100%; }
  .cta-btn { width: 100%; text-align: center; }
  .bp-body { font-size: 14px; }
  .pos-row { grid-template-columns: 110px 1fr; }
}

---

## JAVASCRIPT — INCLUDE VERBATIM AT BOTTOM OF BODY

<script>
  function tog(el) {
    el.closest('.qa').classList.toggle('open');
  }

  function switchPersona(btn, persona) {
    document.querySelectorAll('.ps-btn').forEach(b => b.classList.remove('on'));
    document.querySelectorAll('.profile-card').forEach(c => c.classList.remove('on'));
    btn.classList.add('on');
    const card = document.querySelector('.profile-card[data-persona="' + persona + '"]');
    if (card) card.classList.add('on');
    const stageMap = { nolaunch: 'Starting to Build', stalled: 'Launched but Stuck' };
    document.getElementById('hStage').textContent = stageMap[persona] || 'Starting to Build';
  }

  document.querySelectorAll('.nav-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.nav-pill').forEach(p => p.classList.remove('on'));
      pill.classList.add('on');
      const target = document.getElementById(pill.dataset.to);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const sections = ['s-method','s-persona','s-answers','s-origin','s-mission','s-values','s-voice','s-audience','s-position','s-score'];
  function updateNav() {
    let current = sections[0];
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 120) current = id;
    }
    document.querySelectorAll('.nav-pill').forEach(p => {
      p.classList.toggle('on', p.dataset.to === current);
    });
  }
  window.addEventListener('scroll', updateNav, { passive: true });

  const fiObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); fiObs.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fi').forEach(el => fiObs.observe(el));

  const scoreObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      scoreObs.unobserve(e.target);
      document.querySelectorAll('.sb-item').forEach((item, i) => {
        const score = parseInt(item.dataset.score) || 7;
        const bar = item.querySelector('.sb-bar');
        setTimeout(() => { if (bar) bar.style.width = (score / 10 * 100) + '%'; }, 200 + i * 120);
      });
      const circle = document.getElementById('scoreCircle');
      const scoreText = document.getElementById('scoreText');
      const scores = Array.from(document.querySelectorAll('.sb-item')).map(el => parseInt(el.dataset.score) || 7);
      const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10);
      const circumference = 377;
      const duration = 1400;
      const start = performance.now();
      function animateScore(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentScore = Math.round(eased * overall);
        circle.style.strokeDashoffset = circumference - (eased * overall / 100) * circumference;
        scoreText.textContent = currentScore;
        if (progress < 1) requestAnimationFrame(animateScore);
        else {
          scoreText.textContent = overall;
          document.getElementById('hScore').textContent = overall + '/100';
        }
      }
      requestAnimationFrame(animateScore);
    });
  }, { threshold: 0.25 });

  const scoreSection = document.getElementById('s-score');
  if (scoreSection) scoreObs.observe(scoreSection);
</script>

---

## SCORE SVG — USE THIS EXACT STRUCTURE

<svg width="160" height="160" viewBox="0 0 160 160">
  <defs>
    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#C4A855"/>
      <stop offset="100%" style="stop-color:#D4BD7A"/>
    </linearGradient>
  </defs>
  <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="10"/>
  <circle id="scoreCircle" cx="80" cy="80" r="60" fill="none" stroke="url(#scoreGrad)" stroke-width="10"
    stroke-linecap="round" stroke-dasharray="377" stroke-dashoffset="377"
    transform="rotate(-90 80 80)"/>
  <text x="80" y="80" font-family="Playfair Display,serif" font-size="40" font-weight="700" fill="#fff"
    dominant-baseline="middle" text-anchor="middle" id="scoreText">0</text>
  <text x="80" y="102" font-family="Inter,sans-serif" font-size="13" fill="rgba(255,255,255,0.4)"
    text-anchor="middle">/100</text>
</svg>

---

## STUDENT ANSWERS

[INJECT THE LEAD'S ANSWERS HERE IN THIS FORMAT:]

Q1 — Name: {name}
Q1 — Age: {age}
Q1 — Current situation: {situation}
Q2 — What's something you've been through that changed how you see the world?
{answer}
Q3 — Do you see yourself as a person capable of creating something impactful?
{answer}
Q4 — What's one thing about yourself that you wish people understood more?
{answer}
Q5 — If money wasn't a factor, what would you spend your time doing?
{answer}
Q6 — What is a niched interest that you enjoy?
{answer}
Q7 — What is something you feel you are closest to being an expert in?
{answer}
Q8 — List 3-5 characters you resonate with or are inspired by
{answer}
Q9 — What past experiences shaped who you are today?
{answer}
Q10 — What made you decide to build this brand?
{answer}
Q11 — What are you creating and why?
{answer}
Q12 — What do you envision for your best self in the future?
{answer}
Q13 — What values do you hold close?
{answer}
Q14 — What do you (your brand) stand AGAINST?
{answer}
Q15 — Why is it so important you make impact?
{answer}
Q16 — What type of person do you want to reach?
{answer}
Q17 — What do you want to sell to them?
{answer}
Q18 — Why are they going to buy from you instead of another brand?
{answer}
```

---

## API CALL STRUCTURE (JavaScript / Node example)

```javascript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01"
  },
  body: JSON.stringify({
    model: "claude-opus-4-5",        // Use Opus for best output quality
    max_tokens: 16000,               // Blueprint is long — don't go lower than this
    system: SYSTEM_PROMPT,           // The system prompt above
    messages: [
      {
        role: "user",
        content: buildUserPrompt(leadAnswers)  // User prompt with answers injected
      }
    ]
  })
});

const data = await response.json();
const html = data.content[0].text;   // This is your complete HTML file
```

**Notes:**
- Use `claude-opus-4-5` — the blueprint requires deep reasoning across 18 answers simultaneously. Sonnet will work but output quality drops noticeably on Gap analysis and the Origin/Mission synthesis.
- `max_tokens: 16000` is the floor. A full blueprint runs ~12,000–14,000 tokens of output.
- The response is raw HTML with no wrapper — write it directly to a `.html` file or serve it.
- If a lead skips questions, the model will skip those sections gracefully per the system prompt rules.

---

## HELPER FUNCTION — buildUserPrompt()

```javascript
function buildUserPrompt(lead) {
  // lead is an object like:
  // { name, age, situation, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13, q14, q15, q16, q17, q18 }

  const answers = `
Q1 — Name: ${lead.name}
Q1 — Age: ${lead.age}
Q1 — Current situation: ${lead.situation}
Q2 — What's something you've been through that changed how you see the world?
${lead.q2 || 'N/A'}
Q3 — Do you see yourself as a person capable of creating something impactful?
${lead.q3 || 'N/A'}
Q4 — What's one thing about yourself that you wish people understood more?
${lead.q4 || 'N/A'}
Q5 — If money wasn't a factor, what would you spend your time doing?
${lead.q5 || 'N/A'}
Q6 — What is a niched interest that you enjoy?
${lead.q6 || 'N/A'}
Q7 — What is something you feel you are closest to being an expert in?
${lead.q7 || 'N/A'}
Q8 — List 3-5 characters you resonate with or are inspired by
${lead.q8 || 'N/A'}
Q9 — What past experiences shaped who you are today?
${lead.q9 || 'N/A'}
Q10 — What made you decide to build this brand?
${lead.q10 || 'N/A'}
Q11 — What are you creating and why?
${lead.q11 || 'N/A'}
Q12 — What do you envision for your best self in the future?
${lead.q12 || 'N/A'}
Q13 — What values do you hold close?
${lead.q13 || 'N/A'}
Q14 — What do you (your brand) stand AGAINST?
${lead.q14 || 'N/A'}
Q15 — Why is it so important you make impact?
${lead.q15 || 'N/A'}
Q16 — What type of person do you want to reach?
${lead.q16 || 'N/A'}
Q17 — What do you want to sell to them?
${lead.q17 || 'N/A'}
Q18 — Why are they going to buy from you instead of another brand?
${lead.q18 || 'N/A'}
  `.trim();

  return USER_PROMPT_TEMPLATE.replace('[INJECT THE LEAD\'S ANSWERS HERE IN THIS FORMAT:]', answers);
  // Or simply concatenate: return USER_PROMPT_TEMPLATE + '\n\n' + answers
}
```
