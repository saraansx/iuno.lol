'use server'

import { getSessionUserId } from '@/lib/auth/session'

/** Lightweight server action — returns the current user's ID, or null. */
export async function getCurrentUserId() {
  return getSessionUserId() || null
}
