'use client'

export const dynamic = 'force-dynamic'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import NavBar from '@/components/layout/nav-bar'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <NavBar />
      {children}
    </ProtectedRoute>
  )
}
