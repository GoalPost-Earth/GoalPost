import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'

/**
 * Space-scoped pulse visibility for RAW-CYPHER read paths.
 *
 * GoalPost's rule (kb/02-user-roles.md): a pulse is visible ONLY to people who
 * can access its parent Space — the MeSpace owner, or a WeSpace owner/member.
 * The GraphQL `@authorization` filters on the pulse types enforce this for
 * GraphQL reads, but any path that runs Cypher directly (LangChain
 * `graph.query()` / assistant tools / REST routes) BYPASSES `@authorization`
 * and must re-apply the same gate. These helpers are that gate.
 *
 * The predicate mirrors the FieldPulse READ filter: a pulse is viewable iff it
 * sits in a FieldContext of a Space the user owns or is a member of (any role,
 * including GUEST — matching `canViewContent`).
 */

/**
 * A Cypher boolean predicate (for a WHERE clause) that is true iff the user
 * bound to `$<userParam>` can VIEW the pulse bound to `pulseVar`.
 *
 * Usage:
 *   MATCH (pulse:FieldPulse) WHERE ... AND ${viewablePulsePredicate('pulse')}
 * and pass the user id as the `currentUserId` parameter (or whatever
 * `userParam` you choose).
 *
 * `pulseVar` / `userParam` are caller-controlled Cypher identifiers, never user
 * input — do not interpolate request data here.
 */
export function viewablePulsePredicate(
  pulseVar: string,
  userParam = 'currentUserId'
): string {
  return `EXISTS {
    MATCH (vspace:Space)-[:HAS_CONTEXT]->(:FieldContext)-[:HAS_PULSE]->(${pulseVar})
    WHERE (vspace)<-[:OWNS]-(:Person { id: $${userParam} })
       OR (vspace)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(:Person { id: $${userParam} })
  }`
}

/**
 * Whether `userId` can view the pulse `pulseId`. Fails closed on missing
 * inputs. Returned as an int from Cypher then coerced — Neo4j booleans can
 * round-trip through LangChain as strings, and the string "false" is truthy.
 */
export async function canViewPulse(
  graph: Neo4jGraph,
  userId: string | null | undefined,
  pulseId: string | null | undefined
): Promise<boolean> {
  if (!userId || !pulseId) return false
  const rows = await graph.query<{ allowed: number }>(
    `
    MATCH (pulse:FieldPulse { id: $pulseId })
    RETURN CASE WHEN ${viewablePulsePredicate('pulse', 'currentUserId')} THEN 1 ELSE 0 END AS allowed
    LIMIT 1
    `,
    { pulseId, currentUserId: userId }
  )
  return Number(rows?.[0]?.allowed || 0) === 1
}

/**
 * Whether `userId` can view content in the Space that owns `contextId`. Fails
 * closed on missing inputs.
 */
export async function canViewContext(
  graph: Neo4jGraph,
  userId: string | null | undefined,
  contextId: string | null | undefined
): Promise<boolean> {
  if (!userId || !contextId) return false
  const rows = await graph.query<{ allowed: number }>(
    `
    MATCH (vspace:Space)-[:HAS_CONTEXT]->(:FieldContext { id: $contextId })
    WITH vspace LIMIT 25
    RETURN CASE WHEN any(s IN collect(vspace) WHERE
        EXISTS { (s)<-[:OWNS]-(:Person { id: $currentUserId }) }
        OR EXISTS { (s)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(:Person { id: $currentUserId }) }
      ) THEN 1 ELSE 0 END AS allowed
    `,
    { contextId, currentUserId: userId }
  )
  return Number(rows?.[0]?.allowed || 0) === 1
}
