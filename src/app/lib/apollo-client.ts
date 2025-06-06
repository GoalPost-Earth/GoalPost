import { from } from '@apollo/client'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { registerApolloClient } from '@apollo/experimental-nextjs-app-support'
import {
  authLink,
  ERROR_POLICY,
  errorLink,
  httpLink,
  retryLink,
} from './apollo-functions'

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  return new ApolloClient({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URI || '/api/graphql',
    link: from([retryLink, errorLink, authLink.concat(httpLink)]),
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
  })
})
