import { randomUUID } from 'node:crypto'
import type { Driver } from 'neo4j-driver'

/**
 * Nested FieldContext orchestrators (GOAL-295). Shared by the GraphQL
 * `createSubFieldContext` / `moveFieldContext` mutations so every write to
 * the HAS_SUBCONTEXT hierarchy overlay flows through one gate.
 *
 * Model invariants (see ADR-017 in kb/06-adr.md):
 *
 *   - HAS_SUBCONTEXT is a pure overlay: every context — root or nested —
 *     keeps its own (Space)-[:HAS_CONTEXT] edge. Auth filters, soft delete,
 *     resonance discovery, and the bloom generator's Space anchoring all
 *     keep working unchanged because of that edge.
 *   - A context has at most ONE parent, in the SAME Space.
 *   - No cycles; nesting depth is capped at MAX_SUBCONTEXT_DEPTH (a root
 *     context sits at depth 0).
 *
 * The invariants are enforced here because the generated nested-connect
 * mutations cannot express them — the SDL declares the parentContext /
 * subContexts fields with `nestedOperations: []` so this file is the only
 * write path. Validation reads and the write run inside one transaction;
 * like the rest of the codebase this trusts single-statement atomicity per
 * invariant rather than serializable isolation.
 *
 * Authorization matches the FieldContext CREATE/UPDATE matrix in
 * kb/02-user-roles.md: Space owner, ADMIN, or MEMBER (canEditContent).
 * A missing context and a forbidden caller both return the same
 * `forbidden` failure so existence is not leaked to non-members — same
 * convention as `softDeleteFieldContext`.
 */

/**
 * Maximum nesting depth: a root context is depth 0, so a chain can hold at
 * most this many HAS_SUBCONTEXT hops.
 *
 * Variable-length traversals are hard-bounded at `*..10` (headroom over this
 * cap) in: this file's gate/validation queries,
 * `soft-delete-field-context.ts` (cascade collect),
 * `resonance/discovery/pattern-detector.ts` (subtree search, root climb,
 * containment guard), `simulation/chat-tools.ts` (getFocalRecord), and the
 * `resonancesInContext` / `ancestorContexts` @cypher blocks in
 * `graphql/schema/schema.gql`. Raising this constant past 10 silently
 * truncates all of them — update the literals together.
 */
export const MAX_SUBCONTEXT_DEPTH = 5

export interface SubContextDependencies {
  driver: Driver
}

export interface CreateSubFieldContextInput {
  currentUserId: string
  parentContextId: string
  title: string
  emergentName?: string | null
}

export type SubContextFailureReason =
  | 'forbidden'
  | 'invalid_input'
  | 'invalid_target'
  | 'cycle'
  | 'depth_exceeded'

export interface SubContextFailure {
  ok: false
  reason: SubContextFailureReason
  error: string
}

export interface CreateSubFieldContextSuccess {
  ok: true
  contextId: string
  title: string
  parentContextId: string
}

export type CreateSubFieldContextResult =
  | CreateSubFieldContextSuccess
  | SubContextFailure

export interface MoveFieldContextInput {
  currentUserId: string
  contextId: string
  newParentContextId?: string | null
}

export interface MoveFieldContextSuccess {
  ok: true
  contextId: string
  newParentContextId: string | null
  moved: boolean
}

export type MoveFieldContextResult = MoveFieldContextSuccess | SubContextFailure

const FORBIDDEN: SubContextFailure = {
  ok: false,
  reason: 'forbidden',
  error: 'You do not have permission to organize fields in this space.',
}

/**
 * Gate fragment shared by both mutations: resolve the context's live Space
 * (via HAS_CONTEXT — a soft-deleted context never matches) and check
 * canEditContent (owner, ADMIN, or MEMBER).
 */
const EDIT_GATE = `
  MATCH (space:Space)-[:HAS_CONTEXT]->(c:FieldContext {id: $contextId})
  OPTIONAL MATCH (owner:Person {id: $userId})-[:OWNS]->(space)
  OPTIONAL MATCH (space)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(:Person {id: $userId})
  WHERE sm.role IN ['ADMIN', 'MEMBER']
  WITH space, c, (owner IS NOT NULL OR sm IS NOT NULL) AS allowed
`

