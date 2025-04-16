import type { Metadata } from 'next'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import { Provider } from '@/components/ui/provider'
import { Inter } from 'next/font/google'
import Navbar from '@/components/ui/navigation/top-nav'
import { Toaster } from '@/components/ui/toaster'
import { AppProvider } from './contexts/AppContext'
import { MaintenanceScreen, StartupScreen } from '@/components/screens'
import ChatBotButton from '@/components/ui/chatbot-button'
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

// Content wrapper component to conditionally render maintenance screen
const ContentWrapper = ({ children }: { children: React.ReactNode }) => {
  const isMaintenanceMode = true

  if (isMaintenanceMode) {
    return <MaintenanceScreen />
  }

  return (
    <>
      <Toaster />
      <Navbar />
      <Container pl={{ lg: '50px' }}>
        {children}
        <ChatBotButton />
      </Container>
    </>
  )
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
            <ContentWrapper>
              <ApolloWrapper>
                <StartupScreen>
                  <AppProvider>{children}</AppProvider>
                </StartupScreen>
              </ApolloWrapper>
            </ContentWrapper>
          </UserProvider>
        </Provider>
      </body>
    </html>
  )
}
