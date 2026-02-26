'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { usePulseSharing } from '@/hooks/usePulseSharing'
import { useQuery } from '@apollo/client/react'
import { GET_ALL_USER_CONTEXTS } from '@/app/graphql/queries/FIELD_CONTEXT_QUERIES'
import Select, { StylesConfig } from 'react-select'
import { getConfigForType } from '@/lib/pulse-type-config'

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
  onEdit?: () => void
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
    icon: getConfigForType('goal').icon,
    accent: 'text-gp-goal',
    badge: 'bg-gp-goal/15 text-gp-goal',
    chip: 'bg-gp-goal/10 text-gp-goal border border-gp-goal/30',
  },
  resource: {
    label: 'Resource Pulse',
    icon: getConfigForType('resource').icon,
    accent: 'text-gp-resource',
    badge: 'bg-gp-resource/15 text-gp-resource',
    chip: 'bg-gp-resource/10 text-gp-resource border border-gp-resource/30',
  },
  story: {
    label: 'Story Pulse',
    icon: getConfigForType('story').icon,
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
  onEdit,
}: PulsePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [isContentExpanded, setIsContentExpanded] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const { sharePulseWithContext, loading: sharingLoading } = usePulseSharing()

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
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-gp-ink-muted hover:text-gp-ink-strong transition-colors"
                aria-label="Edit"
                title="Edit pulse"
              >
                <span className="material-symbols-outlined text-lg">edit</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gp-ink-muted hover:text-gp-ink-strong transition-colors"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-6 bg-slate-200/70 dark:bg-white/10 rounded w-3/4" />
            <div className="h-4 bg-slate-200/70 dark:bg-white/10 rounded w-full" />
          </div>
        ) : (
          <h2 className="text-xl font-semibold text-gp-ink-strong leading-tight line-clamp-3">
            {pulse?.title || pulse?.content || 'No title available'}
          </h2>
        )}
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
                      'text-sm text-gp-ink-strong leading-relaxed whitespace-pre-wrap',
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
          onClick={() =>
            pulse?.id && router.push(`/protected/dashboard/pulses/${pulse.id}`)
          }
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
        <button
          className="flex w-full mt-3 cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-transparent border border-gp-glass-border hover:bg-white/60 dark:hover:bg-white/5 transition-colors text-gp-ink-strong gap-2 text-sm font-medium leading-normal"
          onClick={() => setShowShareModal(true)}
        >
          <span className="material-symbols-outlined text-[20px]">share</span>
          <span className="truncate">Share Pulse</span>
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && pulse && (
        <SharePulseModal
          pulse={pulse}
          onClose={() => setShowShareModal(false)}
          onShare={sharePulseWithContext}
          isLoading={sharingLoading}
        />
      )}
    </div>
  )
}

/**
 * Modal component for sharing a pulse to other contexts
 */
interface SharePulseModalProps {
  pulse: PulseDetails
  onClose: () => void
  onShare: (
    pulseId: string,
    contextId: string
  ) => Promise<{ success: boolean; error?: string }>
  isLoading: boolean
}

interface ContextOption {
  value: string
  label: string
  spaceName: string
}

