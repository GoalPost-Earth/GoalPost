'use client'

import type { FC } from 'react'
import { ArrowRight, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GetFieldContextDetailsQuery } from '@/gql/graphql'
import { formatResonanceLabel } from '@/utils/graph-utils'
import { SectionHeader } from './shared'
import { ShowMoreToggle, useExpandableList } from './expandable-list'
import { dispatchOpenInfoDrawer } from './types'

/**
 * The list sections of the FieldContext drawer (GOAL-315). Split out of
 * `field-context-details-body.tsx` so each section owns its own
 * expand/collapse state instead of the body carrying four hooks, and so
 * neither file exceeds the 400-line component budget.
 *
 * Every list renders a capped slice by default and an interactive
 * "+ N more" toggle that reveals the rest in place. Rows keep their existing
 * behaviour: clicking one opens that entity's info drawer.
 */

type FieldContextQuery = GetFieldContextDetailsQuery

export type FieldContextPulse =
  | FieldContextQuery['goalPulses'][number]
  | FieldContextQuery['resourcePulses'][number]
  | FieldContextQuery['storyPulses'][number]
  | FieldContextQuery['carePulses'][number]
  | FieldContextQuery['coreValuePulses'][number]

export type FieldContextResonance = NonNullable<
  FieldContextQuery['fieldContexts'][number]['resonancesInContext']
>[number]

export type FieldContextPerson = {
  id: string
  name: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  photo: string | null
}

export type FieldContextDocument = {
  id: string
  filename: string
  uploadedAt: string
}

const PULSE_LIMIT = 8
const RESONANCE_LIMIT = 6
const PEOPLE_LIMIT = 8
const DOCUMENT_LIMIT = 5

const rowClass = cn(
  'group w-full text-left rounded-xl border border-gp-glass-border bg-white/5 dark:bg-white/[0.03]',
  'hover:bg-white/10 dark:hover:bg-white/[0.06] hover:border-white/20',
  'px-3.5 py-2.5 transition-all cursor-pointer'
)

