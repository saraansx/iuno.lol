'use server'

import { consumePasswordResetToken } from '@/lib/auth/tokens'
import { updatePassword } from '@/lib/features/users/db'

export async function newPassword(token: string, password: string) {
  try {
    if (!token) {
      return { error: 'Missing token!' }
    }
    if (!password) {
      return { error: 'Password is required!' }
    }

    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters.' }
    }

    if (!/[A-Z]/.test(password)) {
      return { error: 'Password must include an uppercase letter.' }
    }

    if (!/[0-9]/.test(password)) {
      return { error: 'Password must include a number.' }
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return { error: 'Password must include a special character.' }
    }

    const email = await consumePasswordResetToken(token)
    if (!email) {
      return { error: 'Invalid or expired reset link!' }
    }

    await updatePassword(email, password)

    return { success: 'Password updated successfully!' }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong.'
    return { error: message }
  }
}
