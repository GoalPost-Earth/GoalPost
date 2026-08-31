'use client'

import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { useFocalEntity } from '@/contexts'
import {
  GET_PERSON_OWNED_PULSES,
  GET_PERSON_PROFILE,
  GET_PERSON_RELATED_PULSES,
} from '@/app/graphql/queries/PERSON_QUERIES'
import { GET_PERSON_PROVENANCE } from '@/app/graphql/queries/PROVENANCE_QUERIES'
import { buildRelatedPulseRows } from '@/lib/person-related-pulses'
import type { ProvenanceDocument } from '@/components/fields/entity-provenance'

/* eslint-disable @typescript-eslint/no-explicit-any */

/** A pulse from an owned WeSpace, flattened with its space + context labels. */
export interface OwnedPulseRow {
  id: string
  title: string
  spaceName: string
  contextName: string
  [key: string]: unknown
}

/**
 * Every read behind the person drawer, plus the derived rows the body renders.
 *
 * The four queries are deliberately separate rather than one document: a
 * data-integrity problem inside any one of them (a NULL on a non-nullable
 * schema field, say) then fails only its own section instead of collapsing the
 * whole drawer. With the global `errorPolicy: 'all'`, a failed query hands back
 * `null` data, and each derivation below treats that as "nothing to render."
 */
export function usePersonDetails(personId: string) {
  const { setFocalLabel } = useFocalEntity()

  const { data, loading, error, refetch } = useQuery(GET_PERSON_PROFILE, {
    variables: { personId },
    fetchPolicy: 'cache-and-network',
  })

  const { data: pulsesData, error: pulsesError } = useQuery(
    GET_PERSON_OWNED_PULSES,
    {
      variables: { personId },
      fetchPolicy: 'cache-and-network',
    }
  )

  const { data: provenanceData } = useQuery<{
    people?: { id: string; extractedFrom?: ProvenanceDocument[] }[]
  }>(GET_PERSON_PROVENANCE, {
    variables: { personId },
  })

  // Pulses this person authored (INITIATED_BY) or is mentioned in
  // (MENTIONED_IN). This is the only way an upload-created PersonPulse's
  // contributions surface — they own no WeSpace, so GET_PERSON_OWNED_PULSES
  // misses them entirely (GOAL-314).
  const { data: relatedPulsesData } = useQuery(GET_PERSON_RELATED_PULSES, {
    variables: { personId },
    fetchPolicy: 'cache-and-network',
  })

  const person = data?.people?.[0]
  // GOAL-275: the PII scalars and the connection graph arrive behind the single
  // type-level gate on PersonPrivateProfile. Null means "this person exists, but
  // their private profile is not visible to you" — the directory identity (name
  // / photo) still renders, so the drawer degrades to a limited card instead of
  // a not-found.
  const pii = person?.privateProfile

  useEffect(() => {
    if (!person?.id || !person?.name) return
    const typename = (person as { __typename?: string }).__typename
    const refined =
      typename === 'User'
        ? ('User' as const)
        : typename === 'PersonPulse'
          ? ('PersonPulse' as const)
          : undefined
    setFocalLabel(person.id, person.name, refined)
  }, [person?.id, person?.name, person, setFocalLabel])

  const ownedPulses: OwnedPulseRow[] = []
  ;((pulsesData?.people?.[0] as any)?.ownsSpaces ?? []).forEach(
    (space: any) => {
      if (space.__typename !== 'WeSpace') return
      ;(space.contexts ?? []).forEach((context: any) => {
        ;(context.pulses ?? []).forEach((pulse: any) => {
          ownedPulses.push({
            ...pulse,
            spaceName: space.name,
            contextName: context.title,
          })
        })
      })
    }
  )

  // Authored + mentioned pulses, minus any already shown via an owned WeSpace
  // above, so a User's own pulse never double-lists.
  const relatedRows = buildRelatedPulseRows(
    relatedPulsesData?.people?.[0]
  ).filter((row) => !ownedPulses.some((p) => p.id === row.id))

  return {
    data,
    person,
    pii,
    loading,
    error,
    refetch,
    ownedPulses,
    relatedRows,
    /** Only the owned-WeSpace query; related pulses come from their own query. */
    pulsesFailed: !!pulsesError,
    provenanceDocuments:
      provenanceData?.people?.[0]?.extractedFrom ?? null,
  }
}
