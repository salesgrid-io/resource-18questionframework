import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"
import { BlueprintEmail } from "@/components/emails/BlueprintEmail"
import { generateBlueprintFromClaude } from "@/lib/automation/integrations"
import { createBlueprintIdentifiers } from "@/lib/blueprint"
import type { LeadRecord, QuizFormState } from "@/lib/automation/types"

// Test quiz data with realistic answers
const TEST_QUIZ_DATA: QuizFormState = {
  name: "Rafael Test",
  age: "28",
  situation: "nolaunch",
  changedWorldview:
    "Growing up in a small town where nobody believed in tech entrepreneurship, I taught myself to code at 14 and built my first app. Seeing my parents work multiple jobs while I created something from nothing showed me that your background doesn't determine your potential - your willingness to learn and adapt does.",
  capableOfImpact:
    "Absolutely. I've already built multiple products that thousands of people use daily. I see problems everywhere and can't help but design solutions. The question isn't whether I can create impact - it's how to maximize it.",
  notUnderstood:
    "People think I'm just into tech, but what drives me is human connection and empowerment. Every product I build is about giving people tools to express themselves and achieve their goals. The technology is just the medium.",
  moneyNoFactor:
    "I'd build a global network of creative spaces where anyone can learn to build digital products for free. I'd travel to underserved communities and teach kids that they can create technology, not just consume it.",
  nichedInterest:
    "The intersection of streetwear culture and tech startup aesthetics. I'm fascinated by how Y2K fashion is making a comeback and how it parallels the optimism of early internet culture.",
  closestExpert:
    "Building and scaling SaaS products. I understand the entire journey from idea validation to product-market fit to scaling. I've done it three times now with varying degrees of success.",
  characters: ["Tony Stark", "Steve Jobs", "Virgil Abloh", "Kanye West", "Elon Musk"],
  thePast:
    "My first business failed spectacularly when I was 21. I had built something nobody wanted because I never talked to customers. That failure taught me more than any success ever could - now I validate everything before building.",
  theTurningPoint:
    "I saw how clothing could be a statement of identity and aspiration. The brands I admired weren't just selling clothes - they were selling belonging and self-expression. I wanted to create that for the tech/creative community.",
  thePresent:
    "I'm building a streetwear brand that speaks to builders, creators, and dreamers. Every piece tells a story about the journey from idea to reality. It's not just clothes - it's armor for people who are building the future.",
  theFuture:
    "In 5 years, I see myself running a lifestyle brand that has become synonymous with the builder mindset. Pop-up shops in every major tech hub, collaborations with innovative companies, and a community of creators who wear our brand as a badge of honor.",
  values: ["Authenticity", "Innovation", "Community", "Quality", "Persistence"],
  against:
    "Fast fashion that exploits workers and destroys the environment. Brands that sell identity without substance. The idea that you need permission or connections to build something meaningful.",
  whyImpact:
    "Because I've seen how the right message at the right time can change someone's trajectory. When I wore my first startup hoodie, I felt like I belonged to something bigger. I want to create that feeling for others.",
  targetPerson:
    "Creative professionals aged 22-35 who are building something - whether it's a startup, an art practice, or a side project. They value quality over quantity, authenticity over trends, and community over clout.",
  whatToSell:
    "Premium streetwear: hoodies, tees, and accessories. Each drop tells a story and has limited availability. Think of it as wearable motivation for builders.",
  whyBuyFromYou:
    "Because I am my customer. I've lived the builder journey, felt the highs and lows, and understand what it means to bet on yourself. Our brand isn't designed by committee - it's crafted by someone who gets it.",
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = body.email || "rafael@salesgrid.io"
    const firstName = body.firstName || "Rafael"

    const db = await getDb()
    const now = new Date()

    // Create blueprint identifiers
    const { blueprintId, blueprintUrl } = createBlueprintIdentifiers()

    // Create test lead record
    const testLead: Omit<LeadRecord, "_id"> = {
      firstName,
      lastName: "Test",
      email,
      phone: "+15551234567",
      countryCode: "+1",
      status: "qualified",
      currentScreen: "complete",
      sessionId: `test-session-${Date.now()}`,
      browserId: `test-browser-${Date.now()}`,
      utm: {
        utm_source: "test",
        utm_medium: "api",
        utm_campaign: "blueprint-test",
        utm_content: "test-email",
      },
      quiz: TEST_QUIZ_DATA,
      booking: {},
      blueprintId,
      blueprintUrl,
      blueprintStatus: "generating",
      createdAt: now,
      updatedAt: now,
    }

    // Insert lead
    const result = await db.collection("leads").insertOne(testLead)
    const leadId = result.insertedId.toString()
    const lead = { ...testLead, _id: result.insertedId } as LeadRecord

    // Generate blueprint using Claude
    console.log("Generating blueprint for test lead...")
    const { blueprint, rawResponse } = await generateBlueprintFromClaude({
      lead,
      resultUrlPlaceholder: blueprintUrl,
    })

    // Save blueprint to leads collection
    await db.collection("leads").updateOne(
      { _id: result.insertedId },
      {
        $set: {
          blueprintContent: blueprint,
          blueprintStatus: "generated",
          blueprintGeneratedAt: now,
          updatedAt: new Date(),
        },
      }
    )

    // Also save to blueprints collection
    await db.collection("blueprints").insertOne({
      publicId: blueprintId,
      leadId,
      blueprint,
      rawResponse,
      createdAt: now,
    })

    console.log("Blueprint generated, sending email...")

    // Send email
    const emailResult = await sendEmail({
      to: email,
      subject: "Your Brand Blueprint is Ready - 18 Question Framework",
      react: BlueprintEmail({ firstName, blueprintUrl }),
    })

    if (!emailResult.success) {
      return NextResponse.json(
        {
          ok: false,
          error: `Email failed: ${emailResult.error}`,
          leadId,
          blueprintId,
          blueprintUrl,
        },
        { status: 500 }
      )
    }

    // Update email status
    await db.collection("leads").updateOne(
      { _id: result.insertedId },
      {
        $set: {
          emailStatus: "sent",
          emailSentAt: new Date(),
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json({
      ok: true,
      message: `Test email sent to ${email}`,
      leadId,
      blueprintId,
      blueprintUrl,
      emailId: emailResult.id,
      blueprint,
    })
  } catch (error) {
    console.error("Test email error:", error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
