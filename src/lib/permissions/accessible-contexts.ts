import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'

/**
 * Accessible-FieldContext enumeration for a member.
 *
 * A member can access a FieldContext iff they can VIEW its parent Space — i.e.
 * they OWN the Space (their MeSpace) or hold ANY `SpaceMembership` role on it
 * (a WeSpace, including GUEST). This mirrors `canViewContent`
 * (`src/lib/permissions/space-permissions.ts`) and the FieldContext READ
 * `@authorization` filter, expressed once here so cross-context features can
 * fan out over "everything the member can see" without re-deriving the rule.
 *
 * Data-sovereignty contract (kb/06-adr.md, kb/02-user-roles.md): the returned
 * set NEVER includes a context in a Space the member neither owns nor belongs
 * to. Callers that read pulses from — or write suggestions into — these
 * contexts inherit that guarantee, provided they restrict their queries to the
 * ids this helper returns.
 */

export interface AccessibleFieldContext {
  contextId: string
  spaceId: string
  spaceType: 'MeSpace' | 'WeSpace' | 'Space'
}

function toSpaceType(
  labels: string[] | null | undefined
): 'MeSpace' | 'WeSpace' | 'Space' {
  if (labels?.includes('MeSpace')) return 'MeSpace'
  if (labels?.includes('WeSpace')) return 'WeSpace'
  return 'Space'
}

/**
 * Every FieldContext the member can view — across every MeSpace they own AND
 * every WeSpace their membership grants. Fails closed: an empty/absent userId
 * returns `[]` rather than the whole graph.
 */
export async function getAccessibleFieldContexts(
  graph: Neo4jGraph,
  userId: string | null | undefined
): Promise<AccessibleFieldContext[]> {
  const currentUserId = userId?.trim() || null
  if (!currentUserId) return []

  const rows = await graph.query<{
    contextId: string
    spaceId: string
    spaceLabels: string[]
  }>(
    // Anchor on the user (Person.id index seek) and expand to THEIR Spaces,
    // rather than scanning every Space in the graph and auth-filtering after —
    // the latter is O(total Spaces) per call and this runs on every upload.
    // The UNION subquery keeps the driving set to the user's own Spaces
    // (~30 dbHits vs ~98 on the label-scan form); the OWNS / membership arms
    // together mirror canViewContent exactly.
    `
    MATCH (user:Person {id: $userId})
    CALL {
      WITH user
      MATCH (user)-[:OWNS]->(space:Space)
      RETURN space
      UNION
      WITH user
      MATCH (space:Space)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(user)
      RETURN space
    }
    MATCH (space)-[:HAS_CONTEXT]->(ctx:FieldContext)
    RETURN DISTINCT ctx.id AS contextId, space.id AS spaceId, labels(space) AS spaceLabels
    `,
    { userId: currentUserId }
  )

  return (Array.isArray(rows) ? rows : [])
    .filter((r) => r.contextId && r.spaceId)
    .map((r) => ({
      contextId: r.contextId,
      spaceId: r.spaceId,
      spaceType: toSpaceType(r.spaceLabels),
    }))
}
