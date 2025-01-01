import type { Metadata } from 'next'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import { Provider } from '@/components/ui/provider'
import { Inter } from 'next/font/google'
import Navbar from '@/components/ui/navigation/top-nav'
import { Toaster } from '@/components/ui/toaster'
import { AppProvider } from './contexts/AppContext'
import { StartupScreen } from '@/components/screens'
import ChatBotButton from '@/components/ui/ChatBotButton'
import { ReactFlowProvider } from '@xyflow/react'
import { ApolloWrapper } from './lib/apollo-wrapper'
import { Container } from '@chakra-ui/react'

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
            <ReactFlowProvider>
              <ApolloWrapper>
                <AppProvider>
                  <StartupScreen>
                    <Navbar />
                    <Toaster />
                    <Container my={'65px'} pl={{ lg: '50px' }} pb="20px">
                      {children}
                      <ChatBotButton />
                    </Container>
                  </StartupScreen>
                </AppProvider>
              </ApolloWrapper>
            </ReactFlowProvider>
          </UserProvider>
        </Provider>
      </body>
    </html>
  )
}
