'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCollectedEntities } from '@/hooks/use-collected-entities'
import { MAX_PIVOT_ENTITIES } from '@/lib/simulation/entity-collector'
import { saveFocusEntities } from '@/lib/simulation/focus-entities-storage'
import { useStudioPanes, type StudioMode } from '@/components/studio'

/**
 * Footer strip rendered above the chat composer. Surfaces every entity the
 * assistant has discussed in this thread (focal entities the user visited +
 * entities returned by tool calls) and lets the user pivot the conversation
 * into another mode of the studio, carrying the focus along via
 * `?focus=Type:id,...` on `/protected`.
 *
 * Renders nothing until at least one entity has been collected — the strip
 * should never push the composer down on empty threads.
 */
export function AIAssistantPivotFooter({
  onPivot,
}: {
  /** Optional callback fired before mode switch (e.g. close the panel). */
  onPivot?: () => void
}) {
  const router = useRouter()
  const { focusedPane, setPaneMode } = useStudioPanes()
  const entities = useCollectedEntities()

  if (entities.length === 0) return null

  const overflow = Math.max(0, entities.length - MAX_PIVOT_ENTITIES)

  const pivot = (targetMode: StudioMode) => {
    const focus = saveFocusEntities(entities)
    onPivot?.()
    router.push(`/protected?focus=${encodeURIComponent(focus)}`)
    setPaneMode(focusedPane, targetMode)
  }

  return (
    <div className="border-t border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/5 backdrop-blur-md px-4 py-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-600 dark:text-white/60">
          <span className="font-medium text-slate-800 dark:text-white/80">
            {entities.length}
          </span>{' '}
          {entities.length === 1 ? 'entity' : 'entities'} in this thread
          {overflow > 0 ? (
            <span className="text-slate-400 dark:text-white/40">
              {' '}
              (showing first {MAX_PIVOT_ENTITIES})
            </span>
          ) : null}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={() => pivot('graph')}
          >
            <span className="material-symbols-outlined text-[14px] mr-1">
              hub
            </span>
            Open in graph
          </Button>
          <Button
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => pivot('dashboard')}
          >
            <span className="material-symbols-outlined text-[14px] mr-1">
              dashboard
            </span>
            Open in dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
