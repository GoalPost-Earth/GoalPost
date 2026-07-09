import type { Driver } from 'neo4j-driver'

/**
 * Projects the de-dup roster the extraction model sees inlined in its
 * prompt. Slice 4 (GOAL-239) returns the persons and pulses already
 * attached to the FieldContext so the model can emit `update_*` instead
 * of `create_*` for matches. The ids are server-side only — they ride in
 * the model prompt but must never appear in user-facing assistantText.
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

/** GOAL-298: organizations attached to the context via HAS_ORGANIZATION. */
export interface RosterOrganization {
  id: string
  name: string
}

export interface FieldContextRoster {
  persons: RosterPerson[]
  pulses: RosterPulse[]
  organizations: RosterOrganization[]
}

export interface LoadFieldContextRosterInput {
  driver: Driver
  fieldContextId: string
  /** Cap per category. Bounds the projection so a dense context cannot
   * blow the model's context budget. */
  limit?: number
}

const DEFAULT_ROSTER_LIMIT = 100

export async function loadFieldContextRoster(
  input: LoadFieldContextRosterInput
): Promise<FieldContextRoster> {
  const limit = Math.max(1, Math.min(500, input.limit ?? DEFAULT_ROSTER_LIMIT))
  const session = input.driver.session()
  try {
    const result = await session.executeRead(async (tx) =>
      tx.run(
        `
        MATCH (c:FieldContext {id: $fieldContextId})
        CALL {
          WITH c
          MATCH (c)-[:HAS_PERSON]->(p:Person)
          RETURN collect({
            id: p.id,
            name: coalesce(p.name, trim(coalesce(p.firstName, '') + ' ' + coalesce(p.lastName, '')))
          })[..$limit] AS persons
        }
        CALL {
          WITH c
          MATCH (c)-[:HAS_PULSE]->(pulse:FieldPulse)
          WHERE pulse:GoalPulse OR pulse:ResourcePulse OR pulse:StoryPulse
          WITH pulse,
               CASE
                 WHEN pulse:GoalPulse THEN 'GoalPulse'
                 WHEN pulse:ResourcePulse THEN 'ResourcePulse'
                 WHEN pulse:StoryPulse THEN 'StoryPulse'
               END AS pulseType
          RETURN collect({
            id: pulse.id,
            title: coalesce(pulse.title, ''),
            pulseType: pulseType
          })[..$limit] AS pulses
        }
        CALL {
          WITH c
          MATCH (c)-[:HAS_ORGANIZATION]->(org:Organization)
          RETURN collect({
            id: org.id,
            name: coalesce(org.name, '')
          })[..$limit] AS organizations
        }
        RETURN persons, pulses, organizations
        `,
        { fieldContextId: input.fieldContextId, limit }
      )
    )

    const record = result.records[0]
    if (!record) return { persons: [], pulses: [], organizations: [] }

    const rawPersons =
      (record.get('persons') as Array<{ id: string; name: string }>) ?? []
    const rawPulses =
      (record.get('pulses') as Array<{
        id: string
        title: string
        pulseType: 'GoalPulse' | 'ResourcePulse' | 'StoryPulse'
      }>) ?? []

    const persons: RosterPerson[] = rawPersons
      .filter((p) => p && typeof p.id === 'string' && p.id.length > 0)
      .map((p) => ({
        id: p.id,
        name: (p.name || '').trim(),
      }))
      .filter((p) => p.name.length > 0)

    const pulses: RosterPulse[] = rawPulses
      .filter((p) => p && typeof p.id === 'string' && p.id.length > 0)
      .filter(
        (p) =>
          p.pulseType === 'GoalPulse' ||
          p.pulseType === 'ResourcePulse' ||
          p.pulseType === 'StoryPulse'
      )
      .map((p) => ({
        id: p.id,
        title: (p.title || '').trim(),
        pulseType: p.pulseType,
      }))
      .filter((p) => p.title.length > 0)

    const rawOrganizations =
      (record.get('organizations') as Array<{ id: string; name: string }>) ?? []
    const organizations: RosterOrganization[] = rawOrganizations
      .filter((o) => o && typeof o.id === 'string' && o.id.length > 0)
      .map((o) => ({ id: o.id, name: (o.name || '').trim() }))
      .filter((o) => o.name.length > 0)

    return { persons, pulses, organizations }
  } finally {
    await session.close()
  }
}
