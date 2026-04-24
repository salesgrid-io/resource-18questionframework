"use client"

import { useState, useRef, useEffect, KeyboardEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"

// ─── Breather / Acknowledgement Screen ──────────────────────────────────────

interface BreatherScreenProps {
  icon: "fire" | "sparkle" | "heart" | "rocket" | "brain" | "compass" | "merge"
  headline: string
  subtext: string
  onContinue: () => void
}

export function BreatherScreen({ icon, headline, subtext, onContinue }: BreatherScreenProps) {
  // Auto-advance after delay
  useEffect(() => {
    const timer = setTimeout(onContinue, 3500)
    return () => clearTimeout(timer)
  }, [onContinue])

  const iconSvg = {
    fire: (
      <svg viewBox="0 0 24 24" fill="none" className="h-16 w-16">
        <motion.path
          d="M12 2C12 2 8 6 8 10C8 12 9 14 12 14C15 14 16 12 16 10C16 6 12 2 12 2Z"
          fill="url(#fireGradient)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
        />
        <motion.path
          d="M12 14C9 14 7 16 7 19C7 21 9 23 12 23C15 23 17 21 17 19C17 16 15 14 12 14Z"
          fill="url(#fireGradient2)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6, delay: 0.1, bounce: 0.3 }}
        />
        <defs>
          <linearGradient id="fireGradient" x1="8" y1="2" x2="16" y2="14">
            <stop stopColor="#d4c08a" />
            <stop offset="1" stopColor="#b59e5f" />
          </linearGradient>
          <linearGradient id="fireGradient2" x1="7" y1="14" x2="17" y2="23">
            <stop stopColor="#b59e5f" />
            <stop offset="1" stopColor="#8b7a45" />
          </linearGradient>
        </defs>
      </svg>
    ),
    sparkle: (
      <svg viewBox="0 0 24 24" fill="none" className="h-16 w-16">
        <motion.path
          d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
          fill="url(#sparkleGradient)"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
        />
        <motion.circle cx="19" cy="5" r="1.5" fill="#b59e5f" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring", bounce: 0.5 }} />
        <motion.circle cx="5" cy="18" r="1" fill="#d4c08a" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: "spring", bounce: 0.5 }} />
        <motion.circle cx="20" cy="18" r="0.75" fill="#8b7a45" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring", bounce: 0.5 }} />
        <defs>
          <linearGradient id="sparkleGradient" x1="4" y1="2" x2="20" y2="18">
            <stop stopColor="#d4c08a" />
            <stop offset="1" stopColor="#b59e5f" />
          </linearGradient>
        </defs>
      </svg>
    ),
    heart: (
      <svg viewBox="0 0 24 24" fill="none" className="h-16 w-16">
        <motion.path
          d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
          fill="url(#heartGradient)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6, bounce: 0.4 }}
        />
        <defs>
          <linearGradient id="heartGradient" x1="2" y1="3" x2="22" y2="21">
            <stop stopColor="#d4c08a" />
            <stop offset="1" stopColor="#b59e5f" />
          </linearGradient>
        </defs>
      </svg>
    ),
    rocket: (
      <svg viewBox="0 0 24 24" fill="none" className="h-16 w-16">
        <motion.path
          d="M12 2C12 2 4 8 4 14C4 17 6 20 12 22C18 20 20 17 20 14C20 8 12 2 12 2Z"
          fill="url(#rocketGradient)"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
        />
        <motion.circle cx="12" cy="12" r="3" fill="#04070d" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} />
        <motion.path
          d="M8 18L6 22M16 18L18 22M12 18V22"
          stroke="#8b7a45"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.5, 1] }}
          transition={{ delay: 0.4, duration: 0.6 }}
        />
        <defs>
          <linearGradient id="rocketGradient" x1="4" y1="2" x2="20" y2="22">
            <stop stopColor="#d4c08a" />
            <stop offset="1" stopColor="#b59e5f" />
          </linearGradient>
        </defs>
      </svg>
    ),
    brain: (
      <svg viewBox="0 0 24 24" fill="none" className="h-16 w-16">
        <motion.path
          d="M12 2C8 2 5 5 5 9C5 11 6 13 8 14V20C8 21 9 22 10 22H14C15 22 16 21 16 20V14C18 13 19 11 19 9C19 5 16 2 12 2Z"
          fill="url(#brainGradient)"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.path
          d="M9 8H15M9 11H15"
          stroke="#04070d"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        />
        <defs>
          <linearGradient id="brainGradient" x1="5" y1="2" x2="19" y2="22">
            <stop stopColor="#d4c08a" />
            <stop offset="1" stopColor="#b59e5f" />
          </linearGradient>
        </defs>
      </svg>
    ),
    compass: (
      <svg viewBox="0 0 24 24" fill="none" className="h-16 w-16">
        <motion.circle
          cx="12" cy="12" r="9"
          stroke="url(#compassRingGrad)"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <motion.path
          d="M12 3V5M12 19V21M3 12H5M19 12H21"
          stroke="#b59e5f"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        />
        <motion.path
          d="M15 9L12.5 12.5L9 15L11.5 11.5L15 9Z"
          fill="url(#compassNeedle)"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.6, type: "spring", bounce: 0.4 }}
          style={{ transformOrigin: "12px 12px" }}
        />
        <motion.circle
          cx="12" cy="12" r="1.5"
          fill="#d4c08a"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7 }}
        />
        <defs>
          <linearGradient id="compassRingGrad" x1="3" y1="3" x2="21" y2="21">
            <stop stopColor="#d4c08a" /><stop offset="1" stopColor="#8b7a45" />
          </linearGradient>
          <linearGradient id="compassNeedle" x1="9" y1="9" x2="15" y2="15">
            <stop stopColor="#d4c08a" /><stop offset="1" stopColor="#b59e5f" />
          </linearGradient>
        </defs>
      </svg>
    ),
    merge: (
      <svg viewBox="0 0 80 36" fill="none" className="h-14 w-28">
        {/* Heart (left) */}
        <motion.path
          d="M14 22L12.2 20.3C7.4 15.8 4 12.6 4 8.6C4 5.5 6.5 3 9.5 3C11.1 3 12.6 3.8 14 5.2C15.4 3.8 16.9 3 18.5 3C21.5 3 24 5.5 24 8.6C24 12.6 20.6 15.8 15.8 20.3L14 22Z"
          fill="url(#heartMerge)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
        />
        {/* Brain (right) */}
        <motion.path
          d="M66 5C62.1 5 59 8.1 59 12C59 13.7 59.6 15.2 60.7 16.4V28C60.7 28.6 61.2 29 61.8 29H70.2C70.8 29 71.3 28.6 71.3 28V16.4C72.4 15.2 73 13.7 73 12C73 8.1 69.9 5 66 5Z"
          fill="url(#brainMerge)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6, delay: 0.1 }}
        />
        {/* Arrow pointing left → heart */}
        <motion.path
          d="M37 18H28M28 18L31 15M28 18L31 21"
          stroke="#b59e5f"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        />
        {/* Arrow pointing right → brain */}
        <motion.path
          d="M43 18H52M52 18L49 15M52 18L49 21"
          stroke="#b59e5f"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        />
        {/* DNA helix center */}
        <motion.path
          d="M37 13C38.5 14.5 39.5 14.5 41 13C42.5 11.5 43.5 11.5 45 13"
          stroke="#d4c08a"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        />
        <motion.path
          d="M37 23C38.5 21.5 39.5 21.5 41 23C42.5 24.5 43.5 24.5 45 23"
          stroke="#d4c08a"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.5 }}
        />
        <motion.line x1="37" y1="13" x2="37" y2="23" stroke="#d4c08a" strokeWidth="1" strokeOpacity="0.35"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.7, duration: 0.3 }} />
        <motion.line x1="41" y1="11" x2="41" y2="25" stroke="#d4c08a" strokeWidth="1" strokeOpacity="0.35"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.72, duration: 0.3 }} />
        <motion.line x1="45" y1="13" x2="45" y2="23" stroke="#d4c08a" strokeWidth="1" strokeOpacity="0.35"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.74, duration: 0.3 }} />
        <defs>
          <linearGradient id="heartMerge" x1="4" y1="3" x2="24" y2="22">
            <stop stopColor="#d4c08a" /><stop offset="1" stopColor="#b59e5f" />
          </linearGradient>
          <linearGradient id="brainMerge" x1="59" y1="5" x2="73" y2="29">
            <stop stopColor="#d4c08a" /><stop offset="1" stopColor="#b59e5f" />
          </linearGradient>
        </defs>
      </svg>
    ),
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mx-auto flex min-h-[400px] max-w-lg flex-col items-center justify-center text-center"
    >
      {/* Icon with glow */}
      <motion.div
        className="relative mb-8"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(181,158,95,0.3) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative">{iconSvg[icon]}</div>
      </motion.div>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-3 text-3xl font-bold text-white"
        style={{ fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif" }}
      >
        {headline}
      </motion.h2>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mb-8 max-w-sm text-base text-white/50"
      >
        {subtext}
      </motion.p>

      {/* Progress dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-1.5"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-[#b59e5f]"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>

      {/* Click to continue hint */}
      <motion.button
        onClick={onContinue}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 text-xs text-white/25 transition-colors hover:text-white/40"
      >
        Click or wait to continue...
      </motion.button>
    </motion.div>
  )
}

