"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

function DNAHelix() {
  return (
    <div className="relative h-64 w-64">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(181,158,95,0.15) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b59e5f" />
            <stop offset="50%" stopColor="#d4c08a" />
            <stop offset="100%" stopColor="#8b7a45" />
          </linearGradient>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#35281e" />
            <stop offset="50%" stopColor="#6b5a3e" />
            <stop offset="100%" stopColor="#35281e" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "100px 100px" }}>
          {[0,1,2,3,4,5,6,7].map((i) => {
            const angle = (i * 45) * (Math.PI / 180)
            const yOffset = 30 + i * 17.5
            const xOffset = Math.sin(angle) * 30
            return <motion.circle key={`s1-${i}`} cx={100+xOffset} cy={yOffset} r={6} fill="url(#goldGradient)" filter="url(#glow)" animate={{ opacity: [0.6,1,0.6], r: [5,7,5] }} transition={{ duration: 1.5, repeat: Infinity, delay: i*0.15, ease: "easeInOut" }} />
          })}
        </motion.g>
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "100px 100px" }}>
          {[0,1,2,3,4,5,6,7].map((i) => {
            const angle = (i * 45 + 180) * (Math.PI / 180)
            const yOffset = 30 + i * 17.5
            const xOffset = Math.sin(angle) * 30
            return <motion.circle key={`s2-${i}`} cx={100+xOffset} cy={yOffset} r={6} fill="url(#blueGradient)" filter="url(#glow)" animate={{ opacity: [0.6,1,0.6], r: [5,7,5] }} transition={{ duration: 1.5, repeat: Infinity, delay: i*0.15+0.5, ease: "easeInOut" }} />
          })}
        </motion.g>
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "100px 100px" }}>
          {[0,1,2,3,4,5,6,7].map((i) => {
            const a1 = (i * 45) * (Math.PI / 180)
            const a2 = (i * 45 + 180) * (Math.PI / 180)
            const y = 30 + i * 17.5
            return <motion.line key={`c-${i}`} x1={100+Math.sin(a1)*30} y1={y} x2={100+Math.sin(a2)*30} y2={y} stroke="rgba(181,158,95,0.3)" strokeWidth={2} animate={{ opacity: [0.2,0.5,0.2] }} transition={{ duration: 1.5, repeat: Infinity, delay: i*0.1 }} />
          })}
        </motion.g>
      </svg>
      {[0,1,2,3,4,5].map((i) => (
        <motion.div key={`p-${i}`} className="absolute h-2 w-2 rounded-full" style={{ background: i%2===0?"#b59e5f":"#6b5a3e", boxShadow: `0 0 10px ${i%2===0?"#b59e5f":"#6b5a3e"}`, left:"50%", top:"50%" }}
          animate={{ x: [Math.cos((i*60)*Math.PI/180)*100, Math.cos((i*60+360)*Math.PI/180)*100], y: [Math.sin((i*60)*Math.PI/180)*100, Math.sin((i*60+360)*Math.PI/180)*100], scale:[0.8,1.2,0.8], opacity:[0.4,1,0.4] }}
          transition={{ duration: 4+i*0.5, repeat: Infinity, ease: "linear", delay: i*0.3 }} />
      ))}
    </div>
  )
}

