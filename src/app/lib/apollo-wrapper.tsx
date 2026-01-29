'use client'

import {
  ApolloLink,
  HttpLink,
  ApolloClient,
  InMemoryCache,
} from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
import { ERROR_POLICY } from './apollo-functions'

import { RetryLink } from '@apollo/client/link/retry'
import { onError } from '@apollo/client/link/error'
import { useMemo } from 'react'
import { toast } from 'sonner'

// have a function to create a client for you
// you need to create a component to wrap your app in
export function ApolloWrapper({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const httpLink = useMemo(
    () =>
      new HttpLink({
        uri: process.env.NEXT_PUBLIC_GRAPHQL_URI ?? '/api/graphql',
      }),
    []
  )

  const authLink = useMemo(
    () =>
      new ApolloLink((operation, forward) => {
        const token =
          typeof window !== 'undefined' ? localStorage.getItem('token') : null

        if (token) {
          console.log('📤 [APOLLO] Attaching token to request')
          operation.setContext(
            ({ headers }: { headers: Record<string, string> }) => {
              return {
                headers: {
                  Authorization: `Bearer ${token}`,
                  ...headers,
                },
              }
            }
          )
        } else {
          console.warn(
            '⚠️ [APOLLO] No token available, request will be unauthenticated'
          )
        }

        return forward(operation)
      }),
    []
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

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
