'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { cn } from '@/lib/utils'

export interface PulseInResonance {
  id: string
  label: string
  type: 'goal' | 'resource' | 'story'
  icon: string
  description: string
  connections: number
  author: string
  relevance: number
}

export interface ResonanceLink {
  id: string
  confidence: number
  evidence?: string | null
  createdAt?: string | null
  source: Array<{
    id: string
    title?: string
    content: string
    __typename: string
  }>
  target: Array<{
    id: string
    title?: string
    content: string
    __typename: string
  }>
}

export interface ResonancePanelProps {
  isOpen: boolean
  onClose: () => void
  isLoading?: boolean
  resonance: {
    id?: string
    label: string
    description?: string | null
    pulseCount?: number
    strength?: number
  } | null
  links?: ResonanceLink[]
  pulses?: PulseInResonance[]
}

const typeConfig = {
  goal: {
    icon: 'track_changes',
    color: 'text-gp-goal',
    bgColor: 'bg-gp-goal/10',
    label: 'Goal Pulse',
  },
  resource: {
    icon: 'inventory_2',
    color: 'text-gp-resource',
    bgColor: 'bg-gp-resource/10',
    label: 'Resource Pulse',
  },
  story: {
    icon: 'auto_stories',
    color: 'text-gp-story',
    bgColor: 'bg-gp-story/10',
    label: 'Story Pulse',
  },
}

