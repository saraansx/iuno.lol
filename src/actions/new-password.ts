'use server'

import { consumePasswordResetToken } from '@/lib/auth/tokens'
import { updatePassword } from '@/lib/features/users/db'
import { validatePassword } from '@/lib/server/security/validation'

export async function newPassword(token: string, password: string) {
  try {
    if (!token) {
      return { error: 'Missing token!' }
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      return { error: passwordError }
    }

    const email = await consumePasswordResetToken(token)
    if (!email) {
      return { error: 'Invalid or expired reset link!' }
    }

    await updatePassword(email, password)

    return { success: 'Password updated successfully!' }
  } catch (err: unknown) {
    console.error('[newPassword] Failed:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}
