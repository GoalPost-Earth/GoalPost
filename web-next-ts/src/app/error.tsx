'use client'

import ErrorPage from '@/components/screens/ErrorScreen'
import React from 'react'

export default function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorPage error={error} />
}
