'use client'

import {
  ApolloLink,
  HttpLink,
  ApolloClient,
  InMemoryCache,
} from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
import { ERROR_POLICY } from './apollo-functions'

import { LoadingScreen } from '@/components/screens'
import { useRouter } from 'next/navigation'
import { RetryLink } from '@apollo/client/link/retry'
import { onError } from '@apollo/client/link/error'
import { useEffect, useMemo, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { Token } from '../../types'
import { toast } from 'sonner'
import { useApp } from '../contexts'

// have a function to create a client for you
// you need to create a component to wrap your app in
export function ApolloWrapper({
  children,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = useApp()
  const router = useRouter()
  const [token, setToken] = useState<Token | undefined>(undefined)
  const [isTokenLoading, setIsTokenLoading] = useState(false)

  const httpLink = useMemo(
    () =>
      new HttpLink({
        uri: process.env.NEXT_PUBLIC_GRAPHQL_URI ?? '/api/graphql',
      }),
    []
  )

  // Fetch token once when user becomes available
  useEffect(() => {
    if (!user) {
      console.log('🚫 [APOLLO] No user, clearing token')
      setToken(undefined)
      return
    }

    // Skip if we already have a token or currently loading
    if (token || isTokenLoading) {
      console.log(
        '⏭️ [APOLLO] Skip token fetch - already have token or loading'
      )
      return
    }

    console.log('🔄 [APOLLO] Fetching token from /api/auth/access-token')
    setIsTokenLoading(true)

    async function fetchToken() {
      try {
        const response = await fetch('/api/auth/access-token', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Include cookies in the request
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(
            '❌ [APOLLO] Failed to fetch token:',
            response.status,
            errorText
          )
          setIsTokenLoading(false)
          return
        }

        const resJson = await response.json()

        if (!resJson.accessToken) {
          console.error('❌ [APOLLO] No accessToken in response')
          setIsTokenLoading(false)
          return
        }

        const decoded = jwtDecode(resJson.accessToken) as { exp: number }
        setToken({
          accessToken: resJson.accessToken,
          expiresAt: decoded.exp,
        })
        console.log(
          '✅ [APOLLO] Token successfully loaded from access-token endpoint'
        )
        setIsTokenLoading(false)
      } catch (error) {
        console.error('❌ [APOLLO] Error fetching token:', error)
        setIsTokenLoading(false)
      }
    }

    fetchToken()
  }, [user, token, isTokenLoading])

  const authLink = useMemo(
    () =>
      new ApolloLink((operation, forward) => {
        if (token) {
          try {
            const expireDate = new Date(token.expiresAt * 1000)
            if (expireDate < new Date()) {
              console.debug(
                '[GraphQL debug] Access token expired, refreshing:',
                expireDate
              )
              router.refresh()
            }

            console.log(
              '📤 [APOLLO] Attaching token to request:',
              token.accessToken.substring(0, 20) + '...'
            )
            operation.setContext(
              ({ headers }: { headers: Record<string, string> }) => {
                return {
                  headers: {
                    Authorization: `Bearer ${token.accessToken}`,
                    ...headers,
                  },
                }
              }
            )
          } catch (error) {
            console.error('[APOLLO ERROR]', error)
          }
        } else {
          console.warn(
            '⚠️ [APOLLO] No token available, request will be unauthenticated'
          )
        }

        return forward(operation)
      }),
    [router, token]
  )

  const errorLink = useMemo(
    () =>
      onError((error) => {
        const { graphQLErrors, networkError } = error as {
          graphQLErrors?: ReadonlyArray<{
            message: string
            locations?: unknown
            path?: unknown
          }>
          networkError?: unknown
        }

        if (graphQLErrors) {
          graphQLErrors.forEach(({ message, locations, path }) =>
            console.error(
              `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            )
          )
          toast.error('GraphQL Error', {
            description: graphQLErrors[0].message,
          })
        }
        if (networkError) {
          console.error('[Network error]:', networkError)
        }
      }),
    []
  )

  const authHttpLink = useMemo(
    () => ApolloLink.from([errorLink, authLink, new RetryLink(), httpLink]),
    [authLink, errorLink, httpLink]
  )

  const client = useMemo(
    () =>
      new ApolloClient({
        clientAwareness: {
          name: 'web-ssr',
          version: '1.2',
        },
        link: authHttpLink,
        cache: new InMemoryCache(),
        defaultOptions: {
          watchQuery: {
            errorPolicy: ERROR_POLICY,
          },
          query: {
            errorPolicy: ERROR_POLICY,
          },
          mutate: {
            errorPolicy: ERROR_POLICY,
          },
        },
      }),
    [authHttpLink]
  )

  // Show loading screen while fetching token
  if (isTokenLoading) {
    return <LoadingScreen />
  }

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
