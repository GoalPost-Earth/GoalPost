import { NextRequest, NextResponse } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/protected']

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const token = request.cookies.get('accessToken')?.value

  // --- CSP Configuration ---
  // 1. Generate a unique nonce for this request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // 2. Define your CSP header
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://vercel.live;
    style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' blob: data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self';
  `

  // 3. Clean up the header
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim()

  // --- Authentication Logic ---
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Handle protected routes
  if (isProtectedRoute && !token) {
    const response = NextResponse.redirect(new URL('/auth/login', request.url))
    // Still add CSP to redirect responses
    response.headers.set(
      'Content-Security-Policy',
      contentSecurityPolicyHeaderValue
    )
    response.headers.set('x-nonce', nonce)
    return response
  }

  // Handle auth routes when already logged in
  if (pathname.startsWith('/auth') && token) {
    const response = NextResponse.redirect(
      new URL('/protected/spaces', request.url)
    )
    response.headers.set(
      'Content-Security-Policy',
      contentSecurityPolicyHeaderValue
    )
    response.headers.set('x-nonce', nonce)
    return response
  }

  // Normal response
  const response = NextResponse.next()
  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  )
  response.headers.set('x-nonce', nonce)

  return response
}

export const config = {
  matcher: ['/((?!_next|.*\\..*|api).*)'],
}
