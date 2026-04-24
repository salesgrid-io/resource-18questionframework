"use client"

import { useEffect, useRef, useState, forwardRef } from "react"
import type { BlueprintContent, QuizFormState } from "@/lib/automation/types"

interface BlueprintPageProps {
  firstName: string
  age: string
  situation: string
  quiz: Partial<QuizFormState>
  blueprint: BlueprintContent
}

const NAV_SECTIONS = [
  { id: "s-score", label: "Score" },
  { id: "s-method", label: "How This Was Built" },
  { id: "s-persona", label: "Persona" },
  { id: "s-answers", label: "Answers + Feedback" },
  { id: "s-origin", label: "Origin Story" },
  { id: "s-mission", label: "Mission & Vision" },
  { id: "s-values", label: "Values" },
  { id: "s-voice", label: "Voice" },
  { id: "s-audience", label: "Audience" },
  { id: "s-position", label: "Positioning" },
]

function scoreTier(score: number): "hi" | "mid" | "lo" {
  if (score >= 8) return "hi"
  if (score >= 6) return "mid"
  return "lo"
}

export default function BlueprintPage({ firstName, age, situation, quiz, blueprint }: BlueprintPageProps) {
  const [activeSection, setActiveSection] = useState("s-score")
  const [currentPersona, setCurrentPersona] = useState<"nolaunch" | "stalled">(
    situation === "stalled" ? "stalled" : "nolaunch"
  )
  const [displayScore, setDisplayScore] = useState(0)
  const [scoreAnimated, setScoreAnimated] = useState(false)
  const scoreSectionRef = useRef<HTMLElement>(null)

  const overallScore = blueprint.scores?.overall ?? 70

  useEffect(() => {
    const handleScroll = () => {
      let current = NAV_SECTIONS[0].id
      for (const section of NAV_SECTIONS) {
        const el = document.getElementById(section.id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 120) current = section.id
        }
      }
      setActiveSection(current)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (scoreAnimated) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !scoreAnimated) {
            setScoreAnimated(true)
            const duration = 1400
            const start = performance.now()
            const animate = (now: number) => {
              const progress = Math.min((now - start) / duration, 1)
              const eased = 1 - Math.pow(1 - progress, 3)
              setDisplayScore(Math.round(eased * overallScore))
              if (progress < 1) requestAnimationFrame(animate)
            }
            requestAnimationFrame(animate)
          }
        })
      },
      { threshold: 0.25 }
    )
    if (scoreSectionRef.current) observer.observe(scoreSectionRef.current)
    return () => observer.disconnect()
  }, [scoreAnimated, overallScore])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const stageLabel = currentPersona === "nolaunch" ? "Starting to Build" : "Launched but Stuck"

  return (
    <div className="bp-page">
      <style>{blueprintStyles}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />

      <div className="bp-hero">
        <div className="bp-wrap">
          <div className="bp-eyebrow">18 Question Framework</div>
          <h1 className="bp-h1">Your Brand<br /><em>Blueprint</em></h1>
          <p className="bp-hero-sub">This is your strategic foundation. Not a mood board. Not a logo guide. The DNA underneath everything you build.</p>
          <div className="bp-meta-bar">
            <div className="bp-meta-item"><span className="bp-meta-label">Name</span><span className="bp-meta-val">{firstName}</span></div>
            <div className="bp-meta-item"><span className="bp-meta-label">Age</span><span className="bp-meta-val">{age}</span></div>
            <div className="bp-meta-item"><span className="bp-meta-label">Stage</span><span className="bp-meta-val">{stageLabel}</span></div>
            <div className="bp-meta-item"><span className="bp-meta-label">Readiness</span><span className="bp-meta-val">{scoreAnimated ? `${displayScore}/100` : "..."}</span></div>
          </div>
        </div>
      </div>

      <nav className="bp-nav">
        <div className="bp-nav-inner">
          {NAV_SECTIONS.map((s) => (
            <button key={s.id} className={`bp-nav-pill ${activeSection === s.id ? "active" : ""}`} onClick={() => scrollToSection(s.id)}>{s.label}</button>
          ))}
        </div>
      </nav>

      <ScoreSection ref={scoreSectionRef} firstName={firstName} displayScore={displayScore} scoreAnimated={scoreAnimated} overallScore={overallScore} blueprint={blueprint} />
      <MethodologySection />
      <PersonaSection currentPersona={currentPersona} setCurrentPersona={setCurrentPersona} blueprint={blueprint} />
      <AnswersSection blueprint={blueprint} quiz={quiz} />
      <OriginSection blueprint={blueprint} />
      <MissionSection blueprint={blueprint} />
      <ValuesSection blueprint={blueprint} />
      <VoiceSection blueprint={blueprint} />
      <AudienceSection blueprint={blueprint} />
      <PositioningSection blueprint={blueprint} />
      <CTASection />

      <footer className="bp-footer">18 Question Framework</footer>
    </div>
  )
}

