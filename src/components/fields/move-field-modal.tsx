'use client'

import { useMemo, useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { GET_FIELDS_FOR_SPACE } from '@/app/graphql/queries/FIELD_CONTEXT_QUERIES'
import { MOVE_FIELD_CONTEXT_MUTATION } from '@/app/graphql/mutations/FIELD_CONTEXT_MUTATIONS'

interface MoveFieldModalProps {
  isOpen: boolean
  onClose: () => void
  contextId: string
  contextTitle: string
  spaceId: string
  currentParentId: string | null
  /** Ids the client already knows cannot be a destination (self + direct
   *  children). Deeper descendants and depth violations are rejected
   *  server-side with a clear message. */
  excludedIds: string[]
  onMoved: () => Promise<unknown> | void
}

/**
 * "Move field" dialog (GOAL-295): re-parent the current FieldContext under
 * another field in the same Space, or lift it to the top level. The custom
 * `moveFieldContext` mutation enforces canEditContent, same-Space, cycle,
 * and depth invariants server-side and writes the activity Log — this
 * dialog only offers the choices.
 */
export function MoveFieldModal({
  isOpen,
  onClose,
  contextId,
  contextTitle,
  spaceId,
  currentParentId,
  excludedIds,
  onMoved,
}: MoveFieldModalProps) {
  const [selected, setSelected] = useState<string | null | undefined>(undefined)
  const [isMoving, setIsMoving] = useState(false)
  const { data, loading } = useQuery(GET_FIELDS_FOR_SPACE, {
    variables: { spaceId },
    skip: !isOpen || !spaceId,
  })
  const [moveFieldContext] = useMutation(MOVE_FIELD_CONTEXT_MUTATION)

  const candidates = useMemo(() => {
    const excluded = new Set(excludedIds)
    excluded.add(contextId)
    return [...(data?.fieldContexts ?? [])]
      .filter((ctx) => !excluded.has(ctx.id))
      .sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''))
  }, [data?.fieldContexts, excludedIds, contextId])

  if (!isOpen) return null

  // `undefined` = nothing picked yet; `null` = "Top level" picked.
  const pickedDestination = selected !== undefined
  const isNoOp = pickedDestination && (selected ?? null) === currentParentId

  const handleMove = async () => {
    if (!pickedDestination || isMoving || isNoOp) return
    setIsMoving(true)
    try {
      await moveFieldContext({
        variables: { contextId, newParentContextId: selected ?? null },
      })
      toast.success(
        selected
          ? `Moved "${contextTitle}" under the selected field.`
          : `Moved "${contextTitle}" to the top level.`
      )
      onClose()
      setSelected(undefined)
      await onMoved()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not move this field'
      )
    } finally {
      setIsMoving(false)
    }
  }

  const optionClass = (isActive: boolean) =>
    cn(
      'w-full flex items-center gap-2 min-w-0 rounded-xl border px-3 py-2 text-left text-sm transition-colors cursor-pointer',
      isActive
        ? 'border-gp-primary/60 bg-gp-primary/10 text-gp-ink-strong dark:text-white'
        : 'border-gp-glass-border bg-gp-glass-bg/40 text-gp-ink-muted hover:text-gp-ink-strong hover:bg-gp-glass-bg'
    )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[80vh] flex flex-col rounded-2xl border border-gp-glass-border bg-gp-surface-strong dark:bg-gp-surface-dark shadow-2xl p-5 sm:p-6 gap-4">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-gp-ink-strong dark:text-white">
            Move field
          </h3>
          <p className="text-xs text-gp-ink-muted mt-1 truncate">
            Choose where &quot;{contextTitle}&quot; should live in this space.
          </p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className={optionClass(pickedDestination && selected === null)}
          >
            <span
              className="material-symbols-outlined text-[18px] shrink-0"
              aria-hidden="true"
            >
              home
            </span>
            <span className="flex-1 min-w-0 truncate font-semibold">
              Top level
            </span>
            {currentParentId === null && (
              <span className="shrink-0 text-[10px] uppercase tracking-wider text-gp-ink-soft">
                current
              </span>
            )}
          </button>

          {loading ? (
            <p className="text-xs text-gp-ink-muted px-1 py-2">
              Loading fields…
            </p>
          ) : candidates.length === 0 ? (
            <p className="text-xs text-gp-ink-muted px-1 py-2">
              No other fields in this space to nest under.
            </p>
          ) : (
            candidates.map((ctx) => (
              <button
                key={ctx.id}
                type="button"
                onClick={() => setSelected(ctx.id)}
                className={optionClass(selected === ctx.id)}
              >
                <span
                  className="material-symbols-outlined text-[18px] shrink-0"
                  aria-hidden="true"
                >
                  category
                </span>
                <span className="flex-1 min-w-0 truncate">
                  {ctx.title || 'Untitled field'}
                </span>
                {currentParentId === ctx.id && (
                  <span className="shrink-0 text-[10px] uppercase tracking-wider text-gp-ink-soft">
                    current
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              onClose()
              setSelected(undefined)
            }}
            disabled={isMoving}
            className="px-4 h-9 rounded-full text-sm font-semibold text-gp-ink-muted hover:text-gp-ink-strong transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleMove()}
            disabled={!pickedDestination || isNoOp || isMoving}
            className="px-4 h-9 rounded-full bg-gp-primary hover:bg-gp-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-md shadow-gp-primary/20 transition-all cursor-pointer"
          >
            {isMoving ? 'Moving…' : 'Move'}
          </button>
        </div>
      </div>
    </div>
  )
}
