import { NextResponse, type NextRequest } from 'next/server'
import { DEFAULT_IMAGE_HOST, getDomainByHost, isOwnHost, usesImageDomain, usesProfileDomain } from '@/lib/features/domain-host'

const HANDLE_RE = /^\/([a-z0-9_.]{2,32})\/?$/
const FILE_RE = /^\/([A-Za-z0-9]{5}\.[a-z0-9]{2,5})$/
const MAIN_SITE = 'https://iuno.lol'

async function customDomain(request: NextRequest, host: string): Promise<NextResponse | null> {
  const { pathname, search } = request.nextUrl
  if (pathname.startsWith('/_next/')) return null
  const domain = await getDomainByHost(host)
  if (!domain) return new NextResponse('Domain not connected to iuno.lol', { status: 404 })

  if (pathname === '/') return NextResponse.rewrite(new URL(`/custom-domain?type=${domain.type}`, request.url))

  if (domain.type === 'image_host') {
    const file = pathname.match(FILE_RE)?.[1]
    if (file && (await usesImageDomain(file, domain.id))) return NextResponse.rewrite(new URL(file, DEFAULT_IMAGE_HOST))
    return new NextResponse('Not found', { status: 404 })
  }

  const handle = pathname.toLowerCase().match(HANDLE_RE)?.[1]
  if (handle) return (await usesProfileDomain(handle, domain.id)) ? null : NextResponse.redirect(`${MAIN_SITE}${pathname}${search}`)
  if (pathname.startsWith('/api/') || /\.[a-z0-9]+$/i.test(pathname)) return null
  return NextResponse.redirect(`${MAIN_SITE}${pathname}${search}`)
}

export default async function middleware(request: NextRequest) {
  const host = (request.headers.get('host') ?? '').toLowerCase().replace(/:\d+$/, '')
  if (host && !isOwnHost(host)) {
    try {
      const handled = await customDomain(request, host)
      if (handled) return handled
    } catch (err) {
      console.error('[domains] proxy error:', host, err)
      return new NextResponse('Something went wrong', { status: 500 })
    }
  }

  const response = NextResponse.next()

  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  if (process.env.NODE_ENV === 'production' && isOwnHost(host)) {
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
    '/((?!api/cron|_next/static|_next/image|favicon.ico).*)',
  ],
}
