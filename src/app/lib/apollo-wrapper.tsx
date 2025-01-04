'use client'

import { ApolloLink, HttpLink } from '@apollo/client'
import {
  ApolloNextAppProvider,
  InMemoryCache,
  ApolloClient,
  SSRMultipartLink,
} from '@apollo/experimental-nextjs-app-support'
import { ERROR_POLICY } from './apollo-functions'

import { useUser } from '@auth0/nextjs-auth0/client'
import { LoadingScreen } from '@/components/screens'
import { useRouter } from 'next/navigation'
import { RetryLink } from '@apollo/client/link/retry'
import { onError } from '@apollo/client/link/error'
import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { Token } from '../types'

// have a function to create a client for you
// you need to create a component to wrap your app in
export function ApolloWrapper({
  children,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: Readonly<{ children: React.ReactNode }>) {
  const { isLoading, user } = useUser()
  const router = useRouter()
  const [token, setToken] = useState<Token>()
  const httpLink = new HttpLink({
    // this needs to be an absolute url, as relative urls cannot be used in SSR
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URI ?? '/api/graphql',

    // you can disable result caching here if you want to
    // (this does not work if you are rendering your page with `export const dynamic = "force-static"`)

    // fetchOptions: { cache: 'no-store' },
    // you can override the default `fetchOptions` on a per query basis
    // via the `context` property on the options passed as a second argument
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

        if (resJson?.accessToken) {
          const decoded = jwtDecode(resJson.accessToken) as { exp: number }

          setToken({
            accessToken: resJson.accessToken,
            accessTokenDecoded: decoded,
            user,
            expiresAt: decoded.exp,
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
  }, [router, user])

  if (isLoading || (!token && user)) {
    return <LoadingScreen />
  }

  const authLink = new ApolloLink((operation, forward) => {
    if (token?.accessToken) {
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
                authorization: `Bearer ${token?.accessToken}`,
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
      name: 'web-ssr',
      version: '1.2',
      link: authHttpLink,
      cache: new InMemoryCache(),
      connectToDevTools: true,
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
