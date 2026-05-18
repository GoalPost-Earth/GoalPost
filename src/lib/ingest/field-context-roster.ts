/**
 * Projects the de-dup roster the extraction model sees inlined in its
 * prompt. Slice 1 returns an empty roster — the extractor has no prior
 * context and treats every fully-named person it finds as "new". Slice 4
 * (GOAL-239) replaces this with a Neo4j-backed projection that lists every
 * `Person` and `FieldPulse` already attached to the FieldContext so the
 * model can emit `update_*` instead of `create_*` for matches.
 */

export interface RosterPerson {
  id: string
  name: string
}

export interface RosterPulse {
  id: string
  title: string
  pulseType: 'GoalPulse' | 'ResourcePulse' | 'StoryPulse'
}

export interface FieldContextRoster {
  persons: RosterPerson[]
  pulses: RosterPulse[]
}

export interface LoadFieldContextRosterInput {
  fieldContextId: string
}

export async function loadFieldContextRoster(
  _input: LoadFieldContextRosterInput
): Promise<FieldContextRoster> {
  return { persons: [], pulses: [] }
}
