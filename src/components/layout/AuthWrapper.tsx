'use client'
import React, { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { StartupScreen } from '@/components/screens'
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
                <Container pl={{ lg: '50px' }}>{children}</Container>
              </>
            )}
          </StartupScreen>
        </AppProvider>
      </ApolloWrapper>
    </div>
  )
}

export default AuthWrapper
