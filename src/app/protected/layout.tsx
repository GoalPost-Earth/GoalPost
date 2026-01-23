'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { UserDataProvider } from '@/app/contexts'
import { ThemeProvider } from '@/app/contexts/theme-context'
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
      </ThemeProvider>
    </ProtectedRoute>
  )
}
