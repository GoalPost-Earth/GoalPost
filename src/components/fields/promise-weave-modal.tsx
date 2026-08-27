'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  getPulseTypeClass,
  getPulseTypeLabel,
} from './field-section-primitives'

export type WeavePulseOption = {
  id: string
  __typename: string
  title: string
}

export type WeavePersonOption = {
  id: string
  name: string
}

export type PromiseWeaveDraft = {
  title: string
  description: string
  pulseIds: string[]
  wovenForId: string | null
}

export type EditingWeave = PromiseWeaveDraft & { id: string }

interface PromiseWeaveModalProps {
  onClose: () => void
  /** Pulses in this field context — the candidates a weave can hold. */
  pulses: WeavePulseOption[]
  /** People attached to this field context — candidates for "woven for". */
  people: WeavePersonOption[]
  /** Populated in edit mode; null creates a new weave. */
  editingWeave?: EditingWeave | null
  onSubmit: (draft: PromiseWeaveDraft & { id?: string }) => Promise<void>
  onDelete?: () => Promise<void>
  isSubmitting?: boolean
}

const EMPTY_DRAFT: PromiseWeaveDraft = {
  title: '',
  description: '',
  pulseIds: [],
  wovenForId: null,
}

/**
 * Create / edit dialog for a PromiseWeave — the connective container that gives
 * a pulse a navigable neighbourhood (kb/01-glossary.md).
 *
 * A weave holds 1..n pulses, so the picker is a searchable multi-select rather
 * than the source/target pair the resonance modal uses. Server-side the write
 * is gated by the type's `@authorization` validate rules; this dialog is only
 * mounted for members who hold `canEditContent`.
 *
 * **Mount is the open/close control** — there is no `isOpen` prop. The draft is
 * seeded once from `editingWeave` at mount, so the caller must render this only
 * while the dialog is open and `key` it on the weave being edited. That keeps a
 * create from inheriting the previous edit's values without a re-seeding effect
 * (which cascades renders and is what `react-hooks/set-state-in-effect` flags).
 */
