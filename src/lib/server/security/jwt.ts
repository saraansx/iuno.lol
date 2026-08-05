import { JWTPayload, SignJWT, jwtVerify } from 'jose'

const secret = process.env.JWT_SECRET_KEY
if (!secret) {
  throw new Error('JWT_SECRET_KEY is not set. Sessions cannot be secured without it.')
}

const encodedKey = new TextEncoder().encode(secret)

export async function encrypt(payload: JWTPayload & { expiresAt: Date }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(payload.expiresAt.getTime() / 1000))
    .sign(encodedKey)
}

export async function decrypt(session = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload
  } catch {
    return undefined
  }
}
