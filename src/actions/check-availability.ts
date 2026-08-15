'use server'

import { assertUsernameAvailable, getUserByEmail } from '@/lib/features/users/db'
import { headers } from 'next/headers'
import { getClientIp } from '@/lib/server/security/ip'
import { validateUsername, validateEmail } from '@/lib/server/security/validation'
import { checkAvailabilityRateLimit } from '@/lib/rate-limit'

export async function checkAvailability({ username, email }: { username: string; email: string }) {
  try {
    const h = await headers()
    const ip = getClientIp(h)
    const rate = await checkAvailabilityRateLimit(ip)
    if (!rate.ok) {
      return { error: 'You\'re checking too fast. Please try again shortly.' }
    }

    const cleanUsername = username.trim().toLowerCase()
    const cleanEmail = email.trim().toLowerCase()

    const usernameError = validateUsername(cleanUsername)
    if (usernameError) return { error: usernameError }

    const emailError = validateEmail(cleanEmail)
    if (emailError) return { error: emailError }

    // Check both — if either exists, return the same generic message so the
    // response never reveals which field is taken.
    const existingUser = await getUserByEmail(cleanEmail)
    if (existingUser && existingUser.emailVerified) {
      return { error: 'An account with that information already exists.' }
    }

    try {
      await assertUsernameAvailable(cleanUsername)
    } catch {
      return { error: 'An account with that information already exists.' }
    }

    return { success: true }
  } catch (err: unknown) {
    console.error('[checkAvailability] Failed:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}
