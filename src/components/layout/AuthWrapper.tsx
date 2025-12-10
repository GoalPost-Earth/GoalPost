'use client'
import React, { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { StartupScreen } from '@/components/screens'
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
                {/* <TopNav /> */}
                <div>{children}</div>
              </>
            )}
          </StartupScreen>
        </AppProvider>
      </ApolloWrapper>
    </div>
  )
}

export default AuthWrapper
