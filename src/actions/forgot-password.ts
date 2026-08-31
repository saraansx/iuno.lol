'use server'

import { createPasswordResetToken } from '@/lib/auth/tokens'
import { getUserByEmail } from '@/lib/features/users/db'
import { sendPasswordResetEmail } from '@/lib/mail'
import { assertTurnstile } from '@/lib/server/security/turnstile'

export async function forgotPassword(email: string, turnstileToken: string) {
  try {
    if (!email) {
      return { error: 'Email is required.' }
    }

    const turnstileError = await assertTurnstile(turnstileToken)
    if (turnstileError) return { error: turnstileError }

    const user = await getUserByEmail(email)
    if (!user) {
      return { success: 'If an account exists, a reset link was sent!' }
    }

    try {
      const token = await createPasswordResetToken(email)
      await sendPasswordResetEmail(email, token)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ''
      if (message.startsWith('Please wait')) {
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
