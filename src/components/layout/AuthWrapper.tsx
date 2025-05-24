'use client'
import React, { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/ui/navigation/top-nav'
import { Toaster } from '@/components/ui/toaster'
import { StartupScreen } from '@/components/screens'
import ChatBotButton from '@/components/ui/chatbot-button'
import { Container } from '@chakra-ui/react'
import { AppProvider } from '@/app/contexts'
import { ApolloWrapper } from '@/app/lib/apollo-wrapper'

const AuthWrapper = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const isAuthRoute = pathname?.startsWith('/auth')

  return (
    <div>
      <ApolloWrapper>
        <AppProvider>
          <StartupScreen>
            {isAuthRoute ? (
              <>{children}</>
            ) : (
              <>
                <Toaster />
                <Navbar />
                <Container pl={{ lg: '50px' }}>
                  {children}
                  <ChatBotButton />
                </Container>
              </>
            )}
          </StartupScreen>
        </AppProvider>
      </ApolloWrapper>
    </div>
  )
}

export default AuthWrapper
