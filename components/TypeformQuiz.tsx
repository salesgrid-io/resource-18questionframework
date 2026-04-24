"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  QuestionWrapper,
  TypeformTextInput,
  TypeformTextarea,
  TypeformOptions,
  PillInput,
  BreatherScreen,
} from "./TypeformQuestion"
import type { QuizFormState } from "@/lib/automation/types"

type Situation = QuizFormState["situation"]

interface TypeformQuizProps {
  onComplete: (form: QuizFormState, isDisqualified: boolean) => void
  initialStep?: number
  initialForm?: QuizFormState
  onProgress?: (payload: { currentStep: number; form: QuizFormState }) => void
  onQuestionAdvance?: (payload: {
    questionIndex: number
    questionNumber: number
    stepKey: string
    value: unknown
    form: QuizFormState
  }) => void
}

// ─── Options ──────────────────────────────────────────────────────────────────

const situationOptions = [
  { label: "Just an idea", value: "Just an idea", icon: "💡" },
  { label: "Starting to build", value: "Starting to build", icon: "🛠️" },
  { label: "Launched but stuck", value: "Launched but stuck", icon: "🚀" },
  { label: "Scaling and ready for impact", value: "Scaling and ready for impact", icon: "📈" },
]

const impactOptions = [
  { label: "Yes, absolutely", value: "Yes, absolutely" },
  { label: "I'm working on believing it", value: "I'm working on believing it" },
  { label: "Not yet, but I want to", value: "Not yet, but I want to" },
]

// ─── Step types ───────────────────────────────────────────────────────────────

type Step =
  | { type: "question"; questionIndex: number }
  | { type: "breather"; icon: "fire" | "sparkle" | "heart" | "rocket" | "brain" | "compass" | "merge"; headline: string; subtext: string }

const quizFlow: Step[] = [
  { type: "question", questionIndex: 0 },  // Q1 — name
  { type: "question", questionIndex: 1 },  // Q1 — age
  { type: "question", questionIndex: 2 },  // Q1 — situation
  { type: "breather", icon: "fire", headline: "Great.", subtext: "Now that we're clear with where you're at let's dive more into who you are." },
  { type: "question", questionIndex: 3 },  // Q2 — changed worldview
  { type: "question", questionIndex: 4 },  // Q3 — capable of impact
  { type: "question", questionIndex: 5 },  // Q4 — not understood
  { type: "question", questionIndex: 6 },  // Q5 — money no factor
  { type: "question", questionIndex: 7 },  // Q6 — niched interest
  { type: "question", questionIndex: 8 },  // Q7 — closest expert
  { type: "question", questionIndex: 9 },  // Q8 — characters
  { type: "breather", icon: "compass", headline: "Cool.", subtext: "Now that we are familiar with who YOU are, let's get into some point of reference…" },
  { type: "question", questionIndex: 10 }, // Q9 — the past
  { type: "question", questionIndex: 11 }, // Q10 — the turning point
  { type: "question", questionIndex: 12 }, // Q11 — the present
  { type: "question", questionIndex: 13 }, // Q12 — the future
  { type: "breather", icon: "merge", headline: "Almost there.", subtext: "Now lets merge who YOU ARE and your points of inspiration." },
  { type: "question", questionIndex: 14 }, // Q13 — values
  { type: "question", questionIndex: 15 }, // Q14 — stand against
  { type: "question", questionIndex: 16 }, // Q15 — why impact
  { type: "question", questionIndex: 17 }, // Q16 — target person
  { type: "question", questionIndex: 18 }, // Q17 — what to sell
  { type: "question", questionIndex: 19 }, // Q18 — why buy from you
]

// ─── Low-effort answer detection ──────────────────────────────────────────────

const GENERIC_PHRASES = [
  "i don't know", "idk", "not sure", "a lot of things", "a lot",
  "quality and different", "good quality", "high quality", "just quality",
  "inauthenticity", "fast fashion", "be myself", "just be myself", "be real", "be authentic",
  "everyone", "everybody", "anyone", "all people", "young people who like fashion",
  "people who like fashion", "people who like clothes", "nice things", "good stuff",
]