export async function createSubFieldContext(
  deps: SubContextDependencies,
  input: CreateSubFieldContextInput
): Promise<CreateSubFieldContextResult> {
  const parentContextId = input.parentContextId?.trim() || ''
  const title = input.title?.trim() || ''
  const emergentName = input.emergentName?.trim() || null
  if (!parentContextId) {
    return {
      ok: false,
      reason: 'invalid_input',
      error: 'parentContextId is required.',
    }
  }
  if (!title) {
    return { ok: false, reason: 'invalid_input', error: 'title is required.' }
  }
  const userId = input.currentUserId?.trim() || ''
  if (!userId) {
    return FORBIDDEN
  }

  const logId = `log_${Date.now()}_${randomUUID().slice(0, 8)}`

  const session = deps.driver.session()
  try {
    return await session.executeWrite(
      async (tx): Promise<CreateSubFieldContextResult> => {
        const gate = await tx.run(
          `
          ${EDIT_GATE}
          OPTIONAL MATCH path = (:FieldContext)-[:HAS_SUBCONTEXT*1..10]->(c)
          RETURN allowed, coalesce(max(length(path)), 0) AS parentDepth
          LIMIT 1
          `,
          { contextId: parentContextId, userId }
        )
        const gateRecord = gate.records[0]
        if (!gateRecord || !gateRecord.get('allowed')) {
          return FORBIDDEN
        }
        const parentDepth = Number(gateRecord.get('parentDepth') ?? 0)
        if (parentDepth + 1 > MAX_SUBCONTEXT_DEPTH) {
          return {
            ok: false,
            reason: 'depth_exceeded',
            error: `Fields can be nested at most ${MAX_SUBCONTEXT_DEPTH} levels deep.`,
          }
        }

        const result = await tx.run(
          `
          MATCH (space:Space)-[:HAS_CONTEXT]->(parent:FieldContext {id: $parentContextId})
          MATCH (u:Person:User {id: $userId})
          // Defensive: a context should have exactly one Space edge; collapse
          // to one row so a data anomaly can't multiply the CREATEs below.
          WITH space, parent, u
          LIMIT 1
          CREATE (child:FieldContext {
            id: 'context_' + randomUUID(),
            title: $title,
            createdAt: datetime(),
            updatedAt: datetime()
          })
          FOREACH (_ IN CASE WHEN $emergentName IS NULL THEN [] ELSE [1] END |
            SET child.emergentName = $emergentName)
          CREATE (space)-[:HAS_CONTEXT]->(child)
          CREATE (parent)-[:HAS_SUBCONTEXT]->(child)
          CREATE (child)-[:CREATED_BY]->(u)
          // Metadata is composed here so it can carry the freshly minted
          // child id — the JS-side payload only knows the parent. Ids are
          // server-generated ('context_' + uuid), so plain concatenation is
          // JSON-safe.
          CREATE (log:Log {
            id: $logId,
            description: 'Created a sub-field: "' + $title + '" under "' +
              coalesce(parent.title, 'Untitled') + '"',
            metadata: '{"parentContextId":"' + parent.id +
              '","contextId":"' + child.id + '"}',
            createdAt: datetime()
          })
          CREATE (log)-[:CREATED_BY]->(u)
          RETURN child.id AS contextId, child.title AS title,
                 parent.id AS parentContextId
          LIMIT 1
          `,
          {
            parentContextId,
            userId,
            title,
            emergentName,
            logId,
          }
        )
        const record = result.records[0]
        if (!record) {
          return FORBIDDEN
        }
        return {
          ok: true,
          contextId: record.get('contextId') as string,
          title: record.get('title') as string,
          parentContextId: record.get('parentContextId') as string,
        }
      }
    )
  } finally {
    await session.close()
  }
}

