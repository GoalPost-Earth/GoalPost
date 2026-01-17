import { NextRequest, NextResponse } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/protected']

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const token = request.cookies.get('accessToken')?.value

  // Generate nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const response = NextResponse.redirect(new URL('/auth/login', request.url))
    response.headers.set('x-nonce', nonce)
    return response
  }

  // If accessing auth routes with token, redirect to protected spaces
  if (pathname.startsWith('/auth') && token) {
    const response = NextResponse.redirect(
      new URL('/protected/spaces', request.url)
    )
    response.headers.set('x-nonce', nonce)
    return response
  }

  const response = NextResponse.next()
  response.headers.set('x-nonce', nonce)

  // Replace CSP nonce placeholder with actual nonce
  const cspHeader = response.headers.get('Content-Security-Policy')
  if (cspHeader) {
    const updatedCSP = cspHeader.replace(/{{NONCE}}/g, nonce)
    response.headers.set('Content-Security-Policy', updatedCSP)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next|.*\\..*|api).*)'],
}
