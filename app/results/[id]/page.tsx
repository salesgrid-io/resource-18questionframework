import { notFound } from "next/navigation"
import { Metadata } from "next"
import { getBlueprintWithLead, getLeadByBlueprintId } from "@/lib/automation/db"
import ResultViewTracker from "@/components/ResultViewTracker"
import BlueprintPage from "@/components/blueprint/BlueprintPage"
import BlueprintLoading from "@/components/blueprint/BlueprintLoading"
import type { BlueprintContent, QuizFormState } from "@/lib/automation/types"

// Don't cache - need fresh data to check if blueprint is ready
export const dynamic = "force-dynamic"

interface ResultsPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ResultsPageProps): Promise<Metadata> {
  const { id } = await params
  const data = await getBlueprintWithLead(id)
  const lead = data?.lead || await getLeadByBlueprintId(id)

  const firstName = lead?.firstName || "Your"
  return {
    title: `${firstName}'s Brand Blueprint - 18 Question Framework`,
    description: "Your strategic foundation. Not a mood board. Not a logo guide. The DNA underneath everything you build.",
  }
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params
  const data = await getBlueprintWithLead(id)

  // Check if we have a lead with this blueprintId but no blueprint yet
  const lead = data?.lead || await getLeadByBlueprintId(id)

  if (!data && !lead) {
    notFound()
  }

  // Blueprint not ready yet - show loading state
  if (!data?.blueprintRecord?.blueprint) {
    const firstName = lead?.firstName || lead?.quiz?.name?.split(" ")[0] || "Friend"
    return <BlueprintLoading firstName={firstName} />
  }

  const { blueprintRecord } = data
  const blueprint = blueprintRecord.blueprint as BlueprintContent
  const quiz = (lead?.quiz || {}) as Partial<QuizFormState>

  // Extract user info
  const firstName = lead?.firstName || quiz.name?.split(" ")[0] || "Friend"
  const age = quiz.age || "—"
  const situation = quiz.situation || "nolaunch"

  return (
    <>
      <ResultViewTracker resultId={id} />
      <BlueprintPage
        firstName={firstName}
        age={age}
        situation={situation}
        quiz={quiz}
        blueprint={blueprint}
      />
    </>
  )
}