export const PulsesSection: FC<{ pulses: FieldContextPulse[] }> = ({
  pulses,
}) => {
  const { visible, hiddenCount, expanded, toggle } = useExpandableList(
    pulses,
    PULSE_LIMIT
  )
  if (pulses.length === 0) return null

  return (
    <section className="px-6 pb-5">
      <SectionHeader>Recent pulses ({pulses.length})</SectionHeader>
      <ul className="mt-2 space-y-1.5">
        {visible.map((pulse) => (
          <li key={pulse.id}>
            <button
              type="button"
              onClick={() =>
                dispatchOpenInfoDrawer({
                  type: 'Pulse',
                  id: pulse.id,
                  label: pulse.title ?? undefined,
                })
              }
              className={cn(rowClass, 'flex items-center gap-3')}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-gp-ink-muted dark:text-white/45 w-14 shrink-0">
                {typenameLabel(pulse.__typename)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gp-ink-strong dark:text-white/90 truncate">
                  {pulse.title || 'Untitled'}
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
            </button>
          </li>
        ))}
        {hiddenCount > 0 && (
          <li className="pt-0.5">
            <ShowMoreToggle
              expanded={expanded}
              hiddenCount={hiddenCount}
              onToggle={toggle}
              itemLabel="pulses"
            />
          </li>
        )}
      </ul>
    </section>
  )
}

export const ResonancesSection: FC<{
  resonances: FieldContextResonance[]
}> = ({ resonances }) => {
  const { visible, hiddenCount, expanded, toggle } = useExpandableList(
    resonances,
    RESONANCE_LIMIT
  )
  if (resonances.length === 0) return null

  return (
    <section className="px-6 pb-5">
      <SectionHeader>Resonances ({resonances.length})</SectionHeader>
      <ul className="mt-2 space-y-1.5">
        {visible.map((res) => {
          const src = res.source?.[0]
          const tgt = res.target?.[0]
          const srcTitle =
            (src && 'title' in src ? src.title : undefined) ?? 'Pulse'
          const tgtTitle =
            (tgt && 'title' in tgt ? tgt.title : undefined) ?? 'Pulse'
          return (
            <li key={res.id}>
              <button
                type="button"
                onClick={() =>
                  dispatchOpenInfoDrawer({
                    type: 'ResonanceLink',
                    id: res.id,
                    label: res.label ?? undefined,
                  })
                }
                className={rowClass}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gp-primary truncate">
                    {formatResonanceLabel(res.label ?? null)}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
                <p className="mt-1 text-[11px] text-gp-ink-muted dark:text-white/55 truncate">
                  {srcTitle} ↔ {tgtTitle}
                </p>
              </button>
            </li>
          )
        })}
        {hiddenCount > 0 && (
          <li className="pt-0.5">
            <ShowMoreToggle
              expanded={expanded}
              hiddenCount={hiddenCount}
              onToggle={toggle}
              itemLabel="resonances"
            />
          </li>
        )}
      </ul>
    </section>
  )
}

export const PeopleSection: FC<{ people: FieldContextPerson[] }> = ({
  people,
}) => {
  const { visible, hiddenCount, expanded, toggle } = useExpandableList(
    people,
    PEOPLE_LIMIT
  )
  if (people.length === 0) return null

  return (
    <section className="px-6 pb-5">
      <SectionHeader>People ({people.length})</SectionHeader>
      <ul className="mt-2 grid grid-cols-2 gap-1.5">
        {visible.map((person) => {
          const name =
            person.name?.trim() ||
            `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim() ||
            'Member'
          return (
            <li key={person.id} className="min-w-0">
              <button
                type="button"
                onClick={() =>
                  dispatchOpenInfoDrawer({
                    type: 'Person',
                    id: person.id,
                    label: name,
                  })
                }
                className="group w-full text-left rounded-lg border border-gp-glass-border bg-white/5 dark:bg-white/[0.03] hover:bg-white/10 dark:hover:bg-white/[0.06] hover:border-white/20 px-2 py-1.5 transition-all cursor-pointer flex items-center gap-2 min-w-0"
              >
                <div className="size-6 shrink-0 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[9px] font-bold text-white/80">
                  {name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-[11px] font-medium text-gp-ink-strong dark:text-white/85 truncate">
                  {name}
                </span>
              </button>
            </li>
          )
        })}
        {hiddenCount > 0 && (
          <li className="col-span-2 pt-0.5">
            <ShowMoreToggle
              expanded={expanded}
              hiddenCount={hiddenCount}
              onToggle={toggle}
              itemLabel="people"
            />
          </li>
        )}
      </ul>
    </section>
  )
}

export const DocumentsSection: FC<{ documents: FieldContextDocument[] }> = ({
  documents,
}) => {
  const { visible, hiddenCount, expanded, toggle } = useExpandableList(
    documents,
    DOCUMENT_LIMIT
  )
  if (documents.length === 0) return null

  return (
    <section className="px-6 pb-5">
      <SectionHeader>Documents ({documents.length})</SectionHeader>
      <ul className="mt-2 space-y-1.5">
        {visible.map((doc) => (
          <li key={doc.id}>
            <button
              type="button"
              onClick={() =>
                dispatchOpenInfoDrawer({
                  type: 'Document',
                  id: doc.id,
                  label: doc.filename,
                })
              }
              className={cn(rowClass, 'flex items-center gap-3')}
            >
              <FileText className="w-3.5 h-3.5 text-gp-ink-muted dark:text-white/55 shrink-0" />
              <span className="text-xs font-medium text-gp-ink-strong dark:text-white/85 truncate flex-1">
                {doc.filename}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
            </button>
          </li>
        ))}
        {hiddenCount > 0 && (
          <li className="pt-0.5">
            <ShowMoreToggle
              expanded={expanded}
              hiddenCount={hiddenCount}
              onToggle={toggle}
              itemLabel="documents"
            />
          </li>
        )}
      </ul>
    </section>
  )
}

function typenameLabel(typename: string | null | undefined): string {
  switch (typename) {
    case 'GoalPulse':
      return 'Goal'
    case 'ResourcePulse':
      return 'Resource'
    case 'StoryPulse':
      return 'Story'
    case 'CarePulse':
      return 'Care'
    case 'CoreValuePulse':
      return 'Value'
    default:
      return 'Pulse'
  }
}
