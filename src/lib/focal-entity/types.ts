/**
 * The discriminator for FocalEntity. MeSpace/WeSpace and User/PersonPulse are
 * kept distinct because their authorization semantics differ — Bloom layouts
 * and assistant tools branch on subtype, not on the Person/Space supertype.
 */
export type FocalEntityType =
  | 'MeSpace'
  | 'WeSpace'
  | 'FieldContext'
  | 'User'
  | 'PersonPulse'
  | 'GoalPulse'
  | 'ResourcePulse'
  | 'StoryPulse'
  | 'CarePulse'
  | 'CoreValuePulse'

export type FocalEntitySource = 'route' | 'manual' | 'persisted'

/**
 * A structural parent of a focal entity, used to render hierarchical
 * breadcrumbs (Dashboard > Space > FieldContext > Pulse). Pushed by
 * detail pages once their query resolves the enclosing entities.
 */
export interface FocalEntityParent {
  type: FocalEntityType
  id: string
  label: string
}

export interface FocalEntity {
  type: FocalEntityType
  id: string
  /** Lazy — populated by setFocalLabel once the detail page query resolves. */
  label?: string
  focusedAt: string
  source: FocalEntitySource
  /** Lazy — populated by setFocalParents once the detail page resolves the chain. */
  parents?: FocalEntityParent[]
}

/**
 * Ambient scope (activeSpaceId / activeFieldContextId) coexists with the
 * narrow focal entity. When focalEntity is a Space or FieldContext the
 * corresponding ambient id must match its id (invariant enforced by the
 * FocalEntityProvider).
 */
export interface SessionContext {
  currentUserId: string | null
  activeSpaceId: string | null
  activeFieldContextId: string | null
  focalEntity: FocalEntity | null
}

const FOCAL_ENTITY_TYPES: ReadonlySet<FocalEntityType> = new Set([
  'MeSpace',
  'WeSpace',
  'FieldContext',
  'User',
  'PersonPulse',
  'GoalPulse',
  'ResourcePulse',
  'StoryPulse',
  'CarePulse',
  'CoreValuePulse',
])

export function isFocalEntityType(value: unknown): value is FocalEntityType {
  return (
    typeof value === 'string' &&
    FOCAL_ENTITY_TYPES.has(value as FocalEntityType)
  )
}

/**
 * Pulse subtypes for which the route `/protected/dashboard/pulses/[id]` is
 * provisionally treated as GoalPulse. After the query resolves, callers
 * refine via setFocalLabel(id, label, refinedType).
 */
export const PULSE_FOCAL_TYPES: ReadonlyArray<FocalEntityType> = [
  'GoalPulse',
  'ResourcePulse',
  'StoryPulse',
  'CarePulse',
  'CoreValuePulse',
]

export function isPulseFocalType(
  type: FocalEntityType
): type is
  | 'GoalPulse'
  | 'ResourcePulse'
  | 'StoryPulse'
  | 'CarePulse'
  | 'CoreValuePulse' {
  return PULSE_FOCAL_TYPES.includes(type)
}
