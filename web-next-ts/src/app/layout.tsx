import type { Metadata } from 'next'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import { Provider } from '@/components/ui/provider'
import localFont from 'next/font/local'
import Navbar from '@/components/ui/navbar'
import { ApolloWrapper } from './lib/ApolloWrapper'
import { Toaster } from '@/components/ui/toaster'
import { AppProvider } from './AppContext'
import { StartupScreen } from '@/components/screens'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
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
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
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
