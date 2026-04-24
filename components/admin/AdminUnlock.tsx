"use client"

import { useState } from "react"

export default function AdminUnlock() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError("")

    const response = await fetch("/api/admin/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })

    setSubmitting(false)

    if (!response.ok) {
      setError("Incorrect password.")
      return
    }

    window.location.reload()
  }

  return (
    <main className="blueprint-bg flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-[2rem] border border-[#35281e] bg-[#0d0a07] p-8 shadow-[0_0_60px_rgba(181,158,95,0.08)]"
      >
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-[#b59e5f]">Internal Access</p>
        <h1 className="blueprint-heading text-3xl font-black">Automation Monitor</h1>
        <p className="mt-3 text-sm leading-7 text-white/55">Enter the shared password to access runs, leads, and step-level logs.</p>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-6 w-full rounded-2xl border border-[#35281e] bg-black/20 px-4 py-4 text-white outline-none focus:border-[#b59e5f]"
          placeholder="Shared password"
        />
        {error ? <p className="mt-3 text-sm text-[#f48989]">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#8b7a45] via-[#b59e5f] to-[#d4c08a] px-4 py-4 font-semibold text-black transition hover:opacity-95 disabled:opacity-50"
        >
          {submitting ? "Unlocking..." : "Unlock Admin"}
        </button>
      </form>
    </main>
  )
}
