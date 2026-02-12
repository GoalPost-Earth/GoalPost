'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import {
  UserDataProvider,
  PageContextProvider,
  PreferencesProvider,
} from '@/contexts'
import { ThemeProvider } from '@/contexts/theme-context'
import { AnimationProvider } from '@/contexts/animation-context'
import { OnboardingProvider } from '@/contexts/OnboardingContext'
import { ONBOARDING_STEPS } from '@/constants/onboarding-steps'
import NavBar from '@/components/layout/nav-bar'
import { AIChatButton } from '@/components/ui/ai-chat-button'
import { AIAssistantPanel } from '@/components/ui/ai-assistant-panel'
import { TourOverlay } from '@/components/onboarding/TourOverlay'
import { TourController } from '@/components/onboarding/TourController'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)

  return (
    <ProtectedRoute>
      <ThemeProvider>
        <AnimationProvider>
          <PreferencesProvider>
            <PageContextProvider>
              <OnboardingProvider steps={ONBOARDING_STEPS}>
                <div className="flex flex-col h-screen">
                  <NavBar />
                  <UserDataProvider>{children}</UserDataProvider>
                  <TourController />
                  <TourOverlay />
                  <AIChatButton
                    onClick={() => setIsAIChatOpen(!isAIChatOpen)}
                    isOpen={isAIChatOpen}
                  />
                  <AIAssistantPanel
                    isOpen={isAIChatOpen}
                    onClose={() => setIsAIChatOpen(false)}
                  />
                </div>
              </OnboardingProvider>
            </PageContextProvider>
          </PreferencesProvider>
        </AnimationProvider>
      </ThemeProvider>
    </ProtectedRoute>
  )
}