export function PromiseWeaveModal({
  onClose,
  pulses,
  people,
  editingWeave = null,
  onSubmit,
  onDelete,
  isSubmitting = false,
}: PromiseWeaveModalProps) {
  const isEditMode = !!editingWeave
  const [draft, setDraft] = useState<PromiseWeaveDraft>(() =>
    editingWeave ? { ...editingWeave } : EMPTY_DRAFT
  )
  const [pulseQuery, setPulseQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const visiblePulses = useMemo(() => {
    const query = pulseQuery.trim().toLowerCase()
    if (!query) return pulses
    return pulses.filter((pulse) =>
      `${pulse.title} ${getPulseTypeLabel(pulse.__typename)}`
        .toLowerCase()
        .includes(query)
    )
  }, [pulses, pulseQuery])

  const togglePulse = (pulseId: string) => {
    setDraft((current) => ({
      ...current,
      pulseIds: current.pulseIds.includes(pulseId)
        ? current.pulseIds.filter((id) => id !== pulseId)
        : [...current.pulseIds, pulseId],
    }))
  }

  const handleClose = () => {
    if (isSubmitting) return
    onClose()
  }

  // `onDelete` re-throws rather than toasting, because the modal is still
  // open and its inline error box is the right channel. Mirrors handleSubmit —
  // without the catch a rejected delete is an unhandled promise and the member
  // sees the confirm row simply do nothing.
  const handleDelete = async () => {
    if (isSubmitting || !onDelete) return
    setError(null)
    try {
      await onDelete()
    } catch (deleteError) {
      setConfirmingDelete(false)
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Could not delete the promise weave.'
      )
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting) return
    const title = draft.title.trim()
    if (!title) {
      setError('Give the weave a name so people can recognise it.')
      return
    }
    if (draft.pulseIds.length === 0) {
      setError('A weave holds at least one pulse — choose what it connects.')
      return
    }
    setError(null)
    try {
      await onSubmit({
        ...draft,
        title,
        description: draft.description.trim(),
        ...(isEditMode && editingWeave ? { id: editingWeave.id } : {}),
      })
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Could not save the promise weave.'
      )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-gp-glass-border bg-gp-surface-strong dark:bg-gp-surface-dark shadow-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-gp-primary text-[22px] shrink-0">
            account_tree
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gp-ink-strong dark:text-white">
              {isEditMode ? 'Edit promise weave' : 'New promise weave'}
            </h3>
            <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft mt-1">
              A weave gathers the pulses and the person a promise implicates, so
              its surroundings are navigable.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="weave-title"
            className="text-[10px] uppercase tracking-widest font-semibold text-gp-ink-muted dark:text-gp-ink-soft"
          >
            Name
          </label>
          <input
            id="weave-title"
            type="text"
            value={draft.title}
            onChange={(e) =>
              setDraft((current) => ({ ...current, title: e.target.value }))
            }
            placeholder="What is being promised here?"
            autoFocus
            className="w-full h-10 rounded-xl border border-gp-glass-border bg-gp-glass-bg px-3 text-sm text-gp-ink-strong dark:text-white placeholder:text-gp-ink-soft focus:outline-none focus:ring-2 focus:ring-gp-primary/50"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="weave-description"
            className="text-[10px] uppercase tracking-widest font-semibold text-gp-ink-muted dark:text-gp-ink-soft"
          >
            Why these belong together
          </label>
          <textarea
            id="weave-description"
            value={draft.description}
            onChange={(e) =>
              setDraft((current) => ({
                ...current,
                description: e.target.value,
              }))
            }
            rows={3}
            placeholder="Optional — what ties these pulses and this person together"
            className="w-full rounded-xl border border-gp-glass-border bg-gp-glass-bg px-3 py-2 text-sm text-gp-ink-strong dark:text-white placeholder:text-gp-ink-soft focus:outline-none focus:ring-2 focus:ring-gp-primary/50 resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-gp-ink-muted dark:text-gp-ink-soft">
              Pulses it weaves
            </span>
            <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft shrink-0">
              {draft.pulseIds.length} selected
            </span>
          </div>
          {pulses.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gp-glass-border px-3 py-3 text-xs text-gp-ink-muted dark:text-gp-ink-soft">
              This field has no pulses yet — add one first, then weave it.
            </p>
          ) : (
            <>
              <input
                type="search"
                value={pulseQuery}
                onChange={(e) => setPulseQuery(e.target.value)}
                placeholder="Filter pulses…"
                className="w-full h-9 rounded-xl border border-gp-glass-border bg-gp-glass-bg px-3 text-xs text-gp-ink-strong dark:text-white placeholder:text-gp-ink-soft focus:outline-none focus:ring-2 focus:ring-gp-primary/50"
              />
              <div className="max-h-48 overflow-y-auto rounded-xl border border-gp-glass-border divide-y divide-gp-glass-border">
                {visiblePulses.length === 0 ? (
                  <p className="px-3 py-3 text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                    No pulses match that filter.
                  </p>
                ) : (
                  visiblePulses.map((pulse) => {
                    const checked = draft.pulseIds.includes(pulse.id)
                    return (
                      <label
                        key={pulse.id}
                        className="flex items-center gap-2.5 px-3 py-2 cursor-pointer gp-menu-item"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePulse(pulse.id)}
                          className="size-4 shrink-0 accent-[var(--gp-primary)] cursor-pointer"
                        />
                        <span
                          className={cn(
                            'text-[9px] uppercase font-semibold shrink-0 w-16 truncate',
                            getPulseTypeClass(pulse.__typename)
                          )}
                        >
                          {getPulseTypeLabel(pulse.__typename)}
                        </span>
                        <span className="text-xs text-gp-ink-strong dark:text-white truncate min-w-0">
                          {pulse.title || 'Untitled'}
                        </span>
                      </label>
                    )
                  })
                )}
              </div>
            </>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="weave-person"
            className="text-[10px] uppercase tracking-widest font-semibold text-gp-ink-muted dark:text-gp-ink-soft"
          >
            Woven for
          </label>
          <select
            id="weave-person"
            value={draft.wovenForId ?? ''}
            onChange={(e) =>
              setDraft((current) => ({
                ...current,
                wovenForId: e.target.value || null,
              }))
            }
            className="w-full h-10 rounded-xl border border-gp-glass-border bg-gp-glass-bg px-3 text-sm text-gp-ink-strong dark:text-white focus:outline-none focus:ring-2 focus:ring-gp-primary/50 cursor-pointer"
          >
            <option value="">No one in particular</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-1">
          {isEditMode && onDelete && !confirmingDelete && (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              disabled={isSubmitting}
              className="sm:mr-auto px-4 h-9 rounded-full border border-destructive/30 bg-destructive/10 text-destructive text-sm font-semibold hover:bg-destructive/20 disabled:opacity-50 transition-colors cursor-pointer"
            >
              Delete
            </button>
          )}
          {isEditMode && onDelete && confirmingDelete && (
            <div className="sm:mr-auto flex items-center gap-2">
              <span className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                Delete this weave?
              </span>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={isSubmitting}
                className="px-3 h-8 rounded-full text-xs font-semibold text-gp-ink-muted hover:text-gp-ink-strong transition-colors cursor-pointer"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={isSubmitting}
                className="px-3 h-8 rounded-full bg-destructive text-white text-xs font-semibold hover:bg-destructive/90 disabled:opacity-50 transition-colors cursor-pointer"
              >
                Yes, delete
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 h-9 rounded-full text-sm font-semibold text-gp-ink-muted hover:text-gp-ink-strong transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || pulses.length === 0}
            className="px-4 h-9 rounded-full bg-gp-primary hover:bg-gp-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-md shadow-gp-primary/20 transition-all cursor-pointer"
          >
            {isSubmitting
              ? 'Saving…'
              : isEditMode
                ? 'Save weave'
                : 'Weave it'}
          </button>
        </div>
      </div>
    </div>
  )
}
