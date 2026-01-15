import React from 'react'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { GoalPostLogo } from '@/components/icons'

const SplashScreen = () => {
  const message = 'Welcome to Goalpost!'

  return (
    <div className="relative min-h-screen bg-gp-surface dark:bg-gp-surface-dark transition-colors overflow-hidden flex items-center justify-center">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(19,127,236,0.08),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(19,127,236,0.15),transparent_70%)]" />
      <div className="absolute top-[15%] left-[15%] w-125 h-125 bg-gp-primary/10 dark:bg-gp-primary/5 rounded-full blur-[120px] animate-blob" />
      <div className="absolute bottom-[15%] right-[15%] w-100 h-100 bg-gp-accent-glow/10 dark:bg-gp-accent-glow/5 rounded-full blur-[100px] animate-blob [animation-delay:2s]" />

      {/* Dot grid pattern */}
      <div className="absolute inset-0 gp-dot-grid opacity-30 dark:opacity-20" />

      {/* Content */}
      <div className="relative z-10 container mx-auto flex justify-center items-center">
        <div className="flex flex-col items-center gap-8">
          {/* Logo */}
          <div className="w-16 h-16 flex items-center justify-center">
            <GoalPostLogo className="text-gp-primary" />
          </div>

          {/* Message */}
          <div className="text-center">
            <TextGenerateEffect duration={3} filter={false} words={message} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SplashScreen
