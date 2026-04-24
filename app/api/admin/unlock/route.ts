import { NextRequest, NextResponse } from "next/server"
import { ADMIN_COOKIE_NAME, verifyAdminPassword } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const password = body?.password

  if (typeof password !== "string" || !verifyAdminPassword(password)) {
    return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE_NAME, password, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })
  return response
}
