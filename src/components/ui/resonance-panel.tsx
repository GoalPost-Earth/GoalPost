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

export interface ResonancePanelProps {
  isOpen: boolean
  onClose: () => void
  resonance: {
    label: string
    description: string
    pulseCount: number
    strength: number
  }
  pulses: PulseInResonance[]
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
  resonance,
  pulses,
}: ResonancePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

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

  if (!isOpen) return null

  return (
    <div
      ref={panelRef}
      className="absolute top-4 right-4 bottom-20 w-80 bg-glass-bg/80 backdrop-blur-xl border border-glass-border rounded-2xl flex flex-col shadow-2xl z-40 overflow-hidden transform transition-transform"
    >
      {/* Header */}
      <div className="p-6 border-b border-glass-border bg-white/5 dark:bg-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gp-primary text-xs font-bold uppercase tracking-wider">
            Field Resonance
          </span>
          <div className="flex gap-2">
            <button className="text-slate-400 dark:text-white/50 hover:text-slate-600 dark:hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">
                open_in_full
              </span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 dark:text-white/50 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
          {resonance.label}
        </h2>
        <div className="flex items-center gap-2 mt-3">
          <span className="flex h-2 w-2 rounded-full bg-gp-primary animate-pulse" />
          <span className="text-xs text-blue-500 dark:text-blue-200">
            Active • {resonance.strength}% Confidence
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div>
          <p className="text-slate-700 dark:text-blue-100/80 text-sm leading-relaxed">
            {resonance.description}
          </p>
        </div>

        <div className="bg-gp-primary/10 rounded-xl p-4 border border-gp-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-gp-primary text-sm">
              psychology
            </span>
            <span className="text-xs font-bold text-gp-primary uppercase">
              AI Analysis
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-white/70 italic">
            "The semantic bridge between these patterns suggests a shift towards
            relational thinking and reciprocal engagement with the community."
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider mb-3">
            Contributing Pulses
          </h3>
          <div className="space-y-3">
            {pulses.map((pulse) => {
              const config = typeConfig[pulse.type]
              return (
                <div
                  key={pulse.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer border border-slate-200 dark:border-transparent dark:hover:border-white/10"
                >
                  <div
                    className={cn(
                      'flex items-center justify-center rounded-full size-8 shrink-0',
                      'bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/20'
                    )}
                  >
                    <span
                      className={cn(
                        'material-symbols-outlined text-sm',
                        config.color
                      )}
                    >
                      {config.icon}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-900 dark:text-white font-medium line-clamp-2">
                      {pulse.description}
                    </p>
                    <span className="text-[10px] text-gp-primary mt-1 block">
                      {pulse.relevance}% Relevance
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
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
