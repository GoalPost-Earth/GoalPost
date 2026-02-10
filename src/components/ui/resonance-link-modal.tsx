'use client'

import { useState, useMemo, useEffect } from 'react'
import { Dialog, DialogContent, DialogPortal } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface PulseOption {
  id: string
  title: string
  content: string
  type: 'goal' | 'resource' | 'story'
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
    if (!isLoading) {
      setSourceId('')
      setTargetId('')
      setLabel('Complements')
      setConfidence(0.75)
      setDescription('')
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
                  <Select
                    value={sourceId}
                    onValueChange={setSourceId}
                    disabled={isLoading || isEditMode}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select source pulse..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceOptions.map((pulse) => (
                        <SelectItem key={pulse.id} value={pulse.id}>
                          {pulse.title || pulse.content.substring(0, 50)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Target Pulse */}
                <div>
                  <label className="block text-sm font-medium text-gp-ink-muted dark:text-gp-ink-soft mb-2">
                    Target Pulse
                  </label>
                  <Select
                    value={targetId}
                    onValueChange={setTargetId}
                    disabled={isLoading || isEditMode}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select target pulse..." />
                    </SelectTrigger>
                    <SelectContent>
                      {targetOptions.map((pulse) => (
                        <SelectItem key={pulse.id} value={pulse.id}>
                          {pulse.title || pulse.content.substring(0, 50)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
  )
}
