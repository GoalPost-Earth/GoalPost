'use client'

import { ThemeProvider } from '@/app/contexts/theme-context'
import { SplashScreenWrapper } from '@/components/screens/SplashScreenWrapper'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <SplashScreenWrapper duration={3000}>{children}</SplashScreenWrapper>
    </ThemeProvider>
  )
}
