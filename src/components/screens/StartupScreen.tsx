'use client'

import React, { useState, useEffect } from 'react'
import { SplashScreen, GetStartedScreen } from '@/components/screens'
import { useUser } from '@auth0/nextjs-auth0/client'

const StartupScreen = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser()
  const [showSplash, setShowSplash] = useState(true)
  const isAuthRoute = window.location.pathname.startsWith('/auth')

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3500)

    return () => clearTimeout(timer)
  }, [])

  if (isAuthRoute) {
    return <>{children}</>
  }

  if (showSplash && !user) {
    return <SplashScreen />
  }

  if (!user) {
    return <GetStartedScreen />
  }

  return <>{children}</>
}

export default StartupScreen
