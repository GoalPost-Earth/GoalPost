'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useApp()

  useEffect(() => {
    if (isLoading) return

    if (isAuthenticated) {
      router.push('/protected/spaces')
    } else {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  return null
}
