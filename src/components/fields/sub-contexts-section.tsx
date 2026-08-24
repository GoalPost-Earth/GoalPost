'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { CREATE_SUB_FIELD_CONTEXT_MUTATION } from '@/app/graphql/mutations/FIELD_CONTEXT_MUTATIONS'

export interface SubContextSummary {
  id: string
  title: string
  emergentName?: string | null
  createdAt?: string | null
  pulseCount: number
  subContextCount: number
}

interface SubContextsSectionProps {
  parentContextId: string
  parentTitle: string
  subContexts: SubContextSummary[]
  /** Me = warm amber accents, We = cool teal — mirrors the page hero. */
  isMe: boolean
  /** canEditContent on the parent Space — gates the create affordance. */
  canEdit: boolean
  onChanged: () => Promise<unknown> | void
}

/**
 * "Nested fields" section on the field-context detail page (GOAL-295).
 * Lists the direct nested sub-contexts as drill-down rows and offers a
 * "New nested field" dialog. The create mutation is the custom
 * `createSubFieldContext` — the server enforces canEditContent, the depth
 * cap, and writes the activity Log; the button here is only a "don't show
 * a control the user cannot use" gate, never a security boundary.
 */
export function SubContextsSection({
  parentContextId,
  parentTitle,
  subContexts,
  isMe,
  canEdit,
  onChanged,
}: SubContextsSectionProps) {
  const router = useRouter()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createSubFieldContext] = useMutation(CREATE_SUB_FIELD_CONTEXT_MUTATION)

  if (subContexts.length === 0 && !canEdit) return null

  const accentText = isMe
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-teal-600 dark:text-teal-400'

  const handleCreate = async () => {
    const trimmed = title.trim()
    if (!trimmed || isCreating) return
    setIsCreating(true)
    try {
      await createSubFieldContext({
        variables: { parentContextId, title: trimmed },
      })
      toast.success(`Nested field "${trimmed}" created.`)
      setIsCreateOpen(false)
      setTitle('')
      await onChanged()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not create nested field'
      )
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gp-glass-border bg-gp-glass-bg/40 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3 min-w-0">
        <span
          className={cn('material-symbols-outlined text-[20px]', accentText)}
          aria-hidden="true"
        >
          account_tree
        </span>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gp-ink-strong dark:text-white truncate">
          Nested fields
          {subContexts.length > 0 ? ` (${subContexts.length})` : ''}
        </h2>
        {canEdit && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="ml-auto shrink-0 inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-gp-primary hover:bg-gp-primary/90 text-white font-semibold text-xs shadow-md shadow-gp-primary/20 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span className="hidden sm:inline">New nested field</span>
            <span className="sm:hidden">New</span>
          </button>
        )}
      </div>

      {subContexts.length === 0 ? (
        <p className="text-xs text-gp-ink-muted">
          Organize a growing field into nested fields — pulses stay part of the
          whole field&apos;s resonance.
        </p>
      ) : (
        <ul className="space-y-2">
          {subContexts.map((sub) => (
            <li key={sub.id}>
              <button
                type="button"
                onClick={() =>
                  router.push(`/protected/dashboard/field-context/${sub.id}`)
                }
                className={cn(
                  'w-full flex items-center gap-3 min-w-0 rounded-xl border px-3 py-2.5 text-left transition-all cursor-pointer',
                  'hover:-translate-y-0.5 hover:shadow-md',
                  isMe
                    ? 'border-amber-300/30 dark:border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10'
                    : 'border-teal-300/30 dark:border-teal-500/20 bg-teal-500/5 hover:bg-teal-500/10'
                )}
              >
                <span
                  className={cn(
                    'material-symbols-outlined text-[20px] shrink-0',
                    accentText
                  )}
                  aria-hidden="true"
                >
                  category
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-gp-ink-strong dark:text-white truncate">
                    {sub.title || 'Untitled field'}
                  </span>
                  {sub.emergentName && (
                    <span className="block text-[11px] italic text-gp-ink-muted truncate">
                      &quot;{sub.emergentName}&quot;
                    </span>
                  )}
                </span>
                <span className="shrink-0 flex items-center gap-2 text-[11px] text-gp-ink-muted">
                  <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">
                      graphic_eq
                    </span>
                    {sub.pulseCount}
                  </span>
                  {sub.subContextCount > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">
                        account_tree
                      </span>
                      {sub.subContextCount}
                    </span>
                  )}
                </span>
                <span
                  className="material-symbols-outlined text-[18px] text-gp-ink-soft shrink-0"
                  aria-hidden="true"
                >
                  chevron_right
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gp-glass-border bg-gp-surface-strong dark:bg-gp-surface-dark shadow-2xl p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-gp-ink-strong dark:text-white">
                New nested field
              </h3>
              <p className="text-xs text-gp-ink-muted mt-1 truncate">
                Nested inside &quot;{parentTitle}&quot;
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
                onClick={() => {
                  setIsCreateOpen(false)
                  setTitle('')
                }}
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
      )}
    </div>
  )
}
