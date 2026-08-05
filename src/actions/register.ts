'use server'

import { createVerificationToken } from '@/lib/auth/tokens'
import { assertEmailAvailable, assertUsernameAvailable, deleteUnverifiedUserByEmail, cleanupExpiredUnverifiedUsers, createUser } from '@/lib/features/users/db'
import { sendVerificationEmail } from '@/lib/mail'
import { verifyTurnstileToken } from '@/lib/server/security/turnstile'
import { registerRateLimit } from '@/lib/rate-limit'
import { headers } from 'next/headers'

type RegisterInput = {
  username: string
  email: string
  password: string
  affiliateCode?: string
  turnstileToken: string
}

export async function register(input: RegisterInput) {
  try {
    const { username, email, password, turnstileToken, affiliateCode } = input

    if (!username || !email || !password) {
      return { error: 'Username, email and password are required.' }
    }

    if (username.length < 3 || username.length > 32) {
      return { error: 'Username must be between 3 and 32 characters.' }
    }

    if (!/^[a-z0-9_.]+$/.test(username)) {
      return { error: 'Invalid username characters.' }
    }

    if (!/^[a-z0-9]$/.test(username.slice(-1))) {
      return { error: 'Username must end with a letter or number.' }
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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { error: 'Invalid email format.' }
    }

    if (!turnstileToken) {
      return { error: 'Please complete the security check.' }
    }

    const isTurnstileValid = await verifyTurnstileToken(turnstileToken)
    if (!isTurnstileValid) {
      return { error: 'Invalid security token. Please refresh the page and try again.' }
    }

    const h = await headers()
    const ip = h.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'

    const rate = await registerRateLimit(email, ip)
    if (!rate.ok) {
      const minutes = Math.ceil(rate.retryAfterSeconds / 60)
      return { error: `You're being rate limited. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` }
    }

    await cleanupExpiredUnverifiedUsers()

    await assertEmailAvailable(email)
    await assertUsernameAvailable(username)

    await deleteUnverifiedUserByEmail(email)

    await createUser({ username, email, password, affiliateCode })

    const token = await createVerificationToken(email)
    await sendVerificationEmail(email, token)

    return { success: 'Account created! Please verify your email.' }
  } catch (err: unknown) {
    console.error('[register] Failed:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}
