'use server'

import { createPasswordResetToken } from '@/lib/auth/tokens'
import { getUserByEmail } from '@/lib/features/users/db'
import { sendPasswordResetEmail } from '@/lib/mail'
import { assertTurnstile } from '@/lib/server/security/turnstile'
import { UserFacingError } from '@/lib/errors'
import { authEmailRateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/server/security/ip'
import { headers } from 'next/headers'

export async function forgotPassword(email: string, turnstileToken: string) {
  try {
    if (!email) {
      return { error: 'Email is required.' }
    }

    const turnstileError = await assertTurnstile(turnstileToken)
    if (turnstileError) return { error: turnstileError }

    const limited = await authEmailRateLimit(email, getClientIp(await headers()))
    if (limited === 'ip') return { error: 'Too many requests. Please try again in a few minutes.' }
    if (limited === 'email') return { success: 'If an account exists, a reset link was sent!' }

    const user = await getUserByEmail(email)
    if (!user?.email) {
      return { success: 'If an account exists, a reset link was sent!' }
    }

    try {
      const token = await createPasswordResetToken(user.email)
      await sendPasswordResetEmail(user.email, token)
    } catch (err: unknown) {
      if (err instanceof UserFacingError) {
        return { success: 'If an account exists, a reset link was sent!' }
      }
      throw err
    }

    return { success: 'If an account exists, a reset link was sent!' }
  } catch (err: unknown) {
    console.error('[forgotPassword] Failed:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}
