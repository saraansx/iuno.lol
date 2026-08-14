'use server'

import { consumePasswordResetToken } from '@/lib/auth/tokens'
import { updatePassword } from '@/lib/features/users/db'
import { getClientIp } from '@/lib/server/security/ip'
import { resetPasswordRateLimit } from '@/lib/rate-limit'
import { headers } from 'next/headers'

export async function newPassword(token: string, password: string) {
  try {
    if (!token) {
      return { error: 'Missing token!' }
    }
    if (!password) {
      return { error: 'Password is required!' }
    }

    // Validate the password BEFORE consuming the token. consumePasswordResetToken
    // deletes the row, so rejecting a weak password afterwards would burn the
    // one-time link and force the user to request a whole new email.
    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters.' }
    }

    if (password.length > 128) {
      return { error: 'Password must be 128 characters or fewer.' }
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

    // Rate limit BEFORE the token lookup. Keyed by IP because the email is only
    // known once the lookup succeeds, and running it after would let a tripped
    // limit destroy an otherwise valid one-time token.
    const h = await headers()
    const ip = getClientIp(h)
    const rate = await resetPasswordRateLimit(ip)
    if (!rate.ok) {
      const minutes = Math.ceil(rate.retryAfterSeconds / 60)
      return { error: `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` }
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
