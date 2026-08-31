'use server'

import { createOTPToken } from '@/lib/auth/otp'
import { getUserByEmail } from '@/lib/features/users/db'
import { sendTwoFactorTokenEmail } from '@/lib/mail'
import { assertTurnstile } from '@/lib/server/security/turnstile'

export const sendOTP = async (email: string, turnstileToken: string) => {
  try {
    if (!email) {
      return { error: 'Email is required.' }
    }

    const turnstileError = await assertTurnstile(turnstileToken)
    if (turnstileError) return { error: turnstileError }

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
