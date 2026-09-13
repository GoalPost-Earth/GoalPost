import { HttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { RetryLink } from '@apollo/client/link/retry'
import {
  getAccessToken,
  handleUnauthenticatedResponse,
} from '@/lib/auth/access-token-client'

/**
 * Did this response say "your bearer wasn't accepted"?
 *
 * `/api/graphql` does NOT 401 on a bad bearer — `apollo-server.ts` verifies
 * the token, leaves `jwt` null when verification fails, and Neo4jGraphQL's
 * `@authentication` directive then raises a GraphQL error on an HTTP 200.
 * So the string is the signal available, and it is the same one users saw
 * when a `JWT_SECRET` rotation wedged them ("Unauthenticated" loading
 * spaces). A 401/403 network error is checked too, for the REST routes that
 * share this client's token.
 *
 * A false positive costs one extra `/api/auth/access-token` call; a false
 * negative costs the user a wedged session, so this errs towards matching.
 */
export function isUnauthenticatedError(error: {
  graphQLErrors?: ReadonlyArray<{ message: string }>
  networkError?: unknown
}): boolean {
  const status = (error.networkError as { statusCode?: number } | undefined)
    ?.statusCode
  if (status === 401 || status === 403) return true
  return !!error.graphQLErrors?.some((e) =>
    /unauthenticated/i.test(e?.message ?? '')
  )
}

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
      // Any response that reached us with a status — 4xx or 5xx — is not the
      // transient case RetryLink is for. A 504 means the request exhausted the
      // API's execution budget and a 502 means the function died on it; both
      // repeat identically, so retrying burned 5 × 60s before any error could
      // surface (a page whose loading state is gated on the query looked like
      // it hung forever) while multiplying load on an already-saturated
      // endpoint. Fail fast and let the caller render a retry affordance the
      // user controls. Genuinely transient faults — connection reset, DNS,
      // aborted fetch — carry no status and still retry below.
      if (typeof status === 'number' && status >= 400) {
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

  // GOAL-375: the token cache now holds a token for its real 30-minute
  // lifetime, so it can no longer rely on a 60s TTL to notice that the
  // session died underneath it. This is what notices instead.
  if (isUnauthenticatedError({ graphQLErrors, networkError })) {
    handleUnauthenticatedResponse()
  }
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
