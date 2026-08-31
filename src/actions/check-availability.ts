'use server'

import { assertEmailAvailable, assertUsernameAvailable } from '@/lib/features/users/db'
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

    const usernameError = validateUsername(username)
    if (usernameError) return { error: usernameError }

    const emailError = validateEmail(email)
    if (emailError) return { error: emailError }

    try {
      await assertEmailAvailable(email)
      await assertUsernameAvailable(username)
    } catch {
      return { error: 'An account with that information already exists.' }
    }

    return { success: true }
  } catch (err: unknown) {
    console.error('[checkAvailability] Failed:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}
