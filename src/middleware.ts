import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'

const ADMIN_COOKIE = 'admin_session_v3'
const GATE_ENABLED = process.env.COMING_SOON_MODE !== 'false'

function jwtSecretKey(): Uint8Array | null {
  const secret = process.env.JWT_SECRET_KEY
  return secret ? new TextEncoder().encode(secret) : null
}

async function signAdminToken(): Promise<string | null> {
  const secret = jwtSecretKey()
  if (!secret) {
    console.error('[middleware] JWT_SECRET_KEY is not set — admin bypass unavailable.')
    return null
  }
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1y')
    .sign(secret)
}

async function verifyAdminToken(token: string): Promise<boolean> {
  const secret = jwtSecretKey()
  if (!secret) return false
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] })
    return payload.role === 'admin'
  } catch {
    return false
  }
}

export default async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const path = request.nextUrl.pathname

  // ── Security headers ──────────────────────────────────────────────────────
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  const secretKey = request.nextUrl.searchParams.get('admin_access')
  if (secretKey && process.env.ADMIN_BYPASS_KEY && secretKey === process.env.ADMIN_BYPASS_KEY) {
    const token = await signAdminToken()
    if (token) {
      const redirectResponse = NextResponse.redirect(new URL('/', request.url))
      redirectResponse.cookies.set(ADMIN_COOKIE, token, {
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
      return redirectResponse
    }
  }

  // 2. Valid admin cookie lets you through
  const adminCookie = request.cookies.get(ADMIN_COOKIE)?.value
  if (adminCookie && (await verifyAdminToken(adminCookie))) {
    return response
  }

  // 3. Coming-soon gate
  if (GATE_ENABLED) {
    const isPublicAsset =
      path === '/coming-soon' ||
      path.startsWith('/_next/') ||
      path.startsWith('/api/cron/') ||
      path.includes('.') // like /logo.svg or /favicon.ico

    if (!isPublicAsset) {
      return NextResponse.redirect(new URL('/coming-soon', request.url))
    }
  }

  return response
}

// Only run middleware on these paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/cron (cron jobs)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/cron|_next/static|_next/image|favicon.ico).*)',
  ],
}
