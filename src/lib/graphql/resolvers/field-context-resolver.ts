import { GraphQLError } from 'graphql'
import { driver } from '@/lib/neo4j/driver'
import { softDeleteFieldContext } from '@/lib/field-context/soft-delete-field-context'

/**
 * GraphQL surface for FieldContext lifecycle (GOAL-319).
 *
 *   mutation deleteFieldContext(contextId: ID!) -> DeleteFieldContextResponse
 *
 * The generated `deleteFieldContexts` is disabled on the type
 * (`@mutation(operations: [CREATE, UPDATE])`) — it ran a bare DETACH DELETE
 * on the context node and orphaned every nested pulse. This resolver
 * delegates to the shared soft-delete orchestrator, which the assistant's
 * `delete_field_context` HITL tool also uses, so both paths delete
 * identically: permission gate + deletedAt stamps + Space-edge re-pointing +
 * activity Log in one transaction, then a 90-day purge via cron.
 */

interface ResolverContext {
  jwt?: { user?: { id?: string } }
}

function requireUserId(context: ResolverContext): string {
  const userId = context.jwt?.user?.id?.trim() || ''
  if (!userId) {
    throw new GraphQLError('Authentication required.', {
      extensions: { code: 'UNAUTHENTICATED' },
    })
  }
  return userId
}

export const fieldContextMutations = {
  deleteFieldContext: async (
    _parent: unknown,
    args: { contextId: string },
    context: ResolverContext
  ) => {
    const userId = requireUserId(context)
    const contextId = String(args.contextId ?? '').trim()
    if (!contextId) {
      throw new GraphQLError('contextId is required.', {
        extensions: { code: 'BAD_USER_INPUT' },
      })
    }

    // Orchestrator does gate + stamps + edge re-pointing + Log in a single
    // transaction. A missing context and a forbidden caller return the same
    // `forbidden` failure to avoid leaking context existence to non-members.
    const result = await softDeleteFieldContext(
      { driver },
      { currentUserId: userId, contextId }
    )

    if (!result.ok) {
      const code =
        result.reason === 'forbidden' ? 'FORBIDDEN' : 'BAD_USER_INPUT'
      throw new GraphQLError(result.error, {
        extensions: { code, reason: result.reason },
      })
    }

    return {
      contextId: result.contextId,
      deleted: true,
      deletedPulseCount: result.deletedPulseCount,
    }
  },
}
