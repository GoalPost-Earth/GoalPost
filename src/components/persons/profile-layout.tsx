'use client'

import { ReactNode } from 'react'

type ProfileLayoutProps = {
  children: ReactNode
  className?: string
}

export function ProfileLayout({ children, className }: ProfileLayoutProps) {
  return (
    <div
      className={`relative w-full max-w-4xl mx-auto px-4 py-16 md:py-24 ${className || ''}`}
    >
      {/* Main Profile Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-14 bg-gp-glass-bg border border-gp-glass-border shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        <div className="relative z-10">{children}</div>

        {/* Decorative blobs inside card */}
        <div className="absolute top-10 right-10 size-16 rounded-full bg-gp-primary/10 border border-gp-glass-border backdrop-blur-sm pointer-events-none" />
        <div className="absolute bottom-16 left-10 size-12 rounded-full bg-gp-accent-glow/10 border border-gp-glass-border backdrop-blur-sm pointer-events-none" />
      </div>
    </div>
  )
}
