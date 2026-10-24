import { randomUUID } from 'crypto'
import type { ManagedTransaction } from 'neo4j-driver'
import { Context } from '@/config/types'

/**
 * GOAL-387 — remove an organization from a field, or delete it, from the
 * field's Dashboard view.
 *
 * The generated Organization mutations stay disabled (`@mutation(operations:
 * [])`); these resolvers are the only GraphQL write paths that take an
 * organization out of a field. Custom resolvers bypass `@authorization`, so the
 * gate below carries the whole check:
 *   - the caller must be able to EDIT the field — owner, ADMIN or MEMBER of its
 *     parent Space (GUESTs are view-only, kb/02-user-roles.md), the same rule as
 *     `canEditContent` and `addPersonToFieldContext`;
 *   - the organization must be in that field.
 * A missing field, a missing organization and a refused caller all answer the
 * same way, so the response cannot be used to probe other Spaces.
 *
 * Every successful change writes one activity Log, in the same transaction.
 */

const NOT_ALLOWED = 'You can only change organizations in fields you can edit.'

/** True when `$userId` can edit field `ctx` (bound in the surrounding query). */
const CALLER_CAN_EDIT = (ctx: string) => `EXISTS {
  MATCH (space:Space)-[:HAS_CONTEXT]->(${ctx})
  WHERE (:Person {id: $userId})-[:OWNS]->(space)
     OR EXISTS {
       MATCH (space)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(:Person {id: $userId})
       WHERE sm.role IN ['ADMIN', 'MEMBER']
     }
}`

function logId() {
  return `log_${Date.now()}_${randomUUID().slice(0, 8)}`
}

function readArgs(
  args: { contextId: string; organizationId: string },
  context: Context
) {
  return {
    userId: context.jwt?.user?.id?.trim() || '',
    contextId: args.contextId?.trim() || '',
    organizationId: args.organizationId?.trim() || '',
  }
}

type Result = { success: boolean; message: string; deleted: boolean }

const refused = (): Result => ({
  success: false,
  message: NOT_ALLOWED,
  deleted: false,
})

/** Detach from one field; delete the org if no field holds it afterwards. */
async function removeFromField(
  tx: ManagedTransaction,
  params: { userId: string; contextId: string; organizationId: string }
): Promise<Result> {
  const result = await tx.run(
    `
    MATCH (u:Person {id: $userId})
    MATCH (c:FieldContext {id: $contextId})-[r:HAS_ORGANIZATION]->(o:Organization {id: $organizationId})
    WHERE ${CALLER_CAN_EDIT('c')}
    WITH u, c, r, o, coalesce(o.name, 'An organization') AS orgName
    DELETE r
    // A context-less organization is unreachable by every READ path (its only
    // Space tie is HAS_ORGANIZATION), so it is deleted rather than orphaned —
    // the same exclusive-holder rule the deleted-field purge applies.
    WITH u, c, o, orgName,
         NOT EXISTS { MATCH (:FieldContext)-[:HAS_ORGANIZATION]->(o) } AS orphaned
    CREATE (log:Log {
      id: $logId,
      description: CASE WHEN orphaned
        THEN 'Removed ' + orgName + ' from ' + coalesce(c.title, 'a field') + ' (it was in no other field, so it was deleted)'
        ELSE 'Removed ' + orgName + ' from ' + coalesce(c.title, 'a field')
      END,
      metadata: $metadata,
      createdAt: datetime()
    })
    CREATE (log)-[:CREATED_BY]->(u)
    FOREACH (_ IN CASE WHEN orphaned THEN [1] ELSE [] END | DETACH DELETE o)
    RETURN orphaned, orgName
    `,
    {
      ...params,
      logId: logId(),
      metadata: JSON.stringify({
        event: 'organization_removed_from_field',
        fieldContextId: params.contextId,
        organizationId: params.organizationId,
      }),
    }
  )
  const record = result.records[0]
  if (!record) return refused()
  return {
    success: true,
    deleted: Boolean(record.get('orphaned')),
    message: `Removed ${record.get('orgName')} from this field.`,
  }
}

/**
 * Delete outright when the caller can edit every field holding the org;
 * otherwise detach it from the ones they can edit and leave it for the rest.
 *
 * A soft-deleted field (HAS_DELETED_CONTEXT, no live parent) fails the edit
 * gate, so it counts as a field the caller cannot edit: the org stays for it,
 * and the deleted-field purge decides its fate later — the same answer
 * `removeFromField` gives.
 */
