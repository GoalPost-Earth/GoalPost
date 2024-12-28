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

// have a function to create a client for you
// you need to create a component to wrap your app in
export function ApolloWrapper({
  token,
  children,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: Readonly<{ token: any; children: React.ReactNode }>) {
  const { isLoading } = useUser()
  const router = useRouter()
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

  if (!token) {
    router.push('/api/auth/logout?returnTo=/')
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
          ({ headers }: { headers: Record<string, string> }) => ({
            headers: {
              authorization: `Bearer ${token?.accessToken}`,
              ...headers,
            },
          })
        )
      } catch (error) {
        console.log(error)
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

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  )
}
