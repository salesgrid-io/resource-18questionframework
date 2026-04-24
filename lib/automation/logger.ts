import { insertLog } from "@/lib/automation/db"

export async function logInfo(scope: string, message: string, context?: Record<string, unknown>) {
  await insertLog({ level: "info", scope, message, context })
}

export async function logWarn(scope: string, message: string, context?: Record<string, unknown>) {
  await insertLog({ level: "warn", scope, message, context })
}

export async function logError(scope: string, message: string, context?: Record<string, unknown>) {
  await insertLog({ level: "error", scope, message, context })
}
