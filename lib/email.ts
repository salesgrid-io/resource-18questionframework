import { Resend } from "resend"
import { env } from "./env"

// Initialize Resend client
const resend = env.emailProviderApiKey ? new Resend(env.emailProviderApiKey) : null

// Default sender configuration
const DEFAULT_FROM = "Marshall Crews <no-reply@18questionframework.com>"

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  react: React.ReactElement
  from?: string
  replyTo?: string
}

export interface SendEmailResult {
  success: boolean
  id?: string
  error?: string
}

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  if (!resend) {
    console.error("Email provider not configured - EMAIL_PROVIDER_API_KEY is missing")
    return {
      success: false,
      error: "Email provider not configured",
    }
  }

  const from = options.from || env.emailFromAddress || DEFAULT_FROM

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      react: options.react,
      replyTo: options.replyTo,
    })

    if (error) {
      console.error("Failed to send email:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      id: data?.id,
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error"
    console.error("Email send error:", errorMessage)
    return {
      success: false,
      error: errorMessage,
    }
  }
}

export function isEmailConfigured(): boolean {
  return Boolean(env.emailProviderApiKey)
}
