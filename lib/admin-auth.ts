import { cookies } from "next/headers"
import { createHash, timingSafeEqual } from "crypto"
import { env } from "@/lib/env"

export const ADMIN_COOKIE_NAME = "urban_unity_admin"

function hash(value: string) {
  return createHash("sha256").update(value).digest()
}

export function verifyAdminPassword(input: string) {
  const expected = hash(env.adminSharedPassword)
  const received = hash(input)
  return timingSafeEqual(expected, received)
}

export async function isAdminAuthenticated() {
  const store = await cookies()
  const cookie = store.get(ADMIN_COOKIE_NAME)?.value
  if (!cookie) {
    return false
  }
  return verifyAdminPassword(cookie)
}
