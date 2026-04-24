import { NextRequest, NextResponse } from "next/server"
import { getBlueprintContent } from "@/lib/blueprint"
import { logError } from "@/lib/automation/logger"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Blueprint ID is required" },
        { status: 400 }
      )
    }

    const content = await getBlueprintContent(id)

    if (!content) {
      return NextResponse.json(
        { ok: false, error: "Blueprint not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ok: true,
      content,
    })
  } catch (error) {
    await logError("api.blueprint.get", "Failed to fetch blueprint", {
      error: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    )
  }
}
