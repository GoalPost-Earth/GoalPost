import { HttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { RetryLink } from '@apollo/client/link/retry'
import { jwtDecode } from 'jwt-decode'

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

const REFRESH_ELIGIBLE_CODES = new Set([
  'ERR_EXPIRED_ACCESS_TOKEN',
  'ERR_NO_ACCESS_TOKEN',
])

async function tryRefresh(): Promise<{ accessToken: string } | null> {
  // The refresh route reads the HttpOnly cookie automatically; the body is
  // a fallback for browsers that lost the cookie but still have the token
  // in localStorage from login.
  const localToken =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('refreshToken')
      : null

  const refreshResponse = localToken
    ? await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: localToken }),
      })
    : await fetch('/api/auth/refresh-token')
  const refreshJson = await refreshResponse.json().catch(() => ({}))

  if (refreshResponse.ok && refreshJson.accessToken) {
    if (typeof window !== 'undefined' && refreshJson.refreshToken) {
      window.localStorage.setItem('refreshToken', refreshJson.refreshToken)
    }
    return { accessToken: refreshJson.accessToken }
  }
  return null
}

export const authLink = setContext(async (_, { headers }) => {
  try {
    const response = await fetch('/api/auth/access-token')
    let resJson = await response.json()

    if (!response.ok) {
      const code: string | undefined = resJson?.code
      if (code && REFRESH_ELIGIBLE_CODES.has(code)) {
        const refreshed = await tryRefresh()
        if (refreshed) {
          resJson = refreshed
        } else {
          console.warn(
            'Access token unavailable and refresh failed, redirecting to login...'
          )
          window.location.href = '/auth/login?returnTo=/'
          return { headers }
        }
      } else {
        return { headers }
      }
    }

    if (resJson?.accessToken) {
      const decoded = jwtDecode(resJson.accessToken) as { exp: number }
      const expireDate = new Date(decoded.exp * 1000)
      if (expireDate < new Date()) {
        // Defensive: server vended an expired token (clock skew, stale cookie).
        // Try refresh before bailing to login.
        const refreshed = await tryRefresh()
        if (refreshed) {
          return {
            headers: {
              ...headers,
              Authorization: `Bearer ${refreshed.accessToken}`,
            },
          }
        }
        console.debug(
          '[GraphQL debug] Access token expired and refresh failed, redirecting:',
          expireDate
        )
        window.location.href = '/auth/login?returnTo=/'
        return { headers }
      }
      return {
        headers: {
          ...headers,
          Authorization: `Bearer ${resJson?.accessToken}`,
        },
      }
    }
    return { headers }
  } catch (error) {
    console.error('Error in auth link:', error)
    return { headers }
  }
})
