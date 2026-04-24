import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { countRuns, listRuns } from "@/lib/automation/db"

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = parseInt(searchParams.get("limit") || "20", 10)
  const skip = (page - 1) * limit

  const [runs, counts] = await Promise.all([listRuns(limit, skip), countRuns()])

  return NextResponse.json({
    ok: true,
    runs,
    pagination: {
      page,
      limit,
      total: counts.total,
      totalPages: Math.ceil(counts.total / limit),
    },
    counts,
  })
}