function MethodologySection() {
  return (
    <section id="s-method" className="bp-section">
      <div className="bp-wrap">
        <div className="bp-sec-num">00</div>
        <h2 className="bp-sec-title">How This Was <em>Built</em></h2>
        <p className="bp-method-intro">This blueprint is not a personality quiz result or a mood board generator. It is a structured identity analysis built from 18 questions designed to surface the raw material that every lasting brand is actually made of - your story, your instincts, your values, and your blind spots.</p>
        <div className="bp-method-grid">
          {[
            { num: "01", title: "Identity Excavation", body: "Questions 2-5 ask about you - your formative experiences, your self-perception, your intrinsic motivations. The strongest brands are excavated from who the founder actually is." },
            { num: "02", title: "Market Positioning", body: "Questions 6, 7, 10, and 14 map your intellectual territory - your niche angle, your expertise, why you decided to build, and what you are actively opposed to." },
            { num: "03", title: "Customer & Product Reality", body: "Questions 11, 16, 17, and 18 force you to get specific about what you are actually building, who you are building it for, and why they would choose you." },
            { num: "04", title: "Vision & Values Architecture", body: "Questions 12, 13, and 15 capture your future self, your non-negotiable principles, and the deeper purpose behind the work." },
            { num: "05", title: "Founder-Led Advantage", body: "Questions 3, 8, and 9 map your evidence of capability, your cultural influences, and the experiences that shaped your eye." },
            { num: "06", title: "Honest Gap Analysis", body: "Every answer is read for both strengths and contradictions. What is strong gets amplified. What is weak or vague gets named directly." },
          ].map((c) => (
            <div key={c.num} className="bp-method-card">
              <div className="bp-method-card-num">Layer {c.num}</div>
              <div className="bp-method-card-title">{c.title}</div>
              <div className="bp-method-card-body">{c.body}</div>
            </div>
          ))}
        </div>
        <div className="bp-method-trust">
          <div className="bp-method-trust-icon">&#9670;</div>
          <div className="bp-method-trust-body"><strong>Why trust this analysis?</strong> Because it is built on observed patterns across hundreds of brand builders. The questions are not arbitrary; each one surfaces a specific signal that predicts whether a brand will have staying power or stall out.</div>
        </div>
      </div>
    </section>
  )
}

function PersonaSection({ currentPersona, setCurrentPersona, blueprint }: { currentPersona: "nolaunch" | "stalled"; setCurrentPersona: (p: "nolaunch" | "stalled") => void; blueprint: BlueprintContent }) {
  return (
    <section id="s-persona" className="bp-section">
      <div className="bp-wrap">
        <div className="bp-sec-num">01</div>
        <h2 className="bp-sec-title">Your <em>Persona</em></h2>
        <div className="bp-persona-switcher">
          <button className={`bp-ps-btn ${currentPersona === "nolaunch" ? "active" : ""}`} onClick={() => setCurrentPersona("nolaunch")}>No brand yet</button>
          <button className={`bp-ps-btn ${currentPersona === "stalled" ? "active" : ""}`} onClick={() => setCurrentPersona("stalled")}>Launched but stuck</button>
        </div>
        <div className={`bp-profile-card ${currentPersona === "nolaunch" ? "active" : ""}`}>
          <p>{blueprint.personas?.noLaunch}</p>
        </div>
        <div className={`bp-profile-card ${currentPersona === "stalled" ? "active" : ""}`}>
          <p>{blueprint.personas?.stalled}</p>
        </div>
      </div>
    </section>
  )
}

