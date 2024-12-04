import React, { ReactNode } from 'react'
import { ApolloError } from '@apollo/client'
import ErrorPage from './ErrorPage'
import LoadingPage from './LoadingPage'

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
    return <ErrorPage error={error as ApolloError} />
  } else if (data || placeholder) {
    return <>{props.children}</>
  } else if (loading) {
    return <LoadingPage />
  }

  return <LoadingPage />
}

export default ApolloWrapper
