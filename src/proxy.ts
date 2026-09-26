import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'

const ADMIN_COOKIE = 'admin_session_v3'
const GATE_ENABLED = process.env.COMING_SOON_MODE !== 'false'

const RESERVED_PATHS = new Set([
  '/',
  '/api',
  '/auth',
  '/dashboard',
  '/register',
  '/signin',
])

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

  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  // Tebex is the merchant-of-record for all purchases. Tebex.js loads from
  // js.tebex.io, opens its embedded checkout in an iframe (frame-src) and talks
  // to the checkout/pay API over XHR (connect-src) — all on *.tebex.io.
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://*.tebex.io",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://files.catbox.moe https://cdn.iuno.lol https://cdn.discordapp.com https://discord-decoration.art https://i.scdn.co https://media.discordapp.net https://media.valorant-api.com https://api.henrikdev.xyz https://avatars.githubusercontent.com https://github.com https://*.workers.dev https://*.steamstatic.com https://*.tebex.io",
    "media-src 'self' data: blob: https://files.catbox.moe https://cdn.iuno.lol https://*.steamstatic.com",
    "connect-src 'self' https://challenges.cloudflare.com https://cloudflareinsights.com https://static.cloudflareinsights.com https://*.tebex.io",
    "frame-src 'self' https://challenges.cloudflare.com https://*.tebex.io",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://discord.com https://*.tebex.io",
  ].join('; ')

  response.headers.set('Content-Security-Policy', cspDirectives)

  const secretKey = request.nextUrl.searchParams.get('admin_access')
  const envBypassKey = process.env.ADMIN_BYPASS_KEY
  if (secretKey && envBypassKey && secretKey.length === envBypassKey.length) {
    const encoder = new TextEncoder()
    const secretBuf = encoder.encode(secretKey)
    const bypassBuf = encoder.encode(envBypassKey)
    let diff = 0
    for (let i = 0; i < secretBuf.length; i++) {
      diff |= secretBuf[i] ^ bypassBuf[i]
    }
    if (diff === 0) {
      const token = await signAdminToken()
      if (token) {
        const redirectUrl = new URL(request.url)
        redirectUrl.searchParams.delete('admin_access')
        const redirectResponse = NextResponse.redirect(redirectUrl)
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
  }

  const adminCookie = request.cookies.get(ADMIN_COOKIE)?.value
  if (adminCookie && (await verifyAdminToken(adminCookie))) {
    return response
  }

  if (GATE_ENABLED) {
    const isStaticFile = /\.(ico|png|jpg|jpeg|svg|css|js|woff2?|webp|mp4|webm|json|xml|txt)$/i.test(path)

    const isProfilePath =
      /^\/[a-z0-9_.]{1,32}$/i.test(path) && !RESERVED_PATHS.has(path.toLowerCase())

    const isPublicAsset =
      path === '/coming-soon' ||
      path === '/api/health' ||
      path === '/api/track-view' ||
      path.startsWith('/api/icons/') ||
      path.startsWith('/api/profile/') ||
      path.startsWith('/api/widgets/') ||
      path.startsWith('/api/webhooks/') ||
      path.startsWith('/api/music/stream/') ||
      path.startsWith('/api/music/artwork') ||
      path.startsWith('/_next/') ||
      path.startsWith('/api/cron/') ||
      path.startsWith('/api/og/') ||
      isProfilePath ||
      isStaticFile

    if (!isPublicAsset) {
      return NextResponse.redirect(new URL('/coming-soon', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api/cron|_next/static|_next/image|favicon.ico).*)',
  ],
}
