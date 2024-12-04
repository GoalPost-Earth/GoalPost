'use client'

import { from, HttpLink } from '@apollo/client'
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from '@apollo/experimental-nextjs-app-support'
import {
  ERROR_POLICY,
  errorLink,
  isTokenExpired,
  retryLink,
} from './apollo-functions'
import { setContext } from '@apollo/client/link/context'
import { getAccessToken } from '@auth0/nextjs-auth0'
import { useEffect, useState } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import LoadingPage from '@/components/LoadingPage'
import { redirect } from 'next/navigation'

// have a function to create a client for you

// you need to create a component to wrap your app in
export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState('')
  const { isLoading, user } = useUser()

  useEffect(() => {
    const fetchToken = async () => {
      const fetchedToken = await getAccessToken({
        authorizationParams: {
          audience: 'https://flcadmin.netlify.app/graphql',
          scope: 'read:current_user',
          ignoreCache: true,
        },
      })

      setToken(fetchedToken.accessToken ?? '')
      return token
    }

    fetchToken()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function makeClient() {
    const httpLink = new HttpLink({
      // this needs to be an absolute url, as relative urls cannot be used in SSR
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URI || '/graphql',

      // you can disable result caching here if you want to
      // (this does not work if you are rendering your page with `export const dynamic = "force-static"`)

      // fetchOptions: { cache: 'no-store' },
      // you can override the default `fetchOptions` on a per query basis
      // via the `context` property on the options passed as a second argument
      // to an Apollo Client data fetching hook, e.g.:
      // const { data } = useSuspenseQuery(MY_QUERY, { context: { fetchOptions: { cache: "force-cache" }}});
    })

    const authLink = setContext(async (_, { headers }) => {
      //localStorage.getItem('token')
      const expiryDate = localStorage.getItem('expiryDate')

      if (token && !isTokenExpired(expiryDate)) {
        // return the headers to the context so httpLink can read them
        return {
          headers: {
            ...headers,
            Authorization: `Bearer ${token}`,
          },
        }
      }
      const fetchedToken = token
      const fetchedExpiryDate = new Date(new Date().getTime() + 3600 * 1000)

      // Store token and its expiry date in local storage
      localStorage.setItem('token', fetchedToken ?? '')
      localStorage.setItem('expiryDate', fetchedExpiryDate.toString())

      // return the headers to the context so httpLink can read them
      return {
        headers: {
          ...headers,
          Authorization: `Bearer ${fetchedToken}`,
        },
      }
    })

    // use the `ApolloClient` from "@apollo/experimental-nextjs-app-support"
    return new ApolloClient({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URI || '/graphql',
      link: from([retryLink, errorLink, authLink.concat(httpLink)]),
      // use the `InMemoryCache` from "@apollo/experimental-nextjs-app-support"
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
  }

  if (isLoading) {
    return <LoadingPage />
  }

  // if (!user) {
  //   redirect('/api/auth/login?returnTo=/dashboard')
  // }

  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  )
}
