/**
 * Shared types and the global "open the drawer" event contract.
 *
 * Any descendant of the studio shell can summon the drawer by dispatching
 * a `goalpost:open-info-drawer` window event with an {InfoEntity} detail
 * — no prop drilling required. The drawer mounts once in CanvasHost and
 * listens globally.
 */

export type InfoEntityType =
  | 'MeSpace'
  | 'WeSpace'
  | 'FieldContext'
  | 'Pulse'
  | 'Person'
  | 'Document'
  | 'ResonanceLink'
  | 'PromiseWeave'
  // A first-class Organization (cooperative / company / group named in a
  // Space) — GOAL-298 / GOAL-299. Not a pulse; see OrganizationDetailsBody.
  | 'Organization'
  // An interpersonal CONNECTED_TO relationship. Its `id` is a composite
  // `personAId__personBId` (sorted) — see ConnectionDetailsBody.
  | 'Connection'

export interface InfoEntity {
  type: InfoEntityType
  id: string
  /**
   * Optional pre-known label. When supplied, the drawer can update the
   * focal entity cache immediately rather than waiting for the body
   * query to resolve. Callers that already have the name in hand (e.g.
   * a bubble that knows its own label) should pass it through.
   */
  label?: string
}

const INFO_ENTITY_TYPES: ReadonlySet<InfoEntityType> = new Set([
  'MeSpace',
  'WeSpace',
  'FieldContext',
  'Pulse',
  'Person',
  'Document',
  'ResonanceLink',
  'PromiseWeave',
  'Organization',
  'Connection',
])

export function isInfoEntityType(value: unknown): value is InfoEntityType {
  return (
    typeof value === 'string' &&
    INFO_ENTITY_TYPES.has(value as InfoEntityType)
  )
}

export const OPEN_INFO_DRAWER_EVENT = 'goalpost:open-info-drawer'
export const CLOSE_INFO_DRAWER_EVENT = 'goalpost:close-info-drawer'

export function dispatchOpenInfoDrawer(entity: InfoEntity) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent(OPEN_INFO_DRAWER_EVENT, { detail: entity })
  )
}

export function dispatchCloseInfoDrawer() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(CLOSE_INFO_DRAWER_EVENT))
}

/**
 * The query-param shape the drawer syncs to the URL: `entity=Type:id`.
 * Refresh / bookmark / shared link → drawer mounts open at the right
 * entity. See useEntityDrawerUrl in ./index.tsx.
 */
export const ENTITY_QUERY_PARAM = 'entity'

export function encodeEntityParam(entity: InfoEntity): string {
  return `${entity.type}:${entity.id}`
}

export function decodeEntityParam(value: string | null): InfoEntity | null {
  if (!value) return null
  const sep = value.indexOf(':')
  if (sep <= 0) return null
  const type = value.slice(0, sep)
  const id = value.slice(sep + 1)
  if (!id || !isInfoEntityType(type)) return null
  return { type, id }
}
