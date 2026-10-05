'use server'

import { consumePasswordResetToken } from '@/lib/auth/tokens'
import { updatePassword } from '@/lib/features/users/db'
import { validatePassword } from '@/lib/server/security/validation'
import { checkRateLimit, ipBucket } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/server/security/ip'
import { headers } from 'next/headers'

export async function newPassword(token: string, password: string) {
  try {
    const ip = getClientIp(await headers())
    const bucket = ipBucket('reset_password:ip', ip, 10)
    const rate = await checkRateLimit(bucket.key, bucket.max, 10 * 60)
    if (!rate.ok) return { error: 'Too many attempts. Please try again in a few minutes.' }
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
