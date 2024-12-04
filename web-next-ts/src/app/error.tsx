'use client'

import ErrorPage from '@/components/ErrorPage'
import React from 'react'

export default function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorPage error={error} />
}
