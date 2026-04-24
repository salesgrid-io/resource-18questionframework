"use client"

import type { BookingFormState, FunnelScreen, OptInFormState, QuizFormState, UtmData } from "@/lib/automation/types"

export interface PersistedFunnelState {
  sessionId: string
  browserId: string
  currentScreen: FunnelScreen
  currentQuizStep: number
  quizData: QuizFormState
  optInForm: OptInFormState
  bookingForm: BookingFormState
  utmData: UtmData
  isDisqualified: boolean
  updatedAt: string
}

const STORAGE_KEY = "urban-unity-funnel"

export function loadPersistedFunnelState() {
  if (typeof window === "undefined") {
    return null
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as PersistedFunnelState
  } catch {
    return null
  }
}

export function savePersistedFunnelState(state: PersistedFunnelState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearPersistedFunnelState() {
  window.localStorage.removeItem(STORAGE_KEY)
}
