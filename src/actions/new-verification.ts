'use server'

import { consumeVerificationToken } from '@/lib/auth/tokens'
import { markEmailVerified, getUserByEmail } from '@/lib/features/users/db'
import { createSession } from '@/lib/auth/session'

export async function newVerification(token: string) {
  try {
    const email = await consumeVerificationToken(token)

    if (!email) {
      return { error: 'Invalid or expired verification token.' }
    }

    const existingUser = await getUserByEmail(email)

    if (!existingUser) {
      return { error: 'Email does not exist.' }
    }

    await markEmailVerified(email)
    await createSession(existingUser.id)

    return { success: 'Email verified successfully!', username: existingUser.username }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong.'
    return { error: message }
  }
}