function QAAccordion({ num, question, answer, feedback }: { num: string; question: string; answer: string; feedback: { type: "strength" | "gap" | "coaching"; content: string }[] }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className={`bp-qa ${isOpen ? "open" : ""}`}>
      <div className="bp-qa-top" onClick={() => setIsOpen(!isOpen)}>
        <div className="bp-qa-left"><div className="bp-qa-num">{num}</div><div className="bp-qa-q">{question}</div></div>
        <div className="bp-qa-arrow">&#9662;</div>
      </div>
      <div className="bp-qa-detail">
        <div className="bp-qa-inner">
          <div className="bp-qa-ans">&ldquo;{answer}&rdquo;</div>
          {(Array.isArray(feedback) ? feedback : []).map((fb, i) => (
            <div key={i} className={`bp-fb bp-fb-${fb.type === "strength" ? "s" : fb.type === "gap" ? "w" : "c"}`}>
              <span className="bp-fb-tag">{fb.type === "strength" ? "Strength" : fb.type === "gap" ? "Gap" : "Coaching Note"}</span>
              <div>{fb.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AnswersSection({ blueprint, quiz }: { blueprint: BlueprintContent; quiz: Partial<QuizFormState> }) {
  const items = Array.isArray(blueprint.answerFeedback) ? blueprint.answerFeedback : []
  return (
    <section id="s-answers" className="bp-section">
      <div className="bp-wrap">
        <div className="bp-sec-num">02</div>
        <h2 className="bp-sec-title">Answers <em>& Feedback</em></h2>
        {items.map((item) => (
          <QAAccordion
            key={item.questionNumber}
            num={item.questionNumber}
            question={item.questionText}
            answer={item.answer}
            feedback={item.feedback}
          />
        ))}
        {items.length === 0 && (
          // Fallback: show raw quiz answers with no feedback if answerFeedback is empty
          Object.entries({
            Q2: quiz.changedWorldview, Q3: quiz.capableOfImpact, Q4: quiz.notUnderstood,
            Q5: quiz.moneyNoFactor, Q6: quiz.nichedInterest, Q7: quiz.closestExpert,
            Q9: quiz.thePast, Q10: quiz.theTurningPoint, Q11: quiz.thePresent,
            Q14: quiz.against, Q16: quiz.targetPerson, Q17: quiz.whatToSell, Q18: quiz.whyBuyFromYou,
          }).filter(([, v]) => v).map(([num, answer]) => (
            <QAAccordion key={num} num={num} question={num} answer={answer as string} feedback={[]} />
          ))
        )}
      </div>
    </section>
  )
}

function OriginSection({ blueprint }: { blueprint: BlueprintContent }) {
  const o = blueprint.originStory
  return (
    <section id="s-origin" className="bp-section">
      <div className="bp-wrap">
        <div className="bp-sec-num">03</div>
        <h2 className="bp-sec-title">Origin <em>Story</em></h2>
        <div className="bp-pull"><span className="bp-pull-mark">&ldquo;</span>{o?.pullQuote}<span className="bp-pull-mark">&rdquo;</span></div>
        <div className="bp-block"><div className="bp-block-label">The Narrative</div><div className="bp-block-body">{o?.narrative}</div></div>
        <div className="bp-block"><div className="bp-block-label">Why It Matters</div><div className="bp-block-body">{o?.whyItMatters}</div></div>
        {o?.coachingNote && <div className="bp-coach-note"><div className="bp-coach-note-label">Coaching Note</div>{o.coachingNote}</div>}
      </div>
    </section>
  )
}

function MissionSection({ blueprint }: { blueprint: BlueprintContent }) {
  const m = blueprint.missionVision
  return (
    <section id="s-mission" className="bp-section">
      <div className="bp-wrap">
        <div className="bp-sec-num">04</div>
        <h2 className="bp-sec-title">Mission <em>& Vision</em></h2>
        <div className="bp-block"><div className="bp-block-label">Mission Statement</div><div className="bp-block-body"><strong>{m?.mission}</strong></div></div>
        <div className="bp-block"><div className="bp-block-label">Vision Statement</div><div className="bp-block-body"><strong>{m?.vision}</strong></div></div>
        <div className="bp-block"><div className="bp-block-label">Brand Purpose</div><div className="bp-block-body">{m?.brandPurpose}</div></div>
        {m?.coachingNote && <div className="bp-coach-note"><div className="bp-coach-note-label">Coaching Note</div>{m.coachingNote}</div>}
      </div>
    </section>
  )
}

function ValuesSection({ blueprint }: { blueprint: BlueprintContent }) {
  const values = Array.isArray(blueprint.values) ? blueprint.values : []
  return (
    <section id="s-values" className="bp-section">
      <div className="bp-wrap">
        <div className="bp-sec-num">05</div>
        <h2 className="bp-sec-title">Core <em>Values</em></h2>
        {values.map((v) => (
          <div key={v.name} className="bp-val-row">
            <div className="bp-val-name">{v.name}</div>
            <div className="bp-val-desc">{v.definition}</div>
          </div>
        ))}
        {blueprint.valuesCoachingNote && <div className="bp-coach-note" style={{ marginTop: "24px" }}><div className="bp-coach-note-label">Coaching Note</div>{blueprint.valuesCoachingNote}</div>}
      </div>
    </section>
  )
}

function VoiceSection({ blueprint }: { blueprint: BlueprintContent }) {
  const v = blueprint.voice
  const isItems = Array.isArray(v?.is) ? v.is : []
  const isNotItems = Array.isArray(v?.isNot) ? v.isNot : []
  return (
    <section id="s-voice" className="bp-section">
      <div className="bp-wrap">
        <div className="bp-sec-num">06</div>
        <h2 className="bp-sec-title">Brand <em>Voice</em></h2>
        <div className="bp-voice-grid">
          <div className="bp-voice-col is">
            <div className="bp-voice-col-hdr">+ IS</div>
            {isItems.map((item, i) => <div key={i} className="bp-voice-item"><span className="bp-vi-prefix">+</span> {item}</div>)}
          </div>
          <div className="bp-voice-col isnot">
            <div className="bp-voice-col-hdr">- IS NOT</div>
            {isNotItems.map((item, i) => <div key={i} className="bp-voice-item"><span className="bp-vi-prefix">-</span> {item}</div>)}
          </div>
        </div>
        <div className="bp-block"><div className="bp-block-label">In Practice</div><div className="bp-block-body">{v?.inPractice}</div></div>
        {v?.coachingNote && <div className="bp-coach-note"><div className="bp-coach-note-label">Coaching Note</div>{v.coachingNote}</div>}
      </div>
    </section>
  )
}

function AudienceSection({ blueprint }: { blueprint: BlueprintContent }) {
  const a = blueprint.audience
  return (
    <section id="s-audience" className="bp-section">
      <div className="bp-wrap">
        <div className="bp-sec-num">07</div>
        <h2 className="bp-sec-title">Your <em>Audience</em></h2>
        {[
          { k: "Who", v: a?.who },
          { k: "Psyche", v: a?.psyche },
          { k: "Behavior", v: a?.behavior },
          { k: "Pain", v: a?.pain },
          { k: "Desire", v: a?.desire },
        ].filter((r) => r.v).map((r) => (
          <div key={r.k} className="bp-block"><div className="bp-block-label">{r.k}</div><div className="bp-block-body">{r.v}</div></div>
        ))}
        {a?.dayInLife && <div className="bp-pull"><span className="bp-pull-mark">&ldquo;</span>{a.dayInLife}<span className="bp-pull-mark">&rdquo;</span></div>}
        {a?.coachingNote && <div className="bp-coach-note"><div className="bp-coach-note-label">Coaching Note</div>{a.coachingNote}</div>}
      </div>
    </section>
  )
}

function PositioningSection({ blueprint }: { blueprint: BlueprintContent }) {
  const p = blueprint.positioning
  const opposition = Array.isArray(p?.opposition) ? p.opposition : []
  return (
    <section id="s-position" className="bp-section">
      <div className="bp-wrap">
        <div className="bp-sec-num">08</div>
        <h2 className="bp-sec-title">Brand <em>Positioning</em></h2>
        <div className="bp-pos-table">
          <div className="bp-pos-row"><div className="bp-pos-key">Category</div><div className="bp-pos-val">{p?.category}</div></div>
          <div className="bp-pos-row"><div className="bp-pos-key">Edge</div><div className="bp-pos-val">{p?.edge}</div></div>
          <div className="bp-pos-row"><div className="bp-pos-key">Hook</div><div className="bp-pos-val"><em>&ldquo;{p?.hook}&rdquo;</em></div></div>
          <div className="bp-pos-row"><div className="bp-pos-key">Promise</div><div className="bp-pos-val"><strong>{p?.promise}</strong></div></div>
        </div>
        {opposition.length > 0 && (
          <>
            <hr className="bp-divider" />
            {opposition.map((opp, i) => (
              <div key={i} className="bp-opp">
                <div className="bp-opp-x">&times;</div>
                <div className="bp-opp-text"><strong>{opp.label}</strong> &mdash; {opp.description}</div>
              </div>
            ))}
          </>
        )}
        {p?.coachingNote && <div className="bp-coach-note" style={{ marginTop: "24px" }}><div className="bp-coach-note-label">Coaching Note</div>{p.coachingNote}</div>}
      </div>
    </section>
  )
}

const ScoreSection = forwardRef<HTMLElement, { firstName: string; displayScore: number; scoreAnimated: boolean; overallScore: number; blueprint: BlueprintContent }>(
  function ScoreSection({ displayScore, scoreAnimated, blueprint }, ref) {
    const circumference = 377
    const offset = scoreAnimated ? circumference - (displayScore / 100) * circumference : circumference
    const s = blueprint.scores
    const scoreCategories = s ? [
      { label: "Clarity of Vision", score: s.clarityOfVision, tier: scoreTier(s.clarityOfVision) },
      { label: "Origin Story Strength", score: s.originStoryStrength, tier: scoreTier(s.originStoryStrength) },
      { label: "Audience Definition", score: s.audienceDefinition, tier: scoreTier(s.audienceDefinition) },
      { label: "Product Strategy", score: s.productStrategy, tier: scoreTier(s.productStrategy) },
      { label: "Competitive Moat", score: s.competitiveMoat, tier: scoreTier(s.competitiveMoat) },
      { label: "Execution Readiness", score: s.executionReadiness, tier: scoreTier(s.executionReadiness) },
    ] : []
    return (
      <section id="s-score" className="bp-section" ref={ref}>
        <div className="bp-wrap">
          <div className="bp-sec-num">01</div>
          <h2 className="bp-sec-title">Brand Readiness <em>Score</em></h2>
          <div className="bp-score-wrap">
            <div className="bp-score-ring-wrap">
              <svg width="160" height="160" viewBox="0 0 160 160">
                <defs><linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{ stopColor: "#C4A855" }} /><stop offset="100%" style={{ stopColor: "#D4BD7A" }} /></linearGradient></defs>
                <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <circle cx="80" cy="80" r="60" fill="none" stroke="url(#scoreGrad)" strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 80 80)" style={{ transition: "stroke-dashoffset 1.4s ease" }} />
                <text x="80" y="80" className="bp-score-num">{displayScore}</text>
                <text x="80" y="102" textAnchor="middle" fontSize="13" fontFamily="Inter,sans-serif" fill="rgba(255,255,255,0.4)">/100</text>
              </svg>
            </div>
            <div className="bp-score-breakdown">
              {scoreCategories.map((cat, i) => (
                <div key={cat.label} className={`bp-sb-item bp-sb-${cat.tier}`}>
                  <div className="bp-sb-label">{cat.label}</div>
                  <div className="bp-sb-bar-wrap"><div className="bp-sb-bar" style={{ width: scoreAnimated ? `${(cat.score / 10) * 100}%` : "0%", transitionDelay: `${0.2 + i * 0.12}s` }} /></div>
                  <div className="bp-sb-score">{cat.score}</div>
                </div>
              ))}
            </div>
          </div>
          {s?.assessment && (
            <div className="bp-coach-note" style={{ marginTop: "32px" }}>
              <div className="bp-coach-note-label">Assessment</div>
              {s.assessment}
            </div>
          )}
        </div>
      </section>
    )
  }
)

function CTASection() {
  return (
    <section id="cta" className="bp-cta">
      <div className="bp-wrap">
        <a href="https://4bucketframework.com/get-your-ticket" className="bp-cta-btn">
          Join Marshall Crew&apos;s upcoming live brand masterclass &rarr;
        </a>
      </div>
    </section>
  )
}

const blueprintStyles = `
:root {
  --bg: #06090F;
  --bg-elevated: #0C1017;
  --gold: #C4A855;
  --gold-soft: #D4BD7A;
  --gold-dim: rgba(196,168,85,0.12);
  --gold-border: rgba(196,168,85,0.2);
  --text: #CDD3DE;
  --text-dim: rgba(255,255,255,0.42);
  --text-faint: rgba(255,255,255,0.18);
  --rule: rgba(255,255,255,0.06);
  --green: #6EE7A0;
  --green-bg: rgba(110,231,160,0.07);
  --amber: #F0A44B;
  --amber-bg: rgba(240,164,75,0.07);
  --sky: #7CB8F5;
  --sky-bg: rgba(124,184,245,0.07);
  --sans: 'Inter', sans-serif;
  --serif: 'Playfair Display', serif;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
::selection { background: var(--gold); color: #000; }

.bp-page {
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  font-size: 15px;
  line-height: 1.7;
  min-height: 100vh;
  position: relative;
}

.bp-page::before {
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

.bp-wrap { max-width: 720px; margin: 0 auto; padding: 0 32px; }

.bp-hero { padding: 100px 0 80px; text-align: center; position: relative; z-index: 1; }
.bp-eyebrow { font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); margin-bottom: 28px; font-weight: 500; }
.bp-h1 { font-family: var(--serif); font-size: clamp(36px, 6vw, 64px); line-height: 1.1; color: #fff; margin-bottom: 24px; font-weight: 700; }
.bp-h1 em { color: var(--gold); font-style: italic; }
.bp-hero-sub { color: var(--text-dim); font-size: 16px; max-width: 480px; margin: 0 auto 40px; line-height: 1.8; }
.bp-meta-bar { display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; }
.bp-meta-item { text-align: center; }
.bp-meta-label { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--text-faint); display: block; margin-bottom: 4px; }
.bp-meta-val { font-size: 15px; font-weight: 600; color: var(--gold-soft); }

.bp-nav { position: sticky; top: 0; z-index: 100; background: rgba(6,9,15,0.85); backdrop-filter: blur(16px); border-bottom: 1px solid var(--rule); padding: 12px 0; overflow-x: auto; }
.bp-nav-inner { display: flex; justify-content: center; gap: 4px; flex-wrap: nowrap; padding: 0 20px; margin: 0 auto; }
.bp-nav-pill { padding: 6px 12px; border-radius: 100px; font-size: 11px; font-weight: 500; color: var(--text-dim); cursor: pointer; border: 1px solid transparent; transition: all 0.2s; white-space: nowrap; background: transparent; }
.bp-nav-pill:hover { color: var(--text); border-color: var(--gold-border); }
.bp-nav-pill.active { background: var(--gold-dim); border-color: var(--gold-border); color: var(--gold-soft); }

.bp-section { padding: 80px 0; border-bottom: 1px solid var(--rule); position: relative; z-index: 1; }
.bp-sec-num { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; font-weight: 500; }
.bp-sec-title { font-family: var(--serif); font-size: clamp(28px, 4vw, 42px); color: #fff; margin-bottom: 40px; line-height: 1.2; font-weight: 700; }
.bp-sec-title em { color: var(--gold); font-style: italic; }

.bp-method-intro { font-size: 16px; color: var(--text-dim); line-height: 1.9; max-width: 620px; margin-bottom: 48px; }
.bp-method-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 40px; }
.bp-method-card { background: var(--bg-elevated); border: 1px solid var(--rule); border-radius: 10px; padding: 24px 20px; transition: border-color 0.2s; }
.bp-method-card:hover { border-color: var(--gold-border); }
.bp-method-card-num { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); font-weight: 700; margin-bottom: 12px; }
.bp-method-card-title { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 8px; line-height: 1.4; }
.bp-method-card-body { font-size: 13px; color: var(--text-dim); line-height: 1.7; }
.bp-method-trust { background: var(--gold-dim); border: 1px solid var(--gold-border); border-radius: 10px; padding: 24px 28px; display: flex; gap: 20px; align-items: flex-start; }
.bp-method-trust-icon { font-size: 22px; flex-shrink: 0; line-height: 1; padding-top: 2px; color: var(--gold); }
.bp-method-trust-body { font-size: 14px; color: var(--text); line-height: 1.8; }
.bp-method-trust-body strong { color: var(--gold-soft); }

.bp-persona-switcher { display: flex; gap: 12px; margin-bottom: 32px; flex-wrap: wrap; }
.bp-ps-btn { padding: 10px 24px; border-radius: 6px; border: 1px solid var(--gold-border); background: transparent; color: var(--text-dim); font-family: var(--sans); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.bp-ps-btn:hover { color: var(--text); }
.bp-ps-btn.active { background: var(--gold-dim); border-color: var(--gold); color: var(--gold-soft); }
.bp-profile-card { background: var(--bg-elevated); border: 1px solid var(--rule); border-radius: 12px; padding: 28px; display: none; }
.bp-profile-card.active { display: block; }
.bp-profile-card p { color: var(--text); line-height: 1.8; font-size: 15px; }

.bp-qa { border: 1px solid var(--rule); border-radius: 10px; margin-bottom: 12px; overflow: hidden; background: var(--bg-elevated); transition: border-color 0.2s; }
.bp-qa:hover { border-color: var(--gold-border); }
.bp-qa.open { border-color: var(--gold-border); }
.bp-qa-top { display: flex; align-items: flex-start; justify-content: space-between; padding: 20px 24px; cursor: pointer; gap: 16px; }
.bp-qa-left { display: flex; gap: 16px; align-items: flex-start; }
.bp-qa-num { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); font-weight: 600; padding-top: 2px; white-space: nowrap; }
.bp-qa-q { font-size: 14px; font-weight: 600; color: #fff; line-height: 1.5; }
.bp-qa-arrow { color: var(--text-faint); font-size: 14px; transition: transform 0.25s; flex-shrink: 0; padding-top: 2px; }
.bp-qa.open .bp-qa-arrow { transform: rotate(180deg); color: var(--gold); }
.bp-qa-detail { max-height: 0; overflow: hidden; transition: max-height 0.35s ease; }
.bp-qa.open .bp-qa-detail { max-height: 2000px; }
.bp-qa-inner { padding: 0 24px 24px; border-top: 1px solid var(--rule); }
.bp-qa-ans { font-size: 14px; color: var(--text-dim); font-style: italic; line-height: 1.8; padding: 16px 0; border-bottom: 1px solid var(--rule); margin-bottom: 16px; }
.bp-fb { padding: 16px; border-radius: 8px; margin-bottom: 10px; font-size: 13.5px; line-height: 1.7; }
.bp-fb:last-child { margin-bottom: 0; }
.bp-fb-s { background: var(--green-bg); border: 1px solid rgba(110,231,160,0.15); }
.bp-fb-w { background: var(--amber-bg); border: 1px solid rgba(240,164,75,0.15); }
.bp-fb-c { background: var(--sky-bg); border: 1px solid rgba(124,184,245,0.15); }
.bp-fb-tag { display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 2px 8px; border-radius: 4px; margin-bottom: 8px; }
.bp-fb-s .bp-fb-tag { color: var(--green); background: rgba(110,231,160,0.12); }
.bp-fb-w .bp-fb-tag { color: var(--amber); background: rgba(240,164,75,0.12); }
.bp-fb-c .bp-fb-tag { color: var(--sky); background: rgba(124,184,245,0.12); }

.bp-pull { font-family: var(--serif); font-size: clamp(20px, 3vw, 28px); font-style: italic; color: var(--gold-soft); line-height: 1.6; text-align: center; padding: 40px 0; border-top: 1px solid var(--gold-border); border-bottom: 1px solid var(--gold-border); margin: 40px 0; }
.bp-pull-mark { color: var(--gold); font-size: 1.5em; line-height: 0; vertical-align: -10px; }

.bp-block { background: var(--bg-elevated); border: 1px solid var(--rule); border-left: 3px solid var(--gold); border-radius: 0 10px 10px 0; padding: 20px 24px; margin-bottom: 16px; }
.bp-block-label { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); font-weight: 600; margin-bottom: 8px; }
.bp-block-body { font-size: 15px; line-height: 1.8; color: var(--text); }
.bp-block-body strong { color: #fff; }

.bp-coach-note { background: var(--sky-bg); border: 1px solid rgba(124,184,245,0.15); border-radius: 10px; padding: 20px 24px; margin-top: 24px; font-size: 14px; line-height: 1.8; color: var(--text); }
.bp-coach-note-label { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--sky); font-weight: 700; margin-bottom: 8px; }

.bp-val-row { display: grid; grid-template-columns: 180px 1fr; gap: 24px; padding: 20px 0; border-bottom: 1px solid var(--rule); align-items: start; }
.bp-val-row:last-of-type { border-bottom: none; }
.bp-val-name { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); font-weight: 700; padding-top: 2px; }
.bp-val-desc { font-size: 14px; line-height: 1.8; color: var(--text); }

.bp-voice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
.bp-voice-col { background: var(--bg-elevated); border: 1px solid var(--rule); border-radius: 10px; padding: 24px; }
.bp-voice-col-hdr { font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--rule); }
.bp-voice-col.is .bp-voice-col-hdr { color: var(--green); }
.bp-voice-col.isnot .bp-voice-col-hdr { color: var(--amber); }
.bp-voice-item { display: flex; gap: 10px; margin-bottom: 12px; font-size: 13.5px; line-height: 1.6; color: var(--text); align-items: flex-start; }
.bp-voice-item:last-child { margin-bottom: 0; }
.bp-vi-prefix { font-weight: 700; flex-shrink: 0; font-size: 15px; line-height: 1.3; }
.bp-voice-col.is .bp-vi-prefix { color: var(--green); }
.bp-voice-col.isnot .bp-vi-prefix { color: var(--amber); }

.bp-pos-table { background: var(--bg-elevated); border: 1px solid var(--rule); border-radius: 10px; overflow: hidden; margin-bottom: 24px; }
.bp-pos-row { display: grid; grid-template-columns: 140px 1fr; border-bottom: 1px solid var(--rule); }
.bp-pos-row:last-child { border-bottom: none; }
.bp-pos-key { padding: 18px 20px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); font-weight: 700; border-right: 1px solid var(--rule); display: flex; align-items: center; }
.bp-pos-val { padding: 18px 20px; font-size: 14px; line-height: 1.7; color: var(--text); }
.bp-pos-val em { font-style: italic; color: var(--text-dim); }
.bp-pos-val strong { color: var(--gold-soft); font-weight: 600; }

.bp-opp { display: flex; gap: 14px; padding: 16px 20px; background: var(--bg-elevated); border: 1px solid var(--rule); border-radius: 8px; margin-bottom: 10px; align-items: flex-start; }
.bp-opp-x { color: var(--amber); font-size: 18px; flex-shrink: 0; line-height: 1.4; font-weight: 700; }
.bp-opp-text { font-size: 13.5px; line-height: 1.7; color: var(--text); }
.bp-opp-text strong { color: #fff; }

.bp-divider { border: none; border-top: 1px solid var(--rule); margin: 32px 0; }

.bp-score-wrap { display: flex; gap: 48px; align-items: flex-start; flex-wrap: wrap; }
.bp-score-ring-wrap { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
.bp-score-num { font-family: var(--serif); font-size: 40px; font-weight: 700; fill: #fff; dominant-baseline: middle; text-anchor: middle; }
.bp-score-breakdown { flex: 1; min-width: 280px; }
.bp-sb-item { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.bp-sb-item:last-child { margin-bottom: 0; }
.bp-sb-label { font-size: 13px; color: var(--text-dim); flex: 1; line-height: 1.4; }
.bp-sb-bar-wrap { width: 80px; height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; }
.bp-sb-bar { height: 100%; border-radius: 2px; width: 0; transition: width 1.4s ease 0.2s; }
.bp-sb-hi .bp-sb-bar { background: var(--green); }
.bp-sb-mid .bp-sb-bar { background: var(--gold); }
.bp-sb-lo .bp-sb-bar { background: var(--amber); }
.bp-sb-score { font-size: 13px; font-weight: 600; width: 26px; text-align: right; }
.bp-sb-hi .bp-sb-score { color: var(--green); }
.bp-sb-mid .bp-sb-score { color: var(--gold); }
.bp-sb-lo .bp-sb-score { color: var(--amber); }

.bp-cta { padding: 80px 0; text-align: center; border-bottom: none; }
.bp-cta h2 { font-family: var(--serif); font-size: clamp(28px, 4vw, 42px); color: #fff; margin-bottom: 16px; }
.bp-cta h2 em { color: var(--gold); font-style: italic; }
.bp-cta p { color: var(--text-dim); font-size: 16px; max-width: 420px; margin: 0 auto 36px; line-height: 1.8; }
.bp-cta-btn { display: inline-block; background: linear-gradient(135deg, var(--gold) 0%, var(--gold-soft) 100%); color: #000; font-family: var(--sans); font-size: 14px; font-weight: 700; padding: 16px 40px; border-radius: 6px; letter-spacing: 0.5px; text-decoration: none; transition: opacity 0.2s, transform 0.2s; border: none; cursor: pointer; }
.bp-cta-btn:hover { opacity: 0.9; transform: translateY(-2px); }

.bp-next-step { background: var(--bg-elevated); border: 1px solid var(--rule); border-radius: 10px; padding: 20px 24px; display: flex; gap: 16px; align-items: flex-start; }
.bp-next-step-num { color: var(--gold); font-weight: 700; font-size: 14px; flex-shrink: 0; width: 24px; }

.bp-footer { padding: 32px 0; text-align: center; color: var(--text-faint); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; border-top: 1px solid var(--rule); position: relative; z-index: 1; }

@media (max-width: 600px) {
  .bp-method-grid { grid-template-columns: 1fr; }
  .bp-method-trust { flex-direction: column; gap: 12px; }
  .bp-voice-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .bp-wrap { padding: 0 20px; }
  .bp-hero { padding: 60px 0 48px; }
  .bp-meta-bar { gap: 20px; }
  .bp-nav { overflow-x: auto; }
  .bp-nav-inner { flex-wrap: nowrap; justify-content: flex-start; padding: 0 16px; }
  .bp-section { padding: 48px 0; }
  .bp-sec-title { font-size: 24px; margin-bottom: 28px; }
  .bp-persona-switcher { flex-direction: column; }
  .bp-ps-btn { width: 100%; }
  .bp-qa-top { padding: 16px; }
  .bp-qa-inner { padding: 0 16px 16px; }
  .bp-qa-q { font-size: 13px; }
  .bp-fb { padding: 12px; font-size: 12.5px; }
  .bp-pull { font-size: 18px; }
  .bp-val-row { grid-template-columns: 1fr; gap: 8px; }
  .bp-score-wrap { flex-direction: column; align-items: center; }
  .bp-score-breakdown { width: 100%; }
  .bp-cta-btn { width: 100%; text-align: center; }
  .bp-block-body { font-size: 14px; }
  .bp-pos-row { grid-template-columns: 110px 1fr; }
}
`
