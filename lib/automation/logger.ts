import { insertLog } from "@/lib/automation/db"

// Logging writes to the same MongoDB we are usually logging *about*, so it must
// never throw: an exception here previously masked the original error and
// skipped the Slack alert in the /api/funnel/events catch block.
async function write(level: "info" | "warn" | "error", scope: string, message: string, context?: Record<string, unknown>) {
  try {
    await insertLog({ level, scope, message, context })
  } catch (error) {
    console.error(`[logger] failed to persist ${level} log for ${scope}`, error)
  }
}

export async function logInfo(scope: string, message: string, context?: Record<string, unknown>) {
  await write("info", scope, message, context)
}

export async function logWarn(scope: string, message: string, context?: Record<string, unknown>) {
  await write("warn", scope, message, context)
}

export async function logError(scope: string, message: string, context?: Record<string, unknown>) {
  await write("error", scope, message, context)
}