function ScanLines() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div className="absolute left-0 h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #b59e5f, transparent)", boxShadow: "0 0 20px #b59e5f, 0 0 40px #b59e5f" }} animate={{ top: ["-10%","110%"] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} />
      <motion.div className="absolute left-0 h-0.5 w-full opacity-50" style={{ background: "linear-gradient(90deg, transparent, #6b5a3e, transparent)", boxShadow: "0 0 15px #6b5a3e" }} animate={{ top: ["110%","-10%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1 }} />
    </div>
  )
}

function DataStream() {
  const characters = "ATCGATCGBRAND"
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-20">
      {[...Array(8)].map((_, i) => (
        <motion.div key={i} className="absolute top-0 flex flex-col font-mono text-xs" style={{ left: `${10+i*12}%`, color: i%2===0?"#b59e5f":"#6b5a3e" }} initial={{ y: -500 }} animate={{ y: 500 }} transition={{ duration: 3+i*0.5, repeat: Infinity, ease: "linear", delay: i*0.3 }}>
          {[...Array(20)].map((_, j) => <span key={j} className="my-1">{characters[Math.floor(Math.random()*characters.length)]}</span>)}
        </motion.div>
      ))}
    </div>
  )
}

function ProgressRing({ progress }: { progress: number }) {
  const circumference = 2 * Math.PI * 45
  return (
    <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(181,158,95,0.1)" strokeWidth="2" />
      <motion.circle cx="50" cy="50" r="45" fill="none" stroke="url(#progressGradient)" strokeWidth="3" strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: circumference - (progress/100)*circumference }} transition={{ duration: 0.5, ease: "easeOut" }} />
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#b59e5f" />
          <stop offset="100%" stopColor="#6b5a3e" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const analysisPhases = [
  { label: "Scanning brand values...", duration: 1600 },
  { label: "Mapping identity markers...", duration: 1400 },
  { label: "Analyzing audience DNA...", duration: 1500 },
  { label: "Decoding story patterns...", duration: 1400 },
  { label: "Synthesizing brand genome...", duration: 1600 },
  { label: "Generating your blueprint...", duration: 1200 },
]

interface DNAAnalysisScreenProps {
  onComplete: () => void
}

export default function DNAAnalysisScreen({ onComplete }: DNAAnalysisScreenProps) {
  const [currentPhase, setCurrentPhase] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const totalDuration = analysisPhases.reduce((sum, p) => sum + p.duration, 0)
    let elapsed = 0
    const advancePhase = (phaseIndex: number) => {
      if (phaseIndex >= analysisPhases.length) { setTimeout(onComplete, 500); return }
      setCurrentPhase(phaseIndex)
      const phaseDuration = analysisPhases[phaseIndex].duration
      const startProgress = (elapsed / totalDuration) * 100
      elapsed += phaseDuration
      const endProgress = (elapsed / totalDuration) * 100
      const steps = 10, stepDuration = phaseDuration / steps
      const progressIncrement = (endProgress - startProgress) / steps
      let step = 0
      const interval = setInterval(() => { step++; setProgress(startProgress + progressIncrement * step); if (step >= steps) clearInterval(interval) }, stepDuration)
      setTimeout(() => advancePhase(phaseIndex + 1), phaseDuration)
    }
    const t = setTimeout(() => advancePhase(0), 500)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative mx-auto flex min-h-[500px] w-full max-w-2xl flex-col items-center justify-center">
      <div className="pointer-events-none absolute inset-0 rounded-3xl" style={{ background: "radial-gradient(ellipse at center, rgba(181,158,95,0.05) 0%, transparent 60%)" }} />
      <DataStream />
      <ScanLines />
      <div className="relative mb-10">
        <div className="relative h-64 w-64">
          <ProgressRing progress={progress} />
          <div className="absolute inset-0 flex items-center justify-center"><DNAHelix /></div>
        </div>
      </div>
      <motion.div className="mb-6 font-mono text-4xl font-bold tracking-wider" style={{ background: "linear-gradient(135deg, #b59e5f 0%, #d4c08a 50%, #b59e5f 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        {Math.round(progress)}%
      </motion.div>
      <div className="relative h-8 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p key={currentPhase} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.3 }} className="text-center text-sm font-medium tracking-wide text-white/60">
            {analysisPhases[currentPhase]?.label || "Complete"}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="mt-6 flex gap-2">
        {analysisPhases.map((_, i) => (
          <motion.div key={i} className="h-1.5 w-1.5 rounded-full" animate={{ backgroundColor: i <= currentPhase ? "#b59e5f" : "rgba(255,255,255,0.2)", scale: i === currentPhase ? 1.3 : 1 }} transition={{ duration: 0.3 }} />
        ))}
      </div>
      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-10 text-center text-2xl font-bold tracking-tight text-white">
        Analyzing Your Brand DNA
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-3 text-center text-sm text-white/40">
        Processing your unique blueprint...
      </motion.p>
    </motion.div>
  )
}
