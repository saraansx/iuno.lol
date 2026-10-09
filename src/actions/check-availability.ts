'use server'

import { assertUsernameAvailable } from '@/lib/features/users/db'
import { headers } from 'next/headers'
import { getClientIp } from '@/lib/server/security/ip'
import { validateUsername, validateEmail } from '@/lib/server/security/validation'
import { checkAvailabilityRateLimit } from '@/lib/rate-limit'
import { UserFacingError } from '@/lib/errors'

type AvailabilityResult = {
  success?: boolean;
  error?: string;
  field?: 'username' | 'email';
}

export async function checkAvailability({ username, email }: { username: string; email: string }): Promise<AvailabilityResult> {
  try {
    const h = await headers()
    const ip = getClientIp(h)
    const rate = await checkAvailabilityRateLimit(ip)
    if (!rate.ok) {
      return { error: 'You\'re checking too fast. Please try again shortly.' }
    }

    const usernameError = validateUsername(username)
    if (usernameError) return { error: usernameError, field: 'username' as const }

    const emailError = validateEmail(email)
    if (emailError) return { error: emailError, field: 'email' as const }

    try {
      await assertUsernameAvailable(username)
    } catch (err: unknown) {
      if (err instanceof UserFacingError) {
        return { error: err.message, field: 'username' as const }
      }
      throw err
    }

    return { success: true }
  } catch (err: unknown) {
    console.error('[checkAvailability] Failed:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}
