import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ADMIN_COOKIE_NAME = "urban_unity_admin"

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next()
  }

  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  if (cookie) {
    return NextResponse.next()
  }

  if (request.nextUrl.pathname === "/admin/automations") {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL("/admin/automations", request.url))
}

export const config = {
  matcher: ["/admin/:path*"],
}
