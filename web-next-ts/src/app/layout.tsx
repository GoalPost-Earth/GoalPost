import type { Metadata } from 'next'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import { Provider } from '@/components/ui/provider'
import { Urbanist } from 'next/font/google'
import Navbar from '@/components/ui/navbar'
import { ApolloWrapper } from './lib/apollo-wrapper'
import { Toaster } from '@/components/ui/toaster'
import { AppProvider } from './AppContext'
import { StartupScreen } from '@/components/screens'

const urbanist = Urbanist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-urbanist',
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${urbanist.variable}`}>
        <Provider>
          <UserProvider>
            <AppProvider>
              <ApolloWrapper>
                <StartupScreen>
                  <Navbar />
                  <Toaster />
                  <main>{children}</main>
                </StartupScreen>
              </ApolloWrapper>
            </AppProvider>
          </UserProvider>
        </Provider>
      </body>
    </html>
  )
}