async function deleteFromFields(
  tx: ManagedTransaction,
  params: { userId: string; contextId: string; organizationId: string }
): Promise<Result> {
  const plan = await tx.run(
    `
    MATCH (c:FieldContext {id: $contextId})-[:HAS_ORGANIZATION]->(o:Organization {id: $organizationId})
    WHERE ${CALLER_CAN_EDIT('c')}
    // Write-lock the org before reading who holds it, so a concurrent attach
    // (contact import MERGEs HAS_ORGANIZATION) waits for this transaction and
    // the decision below cannot go stale before the write.
    SET o._lock = true
    REMOVE o._lock
    WITH o
    MATCH (h:FieldContext)-[:HAS_ORGANIZATION]->(o)
    WITH o, collect(DISTINCT h) AS holders
    RETURN coalesce(o.name, 'An organization') AS orgName,
      [h IN holders WHERE ${CALLER_CAN_EDIT('h')} | h.id] AS editableIds,
      size([h IN holders WHERE NOT ${CALLER_CAN_EDIT('h')}]) AS lockedCount
    `,
    params
  )
  const record = plan.records[0]
  if (!record) return refused()

  const orgName: string = record.get('orgName')
  const editableIds: string[] = record.get('editableIds')
  const lockedCount = Number(record.get('lockedCount'))
  const metadata = JSON.stringify({
    event: 'organization_deleted',
    fieldContextId: params.contextId,
    organizationId: params.organizationId,
    fullDelete: lockedCount === 0,
  })

  if (lockedCount === 0) {
    const deleted = await tx.run(
      `
      MATCH (u:Person {id: $userId})
      MATCH (o:Organization {id: $organizationId})
      CREATE (log:Log {
        id: $logId,
        description: 'Deleted organization ' + $orgName,
        metadata: $metadata,
        createdAt: datetime()
      })
      CREATE (log)-[:CREATED_BY]->(u)
      DETACH DELETE o
      RETURN count(*) AS n
      `,
      { ...params, orgName, metadata, logId: logId() }
    )
    if (Number(deleted.records[0]?.get('n') ?? 0) === 0) return refused()
    return { success: true, deleted: true, message: `Deleted ${orgName}.` }
  }

  const detached = await tx.run(
    `
    MATCH (u:Person {id: $userId})
    MATCH (h:FieldContext)-[r:HAS_ORGANIZATION]->(o:Organization {id: $organizationId})
    WHERE h.id IN $editableIds
    DELETE r
    WITH u, count(r) AS n
    WHERE n > 0
    CREATE (log:Log {
      id: $logId,
      description: 'Removed organization ' + $orgName + ' from ' + toString(n) + ' field(s); it is still used elsewhere, so it was not deleted',
      metadata: $metadata,
      createdAt: datetime()
    })
    CREATE (log)-[:CREATED_BY]->(u)
    RETURN n
    `,
    { ...params, orgName, editableIds, metadata, logId: logId() }
  )
  if (detached.records.length === 0) return refused()
  return {
    success: true,
    deleted: false,
    message: `Removed ${orgName} from your fields. It is still used elsewhere, so it was not deleted.`,
  }
}

function makeResolver(work: typeof removeFromField, failure: string) {
  return async (
    _parent: never,
    args: { contextId: string; organizationId: string },
    context: Context
  ): Promise<Result> => {
    const params = readArgs(args, context)
    if (!params.userId || !params.contextId || !params.organizationId) {
      return refused()
    }
    const session = context.executionContext.session()
    try {
      return await session.executeWrite((tx) => work(tx, params))
    } catch (error) {
      // Real error server-side only: a raw driver message can carry Cypher
      // fragments that should not reach the client.
      console.error(`[organization-resolver] ${failure}`, error)
      return { success: false, message: failure, deleted: false }
    } finally {
      await session.close()
    }
  }
}

export const organizationMutations = {
  removeOrganizationFromFieldContext: makeResolver(
    removeFromField,
    'Failed to remove the organization from this field.'
  ),
  deleteOrganizationFromFieldContext: makeResolver(
    deleteFromFields,
    'Failed to delete the organization.'
  ),
}
