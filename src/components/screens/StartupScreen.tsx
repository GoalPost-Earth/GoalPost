'use client'

import React, { useState, useEffect } from 'react'
import { SplashScreen, GetStartedScreen } from '@/components/screens'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/contexts'

const StartupScreen = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth()
  const [showSplash, setShowSplash] = useState(true)
  const pathname = usePathname()
  const isAuthRoute = pathname?.startsWith('/auth')

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3500)

    return () => clearTimeout(timer)
  }, [])

  if (isAuthRoute) {
    return <>{children}</>
  }

  if (showSplash && !isAuthenticated) {
    return <SplashScreen />
  }

  if (!isAuthenticated) {
    return <GetStartedScreen />
  }

  return <>{children}</>
}

export default StartupScreen
