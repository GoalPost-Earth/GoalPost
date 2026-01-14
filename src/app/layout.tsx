import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { MaintenanceScreen } from '@/components/screens'
import { AuthWrapper } from '@/components/layout'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from 'next-themes'
import './globals.css'
import NavBar from '@/components/layout/nav-bar'

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
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=optional"
          rel="stylesheet"
        />
      </head>
      <body className="isolate">
        <NavBar />
        <ContentWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </ContentWrapper>
        <Toaster />
      </body>
    </html>
  )
}
