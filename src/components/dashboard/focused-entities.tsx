'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type {
  CollectedEntity,
  PivotEntityType,
} from '@/lib/simulation/entity-collector'
import { loadFocusEntities } from '@/lib/simulation/focus-entities-storage'

/**
 * "Focused entities" view rendered when the dashboard receives a
 * `?focus=Type:id,Type:id` query param from the AI assistant pivot footer.
 *
 * Hydrates names from sessionStorage (the panel stashes them on pivot). If
 * the entry is missing — e.g. the user shared the URL with a different
 * browser — falls back to listing the parsed id pairs as a placeholder.
 * Server-side resolution comes with the ConversationThread persistence in
 * commit 3.
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

const GROUP_ORDER: Array<{
  key: 'spaces' | 'contexts' | 'pulses' | 'people'
  label: string
  types: PivotEntityType[]
}> = [
  {
    key: 'spaces',
    label: 'Spaces',
    types: ['MeSpace', 'WeSpace', 'Space'],
  },
  { key: 'contexts', label: 'Field Contexts', types: ['FieldContext'] },
  {
    key: 'pulses',
    label: 'Pulses',
    types: [
      'GoalPulse',
      'ResourcePulse',
      'StoryPulse',
      'CarePulse',
      'CoreValuePulse',
      'FieldPulse',
    ],
  },
  {
    key: 'people',
    label: 'People',
    types: ['User', 'PersonPulse', 'Person'],
  },
]

function detailHref(type: PivotEntityType, id: string): string {
  if (type === 'MeSpace' || type === 'WeSpace' || type === 'Space') {
    return `/protected/dashboard/space/${id}`
  }
  if (type === 'FieldContext') {
    return `/protected/dashboard/field-context/${id}`
  }
  if (type === 'User' || type === 'PersonPulse' || type === 'Person') {
    return `/protected/dashboard/persons/${id}`
  }
  return `/protected/dashboard/pulses/${id}`
}

export function FocusedEntities({ focus }: { focus: string }) {
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

  const grouped = useMemo(() => {
    const map = new Map<string, CollectedEntity[]>()
    for (const entity of state.entities) {
      for (const group of GROUP_ORDER) {
        if (group.types.includes(entity.type)) {
          const existing = map.get(group.key) ?? []
          existing.push(entity)
          map.set(group.key, existing)
          break
        }
      }
    }
    return map
  }, [state.entities])

  if (!state.resolved && state.fallback.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/65 dark:bg-white/5 p-6 backdrop-blur-xl">
        <p className="text-sm text-slate-600 dark:text-white/60">
          No entities to focus on. Open the AI assistant and use{' '}
          <span className="font-medium">Open in dashboard</span> from the chat
          footer.
        </p>
      </section>
    )
  }

  if (!state.resolved) {
    return (
      <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/65 dark:bg-white/5 p-6 backdrop-blur-xl space-y-4">
        <header>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Focused Entities
          </h2>
          <p className="text-sm text-slate-600 dark:text-white/60 mt-1">
            Names aren&apos;t available in this session. Open the AI assistant
            to refresh, or follow the links below to view each entity.
          </p>
        </header>
        <ul className="space-y-2">
          {state.fallback.map(({ type, id }) => (
            <li key={`${type}:${id}`}>
              <Link
                href={detailHref(type, id)}
                className="inline-flex items-center gap-2 text-sm text-gp-primary hover:underline"
              >
                <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-white/40">
                  {TYPE_LABEL[type]}
                </span>
                <span>View entity</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Focused Entities
        </h2>
        <p className="text-sm text-slate-600 dark:text-white/60 mt-1">
          {state.entities.length} entit
          {state.entities.length === 1 ? 'y' : 'ies'} surfaced in your latest
          AI conversation.
        </p>
      </header>

      {GROUP_ORDER.map((group) => {
        const items = grouped.get(group.key)
        if (!items || items.length === 0) return null
        return (
          <div
            key={group.key}
            className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/65 dark:bg-white/5 p-5 backdrop-blur-xl"
          >
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gp-primary mb-3">
              {group.label}
            </h3>
            <ul className="space-y-2">
              {items.map((entity) => (
                <li key={`${entity.type}:${entity.id}`}>
                  <Link
                    href={detailHref(entity.type, entity.id)}
                    className="group flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-100/70 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-medium">
                        {TYPE_LABEL[entity.type]}
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {entity.name}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-slate-400 dark:text-white/30 group-hover:translate-x-0.5 transition-transform">
                      arrow_forward
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </section>
  )
}
