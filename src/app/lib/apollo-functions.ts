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
 * (chat thread client, focal-entity, onboarding). Without this each
 * link instance fired its own `/api/auth/access-token` + `/refresh-token`
 * dance on every operation; on a page mount that spawned 5+ concurrent
 * GraphQL queries the rotating-refresh-token race would 401 most of them.
 *
 * On hard auth failure (token + refresh both unavailable) the user is
 * bounced to `/auth/login` so they don't sit stranded on a protected
 * route silently receiving null `@authorization`-gated responses.
 */
export const authLink = setContext(async (_, { headers }) => {
  try {
    const token = await getAccessToken()
    if (token) {
      return { headers: { ...headers, Authorization: `Bearer ${token}` } }
    }
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      const onProtectedRoute = path.startsWith('/protected')
      const alreadyOnAuthRoute = path.startsWith('/auth')
      if (onProtectedRoute && !alreadyOnAuthRoute) {
        console.warn(
          'Access token unavailable and refresh failed, redirecting to login...'
        )
        const returnTo = encodeURIComponent(path + window.location.search)
        window.location.href = `/auth/login?returnTo=${returnTo}`
      }
    }
    return { headers }
  } catch (error) {
    console.error('Error in auth link:', error)
    return { headers }
  }
})
