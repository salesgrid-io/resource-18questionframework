import AdminShell from "@/components/admin/AdminShell"
import AdminUnlock from "@/components/admin/AdminUnlock"
import { countLeads, countRuns, getRunById, listRuns } from "@/lib/automation/db"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import AutomationRunsTable from "@/components/admin/AutomationRunsTable"

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-[#35281e] bg-[#0d0a07]/80 p-5">
      <p className="text-xs uppercase tracking-[0.28em] text-white/35">{label}</p>
      <p className="mt-3 text-3xl font-black text-[#d4c08a]">{value}</p>
    </div>
  )
}

export default async function AdminAutomationsPage() {
  if (!(await isAdminAuthenticated())) {
    return <AdminUnlock />
  }

  const [runCounts, leadCount, runs] = await Promise.all([countRuns(), countLeads(), listRuns(20)])
  const latestFailure = runs.find((run) => run.status === "failed")
  const failureData = latestFailure ? await getRunById(String(latestFailure._id)) : null

  return (
    <AdminShell title="Automation Runs">
      <section className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Total Runs" value={runCounts.total} />
        <StatCard label="Succeeded" value={runCounts.succeeded} />
        <StatCard label="Failed" value={runCounts.failed} />
        <StatCard label="Total Leads" value={leadCount} />
      </section>

      <section className="mb-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <AutomationRunsTable />

        <div className="rounded-[2rem] border border-[#35281e] bg-[#0d0a07]/80 p-6">
          <h2 className="text-lg font-semibold">Recent Failure</h2>
          {failureData?.run ? (
            <div className="mt-4 space-y-3 text-sm text-white/65">
              <p>Run: {String(failureData.run._id)}</p>
              <p>Trigger: {String(failureData.run.triggerEvent)}</p>
              <p>Status: {String(failureData.run.status)}</p>
              {failureData.steps.find((step) => step.status === "failed") ? (
                <p>Failed step: {String(failureData.steps.find((step) => step.status === "failed")?.stepKey)}</p>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-sm text-white/50">No failures logged yet.</p>
          )}
        </div>
      </section>
    </AdminShell>
  )
}
