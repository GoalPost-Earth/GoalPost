import { NextRequest, NextResponse } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/protected']

// Generate CSP nonce (Edge compatible)
function generateNonce(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)

  // Base64 encode without Buffer
  const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
    ''
  )
  return btoa(binString)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const token = request.cookies.get('accessToken')?.value

  // Generate nonce
  const nonce = generateNonce()

  // CSP Header
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
    .replace(/\s{2,}/g, ' ')
    .trim()

  // Auth logic
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // IMPORTANT: Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    const response = NextResponse.next()
    response.headers.set('Content-Security-Policy', cspHeader)
    response.headers.set('x-nonce', nonce)
    return response
  }

  // Protected routes without token → redirect to login
  if (isProtectedRoute && !token) {
    const response = NextResponse.redirect(new URL('/auth/login', request.url))
    response.headers.set('Content-Security-Policy', cspHeader)
    response.headers.set('x-nonce', nonce)
    return response
  }

  // Already logged in but trying to access auth routes → redirect to spaces
  if (pathname.startsWith('/auth') && token) {
    const response = NextResponse.redirect(
      new URL('/protected/spaces', request.url)
    )
    response.headers.set('Content-Security-Policy', cspHeader)
    response.headers.set('x-nonce', nonce)
    return response
  }

  // Normal request
  const response = NextResponse.next()
  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('x-nonce', nonce)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
