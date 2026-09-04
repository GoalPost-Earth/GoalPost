'use client'

import { useState, type FC } from 'react'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { ArrowRight, Check, UserPlus } from 'lucide-react'
import { ADD_PERSON_TO_FIELD_CONTEXT_MUTATION } from '@/app/graphql/mutations'
import { GET_FIELD_CONTEXT_PEOPLE } from '@/app/graphql/queries'
import { useFieldContextCanEditContent } from '@/hooks/use-field-context-permissions'
import { SectionHeader } from './shared'
import { dispatchOpenInfoDrawer } from './types'

/**
 * The Document drawer's "Extracted people" list, plus the promote affordance
 * (GOAL-346).
 *
 * Document Ingestion and Bulk Article Import attach every person they find to
 * the field via HAS_PERSON, which used to bury the field's own people in the
 * People roster. Those people now carry `Person.extractionFound` and the roster
 * filters them out — so THIS list is where they live, and this is where a
 * member decides one of them belongs in the roster after all.
 *
 * Promote reuses the existing `addPersonToFieldContext` mutation: the person is
 * already on HAS_PERSON, so the MERGE is a no-op and the meaningful write is
 * the resolver clearing the marker. That resolver carries the Space edit gate
 * (owner / ADMIN / MEMBER — GUESTs are view-only) and writes the activity Log,
 * so the button below is only a "don't show a control you cannot use" gate; the
 * real boundary stays server-side.
 */

export interface ExtractedPerson {
  id: string
  firstName: string | null
  lastName: string | null
  /** GOAL-346 — true while the person is held out of the People roster. */
  extractionFound?: boolean | null
}

export const DocumentExtractedPeople: FC<{
  people: ExtractedPerson[]
  /** The document's field. Absent only for an orphaned document. */
  fieldContextId?: string
  /** Refetch the document so a promoted person re-renders as "In People". */
  onPromoted: () => void
}> = ({ people, fieldContextId, onPromoted }) => {
  const canEditContent = useFieldContextCanEditContent(fieldContextId ?? null)
  const [addPersonToFieldContext] = useMutation(
    ADD_PERSON_TO_FIELD_CONTEXT_MUTATION
  )
  const [promotingId, setPromotingId] = useState<string | null>(null)

  if (people.length === 0) return null

  const handlePromote = async (person: ExtractedPerson, name: string) => {
    if (!fieldContextId) return
    setPromotingId(person.id)
    try {
      // The custom mutation reports authorization failures as success: false
      // rather than a thrown GraphQL error (mirrors the field-context page).
      const { data } = await addPersonToFieldContext({
        variables: { contextId: fieldContextId, personId: person.id },
        refetchQueries: [
          {
            query: GET_FIELD_CONTEXT_PEOPLE,
            variables: { contextId: fieldContextId },
          },
        ],
        awaitRefetchQueries: true,
      })
      const result = data?.addPersonToFieldContext
      if (!result?.success) {
        throw new Error(result?.message || 'Failed to add to People.')
      }
      toast.success(`${name} added to People.`)
      onPromoted()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to add to People.'
      )
    } finally {
      setPromotingId(null)
    }
  }

  return (
    <section className="px-6 pb-5">
      <SectionHeader>Extracted people ({people.length})</SectionHeader>
      <ul className="mt-2 space-y-1">
        {people.map((person) => {
          const name =
            `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim() ||
            'Person'
          const inRoster = person.extractionFound !== true
          const isPromoting = promotingId === person.id
          return (
            <li key={person.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  dispatchOpenInfoDrawer({
                    type: 'Person',
                    id: person.id,
                    label: name,
                  })
                }
                // Light mode needs its own values here: a white wash on a light
                // glass panel is no hover state at all, and a white chevron on
                // it is invisible. Same spelling as pulse-details-body.
                className="group min-w-0 flex-1 text-left rounded-lg px-3 py-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center gap-2"
              >
                <span className="min-w-0 flex-1 truncate text-xs text-gp-ink-strong dark:text-white/85">
                  {name}
                </span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-white/30 group-hover:text-slate-600 dark:group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
              </button>
              {inRoster ? (
                // Status, not an action — safe icon-only on mobile, with the
                // meaning kept for screen readers at every width.
                <span
                  title="Already in this field's People"
                  className="shrink-0 inline-flex items-center gap-1 rounded-full border border-gp-glass-border bg-black/[0.03] dark:bg-white/[0.05] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gp-ink-muted dark:text-white/50"
                >
                  <Check className="w-3 h-3 shrink-0" />
                  <span className="sr-only">In this field&apos;s People</span>
                  <span className="hidden sm:inline" aria-hidden="true">
                    In People
                  </span>
                </span>
              ) : (
                canEditContent &&
                fieldContextId && (
                  // An ACTION keeps a visible label at every width. `title` is
                  // a hover affordance and a phone has no hover, so the label
                  // shortens on mobile rather than disappearing.
                  <button
                    type="button"
                    disabled={isPromoting}
                    onClick={() => handlePromote(person, name)}
                    title={`Add ${name} to this field's People`}
                    aria-label={`Add ${name} to this field's People`}
                    className="shrink-0 inline-flex items-center gap-1 rounded-full border border-gp-primary/40 bg-gp-primary/10 hover:bg-gp-primary/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gp-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus className="w-3 h-3 shrink-0" />
                    <span aria-hidden="true">
                      {isPromoting ? (
                        'Adding…'
                      ) : (
                        <>
                          Add<span className="hidden sm:inline"> to People</span>
                        </>
                      )}
                    </span>
                  </button>
                )
              )}
            </li>
          )
        })}
      </ul>
      <p className="mt-2 px-3 text-[10px] leading-relaxed text-gp-ink-muted dark:text-white/40">
        People found in this document stay here rather than in the field&apos;s
        People list. Add the ones who belong there.
      </p>
    </section>
  )
}
