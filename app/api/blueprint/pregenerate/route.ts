import { waitUntil } from "@vercel/functions"
import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { generateBlueprintContent } from "@/lib/claude"
import { initPregeneratedBlueprint, completePregeneratedBlueprint } from "@/lib/automation/db"
import type { QuizFormState } from "@/lib/automation/types"

export const maxDuration = 300

export async function POST(request: NextRequest) {
  const { quiz } = (await request.json()) as { quiz: Partial<QuizFormState> }
  const pregenId = randomUUID()

  // Insert pending doc immediately so orchestrator knows generation is in flight
  await initPregeneratedBlueprint(pregenId)

  waitUntil(
    generateBlueprintContent(quiz)
      .then((content) => completePregeneratedBlueprint(pregenId, content))
      .catch(() => {
        // Leave doc as "pending" — orchestrator timeout will handle it
      }),
  )

  return NextResponse.json({ pregenId })
}
