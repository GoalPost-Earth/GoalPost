import type { Metadata } from 'next'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import { Provider } from '@/components/ui/provider'
import { Inter } from 'next/font/google'
import { MaintenanceScreen } from '@/components/screens'
import { AuthWrapper } from '@/components'

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
  const isMaintenanceMode = false

  if (isMaintenanceMode) {
    return <MaintenanceScreen />
  }

  return <AuthWrapper>{children}</AuthWrapper>
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
            <ContentWrapper>{children}</ContentWrapper>
          </UserProvider>
        </Provider>
      </body>
    </html>
  )
}
