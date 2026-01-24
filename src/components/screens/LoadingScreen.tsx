import React from 'react'
import { Spinner } from '@/components/ui/spinner'

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gp-surface dark:bg-gp-surface-dark transition-colors">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--gp-primary) 16%, transparent), transparent 70%)',
        }}
      />
      <Spinner className="size-16 text-gp-primary relative z-10" />
    </div>
  )
}

export default LoadingScreen
