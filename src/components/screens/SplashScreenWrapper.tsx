'use client'

import { useEffect, useState } from 'react'
import SplashScreen from './SplashScreen'

interface SplashScreenWrapperProps {
  children: React.ReactNode
  duration?: number
}

export const SplashScreenWrapper = ({
  children,
  duration = 3000,
}: SplashScreenWrapperProps) => {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  return showSplash ? <SplashScreen /> : <>{children}</>
}
