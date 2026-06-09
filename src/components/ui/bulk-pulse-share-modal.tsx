'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@apollo/client/react'
import Select, { StylesConfig } from 'react-select'
import { cn } from '@/lib/utils'
import { usePulseSharing } from '@/hooks/usePulseSharing'
import { GET_ALL_USER_CONTEXTS } from '@/app/graphql/queries/FIELD_CONTEXT_QUERIES'

type PulseType = 'goal' | 'resource' | 'story' | 'care' | 'coreValue'

interface PulseSummary {
  id: string
  title: string
  content: string
  type: PulseType
}

interface PulseOption {
  value: string
  label: string
  type: PulseType
}

interface ContextOption {
  value: string
  label: string
  spaceName: string
}

interface BulkPulseShareModalProps {
  isOpen: boolean
  onClose: () => void
  currentContextId: string
  pulses: PulseSummary[]
  /** Pulse ids to pre-select when the modal opens (e.g. from the Pulses
   *  section's per-pulse share or multi-select). Applied on the open
   *  transition only, so it never clobbers selections made inside the modal. */
  initialSelectedPulseIds?: string[]
  /** Which tab the modal opens on. Defaults to 'share'. */
  initialMode?: 'share' | 'move'
  onOperationComplete?: (
    details: BulkPulseOperationDetails
  ) => void | Promise<void>
}

export interface BulkPulseOperationDetails {
  mode: 'share' | 'move'
  successCount: number
}

const duplicateErrorPattern = /already exists|already linked|duplicate/i

const selectStyles: StylesConfig<PulseOption | ContextOption, true> = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'color-mix(in srgb, var(--gp-glass-bg) 80%, transparent)',
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
      backgroundColor: 'color-mix(in srgb, var(--gp-primary) 20%, transparent)',
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
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: 'color-mix(in srgb, var(--gp-primary) 12%, transparent)',
    border: '1px solid color-mix(in srgb, var(--gp-primary) 35%, transparent)',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: 'var(--gp-ink-strong)',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: 'var(--gp-ink-muted)',
    ':hover': {
      backgroundColor: 'color-mix(in srgb, var(--gp-primary) 12%, transparent)',
      color: 'var(--gp-primary)',
    },
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

