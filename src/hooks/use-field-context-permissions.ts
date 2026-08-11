'use client'

import { useMemo } from 'react'
import { useQuery } from '@apollo/client/react'
import { GET_FIELD_CONTEXT_PEOPLE } from '@/app/graphql/queries/FIELD_CONTEXT_PEOPLE_QUERIES'
import { useApp } from '@/contexts'

/**
 * Client-side `canEditContent` for a FieldContext (GOAL-327).
 *
 * Mirrors `canEditContent` from kb/02-user-roles.md — the parent Space's
 * OWNER, ADMIN and MEMBER pass; GUEST and non-members do not. This is purely
 * a "don't show a control the user cannot use" gate: the real boundary stays
 * server-side (`handleIngestDocument`, GraphQL `@authorization`).
 *
 * The derivation used to live inline on the field-context page. It now lives
 * here so the floating canvas action bar — which renders above the routed page
 * tree and has no access to that page's state — can gate on the same rule.
 */

export interface FieldContextMembership {
  role?: 'ADMIN' | 'MEMBER' | 'GUEST' | null
  member?: Array<{ id: string }>
}

export interface FieldContextSpaceScope {
  owner?: Array<{ id: string }>
  members?: FieldContextMembership[]
}

export interface FieldContextPeopleScope {
  meSpace?: FieldContextSpaceScope[]
  weSpace?: FieldContextSpaceScope[]
}

/** Pure rule: does `userId` pass `canEditContent` for this FieldContext? */
export function deriveCanEditContent(
  scope: FieldContextPeopleScope | undefined,
  userId: string | undefined
): boolean {
  if (!scope || !userId) return false

  const ownerId =
    scope.meSpace?.[0]?.owner?.[0]?.id || scope.weSpace?.[0]?.owner?.[0]?.id
  if (ownerId && ownerId === userId) return true

  const memberships: FieldContextMembership[] = [
    ...(scope.meSpace?.[0]?.members || []),
    ...(scope.weSpace?.[0]?.members || []),
  ]
  return memberships.some(
    (membership) =>
      membership.member?.[0]?.id === userId &&
      (membership.role === 'ADMIN' || membership.role === 'MEMBER')
  )
}

/**
 * Resolve `canEditContent` for `fieldContextId` from the Space membership.
 *
 * Reuses `GET_FIELD_CONTEXT_PEOPLE`, so on the field-context page (which
 * already runs that query) this resolves straight from the Apollo cache
 * rather than issuing a second round trip. Returns `false` while loading —
 * a control that flashes in and then disappears is worse than one that
 * appears a beat late.
 */
export function useFieldContextCanEditContent(
  fieldContextId: string | null
): boolean {
  const { user } = useApp()
  const { data } = useQuery(GET_FIELD_CONTEXT_PEOPLE, {
    variables: { contextId: fieldContextId },
    skip: !fieldContextId,
  })

  const scope = (
    data as { fieldContexts?: FieldContextPeopleScope[] } | undefined
  )?.fieldContexts?.[0]

  return useMemo(() => deriveCanEditContent(scope, user?.id), [scope, user?.id])
}
