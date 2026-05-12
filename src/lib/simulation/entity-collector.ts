/**
 * Entity collection for the AI assistant panel's view-pivot affordance.
 *
 * Walks tool-result shapes returned by `buildSimulationChatTools` and pulls
 * out `{type, id, name}` triples for every graph entity referenced. Used
 * alongside the user's focal-entity navigation history to build the deduped
 * list shown in the panel's footer pivot strip.
 *
 * Extractors are deliberately conservative — anything without a known type +
 * non-empty id + non-empty name is skipped, because the pivot URL contract
 * (`?focus=Type:id,...`) can't represent partial entities.
 */

export const PIVOT_ENTITY_TYPES = [
  'MeSpace',
  'WeSpace',
  'Space',
  'FieldContext',
  'GoalPulse',
  'ResourcePulse',
  'StoryPulse',
  'CarePulse',
  'CoreValuePulse',
  'FieldPulse',
  'User',
  'PersonPulse',
  'Person',
] as const

export type PivotEntityType = (typeof PIVOT_ENTITY_TYPES)[number]

export interface CollectedEntity {
  type: PivotEntityType
  id: string
  name: string
}

/** Max entities encoded into the ?focus= URL — keeps URLs sane. */
export const MAX_PIVOT_ENTITIES = 30

function isPivotEntityType(value: unknown): value is PivotEntityType {
  return (
    typeof value === 'string' &&
    (PIVOT_ENTITY_TYPES as readonly string[]).includes(value)
  )
}

function readString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key]
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function pickName(record: Record<string, unknown>): string | null {
  return (
    readString(record, 'name') ??
    readString(record, 'label') ??
    readString(record, 'title') ??
    readString(record, 'emergentName')
  )
}

function tryCollect(
  record: Record<string, unknown>,
  fallbackType: PivotEntityType | null
): CollectedEntity | null {
  const id = readString(record, 'id')
  if (!id) return null
  const name = pickName(record)
  if (!name) return null
  const declaredType = record.type
  const type = isPivotEntityType(declaredType) ? declaredType : fallbackType
  if (!type) return null
  return { type, id, name }
}

function collectFromArray(
  value: unknown,
  fallbackType: PivotEntityType | null,
  out: CollectedEntity[]
): void {
  if (!Array.isArray(value)) return
  for (const item of value) {
    if (item && typeof item === 'object') {
      const entity = tryCollect(item as Record<string, unknown>, fallbackType)
      if (entity) out.push(entity)
    }
  }
}

/**
 * Extract every `{type,id,name}` entity reachable from a single tool-result
 * value. Recognises the common shapes returned by `buildSimulationChatTools`:
 *
 *  - `{ status: 'ok', type, id, label, ... }` (get_focal_entity)
 *  - `{ found: true, spaces: [{ id, name, type }, ...] }` (get_my_spaces / search_space)
 *  - `{ persons: [...] }` / `{ people: [...] }`
 *  - `{ pulses: [...] }`
 *  - `{ fieldContexts: [...] }` / `{ contexts: [...] }`
 *  - Generic `{ results: [...] }` arrays, when items carry their own `type`
 *
 * Anything else returns an empty list — better to miss an entity than to
 * misclassify it.
 */
export function extractEntitiesFromToolResult(
  result: unknown
): CollectedEntity[] {
  if (!result || typeof result !== 'object') return []
  const record = result as Record<string, unknown>
  const out: CollectedEntity[] = []

  const top = tryCollect(record, null)
  if (top) out.push(top)

  collectFromArray(record.spaces, 'Space', out)
  collectFromArray(record.persons, 'Person', out)
  collectFromArray(record.people, 'Person', out)
  collectFromArray(record.pulses, null, out)
  collectFromArray(record.fieldContexts, 'FieldContext', out)
  collectFromArray(record.contexts, 'FieldContext', out)
  collectFromArray(record.results, null, out)

  return out
}

/**
 * Build the comma-separated `Type:id` string for the `?focus=` query param.
 * Preserves order from `entities` and caps at `MAX_PIVOT_ENTITIES`.
 */
export function buildFocusParam(entities: CollectedEntity[]): string {
  return entities
    .slice(0, MAX_PIVOT_ENTITIES)
    .map((e) => `${e.type}:${e.id}`)
    .join(',')
}

/**
 * Parse a `?focus=Type:id,Type:id,...` query param back into structured pairs.
 * Drops malformed segments and unknown types; the caller can resolve names
 * via a follow-up query.
 */
export function parseFocusParam(
  raw: string | null | undefined
): Array<{ type: PivotEntityType; id: string }> {
  if (!raw) return []
  const out: Array<{ type: PivotEntityType; id: string }> = []
  const seen = new Set<string>()
  for (const segment of raw.split(',')) {
    const trimmed = segment.trim()
    if (!trimmed) continue
    const sep = trimmed.indexOf(':')
    if (sep <= 0 || sep === trimmed.length - 1) continue
    const type = trimmed.slice(0, sep)
    const id = trimmed.slice(sep + 1)
    if (!isPivotEntityType(type)) continue
    const key = `${type}:${id}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ type, id })
    if (out.length >= MAX_PIVOT_ENTITIES) break
  }
  return out
}
