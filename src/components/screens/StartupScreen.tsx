'use client'

import React from 'react'

const StartupScreen = ({ children }: { children: React.ReactNode }) => {
  // Splash and onboarding are disabled; render children immediately.
  return <>{children}</>
}

export default StartupScreen
