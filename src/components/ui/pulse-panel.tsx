'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export type PulseKind = 'goal' | 'resource' | 'story'

export interface PulseDetails {
  id: string
  type: PulseKind
  title?: string | null
  content: string
  createdAt?: string | null
  intensity?: number | null
  status?: string | null
  horizon?: string | null
  resourceType?: string | null
  createdBy: Array<{
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
  const router = useRouter()
  const [isContentExpanded, setIsContentExpanded] = useState(false)

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
      className="absolute top-4 right-4 bottom-20 w-96 backdrop-blur-xl rounded-2xl flex flex-col shadow-2xl z-40 overflow-hidden bg-gp-glass-bg/80 border border-gp-glass-border"
    >
      <div className="p-6 border-b border-gp-glass-border bg-white/5 dark:bg-white/5">
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
              <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                Pulse ID • {pulse?.id ?? '—'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gp-ink-muted hover:text-gp-ink-strong transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        <h2 className="text-xl font-semibold text-gp-ink-strong leading-tight line-clamp-3">
          {pulse?.title || pulse?.content || 'No title available'}
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
            {pulse.content && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-gp-ink-muted">
                    description
                  </span>
                  <span className="text-xs font-semibold uppercase text-gp-ink-muted">
                    Description
                  </span>
                </div>
                <div className="relative">
                  <p
                    className={cn(
                      'text-sm text-gp-ink-strong leading-relaxed',
                      !isContentExpanded && 'line-clamp-3'
                    )}
                  >
                    {pulse.content}
                  </p>
                  {pulse.content.length > 150 && (
                    <button
                      onClick={() => setIsContentExpanded(!isContentExpanded)}
                      className="text-xs font-semibold text-gp-primary hover:text-gp-primary/80 mt-1 transition-colors"
                    >
                      {isContentExpanded ? 'Read less' : 'Read more'}
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-gp-glass-bg border border-gp-glass-border">
                <span className="text-[11px] uppercase text-gp-ink-muted font-semibold">
                  Type
                </span>
                <div className="mt-1 text-sm font-semibold text-gp-ink-strong flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">
                    {config.icon}
                  </span>
                  {config.label}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gp-glass-bg border border-gp-glass-border">
                <span className="text-[11px] uppercase text-gp-ink-muted font-semibold">
                  Created
                </span>
                <div className="mt-1 text-sm font-semibold text-gp-ink-strong">
                  {createdAtText}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gp-glass-bg border border-gp-glass-border">
                <span className="text-[11px] uppercase text-gp-ink-muted font-semibold">
                  Intensity
                </span>
                <div className="mt-1 text-sm font-semibold text-gp-ink-strong">
                  {pulse.intensity ?? 'Not set'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gp-glass-bg border border-gp-glass-border space-y-1">
                {pulse.status && (
                  <div>
                    <span className="text-[11px] uppercase text-gp-ink-muted font-semibold">
                      Status
                    </span>
                    <div className="mt-1 text-sm font-semibold text-gp-ink-strong capitalize">
                      {pulse.status.toLowerCase()}
                    </div>
                  </div>
                )}
                {pulse.horizon && (
                  <div>
                    <span className="text-[11px] uppercase text-gp-ink-muted font-semibold">
                      Horizon
                    </span>
                    <div className="mt-1 text-sm font-semibold text-gp-ink-strong capitalize">
                      {pulse.horizon.toLowerCase()}
                    </div>
                  </div>
                )}
                {pulse.resourceType && (
                  <div>
                    <span className="text-[11px] uppercase text-gp-ink-muted font-semibold">
                      Resource Type
                    </span>
                    <div className="mt-1 text-sm font-semibold text-gp-ink-strong capitalize">
                      {pulse.resourceType.toLowerCase()}
                    </div>
                  </div>
                )}
                {!pulse.status && !pulse.horizon && !pulse.resourceType && (
                  <div className="text-sm text-gp-ink-muted">
                    No additional metadata
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-gp-ink-muted">
                  groups
                </span>
                <span className="text-xs font-semibold uppercase text-gp-ink-muted">
                  Created By
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {pulse.createdBy.length === 0 && (
                  <span className="text-sm text-gp-ink-muted">
                    No creators recorded
                  </span>
                )}
                {pulse.createdBy.map((creator) => (
                  <button
                    key={creator.id}
                    onClick={() =>
                      router.push(`/protected/dashboard/persons/${creator.id}`)
                    }
                    className={cn(
                      'text-xs px-3 py-1 rounded-full border backdrop-blur-md cursor-pointer hover:opacity-80 transition-opacity',
                      config.chip
                    )}
                  >
                    {creator.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-gp-ink-muted">
                  share
                </span>
                <span className="text-xs font-semibold uppercase text-gp-ink-muted">
                  Contexts
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {pulse.contexts.length === 0 && (
                  <span className="text-sm text-gp-ink-muted">
                    No contexts linked
                  </span>
                )}
                {pulse.contexts.map((context) => (
                  <span
                    key={context.id}
                    className="text-xs px-3 py-1 rounded-full bg-gp-glass-bg border border-gp-glass-border text-gp-ink-strong"
                  >
                    {context.title || 'Untitled Context'}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

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
          <span className="truncate">View Pulse Thread</span>
        </button>
        <button className="flex w-full mt-3 cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-transparent border border-gp-glass-border hover:bg-white/60 dark:hover:bg-white/5 transition-colors text-gp-ink-strong gap-2 text-sm font-medium leading-normal">
          <span className="material-symbols-outlined text-[20px]">share</span>
          <span className="truncate">Share Pulse</span>
        </button>
      </div>
    </div>
  )
}
