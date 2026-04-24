"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

interface Run {
  _id: string
  triggerEvent: string
  status: string
  leadId?: string
  startedAt: string
}

interface RunsResponse {
  ok: boolean
  runs: Run[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  counts: {
    total: number
    succeeded: number
    failed: number
  }
}

interface Props {
  onCountsUpdate?: (counts: { total: number; succeeded: number; failed: number }) => void
}

export default function AutomationRunsTable({ onCountsUpdate }: Props) {
  const [runs, setRuns] = useState<Run[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchRuns = useCallback(async (pageNum: number) => {
    try {
      const res = await fetch(`/api/admin/runs?page=${pageNum}&limit=20`)
      const data: RunsResponse = await res.json()
      if (data.ok) {
        setRuns(data.runs)
        setTotalPages(data.pagination.totalPages)
        setTotal(data.pagination.total)
        setLastUpdated(new Date())
        onCountsUpdate?.(data.counts)
      }
    } catch (err) {
      console.error("Failed to fetch runs:", err)
    } finally {
      setLoading(false)
    }
  }, [onCountsUpdate])

  useEffect(() => {
    fetchRuns(page)
  }, [page, fetchRuns])

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRuns(page)
    }, 10000)
    return () => clearInterval(interval)
  }, [page, fetchRuns])

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[#35281e] bg-[#0d0a07]/80">
      <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
        <h2 className="text-lg font-semibold">Runs</h2>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-xs text-white/40">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <span className="text-xs text-white/40">
            Auto-refresh: 10s
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-white/45">
            <tr>
              <th className="px-6 py-4">Trigger</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Lead</th>
              <th className="px-6 py-4">Started</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-white/50">
                  Loading...
                </td>
              </tr>
            ) : runs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-white/50">
                  No automation runs yet.
                </td>
              </tr>
            ) : (
              runs.map((run) => (
                <tr key={String(run._id)} className="border-t border-white/6">
                  <td className="px-6 py-4">
                    <Link
                      className="text-[#d4c08a] hover:underline"
                      href={`/admin/automations/runs/${String(run._id)}`}
                    >
                      {String(run.triggerEvent)}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={
                        run.status === "succeeded"
                          ? "text-green-400"
                          : run.status === "failed"
                            ? "text-red-400"
                            : "text-yellow-400"
                      }
                    >
                      {String(run.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {run.leadId ? (
                      <Link
                        className="text-white/70 hover:text-white"
                        href={`/admin/leads/${String(run.leadId)}`}
                      >
                        {String(run.leadId)}
                      </Link>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(String(run.startedAt)).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-white/8 px-6 py-4">
        <span className="text-sm text-white/50">
          Showing {runs.length} of {total} runs
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Previous
          </button>
          <span className="px-3 text-sm text-white/50">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
