// mongod is co-located with ~20 dashboards on a memory-constrained box, so short
// blips ("server monitor timeout", "connection N closed") are expected. Riding
// them out beats dropping a lead and paging Slack.
const TRANSIENT_MARKERS = [
  "server monitor timeout",
  "timed out",
  "connection closed",
  "connection pool",
  "server selection",
  "topology",
  "socket",
  "econnreset",
  "econnrefused",
  "epipe",
  "not primary",
]

export function isTransientMongoError(error: unknown) {
  const message = (error instanceof Error ? error.message : String(error)).toLowerCase()
  return TRANSIENT_MARKERS.some((marker) => message.includes(marker))
}

export async function withMongoRetry<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (attempt === attempts || !isTransientMongoError(error)) {
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** (attempt - 1)))
    }
  }

  throw lastError
}
