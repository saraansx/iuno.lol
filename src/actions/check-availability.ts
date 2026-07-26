'use server'

import { assertUsernameAvailable, getUserByEmail } from '@/lib/features/users/db'

export async function checkAvailability({ username, email }: { username: string; email: string }) {
  try {
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
    const existingUser = await getUserByEmail(cleanEmail)
    if (existingUser && existingUser.emailVerified) {
      return { error: 'An account with that email already exists.' }
    }

    await assertUsernameAvailable(cleanUsername)

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong.'
    return { error: message }
  }
}
