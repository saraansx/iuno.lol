import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 1. Check for the secret bypass URL parameter
  const secretKey = request.nextUrl.searchParams.get('admin_access')
  
  if (secretKey === 'iuno123') {
    // They got the password right! Set the cookie and redirect to home.
    const response = NextResponse.redirect(new URL('/', request.url))
    
    // Give them a cookie that lasts for 1 year
    response.cookies.set('admin_bypass', 'true', {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })
    
    return response
  }

  // 2. Check if they already have the bypass cookie
  const hasBypassCookie = request.cookies.get('admin_bypass')?.value === 'true'

  if (hasBypassCookie) {
    // Let them through! They are the admin.
    return NextResponse.next()
  }

  // 3. If they don't have the cookie, send them to /coming-soon
  const path = request.nextUrl.pathname

  // We need to make sure we don't redirect them if they are ALREADY on /coming-soon, 
  // or if they are requesting static assets (like images) or automated cron jobs.
  const isPublicAsset = 
    path === '/coming-soon' || 
    path.startsWith('/_next/') || 
    path.startsWith('/api/cron/') ||
    path.includes('.') // like /logo.svg or /favicon.ico

  if (!isPublicAsset) {
    // Lock the rest of the site down!
    return NextResponse.redirect(new URL('/coming-soon', request.url))
  }

  return NextResponse.next()
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
