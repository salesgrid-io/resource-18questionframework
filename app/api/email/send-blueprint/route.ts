import { NextRequest, NextResponse } from "next/server"
import { sendEmail, isEmailConfigured } from "@/lib/email"
import { BlueprintEmail } from "@/components/emails/BlueprintEmail"

interface SendBlueprintRequest {
  email: string
  firstName?: string
  blueprintUrl: string
}

export async function POST(request: NextRequest) {
  try {
    // Check if email is configured
    if (!isEmailConfigured()) {
      return NextResponse.json(
        { success: false, error: "Email service not configured" },
        { status: 503 }
      )
    }

    // Parse request body
    const body = await request.json() as SendBlueprintRequest
    const { email, firstName, blueprintUrl } = body

    // Validate required fields
    if (!email || !blueprintUrl) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: email and blueprintUrl" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(blueprintUrl)
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid blueprint URL format" },
        { status: 400 }
      )
    }

    // Send the email
    const result = await sendEmail({
      to: email,
      subject: "Your 18 Question Framework Blueprint is Ready",
      react: BlueprintEmail({ firstName, blueprintUrl }),
    })

    if (!result.success) {
      console.error("Failed to send blueprint email:", result.error)
      return NextResponse.json(
        { success: false, error: result.error || "Failed to send email" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Blueprint email sent successfully",
      id: result.id,
    })
  } catch (error) {
    console.error("Error in send-blueprint API:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