const LOW_EFFORT_WARNINGS: Partial<Record<number, string>> = {
  3:  "That's not enough to build with. Something actually changed how you see the world — name it. What happened, what shifted in you, and why did it matter?",
  5:  "Too vague. There's something specific about you that people consistently misread. What is it actually? Name the thing — not a feeling, the specific thing.",
  6:  "A one-liner doesn't cut it here. This reveals your intrinsic drive. What would actually fill your days if money wasn't the constraint? Be specific.",
  7:  "That could be anyone. What niche are you actually deep in — a subculture, a craft, an obsession — that most people around you don't know as well?",
  8:  "Expertise isn't just \"fashion\" or \"style.\" What specific angle or body of knowledge do you have that most people in your space don't? Get specific.",
  10: "We need more than a sentence. Your past is the raw material for your brand's origin story. What actually happened, and what did it make you into?",
  11: "What was the actual moment? The frustration, the gap you saw, the thing that made you say enough? This is your founding story — make it real.",
  12: "Too general. What specifically are you building — what's the product, the ethos, who is it actually for, and what makes it different from everything else out there?",
  13: "\"Success\" and \"impact\" mean nothing here. Where are you specifically in 5 years? What does the brand look like, what have you shipped, who's wearing it?",
  15: "\"Fast fashion\" and \"inauthenticity\" are what every brand says. What is YOUR brand specifically opposed to — a behavior, a culture, a way of doing things you're actively rejecting?",
  16: "We need the real answer. Not \"because I want to help people.\" Why does making impact matter to YOU personally? What's at stake if you don't build this?",
  17: "\"Young people who like fashion\" is 500 million people. Who specifically — their mindset, their situation, what they're tired of, what they believe. Get specific or this section falls apart.",
  18: "Too vague. What specifically — what type of pieces, what aesthetic, what drop cadence, what price point? Give us something real to work with.",
  19: "\"Quality\" and \"different\" are what every brand claims and what no customer believes. What is actually unreplicable about you — your story, your obsession, your perspective, your community?",
}

function detectLowEffort(_questionIndex: number, _value: string): string | null {
  return null
}

// ─── Main Component ───────────────────────────────────────────────────────────

const emptyQuizState: QuizFormState = {
  name: "",
  age: "",
  situation: "",
  changedWorldview: "",
  capableOfImpact: "",
  notUnderstood: "",
  moneyNoFactor: "",
  nichedInterest: "",
  closestExpert: "",
  characters: [],
  thePast: "",
  theTurningPoint: "",
  thePresent: "",
  theFuture: "",
  values: [],
  against: "",
  whyImpact: "",
  targetPerson: "",
  whatToSell: "",
  whyBuyFromYou: "",
}

const questionFieldMap: Array<keyof QuizFormState> = [
  "name",
  "age",
  "situation",
  "changedWorldview",
  "capableOfImpact",
  "notUnderstood",
  "moneyNoFactor",
  "nichedInterest",
  "closestExpert",
  "characters",
  "thePast",
  "theTurningPoint",
  "thePresent",
  "theFuture",
  "values",
  "against",
  "whyImpact",
  "targetPerson",
  "whatToSell",
  "whyBuyFromYou",
]

