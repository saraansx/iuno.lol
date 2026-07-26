'use server'

import { verifyOTPToken } from '@/lib/auth/otp'
import { createSession } from '@/lib/auth/session'
import { getUserByEmailWithPassword } from '@/lib/features/users/db'
import { isPasswordCorrect } from '@/lib/server/security/bcrypt'
import { verifyTurnstileToken } from '@/lib/server/security/turnstile'
import { loginRateLimit } from '@/lib/rate-limit'

type LoginInput = {
  email: string
  method: 'password' | 'otp'
  password?: string
  otpCode?: string
  turnstileToken?: string
}

export async function login(input: LoginInput) {
  try {
    const { email, method, password, otpCode, turnstileToken } = input

    if (!email) {
      return { error: 'Email is required.' }
    }

    if (!turnstileToken) {
      return { error: 'Please complete the security check.' }
    }

    const isTurnstileValid = await verifyTurnstileToken(turnstileToken)
    if (!isTurnstileValid) {
      return { error: 'Invalid security token. Please refresh the page and try again.' }
    }

    const rate = await loginRateLimit(email)
    if (!rate.ok) {
      const minutes = Math.ceil(rate.retryAfterSeconds / 60)
      return { error: `You're being rate limited. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` }
    }

    const user = await getUserByEmailWithPassword(email)
    if (!user) {
      return { error: 'Invalid credentials.' } // Prevent enumeration
    }

    if (!user.emailVerified) {
      return { error: 'Please verify your email address before logging in.' }
    }

    if (method === 'password') {
      if (!password) {
        return { error: 'Password is required.' }
      }
      
      if (!user.password || !(await isPasswordCorrect(password, user.password))) {
        return { error: 'Invalid credentials.' }
      }
    } else if (method === 'otp') {
      if (!otpCode) {
        return { error: 'OTP code is required.' }
      }

      const verification = await verifyOTPToken(email, otpCode)
      if (!verification.success) {
        return { error: verification.error || 'Invalid or expired OTP.' }
      }
    } else {
      return { error: 'Invalid login method.' }
    }

    // Create session
    await createSession(user.id)

    return { success: 'Logged in successfully!', username: user.username }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong.'
    return { error: message }
  }
}
