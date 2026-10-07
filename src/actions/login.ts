'use server'

import { verifyOTPToken } from '@/lib/auth/otp'
import { createSession } from '@/lib/auth/session'
import { getUserByEmailWithPassword, getUserByUsernameWithPassword } from '@/lib/features/users/db'
import { isPasswordCorrect } from '@/lib/server/security/bcrypt'
import { assertTurnstile } from '@/lib/server/security/turnstile'
import { getClientIp } from '@/lib/server/security/ip'
import { loginRateLimit } from '@/lib/rate-limit'
import { headers, cookies } from 'next/headers'
import { createLoginTicket, redeemLoginTicket, TWO_FACTOR_TICKET_COOKIE } from '@/lib/auth/two-factor'
import { finishPasskeyLogin, startPasskeyLogin } from '@/lib/auth/passkeys'
import { checkRateLimit, ipBucket } from '@/lib/rate-limit'
import type { AuthenticationResponseJSON } from '@simplewebauthn/server'

type LoginInput = {
  identifier: string
  method: 'password' | 'otp'
  password?: string
  otpCode?: string
  turnstileToken?: string
  email?: string
}

export async function login(input: LoginInput) {
  try {
    const { method, password, otpCode, turnstileToken } = input
    const identifier = (input.identifier ?? input.email ?? '').trim()

    if (!identifier) {
      return { error: 'Email or username is required.' }
    }

    const isEmailFormat = identifier.includes('@')
    if (
      identifier.length > 254 ||
      (isEmailFormat && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(identifier)) ||
      (!isEmailFormat && !/^[A-Za-z0-9_.]{1,32}$/.test(identifier))
    ) {
      return { error: 'Invalid credentials.' }
    }

    const h = await headers()
    const ip = getClientIp(h)

    const turnstileError = await assertTurnstile(turnstileToken, ip ?? undefined)
    if (turnstileError) return { error: turnstileError }
    const rate = await loginRateLimit(identifier, ip)
    if (!rate.ok) {
      const minutes = Math.ceil(rate.retryAfterSeconds / 60)
      return { error: `You're being rate limited. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` }
    }

    const isEmail = identifier.includes('@')
    if (!isEmail) {
      const rateU = await checkRateLimit(`login_username:${identifier.toLowerCase()}`, 10, 10 * 60)
      if (!rateU.ok) return { error: 'Too many username login attempts. Try again in a few minutes.' }
    }
    const user = isEmail
      ? await getUserByEmailWithPassword(identifier)
      : await getUserByUsernameWithPassword(identifier)
    if (!user || !user.email) {
      return { error: 'Invalid credentials.' }
    }
    if (!isEmail && !user.usernameLoginEnabled) {
      return { error: 'Invalid credentials.' }
    }

    const email = user.email

    if (method === 'password') {
      if (!password) {
        return { error: 'Password is required.' }
      }

      if (password.length > 128) {
        return { error: 'Invalid credentials.' }
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

    if (!user.emailVerified) {
      return { error: 'Please verify your email address before logging in.' }
    }

    if (user.twoFactorEnabledAt) {
      const ticket = await createLoginTicket(user.id)
      return { twoFactor: true as const, ticket }
    }

    await createSession(user.id)

    return { success: 'Logged in successfully!', username: user.username }
  } catch (err: unknown) {
    console.error('[login] Failed:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}

export async function completeTwoFactorLogin(ticket: string | undefined, code: string) {
  try {
    const cookieStore = await cookies()
    const cookieTicket = cookieStore.get(TWO_FACTOR_TICKET_COOKIE)?.value
    const effectiveTicket = cookieTicket || ticket

    const result = await redeemLoginTicket(String(effectiveTicket ?? ''), String(code ?? ''))

    if (cookieTicket) {
      cookieStore.set(TWO_FACTOR_TICKET_COOKIE, '', { maxAge: 0, path: '/' })
    }

    if (!result.ok) return { error: result.error }
    await createSession(result.userId)
    return { success: 'Logged in successfully!' }
  } catch (err: unknown) {
    console.error('[completeTwoFactorLogin] Failed:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}

export async function beginPasskeyLogin() {
  try {
    const ip = getClientIp(await headers())
    const bucket = ipBucket('passkey_login:ip', ip, 30)
    const rate = await checkRateLimit(bucket.key, bucket.max, 10 * 60)
    if (!rate.ok) return { error: 'Too many attempts. Please try again in a few minutes.' }
    return { data: await startPasskeyLogin() }
  } catch (err: unknown) {
    console.error('[beginPasskeyLogin] Failed:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}

export async function completePasskeyLogin(challengeId: string, response: AuthenticationResponseJSON) {
  try {
    const ip = getClientIp(await headers())
    const bucket = ipBucket('passkey_complete:ip', ip, 20)
    const rate = await checkRateLimit(bucket.key, bucket.max, 10 * 60)
    if (!rate.ok) return { error: 'Too many attempts. Please try again in a few minutes.' }
    const userId = await finishPasskeyLogin(String(challengeId ?? ''), response)
    if (!userId) return { error: "Couldn't sign in with that passkey. Please try again." }
    await createSession(userId)
    return { success: 'Logged in successfully!' }
  } catch (err: unknown) {
    console.error('[completePasskeyLogin] Failed:', err)
    return { error: "Couldn't sign in with that passkey. Please try again." }
  }
}
