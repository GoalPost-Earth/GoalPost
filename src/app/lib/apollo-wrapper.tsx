'use client'

import { ApolloLink, ApolloClient, InMemoryCache } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
import { ERROR_POLICY, authLink, httpLink, retryLink } from './apollo-functions'

import { onError } from '@apollo/client/link/error'
import { useMemo } from 'react'
import { toast } from 'sonner'

// have a function to create a client for you
// you need to create a component to wrap your app in
export function ApolloWrapper({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Auth, retry, and transport links are the shared singletons from
  // apollo-functions. `authLink` resolves the bearer via getAccessToken()
  // — the same refreshing, deduped, session-expiry-aware helper every other
  // client surface uses. The previous inline authLink read a STATIC
  // localStorage('token') set once at login and never refreshed, so the
  // bearer went stale: it broke on every 30-minute access-token expiry and,
  // after a JWT_SECRET rotation, failed signature verification entirely
  // ("Unauthenticated" loading spaces). `retryLink` carries the retryIf that
  // skips 4xx so an auth failure isn't amplified into a request storm.

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

  // Order: error → retry → auth → http. retryLink sits BEFORE authLink so a
  // retried (transient 5xx / network) attempt re-runs authLink and re-resolves
  // a fresh bearer via getAccessToken() rather than reusing the first pass's
  // header — Apollo's documented ordering. (retryIf still skips 4xx, so dead
  // auth isn't retried.)
  const authHttpLink = useMemo(
    () => ApolloLink.from([errorLink, retryLink, authLink, httpLink]),
    [errorLink]
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

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