export default function TypeformQuiz({
  onComplete,
  initialStep = 0,
  initialForm = emptyQuizState,
  onProgress,
  onQuestionAdvance,
}: TypeformQuizProps) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [form, setForm] = useState<QuizFormState>({
    ...emptyQuizState,
    ...initialForm,
  })
  const [lowEffortWarning, setLowEffortWarning] = useState<string | null>(null)

  const totalQuestions = 18
  const totalSteps = quizFlow.length
  const currentStepData = quizFlow[currentStep]

  const getCurrentQuestionNumber = () => {
    let count = 0
    for (let i = 0; i <= currentStep; i++) {
      if (quizFlow[i].type === "question") count++
    }
    return count
  }

  const setField = useCallback(<K extends keyof QuizFormState>(key: K, value: QuizFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setLowEffortWarning(null)
  }, [])

  useEffect(() => {
    onProgress?.({ currentStep, form })
  }, [currentStep, form, onProgress])

  function goNext() {
    if (currentStepData.type === "question") {
      const questionIndex = currentStepData.questionIndex
      const stepKey = questionFieldMap[questionIndex]
      const value = form[stepKey]

      // Check for low-effort text answers before advancing
      if (typeof value === "string") {
        const warning = detectLowEffort(questionIndex, value)
        if (warning) {
          setLowEffortWarning(warning)
          return
        }
      }

      setLowEffortWarning(null)
      onQuestionAdvance?.({
        questionIndex,
        questionNumber: getCurrentQuestionNumber(),
        stepKey,
        value,
        form,
      })
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      const isDisqualified =
        form.situation === "Just an idea" || form.situation === "Starting to build"
      onComplete(form, isDisqualified)
    }
  }

  const goBack = useCallback(() => {
    setLowEffortWarning(null)
    let prevStep = currentStep - 1
    while (prevStep >= 0 && quizFlow[prevStep].type === "breather") {
      prevStep--
    }
    if (prevStep >= 0) {
      setCurrentStep(prevStep)
    }
  }, [currentStep])

  // ─── Render ───────────────────────────────────────────────────────────────

  const renderStep = () => {
    if (currentStepData.type === "breather") {
      return (
        <BreatherScreen
          icon={currentStepData.icon}
          headline={currentStepData.headline}
          subtext={currentStepData.subtext}
          onContinue={goNext}
        />
      )
    }

    const questionIndex = currentStepData.questionIndex

    switch (questionIndex) {

      // ── Q1a: Name ────────────────────────────────────────────────────────
      case 0:
        return (
          <QuestionWrapper
            questionNumber={1}
            totalQuestions={totalQuestions}
            question="What is your name?"
            onNext={goNext}
            canContinue={form.name.trim() !== ""}
          >
            <TypeformTextInput
              value={form.name}
              onChange={(v) => setField("name", v)}
              placeholder=""
              onSubmit={goNext}
            />
          </QuestionWrapper>
        )

      // ── Q1b: Age ─────────────────────────────────────────────────────────
      case 1:
        return (
          <QuestionWrapper
            questionNumber={1}
            totalQuestions={totalQuestions}
            question={`Nice to meet you, ${form.name || "you"}. How old are you?`}
            onBack={goBack}
            onNext={goNext}
            canContinue={form.age.trim() !== ""}
          >
            <TypeformTextInput
              value={form.age}
              onChange={(v) => setField("age", v)}
              placeholder=""
              type="number"
              onSubmit={goNext}
            />
          </QuestionWrapper>
        )

      // ── Q1c: Situation ───────────────────────────────────────────────────
      case 2:
        return (
          <QuestionWrapper
            questionNumber={1}
            totalQuestions={totalQuestions}
            question="What describes your current situation with your brand?"
            onBack={goBack}
            showContinue={false}
          >
            <TypeformOptions
              options={situationOptions}
              value={form.situation}
              onChange={(v) => setField("situation", v as Situation)}
              onSubmit={goNext}
            />
          </QuestionWrapper>
        )

      // ── Q2: Changed worldview ─────────────────────────────────────────────
      case 3:
        return (
          <QuestionWrapper
            questionNumber={2}
            totalQuestions={totalQuestions}
            question="What's something you've been through that changed how you see the world?"
            onBack={goBack}
            onNext={goNext}
            canContinue={form.changedWorldview.trim() !== "" && !lowEffortWarning}
            warning={lowEffortWarning}
          >
            <TypeformTextarea
              value={form.changedWorldview}
              onChange={(v) => setField("changedWorldview", v)}
              placeholder=""
              onSubmit={goNext}
            />
          </QuestionWrapper>
        )

      // ── Q3: Capable of impact ─────────────────────────────────────────────
      case 4:
        return (
          <QuestionWrapper
            questionNumber={3}
            totalQuestions={totalQuestions}
            question="Do you see yourself as a person capable of creating something impactful?"
            onBack={goBack}
            showContinue={false}
          >
            <TypeformOptions
              options={impactOptions}
              value={form.capableOfImpact}
              onChange={(v) => setField("capableOfImpact", v)}
              onSubmit={goNext}
            />
          </QuestionWrapper>
        )

      // ── Q4: Not understood ────────────────────────────────────────────────
      case 5:
        return (
          <QuestionWrapper
            questionNumber={4}
            totalQuestions={totalQuestions}
            question="What's one thing about yourself that you wish people understood more?"
            onBack={goBack}
            onNext={goNext}
            canContinue={form.notUnderstood.trim() !== "" && !lowEffortWarning}
            warning={lowEffortWarning}
          >
            <TypeformTextarea
              value={form.notUnderstood}
              onChange={(v) => setField("notUnderstood", v)}
              placeholder=""
              onSubmit={goNext}
            />
          </QuestionWrapper>
        )

      // ── Q5: Money no factor ───────────────────────────────────────────────
      case 6:
        return (
          <QuestionWrapper
            questionNumber={5}
            totalQuestions={totalQuestions}
            question="If money wasn't a factor, what would you spend your time doing?"
            onBack={goBack}
            onNext={goNext}
            canContinue={form.moneyNoFactor.trim() !== "" && !lowEffortWarning}
            warning={lowEffortWarning}
          >
            <TypeformTextarea
              value={form.moneyNoFactor}
              onChange={(v) => setField("moneyNoFactor", v)}
              placeholder=""
              onSubmit={goNext}
            />
          </QuestionWrapper>
        )

      // ── Q6: Niched interest ───────────────────────────────────────────────
      case 7:
        return (
          <QuestionWrapper
            questionNumber={6}
            totalQuestions={totalQuestions}
            question="What is a niched interest that you enjoy?"
            onBack={goBack}
            onNext={goNext}
            canContinue={form.nichedInterest.trim() !== "" && !lowEffortWarning}
            warning={lowEffortWarning}
          >
            <TypeformTextarea
              value={form.nichedInterest}
              onChange={(v) => setField("nichedInterest", v)}
              placeholder=""
              onSubmit={goNext}
            />
          </QuestionWrapper>
        )

      // ── Q7: Closest expert ────────────────────────────────────────────────
      case 8:
        return (
          <QuestionWrapper
            questionNumber={7}
            totalQuestions={totalQuestions}
            question="What is something you feel you are closest to being an expert in?"
            onBack={goBack}
            onNext={goNext}
            canContinue={form.closestExpert.trim() !== "" && !lowEffortWarning}
            warning={lowEffortWarning}
          >
            <TypeformTextarea
              value={form.closestExpert}
              onChange={(v) => setField("closestExpert", v)}
              placeholder=""
              onSubmit={goNext}
            />
          </QuestionWrapper>
        )

      // ── Q8: Characters ────────────────────────────────────────────────────
      case 9:
        return (
          <QuestionWrapper
            questionNumber={8}
            totalQuestions={totalQuestions}
            question="List 3-5 fictional or nonfictional characters you resonate with or are inspired by"
            onBack={goBack}
            onNext={goNext}
            canContinue={form.characters.length >= 3}
          >
            <PillInput
              value={form.characters}
              onChange={(v) => setField("characters", v)}
              placeholder=""
              maxPills={5}
              minPills={3}
            />
          </QuestionWrapper>
        )

      // ── Q9: The Past ──────────────────────────────────────────────────────
      case 10:
        return (
          <QuestionWrapper
            questionNumber={9}
            totalQuestions={totalQuestions}
            question="What past experiences shaped who you are today?"
            onBack={goBack}
            onNext={goNext}
            canContinue={form.thePast.trim() !== "" && !lowEffortWarning}
            warning={lowEffortWarning}
          >
            <TypeformTextarea
              value={form.thePast}
              onChange={(v) => setField("thePast", v)}
              placeholder=""
              onSubmit={goNext}
            />
          </QuestionWrapper>
        )

      // ── Q10: The Turning Point ────────────────────────────────────────────
      case 11:
        return (
          <QuestionWrapper
            questionNumber={10}
            totalQuestions={totalQuestions}
            question="What made you decide to build this brand?"
            onBack={goBack}
            onNext={goNext}
            canContinue={form.theTurningPoint.trim() !== "" && !lowEffortWarning}
            warning={lowEffortWarning}
          >
            <TypeformTextarea
              value={form.theTurningPoint}
              onChange={(v) => setField("theTurningPoint", v)}
              placeholder=""
              onSubmit={goNext}
            />
          </QuestionWrapper>
        )

      // ── Q11: The Present ──────────────────────────────────────────────────
      case 12:
        return (
          <QuestionWrapper
            questionNumber={11}
            totalQuestions={totalQuestions}
            question="What are you creating and why?"
            onBack={goBack}
            onNext={goNext}
            canContinue={form.thePresent.trim() !== "" && !lowEffortWarning}
            warning={lowEffortWarning}
          >
            <TypeformTextarea
              value={form.thePresent}
              onChange={(v) => setField("thePresent", v)}
              placeholder=""
              onSubmit={goNext}
            />
          </QuestionWrapper>
        )

      // ── Q12: The Future ───────────────────────────────────────────────────
      case 13:
        return (
          <QuestionWrapper
            questionNumber={12}
            totalQuestions={totalQuestions}
            question="What do you envision for your best self in the future?"
            onBack={goBack}
            onNext={goNext}
            canContinue={form.theFuture.trim() !== "" && !lowEffortWarning}
            warning={lowEffortWarning}
          >
            <TypeformTextarea
              value={form.theFuture}
              onChange={(v) => setField("theFuture", v)}
              placeholder=""
              onSubmit={goNext}
            />
          </QuestionWrapper>
        )

      // ── Q13: Values ───────────────────────────────────────────────────────
      case 14:
        return (
          <QuestionWrapper
            questionNumber={13}
            totalQuestions={totalQuestions}
            question="What values do you hold close?"
            onBack={goBack}
            onNext={goNext}
            canContinue={form.values.length >= 3}
          >
            <PillInput
              value={form.values}
              onChange={(v) => setField("values", v)}
              placeholder=""
              maxPills={5}
              minPills={3}
            />
          </QuestionWrapper>
        )

      // ── Q14: Stand Against ────────────────────────────────────────────────
      case 15:
        return (
          <QuestionWrapper
            questionNumber={14}
            totalQuestions={totalQuestions}
            question="What do you (your brand) stand AGAINST?"
            onBack={goBack}
            onNext={goNext}
            canContinue={form.against.trim() !== "" && !lowEffortWarning}
            warning={lowEffortWarning}
          >
            <TypeformTextarea
              value={form.against}
              onChange={(v) => setField("against", v)}
              placeholder=""
              onSubmit={goNext}
            />
          </QuestionWrapper>
        )

      // ── Q15: Why impact ───────────────────────────────────────────────────
      case 16:
        return (
          <QuestionWrapper
            questionNumber={15}
            totalQuestions={totalQuestions}
            question="Why is it so important you make impact?"
            onBack={goBack}
            onNext={goNext}
            canContinue={form.whyImpact.trim() !== "" && !lowEffortWarning}
            warning={lowEffortWarning}
          >
            <TypeformTextarea
              value={form.whyImpact}
              onChange={(v) => setField("whyImpact", v)}
              placeholder=""
              onSubmit={goNext}
            />
          </QuestionWrapper>
        )

      // ── Q16: Target person ────────────────────────────────────────────────
      case 17:
        return (
          <QuestionWrapper
            questionNumber={16}
            totalQuestions={totalQuestions}
            question="What type of person do you want to reach?"
            onBack={goBack}
            onNext={goNext}
            canContinue={form.targetPerson.trim() !== "" && !lowEffortWarning}
            warning={lowEffortWarning}
          >
            <TypeformTextarea
              value={form.targetPerson}
              onChange={(v) => setField("targetPerson", v)}
              placeholder=""
              onSubmit={goNext}
            />
          </QuestionWrapper>
        )

      // ── Q17: What to sell ─────────────────────────────────────────────────
      case 18:
        return (
          <QuestionWrapper
            questionNumber={17}
            totalQuestions={totalQuestions}
            question="What do you want to sell to them?"
            onBack={goBack}
            onNext={goNext}
            canContinue={form.whatToSell.trim() !== "" && !lowEffortWarning}
            warning={lowEffortWarning}
          >
            <TypeformTextarea
              value={form.whatToSell}
              onChange={(v) => setField("whatToSell", v)}
              placeholder=""
              onSubmit={goNext}
            />
          </QuestionWrapper>
        )

      // ── Q18: Why buy from you ─────────────────────────────────────────────
      case 19:
        return (
          <QuestionWrapper
            questionNumber={18}
            totalQuestions={totalQuestions}
            question="Why are they going to buy from you instead of another brand that offers the same thing to the same people?"
            onBack={goBack}
            onNext={goNext}
            canContinue={form.whyBuyFromYou.trim() !== "" && !lowEffortWarning}
            warning={lowEffortWarning}
          >
            <TypeformTextarea
              value={form.whyBuyFromYou}
              onChange={(v) => setField("whyBuyFromYou", v)}
              placeholder=""
              onSubmit={goNext}
            />
          </QuestionWrapper>
        )

      default:
        return null
    }
  }

  const progressPercent = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="blueprint-bg relative flex min-h-screen w-full items-center justify-center">
      {/* Progress bar */}
      <div className="fixed left-0 right-0 top-0 z-50 h-1 bg-[#35281e]/30">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #8b7a45, #b59e5f, #d4c08a)",
            boxShadow: "0 0 20px rgba(181,158,95,0.3)",
          }}
          initial={{ width: "0%" }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Ambient effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-[800px] w-[800px] rounded-full bg-[#b59e5f]/[0.02] blur-[120px]" />
        <div className="absolute -right-1/4 bottom-0 h-[600px] w-[600px] rounded-full bg-[#35281e]/[0.02] blur-[100px]" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentStep} className="relative z-10 w-full py-20">
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
