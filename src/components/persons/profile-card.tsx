'use client'

import { ReactNode } from 'react'

type ProfileCardProps = {
  children: ReactNode
  hover?: boolean
}

export function ProfileCard({ children, hover = true }: ProfileCardProps) {
  return (
    <div
      className={`rounded-3xl p-5 transition-all duration-300 border
        bg-gp-glass-bg border-gp-glass-border 
        backdrop-blur-2xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08)]
        dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]
        ${hover ? 'hover:bg-opacity-[0.85] hover:shadow-lg hover:-translate-y-0.5' : ''}`}
    >
      {children}
    </div>
  )
}
