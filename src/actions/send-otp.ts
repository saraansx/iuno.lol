'use server'

import { createOTPToken } from '@/lib/auth/otp'
import { getUserByEmail } from '@/lib/features/users/db'
import { sendTwoFactorTokenEmail } from '@/lib/mail'
import { assertTurnstile } from '@/lib/server/security/turnstile'
import { UserFacingError } from '@/lib/errors'

export const sendOTP = async (email: string, turnstileToken: string) => {
  try {
    const clean = (email ?? '').trim()
    if (!clean) {
      return { error: 'Email is required.' }
    }
    if (!clean.includes('@')) {
      return { error: 'Enter a valid email address.' }
    }

    const turnstileError = await assertTurnstile(turnstileToken)
    if (turnstileError) return { error: turnstileError }

    const user = await getUserByEmail(clean)
    if (!user?.email) {
      return { error: 'No account found with that email.' }
    }

    try {
      const otp = await createOTPToken(user.email)
      await sendTwoFactorTokenEmail(user.email, otp)
    } catch (error) {
      if (error instanceof UserFacingError) {
        return { error: 'Could not send OTP. Please try again.' }
      }
      throw error
    }

    return { success: 'OTP sent to your email!' }
  } catch (error) {
    console.error('[sendOTP] Failed:', error)
    return { error: 'Something went wrong. Please try again.' }
  }
}
