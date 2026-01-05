import { ApolloClient, InMemoryCache, from } from '@apollo/client'
import {
  authLink,
  ERROR_POLICY,
  errorLink,
  httpLink,
  retryLink,
} from './apollo-functions'

const createApolloClient = () =>
  new ApolloClient({
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

let client: ApolloClient | null = null

export const getClient = () => {
  if (!client) {
    client = createApolloClient()
  }
  return client
}

export const query = (options: Parameters<ApolloClient['query']>[0]) =>
  getClient().query(options)

// Placeholder export to retain previous API surface; not used in the app.
export const PreloadQuery = undefined

export { createApolloClient }
