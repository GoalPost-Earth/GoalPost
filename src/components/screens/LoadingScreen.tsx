import React from 'react'
import { Spinner } from '@/components/ui/spinner'

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gp-surface dark:bg-gp-surface-dark transition-colors">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(19,127,236,0.08),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(19,127,236,0.15),transparent_70%)]" />
      <Spinner className="size-16 text-gp-primary relative z-10" />
    </div>
  )
}

export default LoadingScreen
