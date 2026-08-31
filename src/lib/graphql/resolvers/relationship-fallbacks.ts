import { driver } from '@/lib/neo4j/driver'
import { relationshipField } from './projection'

/**
 * Fallback readers for `@relationship` fields on node types that also carry
 * hand-written resolvers.
 *
 * Every one of them is wrapped in `relationshipField`, so they run ONLY for
 * parents produced by a custom root resolver (`searchAll`, `relatedPeople`,
 * the chat / ingest mutations, …). Whenever `@neo4j/graphql` resolved the
 * parent itself, its own projection — authorization-filtered and resolved in
 * the same Cypher statement — is handed straight back. See ./projection.ts for
 * what breaks when that guard is missing.
 */

// ── Space (interface + both implementations) ───────────────────────────────
// Every Space node carries the `Space` label alongside `MeSpace` / `WeSpace`
// (see the `@node(labels:)` directives in schema.gql), so one implementation
// serves the interface and both implementations.

const fetchSpaceOwner = async (source: Record<string, unknown>) => {
  if (!source.id) return []
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) => {
      return await tx.run(
        `
        MATCH (space:Space {id: $spaceId})<-[:OWNS]-(owner:Person)
        RETURN owner
        `,
        { spaceId: source.id }
      )
    })
    return result.records.map((record) => ({
      ...record.get('owner').properties,
      __typename: 'Person',
    }))
  } finally {
    await session.close()
  }
}

const fetchSpaceMembers = async (source: Record<string, unknown>) => {
  if (!source.id) return []
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) => {
      return await tx.run(
        `
        MATCH (space:Space {id: $spaceId})-[:HAS_MEMBER]->(membership:SpaceMembership)
        RETURN membership
        `,
        { spaceId: source.id }
      )
    })
    return result.records.map((record) => ({
      ...record.get('membership').properties,
      __typename: 'SpaceMembership',
    }))
  } finally {
    await session.close()
  }
}

const fetchSpaceContexts = async (source: Record<string, unknown>) => {
  if (!source.id) return []
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) => {
      return await tx.run(
        `
        MATCH (space:Space {id: $spaceId})-[:HAS_CONTEXT]->(context:FieldContext)
        RETURN context
        `,
        { spaceId: source.id }
      )
    })
    return result.records.map((record) => ({
      ...record.get('context').properties,
      __typename: 'FieldContext',
    }))
  } finally {
    await session.close()
  }
}

export const spaceRelationshipResolvers = {
  owner: relationshipField('owner', fetchSpaceOwner),
  members: relationshipField('members', fetchSpaceMembers),
  contexts: relationshipField('contexts', fetchSpaceContexts),
}

// ── Person ────────────────────────────────────────────────────────────────

const fetchOwnedSpaces = async (source: Record<string, unknown>) => {
  if (!source.id) return []
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) => {
      return await tx.run(
        `
        MATCH (person:Person {id: $personId})-[:OWNS]->(space:Space)
        RETURN space
        `,
        { personId: source.id }
      )
    })
    return result.records.map((record) => {
      const space = record.get('space')
      return {
        ...space.properties,
        __typename: space.labels.includes('WeSpace') ? 'WeSpace' : 'MeSpace',
      }
    })
  } finally {
    await session.close()
  }
}

const fetchMemberships = async (source: Record<string, unknown>) => {
  if (!source.id) return []
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) => {
      return await tx.run(
        `
        MATCH (membership:SpaceMembership)-[:IS_MEMBER]->(person:Person {id: $personId})
        RETURN membership
        `,
        { personId: source.id }
      )
    })
    return result.records.map((record) => ({
      ...record.get('membership').properties,
      __typename: 'SpaceMembership',
    }))
  } finally {
    await session.close()
  }
}

export const personRelationshipResolvers = {
  ownsSpaces: relationshipField('ownsSpaces', fetchOwnedSpaces),
  memberOf: relationshipField('memberOf', fetchMemberships),
}

// ── SpaceMembership ───────────────────────────────────────────────────────

const fetchMembershipMember = async (source: Record<string, unknown>) => {
  if (!source.id) return []
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) => {
      return await tx.run(
        `
        MATCH (membership:SpaceMembership {id: $membershipId})-[:IS_MEMBER]->(person:Person)
        RETURN person
        `,
        { membershipId: source.id }
      )
    })
    return result.records.map((record) => ({
      ...record.get('person').properties,
      __typename: 'Person',
    }))
  } finally {
    await session.close()
  }
}

const fetchMembershipSpace = async (source: Record<string, unknown>) => {
  if (!source.id) return []
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) => {
      return await tx.run(
        `
        MATCH (membership:SpaceMembership {id: $membershipId})<-[:HAS_MEMBER]-(space:Space)
        RETURN space
        `,
        { membershipId: source.id }
      )
    })
    return result.records.map((record) => {
      const space = record.get('space')
      return {
        ...space.properties,
        __typename: space.labels.includes('WeSpace') ? 'WeSpace' : 'MeSpace',
      }
    })
  } finally {
    await session.close()
  }
}

export const spaceMembershipRelationshipResolvers = {
  member: relationshipField('member', fetchMembershipMember),
  space: relationshipField('space', fetchMembershipSpace),
}

// ── FieldContext ──────────────────────────────────────────────────────────

const fetchContextPulses = async (source: Record<string, unknown>) => {
  if (!source.id) return []
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) => {
      return await tx.run(
        `
        MATCH (context:FieldContext {id: $contextId})-[:HAS_PULSE]->(pulse:FieldPulse)
        RETURN pulse
        `,
        { contextId: source.id }
      )
    })
    return result.records.map((record) => record.get('pulse').properties)
  } finally {
    await session.close()
  }
}

const fetchContextResonances = async (source: Record<string, unknown>) => {
  if (!source.id) return []
  const session = driver.session()
  try {
    const result = await session.executeRead(async (tx) => {
      return await tx.run(
        `
        MATCH (context:FieldContext {id: $contextId})-[:HAS_RESONANCE]->(resonance:ResonanceLink)
        RETURN resonance
        `,
        { contextId: source.id }
      )
    })
    return result.records.map((record) => record.get('resonance').properties)
  } finally {
    await session.close()
  }
}

export const fieldContextRelationshipResolvers = {
  pulses: relationshipField('pulses', fetchContextPulses),
  resonances: relationshipField('resonances', fetchContextResonances),
}
