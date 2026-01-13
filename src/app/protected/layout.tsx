'use client'

import { useApp } from '@/app/contexts'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return <>{children}</>
}
