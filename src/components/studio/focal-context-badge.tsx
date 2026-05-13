'use client'

import { useSyncExternalStore, type FC } from 'react'
import { cn } from '@/lib/utils'
import { useFocalEntity } from '@/contexts'
import type { FocalEntityType } from '@/lib/focal-entity/types'
import { getCachedLabel } from '@/lib/focal-entity/label-cache'
import { useStudioMode, type StudioMode } from './studio-mode-context'

// Client-only render gate. `FocalEntityProvider` reads localStorage in its
// lazy initializer, so the focal entity differs between SSR (always null)
// and the first client paint (whatever was persisted). Suppress the entire
// badge during SSR + hydration and render only after mount — avoids a
// hydration mismatch without weakening the provider's persistence.
const NOOP_SUBSCRIBE = () => () => {}
const GET_TRUE = () => true
const GET_FALSE = () => false

interface TypeStyle {
  label: string
  dotClass: string
}

const TYPE_STYLES: Record<FocalEntityType, TypeStyle> = {
  MeSpace: { label: 'MeSpace', dotClass: 'bg-emerald-400' },
  WeSpace: { label: 'WeSpace', dotClass: 'bg-emerald-400' },
  FieldContext: { label: 'FieldContext', dotClass: 'bg-amber-300' },
  User: { label: 'Person', dotClass: 'bg-sky-300' },
  PersonPulse: { label: 'PersonPulse', dotClass: 'bg-sky-300' },
  GoalPulse: { label: 'GoalPulse', dotClass: 'bg-gp-goal' },
  ResourcePulse: { label: 'ResourcePulse', dotClass: 'bg-gp-resource' },
  StoryPulse: { label: 'StoryPulse', dotClass: 'bg-pink-300' },
  CarePulse: { label: 'CarePulse', dotClass: 'bg-rose-300' },
  CoreValuePulse: { label: 'CoreValuePulse', dotClass: 'bg-violet-300' },
}

interface Handoff {
  id: StudioMode
  label: string
  icon: string
}

const HANDOFFS: Handoff[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'graph', label: 'Graph', icon: 'hub' },
  { id: 'assistant', label: 'Ask Aiden', icon: 'auto_awesome' },
  { id: 'voice', label: 'Talk', icon: 'graphic_eq' },
]

interface Chip {
  type: FocalEntityType
  label: string
}

export const FocalContextBadge: FC = () => {
  const { focalEntity, sessionContext } = useFocalEntity()
  const { mode, setMode } = useStudioMode()
  const isMounted = useSyncExternalStore(NOOP_SUBSCRIBE, GET_TRUE, GET_FALSE)

  // Skeleton placeholder during SSR + first paint so the markup matches the
  // server-rendered "No focus" state regardless of what's in localStorage.
  if (!isMounted) {
    return (
      <div
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/30 backdrop-blur"
        aria-hidden="true"
      >
        <span className="material-symbols-outlined text-[14px] leading-none">
          center_focus_strong
        </span>
        <span className="font-medium tracking-wide">…</span>
      </div>
    )
  }

  if (!focalEntity) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50 backdrop-blur">
        <span className="material-symbols-outlined text-[14px] leading-none">
          center_focus_strong
        </span>
        <span className="font-medium tracking-wide">No focus</span>
        <span className="hidden md:inline text-white/30">
          — select a pulse, space, or person
        </span>
      </div>
    )
  }

  // Compose the breadcrumb. The activeSpaceId / activeFieldContextId in
  // sessionContext already point to the ambient Space/Field; if the focal
  // entity itself IS one of those, don't repeat it as an ancestor.
  const chips: Chip[] = []
  const focalIsSpace =
    focalEntity.type === 'MeSpace' || focalEntity.type === 'WeSpace'
  const focalIsField = focalEntity.type === 'FieldContext'

  if (sessionContext.activeSpaceId && !focalIsSpace) {
    const spaceLabel = getCachedLabel('space', sessionContext.activeSpaceId)
    if (spaceLabel) {
      // We can't tell MeSpace vs WeSpace from the id alone — use the generic
      // "Space" type styling. The dot color is still emerald for both.
      chips.push({ type: 'MeSpace', label: spaceLabel })
    }
  }

  if (sessionContext.activeFieldContextId && !focalIsField) {
    const fieldLabel = getCachedLabel(
      'field',
      sessionContext.activeFieldContextId
    )
    if (fieldLabel) {
      chips.push({ type: 'FieldContext', label: fieldLabel })
    }
  }

  // The focal chip is always last.
  const focalStyle = TYPE_STYLES[focalEntity.type] ?? {
    label: focalEntity.type,
    dotClass: 'bg-slate-300',
  }
  const focalLabel =
    focalEntity.label || `${focalStyle.label} ${focalEntity.id.slice(0, 6)}`
  chips.push({ type: focalEntity.type, label: focalLabel })

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-1.5 backdrop-blur-xl shadow-md">
        {chips.map((chip, idx) => {
          const isLast = idx === chips.length - 1
          const style = TYPE_STYLES[chip.type] ?? {
            label: chip.type,
            dotClass: 'bg-slate-300',
          }
          return (
            <span key={`${chip.type}-${idx}`} className="flex items-center">
              <span className="flex items-center gap-1.5 px-1.5">
                <span
                  className={cn('h-2 w-2 rounded-full', style.dotClass)}
                  aria-hidden="true"
                />
                {isLast ? (
                  <>
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                      {style.label}
                    </span>
                    <span className="max-w-[14ch] sm:max-w-[24ch] truncate text-sm font-semibold text-white">
                      {chip.label}
                    </span>
                  </>
                ) : (
                  <span className="max-w-[16ch] truncate text-xs font-medium text-white/75">
                    {chip.label}
                  </span>
                )}
              </span>
              {!isLast && (
                <span
                  className="material-symbols-outlined text-[14px] leading-none text-white/30"
                  aria-hidden="true"
                >
                  chevron_right
                </span>
              )}
            </span>
          )
        })}
      </div>
      <div className="hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/40 p-1 backdrop-blur">
        {HANDOFFS.filter((h) => h.id !== mode).map((h) => (
          <button
            key={h.id}
            type="button"
            onClick={() => setMode(h.id)}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={`Open focal entity in ${h.label}`}
          >
            <span className="material-symbols-outlined text-[14px] leading-none">
              {h.icon}
            </span>
            <span>{h.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
