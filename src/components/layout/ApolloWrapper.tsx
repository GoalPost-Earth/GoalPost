import React, { ReactNode } from 'react'
import { ErrorScreen, LoadingScreen } from '../screens'

type ApolloWrapperPropsType = {
  placeholder?: boolean
  data: unknown
  loading: boolean
  error?: unknown
  children: ReactNode
}

const ApolloWrapper = (props: ApolloWrapperPropsType) => {
  const { data, loading, error, placeholder } = props

  if (error) {
    const normalizedError =
      error instanceof Error ? error : new Error('GraphQL request failed')
    return <ErrorScreen error={normalizedError} />
  } else if (data || placeholder) {
    return <>{props.children}</>
  } else if (loading) {
    return <LoadingScreen />
  }

  return <LoadingScreen />
}

export default ApolloWrapper
