'use server'

import { createVerificationToken, deleteVerificationTokens } from '@/lib/auth/tokens'
import { assertEmailAvailable, assertUsernameAvailable, deleteUnverifiedUserByEmail, cleanupExpiredUnverifiedUsers, createUser } from '@/lib/features/users/db'
import { sendVerificationEmail } from '@/lib/mail'
import { verifyTurnstileToken } from '@/lib/server/security/turnstile'
import { getClientIp } from '@/lib/server/security/ip'
import { validatePassword, validateUsername, validateEmail } from '@/lib/server/security/validation'
import { registerRateLimit } from '@/lib/rate-limit'
import { UserFacingError } from '@/lib/errors'
import { headers } from 'next/headers'

type RegisterInput = {
  username: string
  email: string
  password: string
  turnstileToken: string
}

export async function register(input: RegisterInput) {
  try {
    const { username, email, password, turnstileToken } = input

    const usernameError = validateUsername(username)
    if (usernameError) return { error: usernameError }

    const emailError = validateEmail(email)
    if (emailError) return { error: emailError }

    const passwordError = validatePassword(password)
    if (passwordError) return { error: passwordError }

    if (!turnstileToken) {
      return { error: 'Please complete the security check.' }
    }

    const isTurnstileValid = await verifyTurnstileToken(turnstileToken)
    if (!isTurnstileValid) {
      return { error: 'Invalid security token. Please refresh the page and try again.' }
    }

    const h = await headers()
    const ip = getClientIp(h)

    const rate = await registerRateLimit(email, ip)
    if (!rate.ok) {
      const minutes = Math.ceil(rate.retryAfterSeconds / 60)
      return { error: `You're being rate limited. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` }
    }

    await cleanupExpiredUnverifiedUsers()

    await assertEmailAvailable(email)
    await assertUsernameAvailable(username)

    await deleteUnverifiedUserByEmail(email)

    await createUser({ username, email, password, ip: ip ?? undefined })

    try {
      const token = await createVerificationToken(email)
      await sendVerificationEmail(email, token)
    } catch (err: unknown) {
      console.error('[register] Verification email failed:', err)
      await deleteUnverifiedUserByEmail(email)
      await deleteVerificationTokens(email)
      return { error: 'Could not send the verification email. Please try again.' }
    }

    return { success: 'Account created! Please verify your email.' }
  } catch (err: unknown) {
    if (err instanceof UserFacingError) {
      return { error: err.message }
    }
    console.error('[register] Failed:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}
