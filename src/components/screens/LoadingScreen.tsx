import React from 'react'
import { Spinner } from '@/components/ui/spinner'

const LoadingScreen = () => {
  return (
    <div className="container mx-auto flex justify-center items-center h-screen">
      <Spinner className="size-16 text-blue-600" />
    </div>
  )
}

export default LoadingScreen
