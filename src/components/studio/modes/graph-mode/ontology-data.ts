import type { Node, Relationship } from '@neo4j-nvl/base'
import type { FocalEntityType } from '@/lib/focal-entity/types'

/**
 * Shared ontology data used by both Spatial and Bloom sub-views. Phase 1
 * placeholder for the user's real graph neighborhood. Each NVL node id
 * corresponds 1:1 with a FocalEntityType so the focal entity can highlight
 * itself by matching ids.
 */

export const ONTOLOGY_NODES: Node[] = [
  { id: 'Person', caption: 'Person', size: 30, color: '#93c5fd' },
  { id: 'Community', caption: 'Community', size: 30, color: '#93c5fd' },
  { id: 'MeSpace', caption: 'MeSpace', size: 40, color: '#86efac' },
  { id: 'WeSpace', caption: 'WeSpace', size: 40, color: '#86efac' },
  { id: 'FieldContext', caption: 'FieldContext', size: 35, color: '#fde68a' },
  { id: 'GoalPulse', caption: 'GoalPulse', size: 28, color: '#f9a8d4' },
  { id: 'ResourcePulse', caption: 'ResourcePulse', size: 28, color: '#f9a8d4' },
  { id: 'StoryPulse', caption: 'StoryPulse', size: 28, color: '#f9a8d4' },
  { id: 'FieldResonance', caption: 'FieldResonance', size: 28, color: '#c4b5fd' },
  { id: 'ResonanceLink', caption: 'ResonanceLink', size: 28, color: '#c4b5fd' },
]

export const ONTOLOGY_RELATIONSHIPS: Relationship[] = [
  { id: 'r1', from: 'Person', to: 'MeSpace', caption: 'OWNS' },
  { id: 'r2', from: 'Person', to: 'WeSpace', caption: 'OWNS' },
  { id: 'r3', from: 'Community', to: 'MeSpace', caption: 'OWNS' },
  { id: 'r4', from: 'Community', to: 'WeSpace', caption: 'OWNS' },
  { id: 'r5', from: 'Community', to: 'Person', caption: 'HAS_MEMBER' },
  { id: 'r6', from: 'MeSpace', to: 'Person', caption: 'HAS_MEMBER' },
  { id: 'r7', from: 'WeSpace', to: 'Person', caption: 'HAS_MEMBER' },
  { id: 'r8', from: 'WeSpace', to: 'Community', caption: 'HAS_MEMBER' },
  { id: 'r9', from: 'MeSpace', to: 'FieldContext', caption: 'HAS_CONTEXT' },
  { id: 'r10', from: 'WeSpace', to: 'FieldContext', caption: 'HAS_CONTEXT' },
  { id: 'r11', from: 'FieldContext', to: 'GoalPulse', caption: 'HAS_PULSE' },
  { id: 'r12', from: 'FieldContext', to: 'ResourcePulse', caption: 'HAS_PULSE' },
  { id: 'r13', from: 'FieldContext', to: 'StoryPulse', caption: 'HAS_PULSE' },
  { id: 'r14', from: 'GoalPulse', to: 'Person', caption: 'INITIATED_BY' },
  { id: 'r15', from: 'ResourcePulse', to: 'Community', caption: 'INITIATED_BY' },
  { id: 'r16', from: 'StoryPulse', to: 'Person', caption: 'INITIATED_BY' },
  { id: 'r17', from: 'ResonanceLink', to: 'GoalPulse', caption: 'SOURCE' },
  { id: 'r18', from: 'ResonanceLink', to: 'ResourcePulse', caption: 'TARGET' },
  { id: 'r19', from: 'ResonanceLink', to: 'FieldResonance', caption: 'RESONATES_AS' },
  // Nested sub-contexts (GOAL-295) — self-edge on FieldContext
  { id: 'r20', from: 'FieldContext', to: 'FieldContext', caption: 'HAS_SUBCONTEXT' },
]

/**
 * Map a focal entity type to the ontology node id it should highlight.
 * Pulse subtypes collapse to their concrete node, User/PersonPulse to Person.
 */
export function focalToOntologyNodeId(
  type: FocalEntityType | null | undefined
): string | null {
  if (!type) return null
  if (type === 'User' || type === 'PersonPulse') return 'Person'
  if (type === 'CarePulse') return 'GoalPulse' // closest ontology cousin
  if (type === 'CoreValuePulse') return 'GoalPulse'
  return type
}
