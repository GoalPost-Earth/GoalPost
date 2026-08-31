'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { CREATE_SUB_FIELD_CONTEXT_MUTATION } from '@/app/graphql/mutations/FIELD_CONTEXT_MUTATIONS'

interface CreateNestedFieldModalProps {
  isOpen: boolean
  /** FieldContext.id the new nested field is created under. */
  parentContextId: string
  /** Parent's display title for the "Nested inside …" hint. */
  parentTitle?: string | null
  onClose: () => void
  /**
   * Awaited after a successful create, before the dialog closes, so the
   * caller's refresh has landed and the new field is on screen when the
   * dialog dismisses. A rejected refresh only warns — the create itself
   * already succeeded and the server has the data.
   */
  onCreated?: () => Promise<unknown> | void
}

/**
 * "New nested field" dialog. Owns the title input and the custom
 * `createSubFieldContext` mutation — the server enforces canEditContent,
 * the same-Space / no-cycle / depth-cap invariants, and writes the activity
 * Log in the same transaction (callers must not log again).
 *
 * Shared between the field-context detail page's Nested fields section and
 * the studio canvas action bar, so the dashboard and graph canvas create
 * flows cannot drift.
 */
export function CreateNestedFieldModal({
  isOpen,
  parentContextId,
  parentTitle,
  onClose,
  onCreated,
}: CreateNestedFieldModalProps) {
  const [title, setTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createSubFieldContext] = useMutation(CREATE_SUB_FIELD_CONTEXT_MUTATION)

  if (!isOpen) return null

  const handleCancel = () => {
    if (isCreating) return
    setTitle('')
    onClose()
  }

  const handleCreate = async () => {
    const trimmed = title.trim()
    if (!trimmed || isCreating) return
    setIsCreating(true)
    try {
      await createSubFieldContext({
        variables: { parentContextId, title: trimmed },
      })
      toast.success(`Nested field "${trimmed}" created.`)
      // Hold the pending state through the caller's refresh so the dialog
      // only dismisses once the new field is actually visible behind it.
      try {
        await onCreated?.()
      } catch (error) {
        console.warn(
          '[create-nested-field] post-create refresh failed',
          error
        )
      }
      setTitle('')
      onClose()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not create nested field'
      )
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-gp-glass-border bg-gp-surface-strong dark:bg-gp-surface-dark shadow-2xl p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-gp-ink-strong dark:text-white">
            New nested field
          </h3>
          <p className="text-xs text-gp-ink-muted mt-1 truncate">
            {parentTitle
              ? `Nested inside "${parentTitle}"`
              : 'Nested inside this field'}
          </p>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void handleCreate()
          }}
          placeholder="Nested field title"
          autoFocus
          className="w-full h-10 rounded-xl border border-gp-glass-border bg-gp-glass-bg px-3 text-sm text-gp-ink-strong dark:text-white placeholder:text-gp-ink-soft focus:outline-none focus:ring-2 focus:ring-gp-primary/50"
        />
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isCreating}
            className="px-4 h-9 rounded-full text-sm font-semibold text-gp-ink-muted hover:text-gp-ink-strong transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleCreate()}
            disabled={!title.trim() || isCreating}
            className="px-4 h-9 rounded-full bg-gp-primary hover:bg-gp-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-md shadow-gp-primary/20 transition-all cursor-pointer"
          >
            {isCreating ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
