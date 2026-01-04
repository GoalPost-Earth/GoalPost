'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

interface ErrorPageProps {
  error: Error
  reset?: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="h-screen w-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-destructive">
          Oops! Something went wrong
        </h1>
        <p className="text-lg text-muted-foreground">
          We encountered an error. Please try again or contact support if the
          problem persists.
        </p>
        <div className="text-sm text-muted-foreground">
          <p>Error: {error.message}</p>
        </div>
        {reset && (
          <Button onClick={reset} variant="outline">
            Try Again
          </Button>
        )}
      </div>
    </div>
  )
}
