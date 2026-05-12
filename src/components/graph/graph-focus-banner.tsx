'use client'

import { useEffect, useState } from 'react'
import type {
  CollectedEntity,
  PivotEntityType,
} from '@/lib/simulation/entity-collector'
import { loadFocusEntities } from '@/lib/simulation/focus-entities-storage'

/**
 * Banner pinned to the /graph route when the AI assistant pivot sends the
 * user here with `?focus=Type:id,...`. Lists the focused entities (names
 * hydrated from sessionStorage) and labels the lack of an instance graph as
 * a known upcoming feature, so the pivot action doesn't dead-end the user.
 *
 * Instance graph rendering (the actual NVL sub-graph) is intentionally
 * out-of-scope for this commit per the implementation plan.
 */

const TYPE_LABEL: Record<PivotEntityType, string> = {
  MeSpace: 'MeSpace',
  WeSpace: 'WeSpace',
  Space: 'Space',
  FieldContext: 'Field Context',
  GoalPulse: 'Goal',
  ResourcePulse: 'Resource',
  StoryPulse: 'Story',
  CarePulse: 'Care',
  CoreValuePulse: 'Core Value',
  FieldPulse: 'Pulse',
  User: 'Person',
  PersonPulse: 'Person',
  Person: 'Person',
}

const MAX_VISIBLE = 8

export function GraphFocusBanner({ focus }: { focus: string }) {
  const [state, setState] = useState<{
    entities: CollectedEntity[]
    resolved: boolean
    fallback: Array<{ type: PivotEntityType; id: string }>
  }>({
    entities: [],
    resolved: false,
    fallback: [],
  })

  useEffect(() => {
    setState(loadFocusEntities(focus))
  }, [focus])

  const totalCount = state.resolved
    ? state.entities.length
    : state.fallback.length

  if (totalCount === 0) return null

  return (
    <div className="absolute top-20 right-4 z-20 max-w-md bg-slate-800/90 backdrop-blur border border-gp-primary/40 rounded-lg shadow-lg p-4">
      <div className="flex items-start gap-2 mb-2">
        <span className="material-symbols-outlined text-gp-primary text-[18px]">
          hub
        </span>
        <div>
          <h2 className="text-sm font-bold text-white">
            From your AI conversation
          </h2>
          <p className="text-xs text-slate-300">
            {totalCount} entit{totalCount === 1 ? 'y' : 'ies'} surfaced.
            Instance graph rendering is coming soon — for now, view each entity
            from the dashboard.
          </p>
        </div>
      </div>

      <ul className="space-y-1 max-h-64 overflow-y-auto pr-1">
        {state.resolved
          ? state.entities.slice(0, MAX_VISIBLE).map((entity) => (
              <li
                key={`${entity.type}:${entity.id}`}
                className="flex items-center gap-2 text-xs"
              >
                <span className="text-[10px] uppercase tracking-wider text-slate-400">
                  {TYPE_LABEL[entity.type]}
                </span>
                <span className="text-slate-100 truncate">{entity.name}</span>
              </li>
            ))
          : state.fallback.slice(0, MAX_VISIBLE).map(({ type, id }) => (
              <li
                key={`${type}:${id}`}
                className="flex items-center gap-2 text-xs"
              >
                <span className="text-[10px] uppercase tracking-wider text-slate-400">
                  {TYPE_LABEL[type]}
                </span>
                <span className="text-slate-400 italic">
                  Names unavailable in this session
                </span>
              </li>
            ))}
        {totalCount > MAX_VISIBLE ? (
          <li className="text-xs text-slate-400 italic pt-1">
            and {totalCount - MAX_VISIBLE} more…
          </li>
        ) : null}
      </ul>
    </div>
  )
}
