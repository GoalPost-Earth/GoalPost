import type { FocalEntityType } from './types'

export interface FocalRouteHints {
  /** Used to refine `/protected/dashboard/space/[id]` from WeSpace to MeSpace. */
  meSpaceIds?: ReadonlyArray<string>
  /** Used to map `/protected/profile[/edit]` to `{User, currentUserId}`. */
  currentUserId?: string | null
}

/**
 * Map a Next.js pathname to a provisional focal entity `{type, id}`.
 *
 * Returns null for routes that don't encode a focal entity (lists, neutral
 * surfaces like /graph and /assistant). Pulse subtypes and User-vs-PersonPulse
 * use a provisional default — callers refine via setFocalLabel once the
 * entity's __typename is known.
 */
export function focalEntityFromRoute(
  pathname: string | null | undefined,
  hints?: FocalRouteHints
): { type: FocalEntityType; id: string } | null {
  if (!pathname) return null

  const path = pathname.split(/[?#]/)[0].replace(/\/+$/, '') || '/'
  const segments = path.split('/').filter(Boolean)

  if (segments[0] !== 'protected') return null

  // /protected/profile, /protected/profile/edit — self-focal
  if (segments[1] === 'profile') {
    if (hints?.currentUserId) {
      return { type: 'User', id: hints.currentUserId }
    }
    return null
  }

  if (segments[1] === 'dashboard') {
    const sub = segments[2]
    const id = segments[3]
    if (!sub || !id) return null

    switch (sub) {
      case 'field-context':
        return { type: 'FieldContext', id }
      case 'persons':
        return { type: 'PersonPulse', id }
      case 'pulses':
        return { type: 'GoalPulse', id }
      case 'space': {
        const isMine = hints?.meSpaceIds?.includes(id) ?? false
        return { type: isMine ? 'MeSpace' : 'WeSpace', id }
      }
      case 'resonances':
        // v1 — resonance edges are not focal entities. See plan §7.
        return null
      default:
        return null
    }
  }

  if (segments[1] === 'spaces') {
    const spaceFlavor = segments[2]
    const spaceId = segments[3]
    if (!spaceFlavor || !spaceId) return null

    // /protected/spaces/(me|we)-space/[id]/fields/[field]
    if (segments[4] === 'fields' && segments[5]) {
      return { type: 'FieldContext', id: segments[5] }
    }

    if (spaceFlavor === 'me-space') return { type: 'MeSpace', id: spaceId }
    if (spaceFlavor === 'we-space') return { type: 'WeSpace', id: spaceId }
    return null
  }

  return null
}
