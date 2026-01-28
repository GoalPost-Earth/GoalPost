'use client'

import { cn } from '@/lib/utils'

type ProfileBackgroundProps = {
  className?: string
}

export function ProfileBackground({ className }: ProfileBackgroundProps) {
  return (
    <div
      className={cn('fixed inset-0 pointer-events-none pt-20', className)}
      style={{
        backgroundImage: `
          radial-gradient(at 18% 18%, color-mix(in srgb, var(--gp-primary) 12%, transparent) 0, transparent 55%),
          radial-gradient(at 82% 16%, color-mix(in srgb, var(--gp-accent-glow) 12%, transparent) 0, transparent 55%),
          radial-gradient(at 80% 85%, color-mix(in srgb, var(--gp-goal) 10%, transparent) 0, transparent 60%),
          radial-gradient(at 16% 86%, color-mix(in srgb, var(--gp-resource) 12%, transparent) 0, transparent 60%)
        `,
      }}
    >
      {/* Animated backdrop blobs */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[320px] h-80 rounded-full bg-gp-primary/12 blur-[120px] animate-float" />
        <div className="absolute -bottom-40 -right-40 w-[320px] h-80 rounded-full bg-gp-accent-glow/12 blur-[120px] animate-float-delayed" />
      </div>
    </div>
  )
}
