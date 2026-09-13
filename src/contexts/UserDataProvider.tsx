'use client'

import { useQuery } from '@apollo/client/react'
import { ReactNode, useEffect } from 'react'
import { GET_SHELL_USER } from '@/app/graphql'
import { useApp } from './AppContext'

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useApp()

  // GOAL-371: the shell document, not the full profile one. All this provider
  // needs is the caller's MeSpace id (kb/02-user-roles.md, Auth Flow), and the
  // PII block it used to drag along cost 41 extra `EXISTS {` blocks in the
  // emitted Cypher. GET_SHELL_USER owns the measurements and the scope note on
  // when this read actually reaches the server; the regression suite in
  // person-pii-gate-plan-size.test.ts is what keeps the gate off it.
  //
  // `user?.id` is tested FIRST on purpose: it is undefined during SSR and the
  // first client paint, so `&&` short-circuits and `localStorage` — a
  // browser-only global — is never touched on the server.
  const hasCachedMeSpaceId = !!user?.id && !!localStorage.getItem('meSpaceId')

  // fetchPolicy is `cache-first`, not `network-only` (GOAL-371). A MeSpace id
  // cannot change within a session, and the cache cannot outlive one: the
  // `InMemoryCache` is created by `ApolloWrapper`, which `AppContext` unmounts
  // on every `/auth` route — so login, logout and session-expiry all destroy it.
  // Re-fetching over the network on each navigation bought nothing.
  //
  // The invariant this now rests on: anything that learns or creates the
  // caller's MeSpace must write `localStorage.meSpaceId` itself, the way
  // `AppContext.setUserAndPersist` does from the login response. Two known gaps,
  // both pre-existing and neither fixable by a refetch: `setUserAndPersist`
  // writes on a hit but never clears on a miss, and MeSpace→WeSpace conversion
  // (space-membership-resolver.ts) relabels the node without creating a
  // replacement MeSpace, so the cached id outlives the MeSpace itself.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = useQuery<any>(GET_SHELL_USER as any, {
    variables: { id: user?.id ?? '' },
    skip: !user?.id || hasCachedMeSpaceId,
    fetchPolicy: 'cache-first',
  })

  // Cache the MeSpace id for direct navigation. Reading the query's own result
  // replaces a `refetch()` that used to be fired from this effect for data the
  // `useQuery` above was already fetching — `refetch` also bypasses the cache
  // unconditionally, which would have defeated the `cache-first` policy.
  useEffect(() => {
    const person = data?.people?.[0]
    if (!person) return
    const meSpace = (person.ownsSpaces || []).find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (space: any) => space.__typename === 'MeSpace'
    )
    if (meSpace?.id) {
      localStorage.setItem('meSpaceId', meSpace.id)
    }
  }, [data])

  return <>{children}</>
}
