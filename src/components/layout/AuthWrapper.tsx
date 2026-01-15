'use client'
import React, { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { StartupScreen } from '@/components/screens'
import { AppProvider, AuthProvider } from '@/app/contexts'
import { ApolloWrapper } from '@/app/lib/apollo-wrapper'

const AuthWrapper = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const isAuthRoute = pathname?.startsWith('/auth')

  return (
    <div>
      <AuthProvider>
        <ApolloWrapper>
          <AppProvider>
            <StartupScreen>
              {isAuthRoute ? (
                <>{children}</>
              ) : (
                <>
                  {/* <TopNav /> */}
                  <div>{children}</div>
                </>
              )}
            </StartupScreen>
          </AppProvider>
        </ApolloWrapper>
      </AuthProvider>
    </div>
  )
}

export default AuthWrapper
