'use server'

import { createVerificationToken } from '@/lib/auth/tokens'
import { getUserByEmail } from '@/lib/features/users/db'
import { sendVerificationEmail } from '@/lib/mail'
import { verifyTurnstileToken } from '@/lib/server/security/turnstile'
import { resendVerificationRateLimit } from '@/lib/rate-limit'

export async function resendVerification(email: string, turnstileToken: string) {
  try {
    if (!email) {
      return { error: 'Email is required.' }
    }

    if (!turnstileToken) {
      return { error: 'Please complete the security check.' }
    }

    const isTurnstileValid = await verifyTurnstileToken(turnstileToken)
    if (!isTurnstileValid) {
      return { error: 'Invalid security token. Please refresh the page and try again.' }
    }

    const rate = await resendVerificationRateLimit(email)
    if (!rate.ok) {
      const minutes = Math.ceil(rate.retryAfterSeconds / 60)
      return { error: `You're being rate limited. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` }
    }

    const user = await getUserByEmail(email)

    if (!user) {
      return { success: 'If an account exists, a verification email was sent!' }
    }

    if (user.emailVerified) {
      return { success: 'If an account exists, a verification email was sent!' }
    }

    const token = await createVerificationToken(email)
    await sendVerificationEmail(email, token)

    return { success: 'If an account exists, a verification email was sent!' }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong.'
    return { error: message }
  }
}
