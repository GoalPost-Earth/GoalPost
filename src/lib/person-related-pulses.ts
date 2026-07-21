import { getConfigForType, type NodeType } from '@/lib/pulse-type-config'

/**
 * GOAL-314: shared shaping for the pulses a person is tied to through the graph
 * — `initiatedPulses` (INITIATED_BY, authored) and `mentionedIn` (MENTIONED_IN).
 * Used by both person detail surfaces (the entity-info drawer and the full
 * profile page) so the merge/dedup/label logic stays in one place. An
 * upload-created PersonPulse owns no WeSpace, so these two edges are the only
 * way its contributions render.
 */

type PulseTypename =
  | 'GoalPulse'
  | 'ResourcePulse'
  | 'StoryPulse'
  | 'CarePulse'
  | 'CoreValuePulse'

const TYPENAME_TO_NODE_TYPE: Record<PulseTypename, NodeType> = {
  GoalPulse: 'goal',
  ResourcePulse: 'resource',
  StoryPulse: 'story',
  CarePulse: 'care',
  CoreValuePulse: 'coreValue',
}

/** Shape of a FieldPulse as selected by GET_PERSON_RELATED_PULSES. */
export interface RawRelatedPulse {
  __typename?: string
  id: string
  title: string
  intensity?: number | null
  context?: { id: string; title: string }[] | null
}

export interface PersonRelatedPulsesInput {
  initiatedPulses?: RawRelatedPulse[] | null
  mentionedIn?: RawRelatedPulse[] | null
}

export interface RelatedPulseRow {
  id: string
  title: string
  /** NodeType key so the row can pull its icon + themed color from config. */
  nodeType: NodeType
  /** Entity icon (Material Symbols) from pulse-type-config. */
  icon: string
  /** CSS custom property holding this entity's themed color. */
  cssVar: string
  /** How this person relates to the pulse. */
  relation: 'Authored' | 'Mentioned'
  /** Parent FieldContext title, when available. */
  contextTitle: string | null
}

function nodeTypeFor(typename?: string): NodeType {
  return TYPENAME_TO_NODE_TYPE[(typename as PulseTypename) ?? ''] ?? 'goal'
}

/**
 * Merge a person's authored + mentioned pulses into display rows, deduped by id.
 * `Authored` wins when a pulse carries both edges (the ingest path already keeps
 * an author out of its own MENTIONED_IN list, so this is just belt-and-braces).
 */
export function buildRelatedPulseRows(
  person: PersonRelatedPulsesInput | null | undefined
): RelatedPulseRow[] {
  const byId = new Map<string, RelatedPulseRow>()
  const add = (
    pulses: RawRelatedPulse[] | null | undefined,
    relation: RelatedPulseRow['relation']
  ) => {
    for (const p of pulses ?? []) {
      if (!p?.id) continue
      if (relation === 'Mentioned' && byId.has(p.id)) continue
      const nodeType = nodeTypeFor(p.__typename)
      const config = getConfigForType(nodeType)
      byId.set(p.id, {
        id: p.id,
        title: p.title,
        nodeType,
        icon: config.icon,
        cssVar: config.cssVar,
        relation,
        contextTitle: p.context?.[0]?.title ?? null,
      })
    }
  }
  add(person?.initiatedPulses, 'Authored')
  add(person?.mentionedIn, 'Mentioned')
  return Array.from(byId.values())
}
