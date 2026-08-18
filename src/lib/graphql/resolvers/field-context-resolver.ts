import { GraphQLError } from 'graphql'
import { driver } from '@/lib/neo4j/driver'
import { softDeleteFieldContext } from '@/lib/field-context/soft-delete-field-context'
import {
  createSubFieldContext,
  moveFieldContext,
  type SubContextFailureReason,
} from '@/lib/field-context/sub-context'

/**
 * GraphQL surface for FieldContext lifecycle (GOAL-319) and the nested
 * sub-context hierarchy (GOAL-295).
 *
 *   mutation deleteFieldContext(contextId: ID!) -> DeleteFieldContextResponse
 *   mutation createSubFieldContext(parentContextId: ID!, title: String!,
 *     emergentName: String) -> CreateSubFieldContextResponse
 *   mutation moveFieldContext(contextId: ID!, newParentContextId: ID)
 *     -> MoveFieldContextResponse
 *
 * The generated `deleteFieldContexts` is disabled on the type
 * (`@mutation(operations: [CREATE, UPDATE])`) — it ran a bare DETACH DELETE
 * on the context node and orphaned every nested pulse. This resolver
 * delegates to the shared soft-delete orchestrator, which the assistant's
 * `delete_field_context` HITL tool also uses, so both paths delete
 * identically: permission gate + deletedAt stamps + Space-edge re-pointing +
 * activity Log in one transaction, then a 90-day purge via cron.
 *
 * The HAS_SUBCONTEXT hierarchy writes likewise flow only through the
 * custom orchestrators in `src/lib/field-context/sub-context.ts` — the SDL
 * declares parentContext/subContexts with `nestedOperations: []` so the
 * single-parent / same-Space / no-cycle / depth invariants cannot be
 * bypassed via generated nested connects.
 */

function failureCode(reason: SubContextFailureReason): string {
  return reason === 'forbidden' ? 'FORBIDDEN' : 'BAD_USER_INPUT'
}

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
      deletedSubContextCount: result.deletedSubContextCount,
    }
  },

  createSubFieldContext: async (
    _parent: unknown,
    args: { parentContextId: string; title: string; emergentName?: string | null },
    context: ResolverContext
  ) => {
    const userId = requireUserId(context)

    const result = await createSubFieldContext(
      { driver },
      {
        currentUserId: userId,
        parentContextId: String(args.parentContextId ?? ''),
        title: String(args.title ?? ''),
        emergentName: args.emergentName ?? null,
      }
    )

    if (!result.ok) {
      throw new GraphQLError(result.error, {
        extensions: { code: failureCode(result.reason), reason: result.reason },
      })
    }

    return {
      contextId: result.contextId,
      title: result.title,
      parentContextId: result.parentContextId,
    }
  },

  moveFieldContext: async (
    _parent: unknown,
    args: { contextId: string; newParentContextId?: string | null },
    context: ResolverContext
  ) => {
    const userId = requireUserId(context)

    const result = await moveFieldContext(
      { driver },
      {
        currentUserId: userId,
        contextId: String(args.contextId ?? ''),
        newParentContextId: args.newParentContextId ?? null,
      }
    )

    if (!result.ok) {
      throw new GraphQLError(result.error, {
        extensions: { code: failureCode(result.reason), reason: result.reason },
      })
    }

    return {
      contextId: result.contextId,
      newParentContextId: result.newParentContextId,
      moved: result.moved,
    }
  },
}
