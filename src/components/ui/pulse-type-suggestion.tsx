'use client'

import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { PULSE_TYPE_CONFIG, type NodeType } from '@/lib/pulse-type-config'
import { inferPulseType } from '@/lib/pulse-inference'
import { cn } from '@/lib/utils'
import { OfferingModal } from './offering-modal'
import { PulseTypeSelector } from './pulse-type-selector'

interface PulseTypeSuggestionProps {
  onSelect: (type: NodeType, name: string, content: string) => void
  onClose: () => void
  isOpen: boolean
  isEditing?: boolean
  initialType?: NodeType
  initialName?: string
  initialContent?: string
  onDelete?: () => void
  isLoading?: boolean
}

export function PulseTypeSuggestion({
  onSelect,
  onClose,
  isOpen,
  isEditing = false,
  initialType = 'goal',
  initialName = '',
  initialContent = '',
  onDelete,
  isLoading = false,
}: PulseTypeSuggestionProps) {
  const [selectedType, setSelectedType] = useState<NodeType>(initialType)
  const [suggestedType, setSuggestedType] = useState<NodeType | null>(null)
  const [userPickedType, setUserPickedType] = useState(false)
  const [editedName, setEditedName] = useState(initialName)
  const [nameTouched, setNameTouched] = useState(isEditing)
  const [editedContent, setEditedContent] = useState(initialContent)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Create mode: re-run the heuristic as the user writes, pre-selecting a
  // suggested type until they explicitly pick one. In edit mode the type is
  // fixed (a pulse's label can't change), so inference is skipped.
  useEffect(() => {
    if (isEditing) return
    const trimmed = editedContent.trim()
    if (!trimmed) {
      setSuggestedType(null)
      return
    }
    const inference = inferPulseType(trimmed)
    setSuggestedType(inference.type)
    if (!userPickedType) setSelectedType(inference.type)
    if (!nameTouched) setEditedName(inference.suggestedName)
  }, [editedContent, isEditing, userPickedType, nameTouched])

  // Animate in
  useEffect(() => {
    if (isOpen && containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power3.out' }
      )
    }
  }, [isOpen])

  const handlePickType = (type: NodeType) => {
    if (isLoading || isEditing) return
    setSelectedType(type)
    setUserPickedType(true)
  }

  const canSubmit = !isLoading && editedContent.trim().length > 0

  const handleConfirm = () => {
    if (!canSubmit) return
    onSelect(selectedType, editedName.trim() || 'Untitled Pulse', editedContent)
    // Don't close immediately - let parent handle closing after async operation
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete()
      setShowDeleteConfirm(false)
      onClose()
    }
  }

  if (!isOpen) return null

  const config = PULSE_TYPE_CONFIG[selectedType]

  return (
    <div
      ref={containerRef}
      className="w-full max-w-lg rounded-3xl overflow-hidden flex flex-col items-center bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.9),rgba(232,241,252,0.92))] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,30,0.95),rgba(10,10,15,0.98))] backdrop-blur-2xl border border-white/70 dark:border-white/10 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.45)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] relative"
    >
      {/* Gradient blobs */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#9fd6ff]/35 dark:bg-gp-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#b6cffc]/30 dark:bg-gp-accent-glow/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full p-6 sm:p-8 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-1 shadow-sm bg-[#d7ecff] dark:bg-gp-primary/20 text-[#1187e8] dark:text-gp-primary border border-white/70 dark:border-gp-primary/30">
            <span className="material-symbols-outlined text-sm">
              {isEditing ? 'edit' : 'auto_awesome'}
            </span>
            {isEditing ? 'Edit Mode' : 'New Pulse'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isEditing ? 'Edit' : 'Create'} {config.label} Pulse
          </h1>
          <p className="text-sm text-slate-500 dark:text-gp-ink-soft font-medium">
            {isEditing
              ? 'Update your pulse details below.'
              : 'Choose a type and describe what you want to share.'}
          </p>
        </div>

        {/* Type selector — always-visible, directly selectable */}
        <div className="w-full mb-6">
          <PulseTypeSelector
            selected={selectedType}
            onSelect={handlePickType}
            suggested={suggestedType}
            showSuggestionHint={!isEditing && !userPickedType}
            disabled={isEditing || isLoading}
          />
        </div>

        {/* Content + title fields */}
        <div className="w-full space-y-4 mb-8">
          {/* Content Field */}
          <div className="group relative rounded-xl overflow-hidden bg-[#e6edf5] dark:bg-black/40 border border-transparent dark:border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_25px_-18px_rgba(0,0,0,0.45)] dark:shadow-md">
            <div className="absolute left-4 top-4 text-[#7b8895] dark:text-gp-ink-soft pointer-events-none group-focus-within:text-gp-primary transition-colors">
              <span className="material-symbols-outlined text-xl">
                description
              </span>
            </div>
            <textarea
              autoFocus={!isEditing}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              disabled={isLoading}
              rows={4}
              className={cn(
                'w-full bg-transparent border-none py-4 pl-12 pr-4 text-base text-[#1f2a36] dark:text-white placeholder-[#7b8895] dark:placeholder-white/20 focus:ring-0 focus:outline-none selection:bg-gp-primary/20 resize-none',
                isLoading && 'opacity-60 cursor-not-allowed'
              )}
              placeholder="Speak your intention..."
            />
          </div>

          {/* Name Input */}
          <div className="group relative rounded-xl overflow-hidden bg-[#e6edf5] dark:bg-black/40 border border-transparent dark:border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_25px_-18px_rgba(0,0,0,0.45)] dark:shadow-md">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7b8895] dark:text-gp-ink-soft pointer-events-none group-focus-within:text-gp-primary transition-colors">
              <span className="material-symbols-outlined text-xl">edit</span>
            </div>
            <input
              type="text"
              value={editedName}
              onChange={(e) => {
                setEditedName(e.target.value)
                setNameTouched(true)
              }}
              disabled={isLoading}
              placeholder="Title or headline"
              className={cn(
                'w-full bg-transparent border-none py-4 pl-12 pr-12 text-center text-lg font-semibold text-[#1f2a36] dark:text-white placeholder-[#7b8895] dark:placeholder-white/20 focus:ring-0 focus:outline-none selection:bg-gp-primary/20',
                isLoading && 'opacity-60 cursor-not-allowed'
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <button
                onClick={() => {
                  setEditedName('')
                  setNameTouched(true)
                }}
                disabled={isLoading}
                className={cn(
                  'p-1.5 rounded-full hover:bg-white/80 dark:hover:bg-white/10 text-[#9aa6b2] dark:text-gp-ink-soft hover:text-[#1f2a36] dark:hover:text-white transition-colors',
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                )}
                title="Clear"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full gap-3">
          {isEditing && onDelete ? (
            <>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                className={cn(
                  'flex-1 h-12 rounded-xl border border-red-600/20 dark:border-red-600/30 bg-red-600/10 dark:bg-red-600/20 text-red-600 dark:text-red-400 text-sm font-semibold transition-all flex items-center justify-center gap-2 group hover:bg-red-600/20 dark:hover:bg-red-600/30 active:scale-95',
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
              >
                <span className="material-symbols-outlined text-lg">
                  delete
                </span>
                Delete
              </button>
              <button
                onClick={handleConfirm}
                disabled={!canSubmit}
                className={cn(
                  'flex-1 h-12 rounded-xl text-white text-sm font-bold shadow-lg shadow-gp-primary/30 dark:shadow-gp-primary/50 transition-all flex items-center justify-center gap-2 transform',
                  !canSubmit
                    ? 'bg-gp-primary/70 cursor-not-allowed'
                    : 'bg-gp-primary hover:bg-gp-primary/90 cursor-pointer active:scale-95'
                )}
              >
                <span
                  className={cn(
                    'material-symbols-outlined text-lg',
                    isLoading && 'animate-spin'
                  )}
                >
                  {isLoading ? 'hourglass_bottom' : 'check'}
                </span>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={!canSubmit}
              className={cn(
                'flex-1 h-12 rounded-xl text-white text-sm font-bold shadow-lg shadow-gp-primary/30 dark:shadow-gp-primary/50 transition-all flex items-center justify-center gap-2 transform',
                !canSubmit
                  ? 'bg-gp-primary/70 cursor-not-allowed'
                  : 'bg-gp-primary hover:bg-gp-primary/90 cursor-pointer active:scale-95'
              )}
            >
              <span
                className={cn(
                  'material-symbols-outlined text-lg',
                  isLoading && 'animate-spin'
                )}
              >
                {isLoading ? 'hourglass_bottom' : 'check'}
              </span>
              {isLoading ? 'Creating...' : 'Create Pulse'}
            </button>
          )}
        </div>
      </div>

      {/* Bottom divider */}
      <div className="h-1 w-full bg-white/40 dark:bg-white/10">
        <div className="h-full w-full bg-linear-to-r from-transparent via-[#0f8bf6] dark:via-gp-primary to-transparent opacity-60 animate-pulse" />
      </div>

      {/* Delete Confirmation Modal */}
      <OfferingModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        position="center"
      >
        <div className="relative z-10 w-full">
          {/* Modal Content */}
          <div className="glass-panel rounded-3xl p-8 md:p-12 border border-gp-glass-border dark:border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden">
            {/* Background Glow Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 dark:bg-red-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/20 dark:bg-red-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="flex flex-col items-center text-center relative z-10">
              {/* Icon */}
              <div className="mb-8 relative group">
                <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl" />
                <div className="size-16 rounded-full bg-linear-to-br from-red-100 to-red-50 dark:from-red-500/20 dark:to-red-500/10 border border-red-200 dark:border-red-500/30 flex items-center justify-center backdrop-blur-xl shadow-md dark:shadow-inner">
                  <span className="material-symbols-outlined text-3xl text-red-600 dark:text-red-400">
                    delete
                  </span>
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-3xl md:text-4xl font-light dark:font-extralight text-gp-ink-strong dark:text-white mb-2 tracking-tight leading-tight">
                Delete Pulse
              </h2>
              <p className="text-sm mb-8">
                <span className="text-red-700 dark:text-red-400">
                  Are you sure? This action cannot be undone. The pulse will be
                  permanently deleted.
                </span>
              </p>

              {/* Buttons */}
              <div className="flex gap-4 w-full">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 rounded-xl bg-gp-surface-soft dark:bg-gp-surface-strong text-gp-ink-strong dark:text-gp-ink-strong hover:bg-gp-surface-strong dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </OfferingModal>
    </div>
  )
}
