export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { MaintenanceScreen } from '@/components/screens'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from 'next-themes'
import { AppProvider } from '@/contexts'
import { ApolloWrapper } from '@/app/lib/apollo-wrapper'
import './globals.css'

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

  return (
    <ApolloWrapper>
      <AppProvider>{children}</AppProvider>
    </ApolloWrapper>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const themeInitScript = `(() => {
    try {
      const key = 'goalpost-theme-color';
      const saved = window.localStorage.getItem(key);
      const themes = ['theme-warm','theme-forest','theme-purple','theme-emerald'];
      document.documentElement.classList.remove(...themes);
      if (saved && saved !== 'default') {
        document.documentElement.classList.add('theme-' + saved);
      }
    } catch (_) {
      // no-op
    }
  })();`

  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        <script
          id="gp-theme-init"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="isolate">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ContentWrapper>{children}</ContentWrapper>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
