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
    // Only retry genuinely transient failures. Without a `retryIf`,
    // RetryLink's default retries on ANY error — so an auth failure (the
    // GraphQL request going out without a usable bearer because the
    // session is dead) was retried 5× per query, and each retry re-ran
    // authLink → getAccessToken → /api/auth/access-token. Across the
    // dashboard's parallel queries + re-renders that amplified a dead
    // session into a runaway request storm. A 4xx (incl. 401/403) is not
    // transient — the same request will fail again — so never retry it;
    // let the session-expired flow log the user out instead.
    retryIf: (error) => {
      const status = (error as { statusCode?: number } | undefined)
        ?.statusCode
      if (typeof status === 'number' && status >= 400 && status < 500) {
        return false
      }
      return !!error
    },
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
 * dispatches a `session-expired` event when the server confirms the
 * session is gone (refresh also failed); `AppContext` listens for that
 * event and runs the local session cleanup + redirect (the server already
 * expired the cookies on that 401), so this link just needs to attach the
 * bearer when available and otherwise let the request go.
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
