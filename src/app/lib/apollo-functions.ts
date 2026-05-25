import { HttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { RetryLink } from '@apollo/client/link/retry'
import { getAccessToken } from '@/lib/auth/access-token-client'

export const ERROR_POLICY = 'all'

export const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URI || '/api/graphql',
})

export const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: 2000,
    jitter: true,
  },
  attempts: {
    max: 5,
  },
})

export const errorLink = onError((error) => {
  const { graphQLErrors, networkError } = error as {
    // Apollo Client v4 consolidates error shapes; we only care about these two if present
    graphQLErrors?: ReadonlyArray<{
      message: string
      locations?: unknown
      path?: unknown
    }>
    networkError?: unknown
  }

  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )

      // toaster.create({
      //   title: 'Error!',
      //   description: message,
      //   type: 'error',
      // })
    })
  }
  if (networkError) console.error(`[Network error]: ${networkError}`)
})

/**
 * authLink delegates to the shared `getAccessToken` helper so every
 * GraphQL request reuses the same in-flight refresh as Apollo's siblings
 * (chat thread client, focal-entity, onboarding). The helper itself
 * dispatches a `gp:session-expired` event when the server confirms the
 * session is gone (refresh also failed); `AppContext` listens for that
 * event and runs the full logout + redirect, so this link just needs to
 * attach the bearer when available and otherwise let the request go.
 */
export const authLink = setContext(async (_, { headers }) => {
  try {
    const token = await getAccessToken()
    if (token) {
      return { headers: { ...headers, Authorization: `Bearer ${token}` } }
    }
    return { headers }
  } catch (error) {
    console.error('Error in auth link:', error)
    return { headers }
  }
})
