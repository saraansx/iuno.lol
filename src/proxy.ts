import { NextResponse } from 'next/server'

export default async function middleware() {
  const response = NextResponse.next()

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

  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'production' ? '' : " 'unsafe-eval'"} https://challenges.cloudflare.com https://static.cloudflareinsights.com https://*.razorpay.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://host.iuno.lol https://cdn.iuno.lol https://cdn.discordapp.com https://discord-decoration.art https://i.scdn.co https://media.discordapp.net https://media.valorant-api.com https://api.henrikdev.xyz https://avatars.githubusercontent.com https://github.com https://*.workers.dev https://*.steamstatic.com https://*.razorpay.com https://flagcdn.com",
    "media-src 'self' data: blob: https://host.iuno.lol https://cdn.iuno.lol https://*.steamstatic.com",
    "connect-src 'self' https://challenges.cloudflare.com https://cloudflareinsights.com https://static.cloudflareinsights.com https://*.razorpay.com",
    "frame-src 'self' https://challenges.cloudflare.com https://*.razorpay.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://discord.com https://*.razorpay.com",
  ].join('; ')

  response.headers.set('Content-Security-Policy', cspDirectives)

  return response
}

export const config = {
  matcher: [
    '/((?!api/cron|_next/static|_next/image|favicon.ico|robots\\.txt|sitemap).*)',
  ],
}
