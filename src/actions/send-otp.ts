'use server'

import { createOTPToken } from '@/lib/auth/otp'
import { getUserByEmail } from '@/lib/features/users/db'
import { sendTwoFactorTokenEmail } from '@/lib/mail'
import { verifyTurnstileToken } from '@/lib/server/security/turnstile'
import { sendOTPRateLimit } from '@/lib/rate-limit'

export const sendOTP = async (email: string, turnstileToken: string) => {
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

    const rate = await sendOTPRateLimit(email)
    if (!rate.ok) {
      const minutes = Math.ceil(rate.retryAfterSeconds / 60)
      return { error: `You're being rate limited. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` }
    }

    const user = await getUserByEmail(email)
    if (!user) {
      return { success: 'If an account exists, an OTP was sent!' }
    }

    try {
      const otp = await createOTPToken(email)
      await sendTwoFactorTokenEmail(email, otp)
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      if (message.startsWith('Please wait')) {
        return { success: 'If an account exists, an OTP was sent!' }
      }
      throw error
    }

    return { success: 'If an account exists, an OTP was sent!' }
  } catch (error) {
    console.error('[sendOTP] Failed:', error)
    return { error: 'Something went wrong. Please try again.' }
  }
}
