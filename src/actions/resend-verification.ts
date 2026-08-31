'use server'

import { createVerificationToken } from '@/lib/auth/tokens'
import { getUserByEmail } from '@/lib/features/users/db'
import { sendVerificationEmail } from '@/lib/mail'
import { assertTurnstile } from '@/lib/server/security/turnstile'

export async function resendVerification(email: string, turnstileToken: string) {
  try {
    if (!email) {
      return { error: 'Email is required.' }
    }

    const turnstileError = await assertTurnstile(turnstileToken)
    if (turnstileError) return { error: turnstileError }

    const user = await getUserByEmail(email)

    if (!user) {
      return { success: 'If an account exists, a verification email was sent!' }
    }

    if (user.emailVerified) {
      return { success: 'If an account exists, a verification email was sent!' }
    }

    try {
      const token = await createVerificationToken(email)
      await sendVerificationEmail(email, token)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ''
      if (message.startsWith('Please wait')) {
        return { success: 'If an account exists, a verification email was sent!' }
      }
      throw err
    }

    return { success: 'If an account exists, a verification email was sent!' }
  } catch (err: unknown) {
    console.error('[resendVerification] Failed:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}
