'use client'

import { ApolloLink, HttpLink } from '@apollo/client'
import {
  ApolloClient,
  InMemoryCache,
  ApolloNextAppProvider,
  SSRMultipartLink,
} from '@apollo/experimental-nextjs-app-support'
import { ERROR_POLICY } from './apollo-functions'

import { LoadingScreen } from '@/components/screens'
import { useRouter } from 'next/navigation'
import { RetryLink } from '@apollo/client/link/retry'
import { onError } from '@apollo/client/link/error'
import { useEffect, useState } from 'react'
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
  const [token, setToken] = useState<Token | undefined>({
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImpvaG4tZGFnIiwibGFzdE5hbWUiOiJBZGR5IiwiZW1haWwiOiJqYWVkYWd5QGdtYWlsLmNvbSIsImZpcnN0TmFtZSI6IkpEIiwiaWF0IjoxNzQ4MDU3NDk3LCJleHAiOjE3NDgwNTkyOTd9.Dgb1ySMk4y1ItIuOXWFXZAaPgw3YVvEJhns2FrmJaqo',
    expiresAt: 1748050000,
  })

  const httpLink = new HttpLink({
    // this needs to be an absolute url, as relative urls cannot be used in SSR
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URI ?? '/api/graphql',

    // you can disable result caching here if you want to
    // (this does not work if you are rendering your page with `export const dynamic = "force-static"`)

    // fetchOptions: { cache: 'no-store' },
    // to an Apollo Client data fetching hook, e.g.:
    // const { data } = useSuspenseQuery(MY_QUERY, { context: { fetchOptions: { cache: "force-cache" }}});
  })
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

        const resJson = await response?.json()

        if (token) {
          const decoded = jwtDecode(resJson.accessToken) as { exp: number }

          setToken({
            accessToken: resJson.accessToken,
            // accessTokenDecoded: decoded,
            // user,
            // Add all required Token properties here:
            // Example: refreshToken: resJson.refreshToken,
            expiresAt: decoded.exp,
            // Add any other required fields with appropriate values
          })
        }
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

  if (isLoading || (!token && user)) {
    return <LoadingScreen />
  }

  const authLink = new ApolloLink((operation, forward) => {
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
                Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImpvaG4tZGFnIiwibGFzdE5hbWUiOiJBZGR5IiwiZW1haWwiOiJqYWVkYWd5QGdtYWlsLmNvbSIsImZpcnN0TmFtZSI6IkpEIiwiaWF0IjoxNzQ4MDU3NDk3LCJleHAiOjE3NDgwNTkyOTd9.Dgb1ySMk4y1ItIuOXWFXZAaPgw3YVvEJhns2FrmJaqo`,
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
  })

  const authHttpLink = ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
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
    authLink,
    new RetryLink(),
    typeof window === 'undefined'
      ? ApolloLink.from([
          new SSRMultipartLink({
            stripDefer: false,
            cutoffDelay: 200,
          }),
          httpLink,
        ])
      : httpLink,
  ])

  const makeClient = () =>
    new ApolloClient({
      clientAwareness: {
        name: 'web-ssr',
        version: '1.2',
      },
      link: authHttpLink,
      cache: new InMemoryCache(),
      devtools: {
        enabled: true,
      },
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
    })

  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  )
}
