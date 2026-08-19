'use client'

import { useCallback, useMemo } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { GET_LOGGED_IN_USER } from '@/app/graphql/queries/DASHBOARD_QUERIES'
import { UPDATE_PERSON_MUTATION } from '@/app/graphql/mutations/PERSON_MUTATIONS'
import { useApp } from '@/contexts'

/* eslint-disable @typescript-eslint/no-explicit-any */

/** The free-text profile fields a Person can view and edit about themselves. */
export interface EditableProfile {
  firstName: string
  lastName: string
  phone: string
  pronouns: string
  location: string
  photo: string
  passions: string
  traits: string
  fieldsOfCare: string
  interests: string
  careManual: string
  favorites: string
}

export interface ProfileData extends EditableProfile {
  id: string
  name: string
  email: string
  createdAt: string | null
  spaceCount: number
  weSpaceCount: number
  connectionCount: number
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '')

/**
 * Loads the signed-in Person's own profile (keyed off their own Person id, the
 * same path the dashboard uses) and exposes a self-only update. Editing other
 * people's profiles is not possible here — the query and mutation are both
 * scoped to the authenticated user's own Person node.
 */
export function useProfile() {
  const { user, isAuthenticated } = useApp()
  const id = user?.id ?? ''

  const { data, loading, error, refetch } = useQuery<any>(
    GET_LOGGED_IN_USER as any,
    {
      variables: { id },
      skip: !id,
      fetchPolicy: 'cache-and-network',
    }
  )

  const [updatePerson, { loading: saving }] = useMutation<any>(
    UPDATE_PERSON_MUTATION as any
  )

  const person = data?.people?.[0]

  const profile = useMemo<ProfileData | null>(() => {
    if (!person) return null

    // GOAL-275: PII reads come back through the single type-level gate. This
    // is the caller's own node (matched on their own id), so the "is the
    // person" branch always authorizes it — but stay null-safe, because a
    // cache-and-network first paint can hand us the row before it resolves.
    const pii = person.privateProfile ?? {}

    const ownsSpaces: any[] = person.ownsSpaces ?? []
    const memberSpaces: any[] = (person.memberOf ?? [])
      .map((m: any) => m?.space?.[0] ?? m?.space)
      .filter(Boolean)

    const spaceMap = new Map<string, any>()
    memberSpaces.forEach((s: any) => s?.id && spaceMap.set(s.id, s))
    ownsSpaces.forEach((s: any) => s?.id && spaceMap.set(s.id, s))
    const allSpaces = Array.from(spaceMap.values())

    return {
      id: person.id,
      name: str(person.name) || 'Unnamed',
      email: str(pii.email),
      createdAt: person.createdAt ?? null,
      firstName: str(person.firstName),
      lastName: str(person.lastName),
      phone: str(pii.phone),
      pronouns: str(pii.pronouns),
      location: str(pii.location),
      photo: str(person.photo),
      passions: str(pii.passions),
      traits: str(pii.traits),
      fieldsOfCare: str(pii.fieldsOfCare),
      interests: str(pii.interests),
      careManual: str(pii.careManual),
      favorites: str(pii.favorites),
      spaceCount: allSpaces.length,
      weSpaceCount: allSpaces.filter((s) => s.__typename === 'WeSpace').length,
      connectionCount: (pii.connections ?? []).length,
    }
  }, [person])

  const updateProfile = useCallback(
    async (next: EditableProfile) => {
      if (!person?.id) throw new Error('No profile loaded to update')

      const blankToNull = (v: string) => (v.trim() === '' ? null : v.trim())

      await updatePerson({
        variables: {
          where: { id_EQ: person.id },
          update: {
            firstName_SET: blankToNull(next.firstName),
            lastName_SET: blankToNull(next.lastName),
            phone_SET: blankToNull(next.phone),
            pronouns_SET: blankToNull(next.pronouns),
            location_SET: blankToNull(next.location),
            photo_SET: blankToNull(next.photo),
            passions_SET: blankToNull(next.passions),
            traits_SET: blankToNull(next.traits),
            fieldsOfCare_SET: blankToNull(next.fieldsOfCare),
            interests_SET: blankToNull(next.interests),
            careManual_SET: blankToNull(next.careManual),
            favorites_SET: blankToNull(next.favorites),
          },
        },
      })

      await refetch()
    },
    [person, updatePerson, refetch]
  )

  return {
    profile,
    isLoading: loading && !person,
    isAuthenticated,
    error,
    saving,
    updateProfile,
    refetch,
  }
}
