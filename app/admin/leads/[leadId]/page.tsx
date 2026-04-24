import AdminShell from "@/components/admin/AdminShell"
import AdminUnlock from "@/components/admin/AdminUnlock"
import { getLeadById } from "@/lib/automation/db"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { notFound } from "next/navigation"

interface LeadDetailPageProps {
  params: Promise<{ leadId: string }>
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/10 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-white/35">{label}</p>
      <div className="mt-2 text-sm text-white/70">{value}</div>
    </div>
  )
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  if (!(await isAdminAuthenticated())) {
    return <AdminUnlock />
  }

  const { leadId } = await params
  const lead = await getLeadById(leadId)

  if (!lead) {
    notFound()
  }

  return (
    <AdminShell title={`Lead ${lead.email || leadId}`}>
      <section className="grid gap-6 lg:grid-cols-2">
        <Row label="Name" value={[lead.firstName, lead.lastName].filter(Boolean).join(" ") || "Unknown"} />
        <Row label="Email" value={lead.email || "Unknown"} />
        <Row label="Status" value={lead.status || "Unqualified"} />
        <Row label="Screen" value={lead.currentScreen} />
        <Row
          label="Blueprint"
          value={
            lead.blueprintUrl ? (
              <a className="text-[#d4c08a]" href={String(lead.blueprintUrl)}>
                {String(lead.blueprintUrl)}
              </a>
            ) : (
              "Not generated"
            )
          }
        />
        <Row label="Email Status" value={lead.emailStatus || "Pending"} />
        <Row label="Close Lead ID" value={lead.closeLeadId || "Not synced"} />
        <Row label="Close Contact ID" value={lead.closeContactId || "Not synced"} />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-[#35281e] bg-[#0d0a07]/80 p-6">
          <h2 className="text-lg font-semibold">Quiz Snapshot</h2>
          <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/8 bg-black/15 p-4 text-xs text-white/60">
            {JSON.stringify(lead.quiz, null, 2)}
          </pre>
        </div>
        <div className="rounded-[2rem] border border-[#35281e] bg-[#0d0a07]/80 p-6">
          <h2 className="text-lg font-semibold">Booking Snapshot</h2>
          <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/8 bg-black/15 p-4 text-xs text-white/60">
            {JSON.stringify(lead.booking, null, 2)}
          </pre>
        </div>
      </section>
    </AdminShell>
  )
}
