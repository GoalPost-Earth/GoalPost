'use client'

import { useCallback, useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import {
  CREATE_PROMISE_WEAVE_MUTATION,
  UPDATE_PROMISE_WEAVE_MUTATION,
  DELETE_PROMISE_WEAVE_MUTATION,
} from '@/app/graphql/mutations/PROMISE_WEAVE_MUTATIONS'
import { LOG_WEAVE_ACTIVITY } from '@/app/graphql/mutations/ACTIVITY_LOG_MUTATIONS'
import { WEAVE_ORIGIN, WEAVE_STATUS, type WeaveStatus } from '@/lib/promise-weave'
import type {
  EditingWeave,
  PromiseWeaveDraft,
} from '@/components/fields/promise-weave-modal'

type WeaveLike = {
  id: string
  title?: string | null
  description?: string | null
  weaves?: Array<{ id: string }> | null
  wovenFor?: Array<{ id: string }> | null
}

interface UsePromiseWeavesOptions {
  /** FieldContext the weaves are anchored in via HAS_WEAVE. */
  contextId: string
  /**
   * Authoring member — connected as `CREATED_BY` so a weave records WHO wove
   * it, not merely that a member did. Migration-built weaves carry the edge
   * too, so authorship queries over `:PromiseWeave` must not have a hole where
   * user-authored weaves should be.
   */
  currentUserId?: string | null
  /** Awaited after every successful write so the section re-renders fresh. */
  refetch: () => Promise<unknown>
}

/** A weave with no pulses contradicts WF-12 — it holds nothing. */
class EmptyWeaveError extends Error {
  constructor() {
    super('A weave holds at least one pulse — choose what it connects.')
    this.name = 'EmptyWeaveError'
  }
}

/**
 * Create / edit / delete and lifecycle transitions for PromiseWeaves in one
 * field context.
 *
 * The server is the authority on who may write: the `PromiseWeave` type's
 * `@authorization` validate rules require OWNER / ADMIN / MEMBER on the owning
 * Me/We space (kb/02-user-roles.md), reached through the `HAS_WEAVE` context
 * edge. Callers still hide the affordances for viewers — that is a "don't offer
 * what won't work" measure, never the boundary itself.
 *
 * Every write logs an activity `Log` (spike §4). Logging is best-effort and
 * never fails the write it describes, matching the resonance handlers.
 */
export function usePromiseWeaves({
  contextId,
  currentUserId,
  refetch,
}: UsePromiseWeavesOptions) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWeave, setEditingWeave] = useState<EditingWeave | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Only the row being transitioned dims, rather than the whole section.
  const [pendingWeaveId, setPendingWeaveId] = useState<string | null>(null)

  const [createPromiseWeave] = useMutation(CREATE_PROMISE_WEAVE_MUTATION)
  const [updatePromiseWeave] = useMutation(UPDATE_PROMISE_WEAVE_MUTATION)
  const [deletePromiseWeave] = useMutation(DELETE_PROMISE_WEAVE_MUTATION)
  const [logWeaveActivity] = useMutation(LOG_WEAVE_ACTIVITY)

  const log = useCallback(
    (input: {
      action: string
      weaveId: string
      weaveName: string
      pulseIds: string[]
    }) => {
      logWeaveActivity({
        variables: { input: { ...input, contextId } },
      }).catch((err) =>
        console.warn(`Failed to log weave ${input.action}:`, err)
      )
    },
    [logWeaveActivity, contextId]
  )

  const openCreate = useCallback(() => {
    setEditingWeave(null)
    setIsModalOpen(true)
  }, [])

  const openEdit = useCallback((weave: WeaveLike) => {
    setEditingWeave({
      id: weave.id,
      title: weave.title ?? '',
      description: weave.description ?? '',
      pulseIds: (weave.weaves ?? []).map((p) => p.id),
      wovenForId: weave.wovenFor?.[0]?.id ?? null,
    })
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingWeave(null)
  }, [])

  const submit = useCallback(
    async (draft: PromiseWeaveDraft & { id?: string }) => {
      // Enforced HERE, not only in the modal: this hook is the single write
      // path, so a later surface must not be able to mint an orphan weave. With
      // an empty set the update path would disconnect every pulse and reconnect
      // none.
      if (draft.pulseIds.length === 0) throw new EmptyWeaveError()

      setIsSubmitting(true)
      try {
        if (draft.id) {
          // Disconnect-all + connect-intended in ONE field entry: the modal
          // hands back the full intended set, so anything the member unticked
          // must actually leave or the weave would only ever grow.
          //
          // The connect predicate is a single `id_IN` rather than one entry per
          // pulse. `weaves` points at the FieldPulse INTERFACE, and
          // @neo4j/graphql expands each connect entry across every
          // implementation — with more than one entry it emits the same Cypher
          // variable twice and Neo4j rejects the query for variable shadowing.
          await updatePromiseWeave({
            variables: {
              where: { id_EQ: draft.id },
              update: {
                title_SET: draft.title,
                description_SET: draft.description || null,
                modifiedAt_SET: new Date().toISOString(),
                weaves: [
                  {
                    disconnect: [{ where: {} }],
                    connect: [{ where: { node: { id_IN: draft.pulseIds } } }],
                  },
                ],
                // `wovenFor` is 0..1 by contract (see the schema note) — the
                // picker is a single select, so disconnect-all is exactly the
                // intended set, not an over-broad sweep. The disconnect is
                // scoped to THIS weave's own edges by @neo4j/graphql.
                wovenFor: [
                  {
                    disconnect: [{ where: {} }],
                    ...(draft.wovenForId
                      ? {
                          connect: [
                            { where: { node: { id_EQ: draft.wovenForId } } },
                          ],
                        }
                      : {}),
                  },
                ],
              },
            },
          })
          log({
            action: 'updated',
            weaveId: draft.id,
            weaveName: draft.title,
            pulseIds: draft.pulseIds,
          })
        } else {
          // The schema pins `createdBy` to the caller at CREATE (GOAL-341
          // review), so a create without it is refused server-side as a blunt
          // "Forbidden". Fail here instead, with something a member can act on.
          if (!currentUserId) {
            throw new Error(
              'We could not confirm who you are signed in as. Refresh and try again.'
            )
          }
          const response = await createPromiseWeave({
            variables: {
              input: [
                {
                  title: draft.title,
                  description: draft.description || null,
                  status: WEAVE_STATUS.ACTIVE,
                  origin: WEAVE_ORIGIN.USER,
                  createdAt: new Date().toISOString(),
                  // One `id_IN` predicate, not one entry per pulse — see the
                  // interface-expansion note on the update path below.
                  weaves: {
                    connect: [{ where: { node: { id_IN: draft.pulseIds } } }],
                  },
                  ...(draft.wovenForId
                    ? {
                        wovenFor: {
                          connect: [
                            { where: { node: { id_EQ: draft.wovenForId } } },
                          ],
                        },
                      }
                    : {}),
                  // Authorship. `origin: 'user'` only says *a* member wove it;
                  // this edge says which one, and matches what the migration
                  // writes on its own weaves. Not optional: the type-level
                  // validate rule requires exactly one CREATED_BY edge pointing
                  // at the caller, which is what stops a member forging a weave
                  // attributed to the Space owner.
                  createdBy: {
                    connect: [{ where: { node: { id_EQ: currentUserId } } }],
                  },
                  // The context edge is the visibility anchor — without it the
                  // weave is invisible to every read AND unreachable by the
                  // authorization filter, so it is never optional.
                  context: {
                    connect: [{ where: { node: { id_EQ: contextId } } }],
                  },
                },
              ],
            },
          })

          const createdId =
            response.data?.createPromiseWeaves?.promiseWeaves?.[0]?.id
          if (createdId) {
            log({
              action: 'created',
              weaveId: createdId,
              weaveName: draft.title,
              pulseIds: draft.pulseIds,
            })
          }
        }

        closeModal()
        // The write has already landed and the server has the data — a failed
        // refresh must not be reported as a failed save. Mirrors
        // create-nested-field-modal.tsx.
        try {
          await refetch()
        } catch (refreshError) {
          console.warn('[promise-weave] post-write refresh failed', refreshError)
        }
        toast.success(
          draft.id ? 'Promise weave updated' : 'Promise weave created'
        )
      } catch (error) {
        // The modal stays open on failure and renders this inline, next to the
        // fields the member has to change — so re-throw WITHOUT a toast rather
        // than reporting the same sentence through two channels at once.
        throw error instanceof Error
          ? error
          : new Error('Could not save the promise weave')
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      createPromiseWeave,
      updatePromiseWeave,
      contextId,
      currentUserId,
      log,
      closeModal,
      refetch,
    ]
  )

  const remove = useCallback(async () => {
    if (!editingWeave) return
    setIsSubmitting(true)
    try {
      await deletePromiseWeave({ variables: { id: editingWeave.id } })
      log({
        action: 'deleted',
        weaveId: editingWeave.id,
        weaveName: editingWeave.title,
        pulseIds: editingWeave.pulseIds,
      })
      closeModal()
      // As in `submit`: the delete has landed, so a failed refresh only warns.
      try {
        await refetch()
      } catch (refreshError) {
        console.warn('[promise-weave] post-delete refresh failed', refreshError)
      }
      toast.success('Promise weave deleted')
    } catch (error) {
      // Same single-channel rule as `submit` — the modal is still open, so the
      // inline error box reports it rather than a toast.
      throw error instanceof Error
        ? error
        : new Error('Could not delete the promise weave')
    } finally {
      setIsSubmitting(false)
    }
  }, [deletePromiseWeave, editingWeave, log, closeModal, refetch])

  /**
   * Move a weave to a new lifecycle state — the HITL gate on AI-proposed
   * weaves (`proposed` → `active` | `dissolved`) and the "kept the promise"
   * transition. See kb/04-state-machines.md.
   */
  const setStatus = useCallback(
    async (weave: WeaveLike, status: WeaveStatus) => {
      // One transition at a time. `pendingWeaveId` is a single scalar, so
      // without this a second confirm's `finally` would clear the flag while
      // the first is still in flight — un-dimming its row and re-enabling its
      // buttons mid-write.
      if (pendingWeaveId) return
      setPendingWeaveId(weave.id)
      try {
        await updatePromiseWeave({
          variables: {
            where: { id_EQ: weave.id },
            update: {
              status_SET: status,
              modifiedAt_SET: new Date().toISOString(),
            },
          },
        })
        const action =
          status === WEAVE_STATUS.ACTIVE
            ? 'confirmed'
            : status === WEAVE_STATUS.DISSOLVED
              ? 'dissolved'
              : status === WEAVE_STATUS.FULFILLED
                ? 'fulfilled'
                : 'updated'
        log({
          action,
          weaveId: weave.id,
          weaveName: weave.title ?? '',
          pulseIds: (weave.weaves ?? []).map((p) => p.id),
        })
        try {
          await refetch()
        } catch (refreshError) {
          console.warn(
            '[promise-weave] post-transition refresh failed',
            refreshError
          )
        }
        // A transition has no inline surface — the row IS the affordance — so
        // unlike submit/remove this one reports through a toast.
        toast.success(
          status === WEAVE_STATUS.ACTIVE
            ? 'Promise weave confirmed'
            : status === WEAVE_STATUS.DISSOLVED
              ? 'Promise weave dismissed'
              : 'Promise weave updated'
        )
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Could not update the promise weave'
        )
      } finally {
        setPendingWeaveId(null)
      }
    },
    [updatePromiseWeave, log, refetch, pendingWeaveId]
  )

  return {
    isModalOpen,
    editingWeave,
    isSubmitting,
    pendingWeaveId,
    openCreate,
    openEdit,
    closeModal,
    submit,
    remove,
    setStatus,
  }
}
