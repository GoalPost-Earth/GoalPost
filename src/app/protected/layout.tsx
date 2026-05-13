'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import {
  UserDataProvider,
  PageContextProvider,
  PreferencesProvider,
  FocalEntityProvider,
} from '@/contexts'
import { ThemeProvider } from '@/contexts/theme-context'
import { AnimationProvider } from '@/contexts/animation-context'
import { OnboardingProvider } from '@/contexts/OnboardingContext'
import { ONBOARDING_STEPS } from '@/constants/onboarding-steps'
import { StudioShell } from '@/components/studio'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <ThemeProvider>
        <AnimationProvider>
          <PreferencesProvider>
            <PageContextProvider>
              <FocalEntityProvider>
                <OnboardingProvider steps={ONBOARDING_STEPS}>
                  <StudioShell>
                    <UserDataProvider>{children}</UserDataProvider>
                  </StudioShell>
                </OnboardingProvider>
              </FocalEntityProvider>
            </PageContextProvider>
          </PreferencesProvider>
        </AnimationProvider>
      </ThemeProvider>
    </ProtectedRoute>
  )
}
