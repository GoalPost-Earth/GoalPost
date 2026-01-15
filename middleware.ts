import { NextRequest, NextResponse } from 'next/server'

// Routes that don't require authentication
const publicRoutes = ['/auth/login', '/auth/signup', '/']

// Routes that require authentication
const protectedRoutes = ['/protected']

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const token = request.cookies.get('accessToken')?.value

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) =>
    route === '/' ? pathname === '/' : pathname.startsWith(route)
  )

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // If accessing auth routes with token, redirect to protected spaces
  if (pathname.startsWith('/auth') && token) {
    return NextResponse.redirect(new URL('/protected/spaces', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}
