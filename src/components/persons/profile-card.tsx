'use client'

import { ReactNode } from 'react'

type ProfileCardProps = {
  children: ReactNode
  hover?: boolean
  /** Stretch to fill the parent's height (h-full). Defaults to true so cards
   *  sitting side-by-side in a grid stay equal height. Set false for cards
   *  stacked in a list, where each should hug its own content. */
  stretch?: boolean
  onClick?: () => void
  className?: string
}

export function ProfileCard({
  children,
  hover = true,
  stretch = true,
  onClick,
  className,
}: ProfileCardProps) {
  return (
    <div
      onClick={onClick}
      className={`${stretch ? 'h-full' : ''} rounded-3xl p-4 sm:p-5 transition-all duration-300 border
        bg-gp-glass-bg border-gp-glass-border
        backdrop-blur-2xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08)]
        dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]
        ${hover ? 'hover:-translate-y-0.5 hover:shadow-lg' : ''}
        ${hover && onClick ? 'hover:border-gp-primary/40 hover:bg-white/70 dark:hover:bg-white/[0.07]' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className || ''}`}
    >
      {children}
    </div>
  )
}
