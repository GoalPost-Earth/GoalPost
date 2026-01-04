import React from 'react'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'

const SplashScreen = () => {
  const message = 'Welcome to Goalpost!'

  return (
    <div className="container mx-auto flex justify-center items-center h-[70vh]">
      <div className="flex flex-col">
        <div className="mx-auto">
          <div className="w-12 h-12 bg-gray-500 flex items-center justify-center text-white">
            Logo
          </div>
        </div>
        <TextGenerateEffect duration={3} filter={false} words={message} />
      </div>
    </div>
  )
}

export default SplashScreen
