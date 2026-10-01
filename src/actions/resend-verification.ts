'use server'

import { createVerificationToken } from '@/lib/auth/tokens'
import { getUserByEmail } from '@/lib/features/users/db'
import { sendVerificationEmail } from '@/lib/mail'
import { assertTurnstile } from '@/lib/server/security/turnstile'
import { UserFacingError } from '@/lib/errors'
import { authEmailRateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/server/security/ip'
import { headers } from 'next/headers'

export async function resendVerification(
  email: string,
  turnstileToken: string
): Promise<{ success?: string; error?: string }> {
  try {
    if (!email) {
      return { error: 'Email is required.' }
    }

    const turnstileError = await assertTurnstile(turnstileToken)
    if (turnstileError) return { error: turnstileError }

    const genericSuccess = { success: 'If that email has a pending signup, we sent a verification link.' }

    const limited = await authEmailRateLimit(email, getClientIp(await headers()))
    if (limited === 'ip') return { error: 'Too many requests. Please try again in a few minutes.' }
    if (limited === 'email') return genericSuccess

    const user = await getUserByEmail(email)
    if (!user?.email || user.emailVerified) {
      return genericSuccess
    }

    try {
      const token = await createVerificationToken(user.email)
      await sendVerificationEmail(user.email, token)
    } catch (err: unknown) {
      if (err instanceof UserFacingError) {
        return genericSuccess
      }
      throw err
    }

    return genericSuccess
  } catch (err: unknown) {
    console.error('[resendVerification] Failed:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}
