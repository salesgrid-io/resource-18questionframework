"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import DNAAnalysisScreen from "./DNAAnalysisScreen"
import TypeformQuiz from "./TypeformQuiz"
import type { BookingFormState, FunnelEventPayload, OptInFormState, QuizFormState, UtmData } from "@/lib/automation/types"
import { clearPersistedFunnelState, loadPersistedFunnelState, savePersistedFunnelState } from "@/lib/client/funnel-storage"
import { trackFunnelEvent } from "@/lib/client/tracking"

type Screen =
  | "landing"
  | "quiz"
  | "analyzing"
  | "goodnews"
  | "optin"
  | "disqualified"
  | "generating"
  | "complete"

// ─── Animation variants ────────────────────────────────────────────────────────

const slideVariants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const transition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }

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

const emptyOptInState: OptInFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  countryCode: "+1",
}

const emptyBookingState: BookingFormState = {
  brandFuture: "",
  whyImpact: "",
}

const WEBINAR_POST_OPT_IN_URL = "https://4bucketframework.com/get-your-ticket"

// ─── Sub-components ───────────────────────────────────────────────────────────

function GoldButton({
  children,
  onClick,
  disabled,
  className = "",
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl px-8 py-4 text-base font-semibold text-black transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      style={{
        background: "linear-gradient(135deg, #b59e5f 0%, #d4c08a 50%, #8b7a45 100%)",
        boxShadow: "0 4px 20px rgba(181,158,95,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
      }}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
      <span className="relative">{children}</span>
    </button>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function BrandAuditFunnel() {
  const [screen, setScreen] = useState<Screen>("landing")
  const [sessionId, setSessionId] = useState("")
  const [browserId, setBrowserId] = useState("")
  const [leadId, setLeadId] = useState<string | null>(null)
  const [initialQuizStep, setInitialQuizStep] = useState(0)
  const [isHydrated, setIsHydrated] = useState(false)

  // UTM tracking — captured from URL on mount
  const [utmData, setUtmData] = useState<UtmData>({
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_content: "",
  })

  // Quiz data
  const [quizData, setQuizData] = useState<QuizFormState>(emptyQuizState)
  const [isDisqualified, setIsDisqualified] = useState(false)

  // Opt-in form
  const [optInForm, setOptInForm] = useState<OptInFormState>(emptyOptInState)

  // Booking form
  const [bookingForm, setBookingForm] = useState<BookingFormState>(emptyBookingState)

  const [dqSubmitted, setDqSubmitted] = useState(false)
  const [optInSubmitting, setOptInSubmitting] = useState(false)
  const [pendingBlueprintUrl, setPendingBlueprintUrl] = useState<string | null>(null)
  const [pendingBlueprintId, setPendingBlueprintId] = useState<string | null>(null)

  const buildPayload = useCallback((overrides: Partial<FunnelEventPayload>): FunnelEventPayload => {
    return {
      sessionId,
      browserId,
      leadId,
      eventType: "landing_viewed",
      screen,
      status: isDisqualified ? "disqualified" : "qualified",
      utm: utmData,
      quiz: quizData,
      optIn: optInForm,
      booking: bookingForm,
      ...overrides,
    }
  }, [bookingForm, browserId, isDisqualified, leadId, optInForm, quizData, screen, sessionId, utmData])

  const emitEvent = useCallback(async (overrides: Partial<FunnelEventPayload>) => {
    if (!sessionId || !browserId) {
      return null
    }

    try {
      const result = await trackFunnelEvent(buildPayload(overrides))
      if (result?.leadId) {
        setLeadId(result.leadId)
      }
      return result
    } catch (error) {
      console.error("Event tracking failed", error)
      return null
    }
  }, [browserId, buildPayload, sessionId])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const nextUtmData = {
      utm_source: params.get("utm_source") ?? "",
      utm_medium: params.get("utm_medium") ?? "",
      utm_campaign: params.get("utm_campaign") ?? "",
      utm_content: params.get("utm_content") ?? "",
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUtmData(nextUtmData)

    const persisted = loadPersistedFunnelState()
    const nextBrowserId = persisted?.browserId ?? crypto.randomUUID()
    const nextSessionId = persisted?.sessionId ?? crypto.randomUUID()

    setBrowserId(nextBrowserId)
    setSessionId(nextSessionId)

    if (persisted) {
      const persistedScreen = persisted.currentScreen === "booking" ? "optin" : persisted.currentScreen
      setScreen(persistedScreen as Screen)
      setInitialQuizStep(persisted.currentQuizStep)
      setQuizData(persisted.quizData)
      setOptInForm(persisted.optInForm)
      setBookingForm(persisted.bookingForm)
      setUtmData(persisted.utmData)
      setIsDisqualified(persisted.isDisqualified)
      void trackFunnelEvent({
        sessionId: nextSessionId,
        browserId: nextBrowserId,
        eventType: "quiz_resumed",
        screen: persisted.currentScreen,
        status: persisted.isDisqualified ? "disqualified" : "qualified",
        stepIndex: persisted.currentQuizStep,
        utm: persisted.utmData,
        quiz: persisted.quizData,
        optIn: persisted.optInForm,
        booking: persisted.bookingForm,
      })
    } else {
      void trackFunnelEvent({
        sessionId: nextSessionId,
        browserId: nextBrowserId,
        eventType: "landing_viewed",
        screen: "landing",
        status: "qualified",
        utm: nextUtmData,
        quiz: emptyQuizState,
        optIn: emptyOptInState,
        booking: emptyBookingState,
      })
    }

    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated || !sessionId || !browserId) {
      return
    }

    savePersistedFunnelState({
      sessionId,
      browserId,
      currentScreen: screen,
      currentQuizStep: initialQuizStep,
      quizData,
      optInForm,
      bookingForm,
      utmData,
      isDisqualified,
      updatedAt: new Date().toISOString(),
    })
  }, [bookingForm, browserId, initialQuizStep, isDisqualified, isHydrated, optInForm, quizData, screen, sessionId, utmData])

  useEffect(() => {
    if (!isHydrated || screen !== "analyzing") {
      return
    }

    void trackFunnelEvent({
      sessionId,
      browserId,
      leadId,
      eventType: "analysis_started",
      screen: "analyzing",
      status: isDisqualified ? "disqualified" : "qualified",
      utm: utmData,
      quiz: quizData,
      optIn: optInForm,
      booking: bookingForm,
    })
  }, [bookingForm, browserId, isDisqualified, isHydrated, leadId, optInForm, quizData, screen, sessionId, utmData])

  function goTo(next: Screen) {
    setScreen(next)
  }

  function handleQuizComplete(data: QuizFormState, disqualified: boolean) {
    setQuizData(data)
    setIsDisqualified(disqualified)
    void emitEvent({
      eventType: "quiz_completed",
      screen: "quiz",
      status: disqualified ? "disqualified" : "qualified",
      quiz: data,
      stepIndex: 19,
    })
    goTo("analyzing")
  }

  function handleAnalysisComplete() {
    void emitEvent({
      eventType: "analysis_completed",
      screen: "analyzing",
      status: isDisqualified ? "disqualified" : "qualified",
    })
    goTo("goodnews")
  }

  // Poll for blueprint readiness when on generating screen
  useEffect(() => {
    if (screen !== "generating" || !pendingBlueprintId || !pendingBlueprintUrl) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/blueprint/${pendingBlueprintId}`)
        if (res.ok) {
          clearInterval(interval)
          window.location.href = pendingBlueprintUrl
        }
      } catch {
        // keep polling
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [screen, pendingBlueprintId, pendingBlueprintUrl])

  async function handleOptInComplete() {
    if (optInSubmitting) return // Prevent double-click
    setOptInSubmitting(true)

    try {
      const result = await emitEvent({
        eventType: "opt_in_submitted",
        screen: "optin",
        status: isDisqualified ? "disqualified" : "qualified",
        optIn: optInForm,
        quiz: quizData,
        booking: bookingForm,
      })
      clearPersistedFunnelState()
      const bpUrl = result?.blueprintUrl ?? null
      const bpId = result?.blueprintId ?? null
      if (bpUrl && bpId) {
        setPendingBlueprintUrl(bpUrl)
        setPendingBlueprintId(bpId)
        goTo("generating")
      } else {
        window.location.href = bpUrl ?? "/results"
      }
    } finally {
      setOptInSubmitting(false)
    }
  }

  async function handleDqSubmit() {
    await emitEvent({
      eventType: "disqualified_blueprint_requested",
      screen: "disqualified",
      status: "disqualified",
    })
    setDqSubmitted(true)
    clearPersistedFunnelState()
    window.location.href = WEBINAR_POST_OPT_IN_URL
  }

  // Hide header on quiz screen (it has its own progress bar)
  const showHeader = screen !== "quiz"

  return (
    <div className="blueprint-bg relative flex min-h-screen flex-col">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-[800px] w-[800px] rounded-full bg-[#b59e5f]/[0.02] blur-[120px]" />
        <div className="absolute -right-1/4 bottom-0 h-[600px] w-[600px] rounded-full bg-[#35281e]/[0.02] blur-[100px]" />
      </div>

      {/* Logo - hidden during quiz */}
      {showHeader && (
        <header className="relative z-10 flex items-center justify-center pt-4 pb-2 sm:pt-8 sm:pb-4">
          <Image
            src="/logo.png"
            alt="Urban Unity"
            width={80}
            height={80}
            className="h-16 w-auto object-contain"
          />
        </header>
      )}

      {/* Screen content */}
      <div className={`relative flex flex-1 overflow-hidden px-4 ${showHeader ? 'items-start pt-2 sm:items-center sm:pt-0 sm:py-10' : 'items-center py-0'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="w-full"
          >
            {screen === "landing" && (
              <LandingScreen onStart={() => {
                void emitEvent({
                  eventType: "quiz_started",
                  screen: "quiz",
                  status: isDisqualified ? "disqualified" : "qualified",
                })
                goTo("quiz")
              }} />
            )}
            {screen === "quiz" && (
              <TypeformQuiz
                onComplete={handleQuizComplete}
                initialStep={initialQuizStep}
                initialForm={quizData}
                onProgress={({ currentStep, form }) => {
                  setInitialQuizStep(currentStep)
                  setQuizData(form)
                }}
                onQuestionAdvance={({ questionIndex, questionNumber, stepKey, value, form }) => {
                  setInitialQuizStep(questionIndex + 1)
                  void emitEvent({
                    eventType: "quiz_step_completed",
                    screen: "quiz",
                    stepIndex: questionIndex,
                    stepKey,
                    metadata: {
                      questionNumber,
                      value,
                    },
                    quiz: form,
                    status: form.situation === "Just an idea" || form.situation === "Starting to build" ? "disqualified" : "qualified",
                  })
                }}
              />
            )}
            {screen === "analyzing" && (
              <DNAAnalysisScreen onComplete={handleAnalysisComplete} />
            )}
            {screen === "goodnews" && (
              <GoodNewsScreen onContinue={() => goTo("optin")} />
            )}
            {screen === "optin" && (
              <OptInScreen
                form={optInForm}
                setField={(key, value) => setOptInForm(prev => ({ ...prev, [key]: value }))}
                onNext={handleOptInComplete}
                submitting={optInSubmitting}
              />
            )}
            {screen === "disqualified" && (
              <DisqualifiedScreen
                form={optInForm}
                submitted={dqSubmitted}
                onSubmit={handleDqSubmit}
              />
            )}
            {screen === "generating" && (
              <GeneratingScreen firstName={optInForm.firstName} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Screen 1: Landing ────────────────────────────────────────────────────────

function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5 sm:gap-8 text-center">
      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="blueprint-heading text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl"
      >
        Uncover Your Brand&apos;s DNA{" "}
        <span className="text-gradient-gold">with the 18 Question Framework</span>
      </motion.h1>

      {/* Byline */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-sm text-white/50 -mt-2"
      >
        by Marshall Crews
      </motion.p>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-xl rounded-3xl border border-[#35281e] bg-gradient-to-b from-[#0d0a07] to-[#04070d] px-7 py-6 text-left"
        style={{
          boxShadow: "0 4px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(181,158,95,0.05)",
        }}
      >
        <p className="text-sm leading-relaxed text-white/60">
          This form will give you a clear understanding of who you are, what your strengths and weaknesses as a creator or business owner are, and provide you with details of your taste and experiences that you can leverage for your clothing brand.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-white/40">
          This does not exist anywhere else on the internet.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <GoldButton onClick={onStart} className="px-12 py-5 text-lg tracking-wide">
          Start Building →
        </GoldButton>

        {/* Privacy notice */}
        <div className="flex items-center gap-2 text-xs tracking-wider text-white/25 uppercase">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>Your information will not be shared</span>
        </div>
      </motion.div>

      {/* Decorative glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 h-80 w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#b59e5f]/[0.03] blur-[100px]"
      />
    </div>
  )
}

// ─── Good News Screen ─────────────────────────────────────────────────────────

function GoodNewsScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
      {/* Celebration Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
        className="relative"
      >
        {/* Glow rings */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(181,158,95,0.3) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(26,142,237,0.2) 0%, transparent 60%)" }}
          animate={{ scale: [1.2, 1.8, 1.2], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.3, ease: "easeInOut" }}
        />

        <div
          className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#b59e5f] to-[#8b7a45]"
          style={{ boxShadow: "0 0 60px rgba(181,158,95,0.4)" }}
        >
          <svg className="h-14 w-14 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </motion.div>

      {/* Main Headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="blueprint-heading text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
          We Have{" "}
          <span className="text-gradient-gold">Good News!</span>
        </h1>
      </motion.div>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="max-w-lg text-lg text-white/60 leading-relaxed"
      >
        Your Brand DNA has been successfully analyzed. We&apos;ve uncovered powerful insights about{" "}
        <span className="text-white font-medium">who you are</span> and{" "}
        <span className="text-white font-medium">what makes your brand unique</span>.
      </motion.p>

      {/* Stats/Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid w-full max-w-md grid-cols-3 gap-4"
      >
        {[
          { value: "100%", label: "DNA Mapped" },
          { value: "18", label: "Questions" },
          { value: "1", label: "Unique You" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 + i * 0.1 }}
            className="rounded-2xl border border-[#35281e] bg-[#0d0a07] p-4"
          >
            <div className="text-2xl font-bold text-gradient-gold">{stat.value}</div>
            <div className="mt-1 text-xs text-white/40 uppercase tracking-wider">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Message Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="max-w-lg rounded-3xl border border-[#b59e5f]/20 bg-gradient-to-b from-[#b59e5f]/10 to-transparent p-6"
        style={{ boxShadow: "0 0 40px rgba(181,158,95,0.1)" }}
      >
        <p className="text-sm leading-relaxed text-white/70">
          Your personalized brand blueprint is ready. Enter your details on the next page and we&apos;ll show it to you —{" "}
          <span className="text-[#b59e5f] font-medium">completely free</span>.
        </p>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <GoldButton onClick={onContinue} className="px-12 py-5 text-lg tracking-wide">
          Get My Blueprint →
        </GoldButton>
      </motion.div>
    </div>
  )
}

// ─── Opt-In Screen ────────────────────────────────────────────────────────────

const countryCodes = [
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+55", country: "BR", flag: "🇧🇷" },
  { code: "+52", country: "MX", flag: "🇲🇽" },
]

// ─── Validation helpers ───────────────────────────────────────────────────────

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function normalizePhone(raw: string, countryCode: string): string {
  // Strip the country code prefix if the user typed it (e.g. "+15551234567" or "15551234567")
  const codeDigits = countryCode.replace(/\D/g, "") // e.g. "+1" → "1"
  let digits = raw.replace(/\D/g, "")
  if (digits.startsWith(codeDigits) && digits.length > codeDigits.length) {
    digits = digits.slice(codeDigits.length)
  }
  // US/CA (+1): format as (XXX) XXX-XXXX
  if (countryCode === "+1") {
    const d = digits.slice(0, 10)
    if (d.length <= 3) return d
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
  }
  // Other countries: just return digits, max 15 chars
  return digits.slice(0, 15)
}

function isValidPhone(phone: string, countryCode: string): boolean {
  const digits = phone.replace(/\D/g, "")
  if (countryCode === "+1") return digits.length === 10
  return digits.length >= 7
}

interface OptInErrors {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
}

function OptInScreen({
  form,
  setField,
  onNext,
  submitting = false,
}: {
  form: OptInFormState
  setField: <K extends keyof OptInFormState>(k: K, v: OptInFormState[K]) => void
  onNext: () => void
  submitting?: boolean
}) {
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)
  const [errors, setErrors] = useState<OptInErrors>({})
  const [attempted, setAttempted] = useState(false)
  const selectedCountry = countryCodes.find(c => c.code === form.countryCode) || countryCodes[0]

  function validate(): OptInErrors {
    const e: OptInErrors = {}
    if (!form.firstName.trim()) e.firstName = "First name is required"
    if (!form.lastName.trim()) e.lastName = "Last name is required"
    if (!form.email.trim()) e.email = "Email is required"
    else if (!isValidEmail(form.email)) e.email = "Enter a valid email address"
    if (!form.phone.trim()) e.phone = "Phone number is required"
    else if (!isValidPhone(form.phone, form.countryCode)) {
      e.phone = form.countryCode === "+1"
        ? "Enter a valid 10-digit US number"
        : "Enter a valid phone number"
    }
    return e
  }

  // Re-validate on change once the user has already attempted submit
  useEffect(() => {
    if (attempted) setErrors(validate())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, attempted])

  function handlePhoneChange(raw: string) {
    setField("phone", normalizePhone(raw, form.countryCode))
  }

  function handleSubmit() {
    if (submitting) return
    const e = validate()
    setAttempted(true)
    if (Object.keys(e).length > 0) {
      setErrors(e)
      return
    }
    onNext()
  }

  const inputBase = "w-full rounded-2xl border bg-[#0d0a07] py-4 text-base text-white placeholder-white/30 transition-all duration-300 focus:outline-none focus:ring-1"
  const inputOk = "border-[#35281e] focus:border-[#b59e5f] focus:ring-[#b59e5f]/30"
  const inputErr = "border-red-500/60 focus:border-red-400 focus:ring-red-500/20"

  return (
    <div className="mx-auto w-full max-w-lg">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h2 className="blueprint-heading text-4xl font-bold tracking-tight sm:text-5xl">
          Fill Out Your Info Below
        </h2>
        <p className="mt-3 text-base text-white/50">
          we&apos;ll show you your personalized brand blueprint right away
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-4"
      >
        {/* First Name & Last Name Row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <div className="group relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-[#b59e5f]">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                placeholder="First Name"
                autoComplete="given-name"
                className={`${inputBase} pl-12 pr-4 ${errors.firstName ? inputErr : inputOk}`}
              />
            </div>
            {errors.firstName && (
              <p className="mt-1.5 pl-1 text-xs text-red-400">{errors.firstName}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => setField("lastName", e.target.value)}
              placeholder="Last Name"
              autoComplete="family-name"
              className={`${inputBase} px-5 ${errors.lastName ? inputErr : inputOk}`}
            />
            {errors.lastName && (
              <p className="mt-1.5 pl-1 text-xs text-red-400">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <div className="group relative">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-[#b59e5f]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <input
              type="email"
              inputMode="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="hello@example.com"
              autoComplete="email"
              className={`${inputBase} pl-12 pr-4 ${errors.email ? inputErr : inputOk}`}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 pl-1 text-xs text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Phone with Country Code */}
        <div>
          <div className="flex">
            <div className="relative">
              <button
                type="button"
                onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                className={`flex h-full items-center gap-2 rounded-l-2xl border border-r-0 bg-[#0d0a07] px-4 py-4 text-white transition-all duration-300 hover:bg-[#1a1510] ${errors.phone ? "border-red-500/60" : "border-[#35281e]"}`}
              >
                <span className="text-xl">{selectedCountry.flag}</span>
                <svg className={`h-4 w-4 text-white/40 transition-transform ${countryDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {countryDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 top-full z-50 mt-2 max-h-60 w-48 overflow-y-auto rounded-xl border border-[#35281e] bg-[#0d0a07] py-2 shadow-xl"
                  >
                    {countryCodes.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => {
                          setField("countryCode", country.code)
                          setField("phone", "")
                          setCountryDropdownOpen(false)
                        }}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#b59e5f]/10 ${
                          form.countryCode === country.code ? "bg-[#b59e5f]/10 text-[#b59e5f]" : "text-white/70"
                        }`}
                      >
                        <span className="text-lg">{country.flag}</span>
                        <span>{country.country}</span>
                        <span className="ml-auto text-white/40">{country.code}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <input
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder={form.countryCode === "+1" ? "(555) 123-4567" : "Phone number"}
              autoComplete="tel-national"
              className={`w-full rounded-r-2xl border border-l-0 bg-[#0d0a07] py-4 px-4 text-base text-white placeholder-white/30 transition-all duration-300 focus:outline-none focus:ring-1 ${errors.phone ? "border-red-500/60 focus:border-red-400 focus:ring-red-500/20" : "border-[#35281e] focus:border-[#b59e5f] focus:ring-[#b59e5f]/30"}`}
            />
          </div>
          {errors.phone && (
            <p className="mt-1.5 pl-1 text-xs text-red-400">{errors.phone}</p>
          )}
        </div>

        {/* Continue Button */}
        <div className="mt-4">
          <GoldButton onClick={handleSubmit} disabled={submitting} className="w-full py-5 text-lg">
            {submitting ? "Processing..." : "Continue"}
          </GoldButton>
        </div>

        {/* Privacy notice */}
        <div className="flex items-center justify-center gap-2 text-xs tracking-wider text-white/25 uppercase">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>Your information is secure and will not be shared</span>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Disqualified Screen ──────────────────────────────────────────────────────

function DisqualifiedScreen({
  form,
  submitted,
  onSubmit,
}: {
  form: OptInFormState
  submitted: boolean
  onSubmit: () => void
}) {
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        window.location.href = WEBINAR_POST_OPT_IN_URL
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [submitted])

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#b59e5f]/20 to-[#b59e5f]/5"
          style={{ boxShadow: "0 0 40px rgba(181,158,95,0.2)" }}
        >
          <svg className="h-10 w-10 text-[#b59e5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <h2 className="blueprint-heading text-3xl font-bold">Blueprint on its way!</h2>
        <p className="text-white/50">
          Check your inbox at <span className="text-[#b59e5f]">{form.email}</span> — your customized brand blueprint will arrive shortly.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-[#b59e5f]/20 bg-gradient-to-b from-[#b59e5f]/10 to-transparent p-8 text-center"
        style={{ boxShadow: "0 0 60px rgba(181,158,95,0.1)" }}
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#b59e5f]/30 to-[#b59e5f]/10">
          <svg className="h-8 w-8 text-[#b59e5f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3v18M9 6h6M9 18h6M7 9h10M7 15h10" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="blueprint-heading text-2xl font-bold">
          Your Brand DNA Profile is ready, {form.firstName}!
        </h2>
        <p className="mt-3 text-sm text-white/50">
          Click below and we&apos;ll send your customized brand blueprint to{" "}
          <span className="text-[#b59e5f]">{form.email}</span>
        </p>
        <div className="mt-6">
          <GoldButton onClick={onSubmit} className="w-full">
            Send My Blueprint →
          </GoldButton>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Generating Screen ────────────────────────────────────────────────────────

function GeneratingScreen({ firstName }: { firstName: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="relative flex h-24 w-24 items-center justify-center"
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(181,158,95,0.25) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          className="h-16 w-16 rounded-full border-4 border-[#b59e5f] border-t-transparent animate-spin"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-3"
      >
        <h2 className="blueprint-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Building Your Blueprint{firstName ? `, ${firstName}` : ""}
        </h2>
        <p className="text-white/60">
          Our AI is analyzing your 18 answers and crafting your personalized brand strategy.
        </p>
        <p className="text-sm text-white/30">This usually takes 15–30 seconds.</p>
      </motion.div>
    </div>
  )
}
