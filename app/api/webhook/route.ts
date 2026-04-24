import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    return NextResponse.json({
      ok: false,
      deprecated: true,
      message: "Use /api/funnel/events instead of /api/webhook.",
      receivedKeys: Object.keys(body ?? {}),
    })
  } catch (err) {
    console.error("Webhook proxy error:", err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
