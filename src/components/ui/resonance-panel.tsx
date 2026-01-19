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
  source: {
    id: string
    content: string
    __typename: string
  }
  target: {
    id: string
    content: string
    __typename: string
  }
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
      className="absolute top-4 right-4 bottom-20 w-96 bg-glass-bg/80 backdrop-blur-xl border border-glass-border rounded-2xl flex flex-col shadow-2xl z-40 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-glass-border bg-white/5 dark:bg-white/5">
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
        <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
          {resonance.label}
        </h2>
        <div className="flex items-center gap-2 mt-3">
          <span className="flex h-2 w-2 rounded-full bg-gp-primary animate-pulse" />
          <span className="text-xs text-blue-500 dark:text-blue-200">
            Active • {resonance.strength ?? 0}% Confidence
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
                <p className="text-slate-700 dark:text-blue-100/80 text-sm leading-relaxed">
                  {resonance.description}
                </p>
              </div>
            )}

            {resonance.id && (
              <div className="space-y-2">
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">
                    Pattern ID
                  </span>
                  <p className="text-sm font-mono text-slate-700 dark:text-white/80 break-all">
                    {resonance.id}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">
                    Type
                  </span>
                  <p className="text-sm text-slate-700 dark:text-white/80">
                    AI-Discovered Meaning
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">
                    Connections
                  </span>
                  <p className="text-sm text-slate-700 dark:text-white/80">
                    {links.length}
                  </p>
                </div>
              </div>
            )}

            {links.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider mb-3">
                  Connected Pulses
                </h3>
                <div className="space-y-3">
                  {links.map((link) => {
                    const sourceType =
                      pulseTypeMap[link.source.__typename] || 'goal'
                    const targetType =
                      pulseTypeMap[link.target.__typename] || 'goal'
                    const config = typeConfig[sourceType]
                    const createdAt = link.createdAt
                      ? new Date(link.createdAt).toLocaleDateString()
                      : 'N/A'

                    return (
                      <div
                        key={link.id}
                        className="p-4 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600 dark:text-white/70">
                            {Math.round(link.confidence * 100)}% confidence
                          </span>
                          <span className="text-xs text-slate-500 dark:text-white/50">
                            {createdAt}
                          </span>
                        </div>

                        {link.evidence && (
                          <p className="text-xs text-slate-700 dark:text-white/80 italic leading-relaxed">
                            <strong>Evidence:</strong> {link.evidence}
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase">
                              Source
                            </span>
                            <p className="text-xs text-slate-700 dark:text-white/80 line-clamp-2 mt-1">
                              {link.source.content}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase">
                              Target
                            </span>
                            <p className="text-xs text-slate-700 dark:text-white/80 line-clamp-2 mt-1">
                              {link.target.content}
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
      <div className="p-6 border-t border-glass-border bg-glass-bg backdrop-blur-md">
        <button className="flex w-full cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-gp-primary hover:bg-blue-500 transition-colors text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] shadow-lg shadow-blue-500/20">
          <span className="material-symbols-outlined text-[20px]">
            visibility
          </span>
          <span className="truncate">Deep Dive</span>
        </button>
        <button className="flex w-full mt-3 cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-transparent border border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-700 dark:text-white gap-2 text-sm font-medium leading-normal">
          <span className="material-symbols-outlined text-[20px]">share</span>
          <span className="truncate">Share Resonance</span>
        </button>
      </div>
    </div>
  )
}
