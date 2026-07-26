'use server'

import { createPasswordResetToken } from '@/lib/auth/tokens'
import { getUserByEmail } from '@/lib/features/users/db'
import { sendPasswordResetEmail } from '@/lib/mail'
import { verifyTurnstileToken } from '@/lib/server/security/turnstile'
import { forgotPasswordRateLimit } from '@/lib/rate-limit'

export async function forgotPassword(email: string, turnstileToken: string) {
  try {
    if (!email) {
      return { error: 'Email is required.' }
    }

    if (!turnstileToken) {
      return { error: 'Security verification is required.' }
    }

    const isVerified = await verifyTurnstileToken(turnstileToken)
    if (!isVerified) {
      return { error: 'Security verification failed.' }
    }

    const rate = await forgotPasswordRateLimit(email)
    if (!rate.ok) {
      const minutes = Math.ceil(rate.retryAfterSeconds / 60)
      return { error: `You're being rate limited. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` }
    }

    const user = await getUserByEmail(email)
    if (!user) {
      // Prevent email enumeration
      return { success: 'If an account exists, a reset link was sent!' }
    }

    const token = await createPasswordResetToken(email)
    await sendPasswordResetEmail(email, token)

    return { success: 'If an account exists, a reset link was sent!' }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong.'
    return { error: message }
  }
}
