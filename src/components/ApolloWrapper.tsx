import React, { ReactNode } from 'react'
import { ApolloError } from '@apollo/client'
import { ErrorScreen, LoadingScreen } from './screens'

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
    return <ErrorScreen error={error as ApolloError} />
  } else if (data || placeholder) {
    return <>{props.children}</>
  } else if (loading) {
    return <LoadingScreen />
  }

  return <LoadingScreen />
}

export default ApolloWrapper
