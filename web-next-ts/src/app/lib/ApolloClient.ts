import { from } from '@apollo/client'
import {
  registerApolloClient,
  ApolloClient,
  InMemoryCache,
} from '@apollo/experimental-nextjs-app-support'
import {
  authLink,
  ERROR_POLICY,
  errorLink,
  httpLink,
  retryLink,
} from './apollo-functions'

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  console.log('🚀 ~ file: ApolloClient.ts:34 ~ httpLink:', httpLink)

  return new ApolloClient({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URI || '/graphql',
    link: from([retryLink, errorLink, authLink.concat(httpLink)]),
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
})
