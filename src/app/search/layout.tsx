import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Provider } from '@/components/ui/provider'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import { ReactFlowProvider } from '@xyflow/react'
import { ApolloWrapper } from '@/app/lib/apollo-wrapper'
import { AppProvider } from '@/app/contexts/AppContext'
import { Toaster } from '@/components/ui/toaster'
import ChatBotButton from '@/components/ui/chatbot-button'
import { Container } from '@chakra-ui/react'

export const dynamic = 'force-dynamic'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Search - Goalpost',
  description: 'Search page for Goalpost',
}

export default function SearchLayout({
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
                  <Toaster />
                  <Container mt={'65px'} pl={{ lg: '50px' }}>
                    {children}
                    <ChatBotButton />
                  </Container>
                </AppProvider>
              </ApolloWrapper>
            </ReactFlowProvider>
          </UserProvider>
        </Provider>
      </body>
    </html>
  )
}
