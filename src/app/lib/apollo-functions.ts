import { HttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { RetryLink } from '@apollo/client/link/retry'
import { jwtDecode } from 'jwt-decode'

export const ERROR_POLICY = 'all'

export const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URI || '/graphql',
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

export const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message, locations, path }) => {
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

export const authLink = setContext(async (_, { headers }) => {
  try {
    const response = await fetch('/api/auth/access-token')
    if (!response.ok) {
      const resJson = await response.json()
      const error = {
        status: response.status,
        statusText: response.statusText,
        message: resJson?.message,
        code: resJson?.code,
      }

      console.error('Error fetching access token:', error)

      if (error.code === 'ERR_EXPIRED_ACCESS_TOKEN') {
        console.warn('Access token expired, redirecting to login...')
        window.location.href = '/api/auth/login?returnTo=/'
      }

      return { headers }
    }

    const resJson = await response.json()

    if (resJson?.accessToken) {
      const decoded = jwtDecode(resJson.accessToken) as { exp: number }
      const expireDate = new Date(decoded.exp * 1000)

      if (expireDate < new Date()) {
        console.debug(
          '[GraphQL debug] Access token expired, refreshing:',
          expireDate
        )
        window.location.href = '/api/auth/login?returnTo=/'
        return { headers }
      }

      return {
        headers: {
          ...headers,
          Authorization: `Bearer ${resJson.accessToken}`,
        },
      }
    }

    return { headers }
  } catch (error) {
    console.error('Error in auth link:', error)
    return { headers }
  }
})
