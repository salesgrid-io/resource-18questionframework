import Link from "next/link"

export default function AdminShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <main className="blueprint-bg min-h-screen px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-[#35281e] bg-[#0d0a07]/80 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.35em] text-[#b59e5f]">Urban Unity Admin</p>
            <h1 className="blueprint-heading text-3xl font-black tracking-tight">{title}</h1>
          </div>
          <nav className="flex flex-wrap gap-3 text-sm text-white/60">
            <Link className="rounded-full border border-white/10 px-4 py-2 hover:border-[#b59e5f]/40 hover:text-white" href="/admin/automations">
              Automations
            </Link>
          </nav>
        </div>
        {children}
      </div>
    </main>
  )
}
