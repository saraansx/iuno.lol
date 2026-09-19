'use server'

import { verifyOTPToken } from '@/lib/auth/otp'
import { createSession } from '@/lib/auth/session'
import { getUserByEmailWithPassword, getUserByUsernameWithPassword } from '@/lib/features/users/db'
import { isPasswordCorrect } from '@/lib/server/security/bcrypt'
import { assertTurnstile } from '@/lib/server/security/turnstile'
import { getClientIp } from '@/lib/server/security/ip'
import { loginRateLimit, recordFailedLogin } from '@/lib/rate-limit'
import { headers } from 'next/headers'

type LoginInput = {
  identifier: string
  method: 'password' | 'otp'
  password?: string
  otpCode?: string
  turnstileToken?: string
  /** @deprecated Use `identifier` instead. */
  email?: string
}

export async function login(input: LoginInput) {
  try {
    const { method, password, otpCode, turnstileToken } = input
    const identifier = (input.identifier ?? input.email ?? '').trim()

    if (!identifier) {
      return { error: 'Email or username is required.' }
    }

    const turnstileError = await assertTurnstile(turnstileToken)
    if (turnstileError) return { error: turnstileError }

    const h = await headers()
    const ip = getClientIp(h)
    const rate = await loginRateLimit(identifier, ip)
    if (!rate.ok) {
      const minutes = Math.ceil(rate.retryAfterSeconds / 60)
      return { error: `You're being rate limited. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` }
    }

    const isEmail = identifier.includes('@')
    const user = isEmail
      ? await getUserByEmailWithPassword(identifier)
      : await getUserByUsernameWithPassword(identifier)
    if (!user || !user.email) {
      await recordFailedLogin(identifier, ip)
      return { error: 'Invalid credentials.' }
    }

    const email = user.email

    if (!user.emailVerified) {
      return { error: 'Please verify your email address before logging in.' }
    }

    if (method === 'password') {
      if (!password) {
        return { error: 'Password is required.' }
      }

      if (password.length > 128) {
        await recordFailedLogin(identifier, ip)
        return { error: 'Invalid credentials.' }
      }

      if (!user.password || !(await isPasswordCorrect(password, user.password))) {
        await recordFailedLogin(identifier, ip)
        return { error: 'Invalid credentials.' }
      }
    } else if (method === 'otp') {
      if (!otpCode) {
        return { error: 'OTP code is required.' }
      }

      const verification = await verifyOTPToken(email, otpCode)
      if (!verification.success) {
        await recordFailedLogin(identifier, ip)
        return { error: verification.error || 'Invalid or expired OTP.' }
      }
    } else {
      return { error: 'Invalid login method.' }
    }

    await createSession(user.id)

    return { success: 'Logged in successfully!', username: user.username }
  } catch (err: unknown) {
    console.error('[login] Failed:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}
