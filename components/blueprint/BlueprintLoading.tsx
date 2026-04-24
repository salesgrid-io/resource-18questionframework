"use client"

import { useEffect } from "react"

export default function BlueprintLoading({ firstName }: { firstName: string }) {
  // Auto-refresh every 3 seconds to check if blueprint is ready
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload()
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#06090F] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto border-4 border-[#C4A855] border-t-transparent rounded-full animate-spin" />
        </div>
        <h1 className="text-3xl font-light text-white mb-4">
          Building Your Blueprint, <span className="text-[#C4A855]">{firstName}</span>
        </h1>
        <p className="text-white/60 text-lg mb-6">
          Our AI is analyzing your responses and crafting your personalized brand strategy.
        </p>
        <p className="text-white/40 text-sm">
          This usually takes 15-30 seconds. The page will refresh automatically.
        </p>
      </div>
    </div>
  )
}
