import { notFound } from "next/navigation"
import AdminShell from "@/components/admin/AdminShell"
import AdminUnlock from "@/components/admin/AdminUnlock"
import { getRunById } from "@/lib/automation/db"
import { isAdminAuthenticated } from "@/lib/admin-auth"

interface RunDetailPageProps {
  params: Promise<{ runId: string }>
}

export default async function RunDetailPage({ params }: RunDetailPageProps) {
  if (!(await isAdminAuthenticated())) {
    return <AdminUnlock />
  }

  const { runId } = await params
  const data = await getRunById(runId)

  if (!data.run) {
    notFound()
  }

  return (
    <AdminShell title={`Run ${runId}`}>
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[2rem] border border-[#35281e] bg-[#0d0a07]/80 p-6">
          <h2 className="text-lg font-semibold">Step Timeline</h2>
          <div className="mt-5 space-y-4">
            {(Array.isArray(data.steps) ? data.steps : []).map((step) => (
              <div key={String(step._id)} className="rounded-2xl border border-white/8 bg-black/10 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{String(step.stepKey)}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-white/35">{String(step.provider)}</p>
                  </div>
                  <span className="rounded-full border border-[#b59e5f]/30 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#d4c08a]">
                    {String(step.status)}
                  </span>
                </div>
                {step.errorMessage ? <p className="mt-3 text-sm text-[#f4a1a1]">{String(step.errorMessage)}</p> : null}
                {step.responseSummary ? (
                  <pre className="mt-3 overflow-x-auto rounded-xl border border-white/6 bg-black/20 p-3 text-xs text-white/60">
                    {JSON.stringify(step.responseSummary, null, 2)}
                  </pre>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#35281e] bg-[#0d0a07]/80 p-6">
          <h2 className="text-lg font-semibold">Logs</h2>
          <div className="mt-4 space-y-3">
            {Array.isArray(data.logs) && data.logs.length ? (
              data.logs.map((log) => (
                <div key={String(log._id)} className="rounded-2xl border border-white/8 bg-black/10 p-3 text-sm">
                  <p className="font-medium text-white">{String(log.message)}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/35">{String(log.level)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/50">No logs attached to this run yet.</p>
            )}
          </div>
        </div>
      </section>
    </AdminShell>
  )
}
