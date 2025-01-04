import { HttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { RetryLink } from '@apollo/client/link/retry'
import { getAccessToken } from '@auth0/nextjs-auth0'

export const ERROR_POLICY = 'all'

export const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URI || '/graphql',
})

export const isTokenExpired = (expiryDate: string | null) => {
  if (!expiryDate) {
    return true
  }

  const now = new Date()
  const expiry = new Date(expiryDate)
  return now >= expiry
}

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
  const token = ''
  const expiryDate = ''

  if (token && !isTokenExpired(expiryDate)) {
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    }
  }

  const fetchedToken = await getAccessToken({
    authorizationParams: {
      audience: 'https://goalpost.app/graphql',
      scope: 'read:current_user',
      ignoreCache: true,
    },
  }).catch((error) => {
    console.error('Error fetching token:', error)
    return { accessToken: '' }
  })
  // const fetchedExpiryDate = new Date(new Date().getTime() + 3600 * 1000)

  // Store token and its expiry date in local storage
  // localStorage.setItem('token', fetchedToken.accessToken ?? null)
  // localStorage.setItem('expiryDate', fetchedExpiryDate.toString())

  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      Authorization: `Bearer ${fetchedToken.accessToken ?? null}`,
    },
  }
})
