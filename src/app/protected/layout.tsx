'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { UserDataProvider, PageContextProvider } from '@/contexts'
import { ThemeProvider } from '@/contexts/theme-context'
import { AnimationProvider } from '@/contexts/animation-context'
import NavBar from '@/components/layout/nav-bar'
import { AIChatButton } from '@/components/ui/ai-chat-button'
import { AIAssistantPanel } from '@/components/ui/ai-assistant-panel'

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
          <PageContextProvider>
            <div className="flex flex-col h-screen">
              <NavBar />
              <UserDataProvider>{children}</UserDataProvider>
              <AIChatButton
                onClick={() => setIsAIChatOpen(!isAIChatOpen)}
                isOpen={isAIChatOpen}
              />
              <AIAssistantPanel
                isOpen={isAIChatOpen}
                onClose={() => setIsAIChatOpen(false)}
              />
            </div>
          </PageContextProvider>
        </AnimationProvider>
      </ThemeProvider>
    </ProtectedRoute>
  )
}
