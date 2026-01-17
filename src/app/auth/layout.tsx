export const dynamic = 'force-dynamic'

import { SplashScreenWrapper } from '@/components/screens/SplashScreenWrapper'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SplashScreenWrapper duration={3000}>{children}</SplashScreenWrapper>
}
