export const dynamic = 'force-dynamic'

import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import { Inter } from 'next/font/google'
import { MaintenanceScreen } from '@/components/screens'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from 'next-themes'
import { AppProvider } from '@/contexts'
import { ApolloWrapper } from '@/app/lib/apollo-wrapper'
import { resolveAppBaseUrl } from '@/lib/url/app-base-url'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// Canonical public base URL — resolved from server config only (never request
// headers), shared with password-reset + durable-download links. Used as the
// metadataBase so og:image / og:url resolve to absolute URLs.
const SITE_URL = resolveAppBaseUrl()

const SITE_DESCRIPTION =
  'A community-first, privacy-respecting platform for mutual aid, collective ' +
  'sense-making, and relational depth — share goals, resources, and stories, ' +
  'and discover the resonance between them.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'GoalPost',
    template: '%s · GoalPost',
  },
  description: SITE_DESCRIPTION,
  applicationName: 'GoalPost',
  keywords: [
    'GoalPost',
    'mutual aid',
    'community',
    'collective sense-making',
    'collaboration',
    'resonance',
    'graph',
  ],
  // Icon + social images are wired automatically from the file-based
  // conventions in this directory: icon.tsx, apple-icon.tsx, opengraph-image.tsx.
  openGraph: {
    type: 'website',
    siteName: 'GoalPost',
    title: 'GoalPost',
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoalPost',
    description: SITE_DESCRIPTION,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f7f8' },
    { media: '(prefers-color-scheme: dark)', color: '#101c22' },
  ],
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Set by middleware.ts on the request. Both theme bootstrappers below run
  // before hydration, so under `script-src 'strict-dynamic'` they execute only
  // when they carry this nonce.
  const nonce = (await headers()).get('x-nonce') ?? undefined

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
        {/* Material Symbols is self-hosted (see the `@font-face` in
            globals.css) and declared in a low cascade layer so Tailwind size
            utilities can override its default 24px. Preload the woff2 so icon
            ligatures paint on first render rather than flashing literal text. */}
        <link
          rel="preload"
          href="/fonts/material-symbols-outlined.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script
          id="gp-theme-init"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="isolate">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          nonce={nonce}
        >
          <ContentWrapper>{children}</ContentWrapper>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
