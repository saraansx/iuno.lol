'use server'

import { createVerificationToken } from '@/lib/auth/tokens'
import { getUserByEmail } from '@/lib/features/users/db'
import { sendVerificationEmail } from '@/lib/mail'
import { assertTurnstile } from '@/lib/server/security/turnstile'
import { UserFacingError } from '@/lib/errors'

export async function resendVerification(email: string, turnstileToken: string) {
  try {
    if (!email) {
      return { error: 'Email is required.' }
    }

    const turnstileError = await assertTurnstile(turnstileToken)
    if (turnstileError) return { error: turnstileError }

    const user = await getUserByEmail(email)

    if (!user) {
      return { error: 'No pending signup found for that email. Please register again.' }
    }

    if (user.emailVerified) {
      return { error: 'That email is already verified. You can sign in.' }
    }

    try {
      const token = await createVerificationToken(email)
      await sendVerificationEmail(email, token)
    } catch (err: unknown) {
      if (err instanceof UserFacingError) {
        return { error: err.message }
      }
      throw err
    }

    return { success: 'Verification email sent! Check your inbox.' }
  } catch (err: unknown) {
    console.error('[resendVerification] Failed:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}
