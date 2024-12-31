import type { Metadata } from 'next'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import { Provider } from '@/components/ui/provider'
import { Inter } from 'next/font/google'
import Navbar from '@/components/ui/navigation/navbar'
import { Toaster } from '@/components/ui/toaster'
import { AppProvider } from './AppContext'
import { StartupScreen } from '@/components/screens'
import ChatBotButton from '@/components/ui/ChatBotButton'
import { ReactFlowProvider } from '@xyflow/react'
import { ApolloWrapper } from './lib/apollo-wrapper'
import { Container } from '@chakra-ui/react'
import LoggedInUserContextProvider from './LoggedInUserContext'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Goalpost',
  description: 'A directive by the Seed COC',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <body>
        <Provider>
          <UserProvider>
            <AppProvider>
              <ReactFlowProvider>
                <ApolloWrapper>
                  <LoggedInUserContextProvider>
                    <StartupScreen>
                      <Navbar />
                      <Toaster />
                      <Container
                        paddingLeft={{ base: '16px', lg: '72px' }}
                        paddingTop={'65px'}
                      >
                        <>
                          {children}
                          <ChatBotButton />
                        </>
                      </Container>
                    </StartupScreen>
                  </LoggedInUserContextProvider>
                </ApolloWrapper>
              </ReactFlowProvider>
            </AppProvider>
          </UserProvider>
        </Provider>
      </body>
    </html>
  )
}
