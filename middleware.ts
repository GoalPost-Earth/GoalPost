import { NextRequest, NextResponse } from 'next/server'

// Routes that require authentication
// const protectedRoutes = ['/protected']

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
  // const token = request.cookies.get('accessToken')?.value

  // Generate nonce
  const nonce = generateNonce()

  // CSP Header
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://vercel.live;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' blob: data: https:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    frame-src 'self' https://vercel.live;
    connect-src 'self' https://*.s3.amazonaws.com https://*.s3.us-east-1.amazonaws.com;
  `
    .replace(/\s{2,}/g, ' ')
    .trim()

  // The nonce has to travel on the REQUEST, not just the response: `headers()`
  // in a Server Component reads request headers, and that is the only way the
  // root layout can stamp its inline <script> tags with the matching nonce.
  // Because `script-src` carries 'strict-dynamic', browsers ignore 'self' —
  // an un-nonced inline script (the theme bootstrappers) is simply blocked.
  const withNonce = (response: NextResponse) => {
    response.headers.set('Content-Security-Policy', cspHeader)
    response.headers.set('x-nonce', nonce)
    return response
  }
  // `set` (not `append`) so a client-supplied `x-nonce` is always overwritten
  // rather than trusted — nothing downstream should ever read an attacker's
  // value. Applied on every path for that reason, not just rendered routes.
  const forwardNonce = () => {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-nonce', nonce)
    // Next derives the nonce for its OWN framework <script> tags from the
    // request-side CSP header (app-render's getScriptNonceFromHeader), so set
    // it here too — this is the shape the Next.js CSP guide documents.
    requestHeaders.set('Content-Security-Policy', cspHeader)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // Auth logic
  // const isProtectedRoute = protectedRoutes.some((route) =>
  //   pathname.startsWith(route)
  // )

  // IMPORTANT: Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return withNonce(forwardNonce())
  }

  // Public sign up is hidden (invite-only onboarding). Block the page route so
  // it can't be reached by typing the URL directly. Toggle with
  // NEXT_PUBLIC_DISABLE_SIGNUP — keep in sync with the SIGNUP_DISABLED constant.
  if (
    process.env.NEXT_PUBLIC_DISABLE_SIGNUP === 'true' &&
    pathname.startsWith('/auth/signup')
  ) {
    return withNonce(NextResponse.redirect(new URL('/auth/login', request.url)))
  }

  // Protected routes without token → redirect to login
  // if (isProtectedRoute && !token) {
  //   const response = NextResponse.redirect(new URL('/auth/login', request.url))
  //   response.headers.set('Content-Security-Policy', cspHeader)
  //   response.headers.set('x-nonce', nonce)
  //   return response
  // }

  // // Already logged in but trying to access auth routes → redirect to spaces
  // if (pathname.startsWith('/auth') && token) {
  //   const response = NextResponse.redirect(
  //     new URL('/protected/spaces', request.url)
  //   )
  //   response.headers.set('Content-Security-Policy', cspHeader)
  //   response.headers.set('x-nonce', nonce)
  //   return response
  // }

  // Normal request
  return withNonce(forwardNonce())
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
