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
  const isLoading = false
  const router = useRouter()
  const [token, setToken] = useState<Token | undefined>(undefined)

  const httpLink = useMemo(
    () =>
      new HttpLink({
        uri: process.env.NEXT_PUBLIC_GRAPHQL_URI ?? '/api/graphql',
      }),
    []
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        if (!user) {
          return
        }

        const response = await fetch('/api/auth/access-token')
        if (!response.ok) {
          const resJson = await response.json()
          const error = {
            status: response.status,
            statusText: response.statusText,
            message: resJson?.message,
            code: resJson?.code,
          }

          throw error
        }

        const resJson = await response.json()

        const decoded = jwtDecode(resJson.accessToken) as { exp: number }
        setToken({
          accessToken: resJson.accessToken,
          expiresAt: decoded.exp,
        })
      } catch (error) {
        if ((error as { code?: string }).code === 'ERR_EXPIRED_ACCESS_TOKEN') {
          console.warn('Access token expired, refreshing...')
          router.push('/api/auth/login?returnTo=/')
        }

        console.error(error)
      }
    }

    fetchTokenData()
  }, [router, user, token])

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
            console.error(error)
          }
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

  if (isLoading || (!token && user)) {
    return <LoadingScreen />
  }

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
