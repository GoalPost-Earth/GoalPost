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
  const requestHeaders = await headers()
  const nonce = requestHeaders.get('x-nonce') ?? undefined
  // GOAL-375: middleware decides this (it has the pathname and the HttpOnly
  // cookies). '1' only for a /protected page request that plausibly carries
  // a session.
  //
  // The `nonce` conjunct is not belt-and-braces — it is the gate. Some paths
  // are excluded by `config.matcher` yet still render this layout (Next's 404
  // for `/api-docs`, for instance), and on those the middleware never ran, so
  // `x-gp-auth-boot` would be whatever the client sent. A nonce can only come
  // from the middleware, so requiring it means a forged header reaches
  // nothing. (A nonce-less inline script would be CSP-blocked on any path
  // that has a CSP anyway, but this makes the invariant true rather than
  // incidental.)
  const shouldBootAuth =
    !!nonce && requestHeaders.get('x-gp-auth-boot') === '1'

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

  // GOAL-375: take `GET /api/auth/access-token` off the first-render critical
  // path. Apollo needs the token as a bearer (ADR-013) but it lives in an
  // HttpOnly cookie, so the client must ask for it — and before this, that ask
  // started only once the React bundle had downloaded, hydrated, and run
  // authLink, putting a 0.4–2.1s cookie-verify hop IN FRONT of the very first
  // GraphQL request. Starting the fetch from the document <head> moves it to
  // parallel with the JS it used to wait for; by the time `getAccessToken()`
  // runs it adopts this promise (see `takeAuthBoot` in access-token-client.ts)
  // instead of issuing a request of its own.
  //
  // Parked as a promise rather than a value, and the module deletes the
  // global as it adopts it. That is hygiene, not a security boundary — a
  // promise is multi-subscriber, and any same-origin script could call this
  // cookie-authenticated endpoint itself regardless. The self-clear below
  // bounds how long a resolved token sits on `window` if, on some route,
  // nothing ever consumes it. No token text is logged or persisted here.
  const authBootScript = `(() => {
    try {
      window.__GP_AUTH_BOOT__ = fetch('/api/auth/access-token', {
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { accept: 'application/json' },
      }).then(function (res) {
        if (res.status !== 200) return { status: res.status };
        return res.json().then(function (data) {
          return {
            status: 200,
            accessToken: data && data.accessToken,
            expiresAt: data && data.expiresAt,
          };
        });
      }).catch(function () { return null; });
      setTimeout(function () {
        delete window.__GP_AUTH_BOOT__;
      }, 30000);
    } catch (_) {
      // no-op — getAccessToken() falls back to fetching normally
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
        {shouldBootAuth && (
          <script
            id="gp-auth-boot"
            nonce={nonce}
            dangerouslySetInnerHTML={{ __html: authBootScript }}
          />
        )}
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