export async function moveFieldContext(
  deps: SubContextDependencies,
  input: MoveFieldContextInput
): Promise<MoveFieldContextResult> {
  const contextId = input.contextId?.trim() || ''
  const newParentContextId = input.newParentContextId?.trim() || null
  if (!contextId) {
    return {
      ok: false,
      reason: 'invalid_input',
      error: 'contextId is required.',
    }
  }
  if (newParentContextId === contextId) {
    return {
      ok: false,
      reason: 'cycle',
      error: 'A field cannot be nested under itself.',
    }
  }
  const userId = input.currentUserId?.trim() || ''
  if (!userId) {
    return FORBIDDEN
  }

  const logId = `log_${Date.now()}_${randomUUID().slice(0, 8)}`
  const metadata = JSON.stringify({ contextId, newParentContextId })

  const session = deps.driver.session()
  try {
    return await session.executeWrite(
      async (tx): Promise<MoveFieldContextResult> => {
        const gate = await tx.run(
          `
          ${EDIT_GATE}
          OPTIONAL MATCH (currentParent:FieldContext)-[:HAS_SUBCONTEXT]->(c)
          OPTIONAL MATCH downPath = (c)-[:HAS_SUBCONTEXT*1..10]->(d:FieldContext)
          WHERE d.deletedAt IS NULL
          RETURN allowed, space.id AS spaceId,
                 currentParent.id AS currentParentId,
                 coalesce(max(length(downPath)), 0) AS subtreeHeight
          LIMIT 1
          `,
          { contextId, userId }
        )
        const gateRecord = gate.records[0]
        if (!gateRecord || !gateRecord.get('allowed')) {
          return FORBIDDEN
        }
        const spaceId = gateRecord.get('spaceId') as string
        const currentParentId =
          (gateRecord.get('currentParentId') as string | null) ?? null
        const subtreeHeight = Number(gateRecord.get('subtreeHeight') ?? 0)

        if (currentParentId === newParentContextId) {
          // Already where the caller wants it — succeed without writing.
          return { ok: true, contextId, newParentContextId, moved: false }
        }

        if (newParentContextId) {
          const target = await tx.run(
            `
            MATCH (space:Space {id: $spaceId})-[:HAS_CONTEXT]->(np:FieldContext {id: $newParentContextId})
            MATCH (c:FieldContext {id: $contextId})
            WITH np, EXISTS { MATCH (c)-[:HAS_SUBCONTEXT*1..10]->(np) } AS wouldCycle
            OPTIONAL MATCH upPath = (:FieldContext)-[:HAS_SUBCONTEXT*1..10]->(np)
            RETURN wouldCycle, coalesce(max(length(upPath)), 0) AS newParentDepth
            LIMIT 1
            `,
            { spaceId, newParentContextId, contextId }
          )
          const targetRecord = target.records[0]
          if (!targetRecord) {
            return {
              ok: false,
              reason: 'invalid_target',
              error:
                'The destination field was not found in the same space — fields can only be nested within their own space.',
            }
          }
          if (targetRecord.get('wouldCycle')) {
            return {
              ok: false,
              reason: 'cycle',
              error:
                'A field cannot be moved under one of its own sub-fields.',
            }
          }
          const newParentDepth = Number(
            targetRecord.get('newParentDepth') ?? 0
          )
          if (newParentDepth + 1 + subtreeHeight > MAX_SUBCONTEXT_DEPTH) {
            return {
              ok: false,
              reason: 'depth_exceeded',
              error: `That move would nest fields more than ${MAX_SUBCONTEXT_DEPTH} levels deep.`,
            }
          }

          const result = await tx.run(
            `
            MATCH (c:FieldContext {id: $contextId})
            MATCH (np:FieldContext {id: $newParentContextId})
            MATCH (u:Person:User {id: $userId})
            OPTIONAL MATCH (:FieldContext)-[oldRel:HAS_SUBCONTEXT]->(c)
            DELETE oldRel
            WITH DISTINCT c, np, u
            MERGE (np)-[:HAS_SUBCONTEXT]->(c)
            CREATE (log:Log {
              id: $logId,
              description: 'Moved field "' + coalesce(c.title, 'Untitled') +
                '" under "' + coalesce(np.title, 'Untitled') + '"',
              metadata: $metadata,
              createdAt: datetime()
            })
            CREATE (log)-[:CREATED_BY]->(u)
            RETURN c.id AS contextId
            LIMIT 1
            `,
            { contextId, newParentContextId, userId, logId, metadata }
          )
          if (!result.records[0]) {
            return FORBIDDEN
          }
          return { ok: true, contextId, newParentContextId, moved: true }
        }

        const result = await tx.run(
          `
          MATCH (c:FieldContext {id: $contextId})
          MATCH (u:Person:User {id: $userId})
          OPTIONAL MATCH (:FieldContext)-[oldRel:HAS_SUBCONTEXT]->(c)
          DELETE oldRel
          WITH DISTINCT c, u
          CREATE (log:Log {
            id: $logId,
            description: 'Moved field "' + coalesce(c.title, 'Untitled') +
              '" to the top level of its space',
            metadata: $metadata,
            createdAt: datetime()
          })
          CREATE (log)-[:CREATED_BY]->(u)
          RETURN c.id AS contextId
          LIMIT 1
          `,
          { contextId, userId, logId, metadata }
        )
        if (!result.records[0]) {
          return FORBIDDEN
        }
        return { ok: true, contextId, newParentContextId: null, moved: true }
      }
    )
  } finally {
    await session.close()
  }
}
