'use client'

import { useState, useMemo, useEffect } from 'react'
import { Dialog, DialogContent, DialogPortal } from '@/components/ui/dialog'
import ReactSelect from 'react-select'

export interface PulseOption {
  id: string
  title: string
  content: string
  type: 'goal' | 'resource' | 'story' | 'care' | 'coreValue'
}

/**
 * Create a manual ResonanceLink between two pulses in the same FieldContext.
 *
 * Creation only. Editing an existing resonance (label + description) and
 * deleting one both live in the entity info drawer —
 * `entity-info-drawer/resonance-details-body.tsx` — which is what clicking a
 * resonance card opens. This modal deliberately has no edit mode; it carried
 * one until the drawer took over, after which the branch was unreachable.
 */
interface ResonanceLinkModalProps {
  isOpen: boolean
  onClose: () => void
  pulses: PulseOption[]
  onSubmit: (data: {
    label: string
    confidence: number
    description: string
    sourceId: string
    targetId: string
    sourceType: 'goal' | 'resource' | 'story' | 'care' | 'coreValue'
    targetType: 'goal' | 'resource' | 'story' | 'care' | 'coreValue'
  }) => Promise<void>
  isLoading?: boolean
}

export function ResonanceLinkModal({
  isOpen,
  onClose,
  pulses,
  onSubmit,
  isLoading = false,
}: ResonanceLinkModalProps) {
  const [sourceId, setSourceId] = useState<string>('')
  const [targetId, setTargetId] = useState<string>('')
  const [label, setLabel] = useState<string>('Complements')
  const [confidence, setConfidence] = useState<number>(0.75)
  const [description, setDescription] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isDark, setIsDark] = useState(false)

  // Detect dark mode on mount
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [])

  // React-select styles
  const selectStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      borderColor: isDark ? '#444444' : '#e0e0e0',
      color: isDark ? '#ffffff' : '#000000',
      minHeight: '40px',
      borderRadius: '8px',
      boxShadow: 'none',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      opacity: isLoading ? 0.5 : 1,
      '&:hover': {
        borderColor: isDark ? '#666666' : '#d0d0d0',
      },
      '&:focus-within': {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 1px #3b82f6',
      },
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      border: `1px solid ${isDark ? '#444444' : '#e0e0e0'}`,
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 50,
    }),
    menuList: (base: any) => ({
      ...base,
      padding: '4px 0',
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#3b82f6'
        : state.isFocused
          ? isDark
            ? '#333333'
            : '#f5f5f5'
          : isDark
            ? '#1a1a1a'
            : '#ffffff',
      color: state.isSelected ? '#ffffff' : isDark ? '#ffffff' : '#000000',
      padding: '8px 12px',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: '#3b82f6',
      },
    }),
    input: (base: any) => ({
      ...base,
      color: isDark ? '#ffffff' : '#000000',
    }),
    placeholder: (base: any) => ({
      ...base,
      color: isDark ? '#888888' : '#999999',
    }),
    singleValue: (base: any) => ({
      ...base,
      color: isDark ? '#ffffff' : '#000000',
    }),
    clearIndicator: (base: any) => ({
      ...base,
      color: isDark ? '#888888' : '#999999',
      cursor: 'pointer',
      '&:hover': {
        color: isDark ? '#ffffff' : '#000000',
      },
    }),
    dropdownIndicator: (base: any) => ({
      ...base,
      color: isDark ? '#888888' : '#999999',
      '&:hover': {
        color: isDark ? '#ffffff' : '#000000',
      },
    }),
  }

  // Filter out selected source from target options and vice versa
  const targetOptions = useMemo(
    () => (sourceId ? pulses.filter((p) => p.id !== sourceId) : pulses),
    [pulses, sourceId]
  )

  const sourceOptions = useMemo(
    () => (targetId ? pulses.filter((p) => p.id !== targetId) : pulses),
    [pulses, targetId]
  )

  const isValid = sourceId && targetId && label.trim()

  const resetForm = () => {
    setSourceId('')
    setTargetId('')
    setLabel('Complements')
    setConfidence(0.75)
    setDescription('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!isValid) {
      setError(
        'Please select both source and target pulses and provide a label'
      )
      return
    }

    try {
      const sourcePulse = pulses.find((p) => p.id === sourceId)
      const targetPulse = pulses.find((p) => p.id === targetId)

      if (!sourcePulse || !targetPulse) {
        setError('Could not find source or target pulse')
        return
      }

      await onSubmit({
        label,
        confidence,
        description,
        sourceId,
        targetId,
        sourceType: sourcePulse.type,
        targetType: targetPulse.type,
      })
      setSuccess(true)

      // Reset form
      setTimeout(() => {
        resetForm()
        setSuccess(false)
        onClose()
      }, 1500)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create resonance link'
      )
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      resetForm()
      setError(null)
      setSuccess(false)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogPortal>
        <DialogContent
          showCloseButton={false}
          className="flex justify-center gap-0 border-0 bg-transparent p-0 shadow-none"
        >
          <div className="w-full max-w-160 px-4 animate-fade-in-up">
            <form
              onSubmit={handleSubmit}
              className="bg-gp-surface dark:bg-gp-surface-dark rounded-2xl border border-gp-glass-border p-6 shadow-lg"
            >
              <h2 className="text-xl font-semibold text-gp-ink-strong dark:text-gp-ink-strong mb-6">
                Create Resonance Link
              </h2>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 rounded-lg bg-green-500/10 dark:bg-green-500/20 border border-green-500/30 text-green-700 dark:text-green-300 text-sm">
                  Resonance link created successfully!
                </div>
              )}

              <div className="space-y-4">
                {/* Source Pulse */}
                <div>
                  <label className="block text-sm font-medium text-gp-ink-muted dark:text-gp-ink-soft mb-2">
                    Source Pulse
                  </label>
                  <ReactSelect
                    options={sourceOptions.map((pulse) => ({
                      value: pulse.id,
                      label: pulse.title || pulse.content.substring(0, 50),
                    }))}
                    value={
                      sourceId
                        ? {
                            value: sourceId,
                            label:
                              sourceOptions.find((p) => p.id === sourceId)
                                ?.title ||
                              sourceOptions
                                .find((p) => p.id === sourceId)
                                ?.content.substring(0, 50) ||
                              '',
                          }
                        : null
                    }
                    onChange={(option) => setSourceId(option?.value || '')}
                    isDisabled={isLoading}
                    isClearable={true}
                    isSearchable={true}
                    placeholder="Select source pulse..."
                    styles={selectStyles}
                  />
                </div>

                {/* Target Pulse */}
                <div>
                  <label className="block text-sm font-medium text-gp-ink-muted dark:text-gp-ink-soft mb-2">
                    Target Pulse
                  </label>
                  <ReactSelect
                    options={targetOptions.map((pulse) => ({
                      value: pulse.id,
                      label: pulse.title || pulse.content.substring(0, 50),
                    }))}
                    value={
                      targetId
                        ? {
                            value: targetId,
                            label:
                              targetOptions.find((p) => p.id === targetId)
                                ?.title ||
                              targetOptions
                                .find((p) => p.id === targetId)
                                ?.content.substring(0, 50) ||
                              '',
                          }
                        : null
                    }
                    onChange={(option) => setTargetId(option?.value || '')}
                    isDisabled={isLoading}
                    isClearable={true}
                    isSearchable={true}
                    placeholder="Select target pulse..."
                    styles={selectStyles}
                  />
                </div>

                {/* Label */}
                <div>
                  <label className="block text-sm font-medium text-gp-ink-muted dark:text-gp-ink-soft mb-2">
                    Relationship Label
                  </label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g., Complements, Conflicts, Supports"
                    disabled={isLoading}
                    className="w-full px-3 py-2 rounded-lg bg-gp-surface-alt dark:bg-gp-surface-alt-dark border border-gp-glass-border text-gp-ink-strong dark:text-gp-ink-strong placeholder-gp-ink-muted dark:placeholder-gp-ink-muted focus:outline-none focus:border-gp-primary/50 disabled:opacity-50"
                  />
                </div>

                {/* Confidence */}
                <div>
                  <label className="block text-sm font-medium text-gp-ink-muted dark:text-gp-ink-soft mb-2">
                    Confidence: {(confidence * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={confidence}
                    onChange={(e) => setConfidence(parseFloat(e.target.value))}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gp-ink-muted dark:text-gp-ink-soft mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explain why these pulses resonate together..."
                    disabled={isLoading}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-gp-surface-alt dark:bg-gp-surface-alt-dark border border-gp-glass-border text-gp-ink-strong dark:text-gp-ink-strong placeholder-gp-ink-muted dark:placeholder-gp-ink-muted focus:outline-none focus:border-gp-primary/50 disabled:opacity-50 resize-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-lg bg-gp-surface-alt dark:bg-gp-surface-alt-dark border border-gp-glass-border text-gp-ink-strong dark:text-gp-ink-strong hover:bg-gp-surface-alt/80 dark:hover:bg-gp-surface-alt-dark/80 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isValid || isLoading}
                  className="flex-1 px-4 py-2 rounded-lg bg-gp-primary text-white hover:bg-gp-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isLoading ? 'Creating...' : 'Create Link'}
                </button>
              </div>
            </form>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