// ─── Pill Input (for multiple values) ───────────────────────────────────────

interface PillInputProps {
  value: string[]
  onChange: (pills: string[]) => void
  placeholder?: string
  maxPills?: number
  minPills?: number
}

export function PillInput({
  value,
  onChange,
  placeholder = "Type and press Enter...",
  maxPills = 5,
  minPills = 1,
}: PillInputProps) {
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const addPill = () => {
    const trimmed = inputValue.trim()
    if (trimmed && value.length < maxPills && !value.includes(trimmed)) {
      onChange([...value, trimmed])
      setInputValue("")
    }
  }

  const removePill = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addPill()
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      removePill(value.length - 1)
    }
  }

  return (
    <div
      className="group w-full cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Pills container */}
      <div className="flex flex-wrap gap-2 mb-4">
        <AnimatePresence mode="popLayout">
          {value.map((pill, index) => (
            <motion.div
              key={pill}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              layout
              className="flex items-center gap-2 rounded-full border border-[#b59e5f]/40 px-5 py-2.5 text-base font-medium text-white"
              style={{
                background: "linear-gradient(135deg, rgba(181,158,95,0.2) 0%, rgba(181,158,95,0.05) 100%)",
                boxShadow: "0 0 25px rgba(181,158,95,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              <span>{pill}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removePill(index)
                }}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white/60 transition-all hover:bg-[#b59e5f]/30 hover:text-white"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input field */}
      {value.length < maxPills && (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : "Add another..."}
            className="w-full border-b-2 border-[#35281e] bg-transparent py-4 text-2xl text-white placeholder-white/20 transition-all focus:border-[#b59e5f] focus:outline-none"
            style={{ caretColor: "#b59e5f" }}
          />
        </div>
      )}

      {/* Counter */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex gap-1">
          {Array.from({ length: maxPills }).map((_, i) => (
            <motion.div
              key={i}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                i < value.length ? "bg-[#b59e5f]" : "bg-[#35281e]"
              }`}
              animate={i < value.length ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
        <span className="text-xs text-white/30">
          {value.length}/{maxPills}
          {value.length < minPills && (
            <span className="ml-1 text-[#b59e5f]">(need {minPills - value.length} more)</span>
          )}
        </span>
      </div>
    </div>
  )
}

// ─── Text Input (single line) ───────────────────────────────────────────────

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: "text" | "number" | "email"
  onSubmit?: () => void
}

export function TypeformTextInput({
  value,
  onChange,
  placeholder = "Type your answer...",
  type = "text",
  onSubmit,
}: TextInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim() && onSubmit) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="w-full">
      <input
        type={type}
        inputMode={type === "number" ? "numeric" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full border-b-2 border-[#35281e] bg-transparent py-4 text-2xl font-medium text-white placeholder-white/20 transition-all focus:border-[#b59e5f] focus:outline-none sm:text-3xl"
        style={{ caretColor: "#b59e5f" }}
      />
    </div>
  )
}

// ─── Textarea Input ─────────────────────────────────────────────────────────

interface TextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onSubmit?: () => void
}

export function TypeformTextarea({
  value,
  onChange,
  placeholder = "Type your answer...",
  onSubmit,
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 60)}px`
    }
  }, [value])

  return (
    <div className="w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full resize-none border-b-2 border-[#35281e] bg-transparent py-4 text-xl text-white placeholder-white/20 transition-all focus:border-[#b59e5f] focus:outline-none sm:text-2xl leading-relaxed"
        style={{ caretColor: "#b59e5f" }}
      />
    </div>
  )
}

// ─── Option Selector ────────────────────────────────────────────────────────

interface Option {
  label: string
  value: string
  icon?: string
}

interface OptionSelectorProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  onSubmit?: () => void
}

export function TypeformOptions({
  options,
  value,
  onChange,
  onSubmit,
}: OptionSelectorProps) {
  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    // Auto-advance after short delay
    if (onSubmit) {
      setTimeout(onSubmit, 500)
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {options.map((option, index) => {
        const isSelected = value === option.value
        const letter = String.fromCharCode(65 + index) // A, B, C, D...

        return (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className={`group flex w-full items-center gap-4 rounded-2xl border-2 px-6 py-5 text-left transition-all duration-300 ${
              isSelected
                ? "border-[#b59e5f]"
                : "border-[#35281e] hover:border-[#b59e5f]/40"
            }`}
            style={{
              background: isSelected
                ? "linear-gradient(135deg, rgba(181,158,95,0.15) 0%, rgba(181,158,95,0.05) 100%)"
                : "linear-gradient(135deg, rgba(13,10,7,0.8) 0%, rgba(4,7,13,0.8) 100%)",
              boxShadow: isSelected ? "0 0 40px rgba(181,158,95,0.15)" : "none",
            }}
          >
            {/* Letter indicator */}
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 ${
                isSelected
                  ? "bg-gradient-to-br from-[#b59e5f] to-[#8b7a45] text-black shadow-[0_0_20px_rgba(181,158,95,0.3)]"
                  : "border border-[#35281e] bg-[#0d0a07] text-white/40 group-hover:border-[#b59e5f]/40 group-hover:text-white/60"
              }`}
            >
              {letter}
            </span>

            {/* Icon */}
            {option.icon && (
              <span className={`text-2xl transition-transform duration-300 ${isSelected ? "scale-110" : "group-hover:scale-105"}`}>
                {option.icon}
              </span>
            )}

            {/* Label */}
            <span
              className={`text-lg font-medium transition-colors ${
                isSelected ? "text-white" : "text-white/60 group-hover:text-white/80"
              }`}
            >
              {option.label}
            </span>

            {/* Checkmark */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#b59e5f]"
              >
                <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        )
      })}

    </div>
  )
}

// ─── Question Wrapper ───────────────────────────────────────────────────────

interface QuestionWrapperProps {
  questionNumber: number
  totalQuestions: number
  question: string
  hint?: string
  children: React.ReactNode
  onNext?: () => void
  onBack?: () => void
  canContinue?: boolean
  showContinue?: boolean
  warning?: string | null
}

export function QuestionWrapper({
  questionNumber,
  totalQuestions,
  question,
  hint,
  children,
  onNext,
  onBack,
  canContinue = true,
  showContinue = true,
  warning,
}: QuestionWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex w-full max-w-2xl flex-col px-4"
    >
      {/* Question number badge */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 flex items-center gap-4"
      >
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold"
          style={{
            background: "linear-gradient(135deg, rgba(181,158,95,0.2) 0%, rgba(181,158,95,0.05) 100%)",
            border: "1px solid rgba(181,158,95,0.3)",
            color: "#b59e5f",
          }}
        >
          {questionNumber}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-[2px] w-12 rounded-full bg-gradient-to-r from-[#b59e5f]/50 to-transparent" />
          <span className="text-sm font-medium text-white/30">
            Question {questionNumber} of {totalQuestions}
          </span>
        </div>
      </motion.div>

      {/* Question text */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-4 text-2xl font-bold leading-snug text-white sm:text-3xl lg:text-4xl"
        style={{ fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif" }}
      >
        {question}
      </motion.h2>

      {/* Hint */}
      {hint && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-10 text-base leading-relaxed text-white/40"
        >
          {hint}
        </motion.p>
      )}

      {/* Input area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-12"
      >
        {children}
      </motion.div>

      {/* Low-effort warning */}
      <AnimatePresence>
        {warning && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mb-6 rounded-xl border px-5 py-4 text-sm leading-relaxed"
            style={{
              background: "rgba(240,164,75,0.07)",
              border: "1px solid rgba(240,164,75,0.25)",
              color: "#F0A44B",
            }}
          >
            <span className="mr-2 font-bold uppercase tracking-widest text-xs" style={{ color: "#F0A44B" }}>Hold up —</span>
            {warning}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="flex items-center gap-4"
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 rounded-xl border border-[#35281e] bg-[#0d0a07] px-5 py-3 text-sm font-medium text-white/50 transition-all hover:border-[#b59e5f]/30 hover:text-white/70"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}

        {showContinue && onNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={!canContinue}
            className="group relative ml-auto flex items-center gap-3 overflow-hidden rounded-xl px-8 py-3.5 text-base font-semibold text-black transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: canContinue
                ? "linear-gradient(135deg, #b59e5f 0%, #d4c08a 50%, #8b7a45 100%)"
                : "linear-gradient(135deg, #35281e 0%, #35281e 100%)",
              boxShadow: canContinue ? "0 4px 25px rgba(181,158,95,0.35)" : "none",
            }}
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            <span className="relative">OK</span>
            <svg className="relative h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}
