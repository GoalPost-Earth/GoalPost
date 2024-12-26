import type { Metadata } from 'next'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import { Provider } from '@/components/ui/provider'
import { Urbanist } from 'next/font/google'
import Navbar from '@/components/ui/navigation/navbar'
import { ApolloWrapper } from './lib/apollo-wrapper'
import { Toaster } from '@/components/ui/toaster'
import { AppProvider } from './AppContext'
import { StartupScreen } from '@/components/screens'
import ChatBotButton from '@/components/ui/ChatBotButton'
import { ReactFlowProvider } from '@xyflow/react'
import { getAccessToken, getSession } from '@auth0/nextjs-auth0'
import { jwtDecode } from 'jwt-decode'

const urbanist = Urbanist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-urbanist',
})

export const metadata: Metadata = {
  title: 'Goalpost',
  description: 'A directive by the Seed COC',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSession()
  let token

  if (session) {
    const at = await getAccessToken()

    if (at?.accessToken) {
      const decoded = jwtDecode(at.accessToken) as { exp: number }

      token = {
        accessToken: at.accessToken,
        accessTokenDecoded: decoded,
        user: session.user,
        expiresAt: decoded.exp,
      }
    }
  }

  return (
    <html lang="en" className={`${urbanist.variable}`} suppressHydrationWarning>
      <body style={{ position: 'relative' }}>
        <Provider>
          <UserProvider>
            <AppProvider>
              <ReactFlowProvider>
                <ApolloWrapper token={token}>
                  <StartupScreen>
                    <Navbar />
                    <Toaster />
                    <main>
                      <>
                        {children}
                        <ChatBotButton />
                      </>
                    </main>
                  </StartupScreen>
                </ApolloWrapper>
              </ReactFlowProvider>
            </AppProvider>
          </UserProvider>
        </Provider>
      </body>
    </html>
  )
}
