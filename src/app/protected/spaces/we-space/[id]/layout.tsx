import { ReactNode } from 'react'

// Enable dynamic rendering for paths not pre-generated at build time
// This MUST be in a Server Component (not 'use client') to take effect
export const dynamicParams = true
export const dynamic = 'force-dynamic'

interface LayoutProps {
  children: ReactNode
}

export default function WeSpaceIdLayout({ children }: LayoutProps) {
  return <>{children}</>
}
