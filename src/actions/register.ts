'use server'

import { createVerificationToken, deleteVerificationTokens } from '@/lib/auth/tokens'
import { deleteUnverifiedUserByEmail, countRecentUnverifiedByIp, createUser } from '@/lib/features/users/db'
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

const MAX_UNVERIFIED_PER_IP = 2

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

    const h = await headers()
    const ip = getClientIp(h)

    const isTurnstileValid = await verifyTurnstileToken(turnstileToken, ip ?? undefined)
    if (!isTurnstileValid) {
      return { error: 'Invalid security token. Please refresh the page and try again.' }
    }

    const rate = await registerRateLimit(email, ip)
    if (!rate.ok) {
      const minutes = Math.ceil(rate.retryAfterSeconds / 60)
      return { error: `You're being rate limited. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` }
    }

    if (ip) {
      const unverified = await countRecentUnverifiedByIp(ip)
      if (unverified >= MAX_UNVERIFIED_PER_IP) {
        return { error: 'Too many pending accounts from your network. Please verify an existing one or try again later.' }
      }
    }

    await deleteUnverifiedUserByEmail(email)

    try {
      await createUser({ username, email, password, ip: ip ?? undefined })
    } catch (err: unknown) {
      if (err instanceof UserFacingError && /email/i.test(err.message)) {
        console.warn('[register] signup blocked: email already registered')
        return { success: 'Account created! Please verify your email.' }
      }
      throw err
    }

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
