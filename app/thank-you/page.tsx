"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, Mail, ArrowRight, Loader2 } from "lucide-react"

const LIVE_CLASS_URL = "https://4bucketframework.com/liveclass"

function ThankYouContent() {
  const searchParams = useSearchParams()
  const blueprintId = searchParams.get("id")

  return (
    <div className="blueprint-bg min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full text-center">
        {/* Success Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[var(--bp-gold)] opacity-20 blur-xl animate-pulse" />
            <CheckCircle
              className="relative w-20 h-20 text-[var(--bp-gold)]"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="blueprint-heading text-3xl md:text-4xl font-light mb-4 tracking-wide">
          <span className="text-gradient-gold">You&apos;re In!</span>
        </h1>

        {/* Subheading */}
        <p className="text-[var(--bp-white)] text-lg md:text-xl font-light mb-8 opacity-90">
          Your Brand Blueprint is on its way.
        </p>

        {/* Email Notice */}
        <div className="bg-[var(--bp-blue)]/30 border border-[var(--bp-border)] rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Mail className="w-5 h-5 text-[var(--bp-gold)]" />
            <span className="text-[var(--bp-gold)] font-medium">Check Your Inbox</span>
          </div>
          <p className="text-[var(--bp-white)] opacity-80 text-sm leading-relaxed">
            We&apos;ve sent your personal Brand Blueprint link to your email.
            <br />
            You can access it anytime.
          </p>
        </div>

        {/* CTA Button */}
        <div className="space-y-6">
          <a
            href={LIVE_CLASS_URL}
            className="group inline-flex items-center justify-center gap-3 w-full px-8 py-4 bg-gradient-to-r from-[var(--bp-gold)] to-[#d4c08a] text-[var(--bp-bg-primary)] font-semibold text-lg rounded-lg hover:opacity-90 transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-[var(--bp-gold)]/20"
          >
            Join the Live Class
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>

          <p className="text-[var(--bp-white)] opacity-60 text-sm">
            Ready to take your brand to the next level? Join our exclusive live training.
          </p>
        </div>

        {/* Blueprint Link (if available) */}
        {blueprintId && (
          <div className="mt-8 pt-6 border-t border-[var(--bp-border)]">
            <a
              href={`/results/${blueprintId}`}
              className="inline-flex items-center gap-2 text-[var(--bp-gold)] hover:text-[var(--bp-gold-light)] transition-colors text-sm opacity-80 hover:opacity-100"
            >
              View Your Blueprint Now
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-[var(--bp-border)]">
          <p className="text-[var(--bp-white)] opacity-50 text-xs tracking-wider uppercase">
            18 Question Framework
          </p>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="blueprint-bg min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8 flex justify-center">
          <Loader2 className="w-12 h-12 text-[var(--bp-gold)] animate-spin" />
        </div>
        <p className="text-[var(--bp-white)] opacity-70">Loading...</p>
      </div>
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ThankYouContent />
    </Suspense>
  )
}
