'use client'

import { type FC } from 'react'
import { cn } from '@/lib/utils'

interface GraphLoadingStateProps {
  /** Visible label under the skeleton — typically "Loading graph" or "Bloom is gathering". */
  label?: string
  /** Optional subtitle for context. */
  subtitle?: string
}

/**
 * Shared loading skeleton for the Graph + Bloom canvases. Mimics the
 * upcoming bubble layout with a cluster of pulsing circles so the surface
 * never reads as "blank canvas, did this break?" — matches the dashboard
 * cards' skeleton language (rounded shape + animate-pulse + glass tint).
 */
export const GraphLoadingState: FC<GraphLoadingStateProps> = ({
  label = 'Loading graph',
  subtitle,
}) => {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-72 h-56">
          <Skeleton
            className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-32"
            delay="0s"
          />
          <Skeleton className="left-0 top-6 size-20" delay="0.15s" />
          <Skeleton className="right-2 top-2 size-16" delay="0.3s" />
          <Skeleton className="bottom-0 left-1/4 size-14" delay="0.45s" />
          <Skeleton className="bottom-4 right-6 size-14" delay="0.6s" />
        </div>
        <div className="text-center space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/45">
            {label}
          </p>
          {subtitle && (
            <p className="text-xs text-white/35 max-w-xs">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}

const Skeleton: FC<{ className: string; delay: string }> = ({
  className,
  delay,
}) => (
  <div
    className={cn(
      'absolute rounded-full bg-white/5 border border-white/10 animate-pulse',
      className
    )}
    style={{ animationDelay: delay }}
    aria-hidden="true"
  />
)