export function BulkPulseShareModal({
  isOpen,
  onClose,
  currentContextId,
  pulses,
  initialSelectedPulseIds,
  initialMode,
  onOperationComplete,
}: BulkPulseShareModalProps) {
  const [mode, setMode] = useState<'share' | 'move'>('share')
  const [selectedPulses, setSelectedPulses] = useState<PulseOption[]>([])
  const [selectedContexts, setSelectedContexts] = useState<ContextOption[]>([])
  const [feedbackMessage, setFeedbackMessage] = useState('')

  // Apply the caller's pre-selection (and tab) only on the open transition.
  // Re-renders while open must not reset selections the user makes in the modal
  // — the `pulses` prop is re-mapped to a new array on every parent render, so
  // we gate on the rising edge of `isOpen` rather than on prop identity.
  const wasOpenRef = useRef(false)
  useEffect(() => {
    const justOpened = isOpen && !wasOpenRef.current
    wasOpenRef.current = isOpen
    if (!justOpened) return
    setMode(initialMode ?? 'share')
    // Reset transient state so a prior session's destination contexts / feedback
    // don't bleed into a fresh open (esp. important for 'move').
    setSelectedContexts([])
    setFeedbackMessage('')
    const ids = new Set(initialSelectedPulseIds ?? [])
    setSelectedPulses(
      ids.size
        ? pulses
            .filter((pulse) => ids.has(pulse.id))
            .map((pulse) => ({
              value: pulse.id,
              label:
                pulse.title?.trim() || pulse.content?.trim() || 'Untitled Pulse',
              type: pulse.type,
            }))
        : []
    )
  }, [isOpen, initialMode, initialSelectedPulseIds, pulses])

  const {
    sharePulseWithContext,
    removePulseFromContext,
    loading: isLoading,
  } = usePulseSharing()

  const { data: contextsData, loading: isContextsLoading } = useQuery(
    GET_ALL_USER_CONTEXTS,
    {
      skip: !isOpen,
    }
  )

  const pulseOptions = useMemo<PulseOption[]>(() => {
    return pulses.map((pulse) => ({
      value: pulse.id,
      label: pulse.title?.trim() || pulse.content?.trim() || 'Untitled Pulse',
      type: pulse.type,
    }))
  }, [pulses])

  const contextOptions = useMemo<ContextOption[]>(() => {
    return (
      contextsData?.fieldContexts
        ?.filter((context: { id: string }) => context.id !== currentContextId)
        .map(
          (context: {
            id: string
            title: string
            space?: Array<{ name?: string }>
          }) => ({
            value: context.id,
            label: context.title,
            spaceName: context.space?.[0]?.name || 'Unknown Space',
          })
        ) || []
    )
  }, [contextsData, currentContextId])

  const runBulkShare = async () => {
    if (selectedPulses.length === 0 || selectedContexts.length === 0) return

    const failures: string[] = []
    let successCount = 0

    for (const pulse of selectedPulses) {
      for (const context of selectedContexts) {
        const result = await sharePulseWithContext(pulse.value, context.value)
        if (result.success || duplicateErrorPattern.test(result.error || '')) {
          successCount += 1
          continue
        }
        failures.push(
          `${pulse.label.slice(0, 30)} -> ${context.label}: ${result.error || 'Failed to share'}`
        )
      }
    }

    if (successCount > 0) {
      await onOperationComplete?.({ mode: 'share', successCount })
    }

    if (failures.length === 0) {
      setFeedbackMessage(
        `Shared successfully across ${successCount} pulse-context link${successCount === 1 ? '' : 's'}.`
      )
      setTimeout(() => {
        setFeedbackMessage('')
        onClose()
      }, 1800)
      return
    }

    setFeedbackMessage(
      `Completed with ${failures.length} issue${failures.length === 1 ? '' : 's'}: ${failures.join(' | ')}`
    )
  }

  const runBulkMove = async () => {
    if (selectedPulses.length === 0 || selectedContexts.length === 0) return

    const failures: string[] = []
    let movedCount = 0

    for (const pulse of selectedPulses) {
      let destinationPresenceCount = 0

      for (const context of selectedContexts) {
        const shareResult = await sharePulseWithContext(
          pulse.value,
          context.value
        )
        if (
          shareResult.success ||
          duplicateErrorPattern.test(shareResult.error || '')
        ) {
          destinationPresenceCount += 1
          continue
        }

        failures.push(
          `${pulse.label.slice(0, 30)} -> ${context.label}: ${shareResult.error || 'Failed to copy into destination'}`
        )
      }

      if (destinationPresenceCount === 0) {
        failures.push(
          `${pulse.label.slice(0, 30)}: no destination context accepted this pulse`
        )
        continue
      }

      const removeResult = await removePulseFromContext(
        pulse.value,
        currentContextId
      )
      if (!removeResult.success) {
        failures.push(
          `${pulse.label.slice(0, 30)}: ${removeResult.error || 'Failed to remove from source context'}`
        )
        continue
      }

      movedCount += 1
    }

    if (movedCount > 0) {
      await onOperationComplete?.({ mode: 'move', successCount: movedCount })
    }

    if (failures.length === 0) {
      setFeedbackMessage(
        `Moved ${movedCount} pulse${movedCount === 1 ? '' : 's'} successfully.`
      )
      setTimeout(() => {
        setFeedbackMessage('')
        onClose()
      }, 1800)
      return
    }

    const movedPrefix =
      movedCount > 0
        ? `Moved ${movedCount} pulse${movedCount === 1 ? '' : 's'}. `
        : ''
    setFeedbackMessage(
      `${movedPrefix}${failures.length} issue${failures.length === 1 ? '' : 's'}: ${failures.join(' | ')}`
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gp-surface dark:bg-gp-surface-dark border border-gp-glass-border rounded-2xl shadow-2xl max-w-2xl w-full p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gp-ink-strong">
            Share Pulses
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer text-gp-ink-muted hover:text-gp-ink-strong transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="text-sm text-gp-ink-muted">
          {mode === 'share'
            ? 'Select multiple pulses and share them with multiple destination contexts in one action.'
            : 'Move selected pulses from the current context into one or more destination contexts.'}
        </p>

        <div className="flex gap-2 p-1 rounded-lg bg-gp-glass-bg border border-gp-glass-border">
          <button
            onClick={() => {
              setMode('share')
              setFeedbackMessage('')
            }}
            className={cn(
              'cursor-pointer flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              mode === 'share'
                ? 'bg-gp-primary text-white'
                : 'text-gp-ink-strong hover:bg-white/50 dark:hover:bg-white/5'
            )}
          >
            Share
          </button>
          <button
            onClick={() => {
              setMode('move')
              setFeedbackMessage('')
            }}
            className={cn(
              'cursor-pointer flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              mode === 'move'
                ? 'bg-gp-primary text-white'
                : 'text-gp-ink-strong hover:bg-white/50 dark:hover:bg-white/5'
            )}
          >
            Move
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-gp-ink-muted">
              Pulses
            </label>
            <Select<PulseOption, true>
              options={pulseOptions}
              value={selectedPulses}
              onChange={(options) =>
                setSelectedPulses(options ? [...options] : [])
              }
              isMulti
              isSearchable
              closeMenuOnSelect={false}
              placeholder="Select one or more pulses..."
              noOptionsMessage={() =>
                pulseOptions.length === 0
                  ? 'No pulses available in this context'
                  : 'No matching pulses found'
              }
              styles={
                selectStyles as unknown as StylesConfig<PulseOption, true>
              }
              formatOptionLabel={(option) => (
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-gp-ink-strong truncate">
                    {option.label}
                  </span>
                  <span className="text-[11px] uppercase text-gp-ink-muted">
                    {option.type}
                  </span>
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-gp-ink-muted">
              Destination Contexts
            </label>
            <Select<ContextOption, true>
              options={contextOptions}
              value={selectedContexts}
              onChange={(options) =>
                setSelectedContexts(options ? [...options] : [])
              }
              isLoading={isContextsLoading}
              isMulti
              isSearchable
              closeMenuOnSelect={false}
              placeholder="Select one or more contexts..."
              noOptionsMessage={() =>
                contextOptions.length === 0
                  ? 'No destination contexts available'
                  : 'No matching contexts found'
              }
              styles={
                selectStyles as unknown as StylesConfig<ContextOption, true>
              }
              formatOptionLabel={(option) => (
                <div className="flex flex-col">
                  <span className="font-medium text-gp-ink-strong">
                    {option.label}
                  </span>
                  <span className="text-xs text-gp-ink-muted">
                    {option.spaceName}
                  </span>
                </div>
              )}
            />
          </div>
        </div>

        {feedbackMessage && (
          <div
            className={cn(
              'text-sm p-3 rounded-lg',
              feedbackMessage.includes('success') ||
                feedbackMessage.includes('Moved')
                ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                : 'bg-red-500/20 text-red-700 dark:text-red-400'
            )}
          >
            {feedbackMessage}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="cursor-pointer flex-1 px-4 py-2 rounded-lg border border-gp-glass-border text-gp-ink-strong hover:bg-white/60 dark:hover:bg-white/5 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={mode === 'share' ? runBulkShare : runBulkMove}
            disabled={
              selectedPulses.length === 0 ||
              selectedContexts.length === 0 ||
              isLoading
            }
            className="cursor-pointer flex-1 px-4 py-2 rounded-lg bg-gp-primary text-white hover:opacity-90 disabled:opacity-50 transition-opacity text-sm font-medium flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin">
                  sync
                </span>
                Processing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">
                  {mode === 'share' ? 'share' : 'drive_file_move'}
                </span>
                {mode === 'share' ? 'Share' : 'Move'}
                {selectedPulses.length > 0 && selectedContexts.length > 0
                  ? ` (${selectedPulses.length} x ${selectedContexts.length})`
                  : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