export function ResonancePanel({
  isOpen,
  onClose,
  isLoading = false,
  resonance,
  links = [],
  pulses = [],
}: ResonancePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (panelRef.current) {
      if (isOpen) {
        gsap.fromTo(
          panelRef.current,
          { x: '100%', opacity: 0 },
          { x: '0%', opacity: 1, duration: 0.4, ease: 'power3.out' }
        )
      } else {
        gsap.to(panelRef.current, {
          x: '100%',
          opacity: 0,
          duration: 0.3,
          ease: 'power3.in',
        })
      }
    }
  }, [isOpen])

  if (!isOpen || !resonance) return null

  const pulseTypeMap: Record<string, 'goal' | 'resource' | 'story'> = {
    GoalPulse: 'goal',
    ResourcePulse: 'resource',
    StoryPulse: 'story',
  }

  return (
    <div
      ref={panelRef}
      className="absolute top-4 right-4 bottom-20 w-96 bg-gp-glass-bg/80 backdrop-blur-xl border border-gp-glass-border rounded-2xl flex flex-col shadow-2xl z-40 overflow-hidden"
      style={{
        transform: 'translateX(100%)',
        opacity: 0,
      }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gp-glass-border bg-white/5 dark:bg-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gp-primary text-xs font-bold uppercase tracking-wider">
            Field Resonance
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-white/50 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        <h2 className="text-xl font-bold text-gp-ink-strong dark:text-gp-ink-strong leading-tight">
          {resonance.label}
        </h2>
        <div className="flex items-center gap-2 mt-3">
          <span className="flex h-2 w-2 rounded-full bg-gp-primary animate-pulse" />
          <span className="text-xs text-gp-primary">
            Active •{' '}
            {typeof resonance.strength === 'number'
              ? resonance.strength.toFixed(2)
              : '0.00'}
            % Confidence
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 bg-slate-200/70 dark:bg-white/10 rounded" />
            <div className="h-4 w-3/4 bg-slate-200/70 dark:bg-white/10 rounded" />
            <div className="h-4 w-2/3 bg-slate-200/70 dark:bg-white/10 rounded" />
          </div>
        ) : (
          <>
            {resonance.description && (
              <div>
                <p className="text-gp-ink-muted dark:text-gp-ink-soft text-sm leading-relaxed">
                  {resonance.description}
                </p>
              </div>
            )}

            {resonance.id && (
              <div className="space-y-2">
                <div>
                  <span className="text-xs font-bold text-gp-ink-muted dark:text-gp-ink-soft uppercase tracking-wider">
                    Pattern ID
                  </span>
                  <p className="text-sm font-mono text-gp-ink-strong dark:text-gp-ink-strong break-all">
                    {resonance.id}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-gp-ink-muted dark:text-gp-ink-soft uppercase tracking-wider">
                    Type
                  </span>
                  <p className="text-sm text-gp-ink-strong dark:text-gp-ink-strong">
                    AI-Discovered Meaning
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-gp-ink-muted dark:text-gp-ink-soft uppercase tracking-wider">
                    Connections
                  </span>
                  <p className="text-sm text-gp-ink-strong dark:text-gp-ink-strong">
                    {links.length}
                  </p>
                </div>
              </div>
            )}

            {links.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gp-ink-muted dark:text-gp-ink-soft uppercase tracking-wider mb-3">
                  Connected Pulses
                </h3>
                <div className="space-y-3">
                  {links.map((link) => {
                    // Access first element of source/target arrays
                    const source = link.source?.[0]
                    const target = link.target?.[0]

                    if (!source || !target) return null

                    const sourceType = pulseTypeMap[source.__typename] || 'goal'
                    const targetType = pulseTypeMap[target.__typename] || 'goal'
                    const config = typeConfig[sourceType]
                    const createdAt = link.createdAt
                      ? new Date(link.createdAt).toLocaleDateString()
                      : 'N/A'

                    return (
                      <div
                        key={link.id}
                        className="p-4 rounded-lg bg-gp-glass-bg border border-gp-glass-border space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gp-ink-strong dark:text-gp-ink-strong">
                            {Math.round(link.confidence * 100)}% confidence
                          </span>
                          <span className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                            {createdAt}
                          </span>
                        </div>

                        {link.evidence && (
                          <p className="text-xs text-gp-ink-strong dark:text-gp-ink-strong italic leading-relaxed">
                            <strong>Evidence:</strong> {link.evidence}
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-gp-ink-muted dark:text-gp-ink-soft uppercase">
                              Source
                            </span>
                            {source.title && (
                              <p className="text-xs font-semibold text-gp-ink-strong dark:text-gp-ink-strong mt-1">
                                {source.title}
                              </p>
                            )}
                            <p className="text-xs text-gp-ink-strong dark:text-gp-ink-strong line-clamp-2 mt-0.5">
                              {source.content}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gp-ink-muted dark:text-gp-ink-soft uppercase">
                              Target
                            </span>
                            {target.title && (
                              <p className="text-xs font-semibold text-gp-ink-strong dark:text-gp-ink-strong mt-1">
                                {target.title}
                              </p>
                            )}
                            <p className="text-xs text-gp-ink-strong dark:text-gp-ink-strong line-clamp-2 mt-0.5">
                              {target.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gp-glass-border bg-gp-glass-bg backdrop-blur-md">
        <button
          className="flex w-full cursor-pointer items-center justify-center rounded-xl h-10 px-4 text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] shadow-lg transition-all"
          style={{
            background:
              'linear-gradient(135deg, color-mix(in srgb, var(--gp-primary) 95%, white 5%), color-mix(in srgb, var(--gp-primary) 75%, black 25%))',
            boxShadow:
              '0 10px 28px color-mix(in srgb, var(--gp-primary) 40%, transparent)',
          }}
        >
          <span className="material-symbols-outlined text-[20px]">
            visibility
          </span>
          <span className="truncate">Deep Dive</span>
        </button>
        <button className="flex w-full mt-3 cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-transparent border border-gp-glass-border hover:bg-white/60 dark:hover:bg-white/5 transition-colors text-gp-ink-strong dark:text-gp-ink-strong gap-2 text-sm font-medium leading-normal">
          <span className="material-symbols-outlined text-[20px]">share</span>
          <span className="truncate">Share Resonance</span>
        </button>
      </div>
    </div>
  )
}
