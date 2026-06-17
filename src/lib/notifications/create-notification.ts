/**
 * Notification Creation Service
 *
 * Recipient-addressed notifications that back the bell popover. Distinct from
 * the activity Log (see src/lib/activity-logs/create-log.ts): a Log is the
 * immutable, space-wide audit trail; a Notification is owned by exactly one
 * recipient, concerns them specifically, and carries server-side read state.
 *
 * Emission is decoupled from delivery — call sites only ever call
 * createNotification; an email/Resend channel can subscribe here later without
 * touching any caller.
 */

import { initGraph } from '@/modules/graph'

export type NotificationType =
  | 'INVITE'
  | 'ROLE_CHANGE'
  | 'MEMBERSHIP'
  | 'RESONANCE'
  | 'MENTION'

export interface CreateNotificationInput {
  recipientId: string // who receives it
  actorId?: string // who caused it (omit for system events)
  type: NotificationType
  title: string // short headline
  message: string // body — NEVER embed raw internal ids (KB Rule 1)
  link?: string // in-app route for click-through
  metadata?: Record<string, unknown>
}

/**
 * Create a Notification node for a single recipient.
 *
 * - Skips self-notifications (recipientId === actorId) — you are never notified
 *   about your own action.
 * - Best-effort: logs and returns null on failure, never throws into the
 *   caller's hot path (a notification failure must not roll back the action
 *   that triggered it).
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<string | null> {
  if (!input.recipientId) return null
  if (input.actorId && input.actorId === input.recipientId) return null

  const graph = await initGraph()
  const id = `ntf_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const metadataJson = input.metadata ? JSON.stringify(input.metadata) : null

  try {
    const result = await graph.query<{ id: string }>(
      `
      MATCH (recipient:Person {id: $recipientId})
      CREATE (n:Notification {
        id: $id,
        type: $type,
        title: $title,
        message: $message,
        link: $link,
        read: false,
        readAt: null,
        createdAt: datetime(),
        metadata: $metadataJson
      })
      CREATE (n)-[:NOTIFIES]->(recipient)
      WITH n
      OPTIONAL MATCH (actor:Person {id: $actorId})
      FOREACH (_ IN CASE WHEN actor IS NULL THEN [] ELSE [1] END |
        CREATE (n)-[:TRIGGERED_BY]->(actor)
      )
      RETURN n.id AS id
      `,
      {
        id,
        recipientId: input.recipientId,
        actorId: input.actorId ?? null,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link ?? null,
        metadataJson,
      }
    )

    // No recipient match → no node created (best-effort, not an error).
    if (!result[0]) return null
    return id
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

/**
 * Fan one event out to many recipients (e.g. both authors of a resonance, or
 * all members of a space). Each createNotification is independent and
 * best-effort, so one failure never blocks the others.
 */
export async function createNotifications(
  inputs: CreateNotificationInput[]
): Promise<void> {
  await Promise.all(
    inputs.map((input) => createNotification(input).catch(() => null))
  )
}
