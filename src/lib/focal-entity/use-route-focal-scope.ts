'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { focalEntityFromRoute } from '@/lib/focal-entity/route-matcher'

/**
 * The single URL-derived source of canvas scope.
 *
 * Both the Studio's Bloom Exploration surface and the Dashboard's Space /
 * FieldContext pages must resolve "which Space / Field am I looking at?" from
 * the *route*, not from any persisted session hint. Previously each surface
 * derived this independently — Bloom from `usePathname()`, the Dashboard pages
 * from `useParams()`. Because `CanvasHost` keeps the Dashboard subtree mounted
 * under `visibility:hidden` while Bloom is visible, those two reads could
 * diverge across an App Router update cycle, so switching views could show two
 * different Spaces (GOAL-271). Funnelling every reader through this one hook
 * removes the divergence: there is exactly one derivation.
 *
 * Purely route-derived, mirroring `canvas-scope.ts` — no `meSpaceIds` /
 * session hint. MeSpace-vs-WeSpace disambiguation is irrelevant for scope
 * (both resolve to `activeSpaceId`), so the matcher's hints are omitted.
 */
export function useRouteFocalScope(): {
  activeSpaceId: string | null
  activeFieldId: string | null
} {
  const pathname = usePathname()
  return useMemo(() => {
    const match = focalEntityFromRoute(pathname)
    if (!match) return { activeSpaceId: null, activeFieldId: null }
    if (match.type === 'MeSpace' || match.type === 'WeSpace') {
      return { activeSpaceId: match.id, activeFieldId: null }
    }
    if (match.type === 'FieldContext') {
      return { activeSpaceId: null, activeFieldId: match.id }
    }
    return { activeSpaceId: null, activeFieldId: null }
  }, [pathname])
}
