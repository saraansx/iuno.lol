'use server'

import { assertUsernameAvailable, getUserByEmail } from '@/lib/features/users/db'
import { headers } from 'next/headers'
import { checkAvailabilityRateLimit } from '@/lib/rate-limit'

export async function checkAvailability({ username, email }: { username: string; email: string }) {
  try {
    const h = await headers()
    const ip = h.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
    const rate = await checkAvailabilityRateLimit(ip)
    if (!rate.ok) {
      return { error: 'You\'re checking too fast. Please try again shortly.' }
    }

    const cleanUsername = username.trim().toLowerCase()
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanUsername) return { error: 'Username is required.' }
    if (!cleanEmail) return { error: 'Email is required.' }

    if (cleanUsername.length < 3 || cleanUsername.length > 32) {
      return { error: 'Username must be between 3 and 32 characters.' }
    }

    if (!/^[a-z0-9_.]+$/.test(cleanUsername)) {
      return { error: 'Invalid username characters.' }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { error: 'Invalid email format.' }
    }

    // Check both — if either exists, return the same generic message so the
    // response never reveals which field is taken.
    const existingUser = await getUserByEmail(cleanEmail)
    if (existingUser && existingUser.emailVerified) {
      return { error: 'An account with that information already exists.' }
    }

    try {
      await assertUsernameAvailable(cleanUsername)
    } catch {
      return { error: 'An account with that information already exists.' }
    }

    return { success: true }
  } catch (err: unknown) {
    console.error('[checkAvailability] Failed:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}
