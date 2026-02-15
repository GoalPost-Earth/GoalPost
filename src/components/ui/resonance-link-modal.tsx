'use client'

import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Dialog, DialogContent, DialogPortal } from '@/components/ui/dialog'
import ReactSelect from 'react-select'
import { cn } from '@/lib/utils'

export interface PulseOption {
  id: string
  title: string
  content: string
  type: 'goal' | 'resource' | 'story' | 'care' | 'coreValue'
}

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
    sourceType: 'goal' | 'resource' | 'story'
    targetType: 'goal' | 'resource' | 'story'
    resonanceId?: string
  }) => Promise<void>
  isLoading?: boolean
  onDelete?: () => Promise<void>
  editingResonance?: {
    id: string
    label: string
    confidence: number
    description: string
    sourceId: string
    targetId: string
    sourceType: 'goal' | 'resource' | 'story'
    targetType: 'goal' | 'resource' | 'story'
  } | null
}

export function ResonanceLinkModal({
  isOpen,
  onClose,
  pulses,
  onSubmit,
  isLoading = false,
  onDelete,
  editingResonance = null,
}: ResonanceLinkModalProps) {
  const isEditMode = !!editingResonance
  const [sourceId, setSourceId] = useState<string>(
    editingResonance?.sourceId || ''
  )
  const [targetId, setTargetId] = useState<string>(
    editingResonance?.targetId || ''
  )
  const [label, setLabel] = useState<string>(
    editingResonance?.label || 'Complements'
  )
  const [confidence, setConfidence] = useState<number>(
    editingResonance?.confidence ?? 0.75
  )
  const [description, setDescription] = useState<string>(
    editingResonance?.description || ''
  )
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
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

  // Reset form when editing resonance changes
  useEffect(() => {
    if (editingResonance) {
      setSourceId(editingResonance.sourceId)
      setTargetId(editingResonance.targetId)
      setLabel(editingResonance.label)
      setConfidence(editingResonance.confidence)
      setDescription(editingResonance.description)
      setError(null)
      setSuccess(false)
    }
  }, [editingResonance])

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
        ...(isEditMode && editingResonance
          ? { resonanceId: editingResonance.id }
          : {}),
      })
      setSuccess(true)

      // Reset form
      setTimeout(() => {
        setSourceId('')
        setTargetId('')
        setLabel('Complements')
        setConfidence(0.75)
        setDescription('')
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
    // Don't close if delete confirmation is showing
    if (showDeleteConfirm) {
      return
    }

    if (!isLoading) {
      setSourceId('')
      setTargetId('')
      setLabel('Complements')
      setConfidence(0.75)
      setDescription('')
      setError(null)
      setSuccess(false)
      setShowDeleteConfirm(false)
      onClose()
    }
  }

  const handleDelete = async () => {
    if (!onDelete) {
      setError('Delete function not available')
      return
    }

    try {
      // Close confirmation first to prevent re-renders
      setShowDeleteConfirm(false)
      await onDelete()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete resonance link'
      )
    }
  }

  return (
    <>
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
                  {isEditMode ? 'Edit Resonance Link' : 'Create Resonance Link'}
                </h2>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 text-red-700 dark:text-red-300 text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 rounded-lg bg-green-500/10 dark:bg-green-500/20 border border-green-500/30 text-green-700 dark:text-green-300 text-sm">
                    {isEditMode
                      ? 'Resonance link updated successfully!'
                      : 'Resonance link created successfully!'}
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
                      isDisabled={isLoading || isEditMode}
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
                      isDisabled={isLoading || isEditMode}
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
                      onChange={(e) =>
                        setConfidence(parseFloat(e.target.value))
                      }
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
                  {isEditMode && onDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteConfirm(true)
                      }}
                      disabled={isLoading}
                      className="px-4 py-2 rounded-lg bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 text-red-700 dark:text-red-300 hover:bg-red-500/20 dark:hover:bg-red-500/30 disabled:opacity-50 transition-colors"
                    >
                      Delete
                    </button>
                  )}
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
                    {isLoading
                      ? isEditMode
                        ? 'Updating...'
                        : 'Creating...'
                      : isEditMode
                        ? 'Update Link'
                        : 'Create Link'}
                  </button>
                </div>
              </form>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* Delete Confirmation Modal - Rendered via portal at document root */}
      {showDeleteConfirm &&
        typeof window !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center pointer-events-auto"
            style={{
              zIndex: 9999,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
            }}
            onMouseDown={(e) => {
              // Prevent any event from reaching the Dialog below
              e.stopPropagation()
            }}
            onClick={(e) => {
              e.stopPropagation()
              // Close on backdrop click
              if (e.target === e.currentTarget) {
                setShowDeleteConfirm(false)
              }
            }}
          >
            <div
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl pointer-events-auto"
              style={{ position: 'relative', zIndex: 10000 }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Delete Resonance Link?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                This will permanently delete this resonance link. This action
                cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    setShowDeleteConfirm(false)
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  disabled={isLoading}
                  style={{
                    pointerEvents: 'auto',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    handleDelete()
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  disabled={isLoading}
                  style={{
                    pointerEvents: 'auto',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
