'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { cn } from '@/lib/utils'

export type PulseKind = 'goal' | 'resource' | 'story'

export interface PulseDetails {
  id: string
  type: PulseKind
  content: string
  createdAt?: string | null
  intensity?: number | null
  status?: string | null
  horizon?: string | null
  resourceType?: string | null
  initiators: Array<{
    id: string
    name: string
    email?: string | null
    kind: 'person' | 'community'
  }>
  contexts: Array<{ id: string; title?: string | null }>
}

export interface PulsePanelProps {
  isOpen: boolean
  isLoading: boolean
  pulse: PulseDetails | null
  onClose: () => void
}

const typeConfig: Record<
  PulseKind,
  {
    label: string
    icon: string
    accent: string
    badge: string
    chip: string
  }
> = {
  goal: {
    label: 'Goal Pulse',
    icon: 'flag',
    accent: 'text-gp-goal',
    badge: 'bg-gp-goal/15 text-gp-goal',
    chip: 'bg-gp-goal/10 text-gp-goal border border-gp-goal/30',
  },
  resource: {
    label: 'Resource Pulse',
    icon: 'diamond',
    accent: 'text-gp-resource',
    badge: 'bg-gp-resource/15 text-gp-resource',
    chip: 'bg-gp-resource/10 text-gp-resource border border-gp-resource/30',
  },
  story: {
    label: 'Story Pulse',
    icon: 'auto_stories',
    accent: 'text-gp-story',
    badge: 'bg-gp-story/15 text-gp-story',
    chip: 'bg-gp-story/10 text-gp-story border border-gp-story/30',
  },
}

export function PulsePanel({
  isOpen,
  isLoading,
  pulse,
  onClose,
}: PulsePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!panelRef.current) return
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
  }, [isOpen])

  if (!isOpen) return null

  const kind = pulse?.type ?? 'goal'
  const config = typeConfig[kind]
  const createdAtText = pulse?.createdAt
    ? new Date(pulse.createdAt).toLocaleString()
    : 'Not available'

  return (
    <div
      ref={panelRef}
      className="absolute top-4 right-4 bottom-20 w-96 bg-glass-bg/80 backdrop-blur-xl border border-glass-border rounded-2xl flex flex-col shadow-2xl z-40 overflow-hidden"
    >
      <div className="p-6 border-b border-glass-border bg-white/5 dark:bg-white/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'material-symbols-outlined text-lg rounded-full px-2 py-1 bg-white/50 dark:bg-white/10',
                config.badge
              )}
            >
              {config.icon}
            </span>
            <div className="flex flex-col">
              <span
                className={cn(
                  'text-xs font-bold uppercase tracking-wider',
                  config.accent
                )}
              >
                {config.label}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-white/50">
                Pulse ID • {pulse?.id ?? '—'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-white/60 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white leading-tight line-clamp-3">
          {pulse?.content || 'No content available'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-hide [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {isLoading && (
          <div className="space-y-3">
            <div className="h-4 bg-slate-200/70 dark:bg-white/10 rounded" />
            <div className="h-4 w-3/4 bg-slate-200/70 dark:bg-white/10 rounded" />
            <div className="h-4 w-2/3 bg-slate-200/70 dark:bg-white/10 rounded" />
          </div>
        )}

        {!isLoading && pulse && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <span className="text-[11px] uppercase text-slate-500 dark:text-white/50 font-semibold">
                  Type
                </span>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">
                    {config.icon}
                  </span>
                  {config.label}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <span className="text-[11px] uppercase text-slate-500 dark:text-white/50 font-semibold">
                  Created
                </span>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {createdAtText}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <span className="text-[11px] uppercase text-slate-500 dark:text-white/50 font-semibold">
                  Intensity
                </span>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {pulse.intensity ?? 'Not set'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                {pulse.status && (
                  <div>
                    <span className="text-[11px] uppercase text-slate-500 dark:text-white/50 font-semibold">
                      Status
                    </span>
                    <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white capitalize">
                      {pulse.status.toLowerCase()}
                    </div>
                  </div>
                )}
                {pulse.horizon && (
                  <div>
                    <span className="text-[11px] uppercase text-slate-500 dark:text-white/50 font-semibold">
                      Horizon
                    </span>
                    <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white capitalize">
                      {pulse.horizon.toLowerCase()}
                    </div>
                  </div>
                )}
                {pulse.resourceType && (
                  <div>
                    <span className="text-[11px] uppercase text-slate-500 dark:text-white/50 font-semibold">
                      Resource Type
                    </span>
                    <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white capitalize">
                      {pulse.resourceType.toLowerCase()}
                    </div>
                  </div>
                )}
                {!pulse.status && !pulse.horizon && !pulse.resourceType && (
                  <div className="text-sm text-slate-500 dark:text-white/50">
                    No additional metadata
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-slate-500 dark:text-white/50">
                  groups
                </span>
                <span className="text-xs font-semibold uppercase text-slate-500 dark:text-white/50">
                  Initiated By
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {pulse.initiators.length === 0 && (
                  <span className="text-sm text-slate-500 dark:text-white/50">
                    No initiators recorded
                  </span>
                )}
                {pulse.initiators.map((initiator) => (
                  <span
                    key={initiator.id}
                    className={cn(
                      'text-xs px-3 py-1 rounded-full border backdrop-blur-md',
                      config.chip
                    )}
                  >
                    {initiator.name}
                    {initiator.email ? ` • ${initiator.email}` : ''}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-slate-500 dark:text-white/50">
                  share
                </span>
                <span className="text-xs font-semibold uppercase text-slate-500 dark:text-white/50">
                  Contexts
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {pulse.contexts.length === 0 && (
                  <span className="text-sm text-slate-500 dark:text-white/50">
                    No contexts linked
                  </span>
                )}
                {pulse.contexts.map((context) => (
                  <span
                    key={context.id}
                    className="text-xs px-3 py-1 rounded-full bg-white/60 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-700 dark:text-white"
                  >
                    {context.title || 'Untitled Context'}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-6 border-t border-glass-border bg-glass-bg backdrop-blur-md">
        <button className="flex w-full cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-gp-primary hover:bg-blue-500 transition-colors text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] shadow-lg shadow-blue-500/20">
          <span className="material-symbols-outlined text-[20px]">
            visibility
          </span>
          <span className="truncate">View Pulse Thread</span>
        </button>
        <button className="flex w-full mt-3 cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-transparent border border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-700 dark:text-white gap-2 text-sm font-medium leading-normal">
          <span className="material-symbols-outlined text-[20px]">share</span>
          <span className="truncate">Share Pulse</span>
        </button>
      </div>
    </div>
  )
}