function SharePulseModal({
  pulse,
  onClose,
  onShare,
  isLoading,
}: SharePulseModalProps) {
  const [selectedContextId, setSelectedContextId] = useState('')
  const [shareMessage, setShareMessage] = useState('')

  // Fetch all contexts available to the user
  const { data: contextsData, loading: contextsLoading } = useQuery(
    GET_ALL_USER_CONTEXTS
  )

  // Filter out contexts where the pulse already exists and transform to options
  const contextOptions: ContextOption[] =
    contextsData?.fieldContexts
      .filter((context) => !pulse.contexts.some((pc) => pc.id === context.id))
      .map((context) => ({
        value: context.id,
        label: context.title,
        spaceName: context.space?.[0]?.name || 'Unknown Space',
      })) || []

  // Custom styles for react-select to match design system
  const customStyles: StylesConfig<ContextOption, false> = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor:
        'color-mix(in srgb, var(--gp-glass-bg) 80%, transparent)',
      borderColor: state.isFocused
        ? 'var(--gp-primary)'
        : 'var(--gp-glass-border)',
      borderRadius: '0.5rem',
      padding: '0.125rem',
      boxShadow: 'none',
      '&:hover': {
        borderColor: 'var(--gp-primary)',
      },
      cursor: 'pointer',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'var(--gp-surface)',
      border: '1px solid var(--gp-glass-border)',
      borderRadius: '0.5rem',
      boxShadow:
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
    }),
    menuList: (provided) => ({
      ...provided,
      padding: 0,
      maxHeight: '12rem',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? 'color-mix(in srgb, var(--gp-primary) 10%, transparent)'
        : state.isFocused
          ? 'var(--gp-glass-bg)'
          : 'transparent',
      color: state.isSelected ? 'var(--gp-primary)' : 'var(--gp-ink-strong)',
      padding: '0.75rem',
      cursor: 'pointer',
      '&:active': {
        backgroundColor:
          'color-mix(in srgb, var(--gp-primary) 20%, transparent)',
      },
    }),
    input: (provided) => ({
      ...provided,
      color: 'var(--gp-ink-strong)',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'var(--gp-ink-muted)',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'var(--gp-ink-strong)',
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      color: 'var(--gp-ink-muted)',
      padding: '0.75rem',
    }),
    loadingMessage: (provided) => ({
      ...provided,
      color: 'var(--gp-ink-muted)',
      padding: '0.75rem',
    }),
  }

  const handleShare = async () => {
    if (!selectedContextId) return

    const result = await onShare(pulse.id, selectedContextId)
    if (result.success) {
      setShareMessage('Pulse shared successfully!')
      setTimeout(() => {
        onClose()
        setShareMessage('')
      }, 2000)
    } else {
      setShareMessage(result.error || 'Failed to share pulse')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gp-surface dark:bg-gp-surface-dark border border-gp-glass-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gp-ink-strong">
            Share Pulse
          </h3>
          <button
            onClick={onClose}
            className="text-gp-ink-muted hover:text-gp-ink-strong transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div>
          <p className="text-sm text-gp-ink-muted mb-3">
            Select a context to share this pulse with. When shared, any
            resonances with pulses in that context will be discoverable.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-gp-ink-muted">
            Target Context
          </label>

          <Select<ContextOption>
            options={contextOptions}
            value={contextOptions.find(
              (opt) => opt.value === selectedContextId
            )}
            onChange={(option) => setSelectedContextId(option?.value || '')}
            isLoading={contextsLoading}
            isSearchable
            placeholder="Choose a context..."
            noOptionsMessage={() =>
              contextOptions.length === 0
                ? 'No additional contexts available'
                : 'No matching contexts found'
            }
            styles={customStyles}
            formatOptionLabel={(option) => (
              <div className="flex flex-col">
                <div className="font-medium text-gp-ink-strong">
                  {option.label}
                </div>
                <div className="text-xs text-gp-ink-muted">
                  {option.spaceName}
                </div>
              </div>
            )}
          />

          {contextOptions.length === 0 && !contextsLoading && (
            <p className="text-xs text-gp-ink-muted mt-2">
              No additional contexts available. Create more contexts to share
              this pulse.
            </p>
          )}
        </div>

        {shareMessage && (
          <div
            className={cn(
              'text-sm p-3 rounded-lg',
              shareMessage.includes('success')
                ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                : 'bg-red-500/20 text-red-700 dark:text-red-400'
            )}
          >
            {shareMessage}
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-gp-glass-border text-gp-ink-strong hover:bg-white/60 dark:hover:bg-white/5 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={!selectedContextId || isLoading}
            className="flex-1 px-4 py-2 rounded-lg bg-gp-primary text-white hover:opacity-90 disabled:opacity-50 transition-opacity text-sm font-medium flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin">
                  sync
                </span>
                Sharing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">check</span>
                Share
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
