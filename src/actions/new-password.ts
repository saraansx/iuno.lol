'use server'

import { consumePasswordResetToken } from '@/lib/auth/tokens'
import { updatePassword } from '@/lib/features/users/db'
import { resetPasswordRateLimit } from '@/lib/rate-limit'

export async function newPassword(token: string, password: string) {
  try {
    if (!token) {
      return { error: 'Missing token!' }
    }
    if (!password) {
      return { error: 'Password is required!' }
    }

    const email = await consumePasswordResetToken(token)
    if (!email) {
      return { error: 'Invalid or expired reset link!' }
    }

    const rate = await resetPasswordRateLimit(email)
    if (!rate.ok) {
      const minutes = Math.ceil(rate.retryAfterSeconds / 60)
      return { error: `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` }
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

    await updatePassword(email, password)

    return { success: 'Password updated successfully!' }
  } catch (err: unknown) {
    console.error('[newPassword] Failed:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}
