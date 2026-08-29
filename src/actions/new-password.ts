'use server'

import { consumePasswordResetToken } from '@/lib/auth/tokens'
import { updatePassword } from '@/lib/features/users/db'
import { getClientIp } from '@/lib/server/security/ip'
import { validatePassword } from '@/lib/server/security/validation'
import { resetPasswordRateLimit } from '@/lib/rate-limit'
import { headers } from 'next/headers'

export async function newPassword(token: string, password: string) {
  try {
    if (!token) {
      return { error: 'Missing token!' }
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      return { error: passwordError }
    }

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
