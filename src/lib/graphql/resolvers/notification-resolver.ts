/**
 * Notification Resolvers
 *
 * Recipient-scoped reads + mark-read mutations for the bell popover. Every
 * operation is gated on the authenticated JWT user id: a Notification is
 * visible to, and mutable by, only its single recipient. The recipient MATCH in
 * each Cypher statement IS the authorization gate — a non-recipient matches
 * zero rows and silently no-ops.
 *
 * Reads return createdAt/readAt as ISO strings (mirroring the activity-log
 * resolver), which the DateTime scalar serializes correctly. Counts come back
 * from graph.query() as strings (Neo4j ints are stringified), so they are
 * coerced with Number(x || 0) — never .low.
 */

import { initGraph } from '@/modules/graph'
import { Context } from '@/config/types'

function resolveUserId(context: Context): string | null {
  return context.jwt?.user?.id ?? context.jwt?.sub ?? null
}

interface NotificationRow {
  id: string
  type: string
  title: string
  message: string
  link?: string | null
  read: boolean
  readAt?: string | null
  createdAt: string
  metadata?: string | null
  actorId?: string | null
  actorFirstName?: string | null
  actorLastName?: string | null
  actorName?: string | null
  actorPhoto?: string | null
}

function shapeNotification(r: NotificationRow, recipientId: string) {
  const fullName = `${r.actorFirstName || ''} ${r.actorLastName || ''}`.trim()
  const actor = r.actorId
    ? [
        {
          id: r.actorId,
          firstName: r.actorFirstName || '',
          lastName: r.actorLastName || '',
          // Never fall back to the raw actor id (KB Rule 1) — an unnamed actor
          // resolves to null and the UI shows just the message + time.
          name: r.actorName || (fullName === '' ? null : fullName),
          photo: r.actorPhoto || null,
          __typename: 'Person',
        },
      ]
    : []

  return {
    id: r.id,
    type: r.type,
    title: r.title,
    message: r.message,
    link: r.link ?? null,
    read: Boolean(r.read),
    readAt: r.readAt ?? null,
    createdAt: r.createdAt,
    metadata: r.metadata ?? null,
    recipient: [{ id: recipientId, __typename: 'Person' }],
    actor,
    __typename: 'Notification',
  }
}

async function countUnread(userId: string): Promise<number> {
  const graph = await initGraph()
  const rows = await graph.query<{ count: number | string }>(
    `
    MATCH (n:Notification)-[:NOTIFIES]->(:Person {id: $userId})
    WHERE coalesce(n.read, false) = false
    RETURN count(n) AS count
    `,
    { userId }
  )
  return Number(rows[0]?.count || 0)
}

export const notificationQueries = {
  myNotifications: async (
    _source: unknown,
    { limit = 20 }: { limit?: number },
    context: Context
  ) => {
    const userId = resolveUserId(context)
    if (!userId) return []

    const normalizedLimit = Math.max(
      1,
      Math.min(Number.parseInt(String(limit), 10) || 20, 100)
    )

    try {
      const graph = await initGraph()
      const rows = await graph.query<NotificationRow>(
        `
        MATCH (n:Notification)-[:NOTIFIES]->(:Person {id: $userId})
        OPTIONAL MATCH (n)-[:TRIGGERED_BY]->(actor:Person)
        RETURN
          n.id AS id,
          n.type AS type,
          n.title AS title,
          n.message AS message,
          n.link AS link,
          coalesce(n.read, false) AS read,
          toString(n.readAt) AS readAt,
          toString(n.createdAt) AS createdAt,
          n.metadata AS metadata,
          actor.id AS actorId,
          actor.firstName AS actorFirstName,
          actor.lastName AS actorLastName,
          actor.name AS actorName,
          actor.photo AS actorPhoto
        ORDER BY n.createdAt DESC
        LIMIT toInteger($limit)
        `,
        { userId, limit: normalizedLimit }
      )
      return rows.map((r) => shapeNotification(r, userId))
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
  },

  unreadNotificationCount: async (
    _source: unknown,
    _args: unknown,
    context: Context
  ) => {
    const userId = resolveUserId(context)
    if (!userId) return 0
    try {
      return await countUnread(userId)
    } catch (error) {
      console.error('Error counting unread notifications:', error)
      return 0
    }
  },
}

export const notificationMutations = {
  markNotificationRead: async (
    _source: unknown,
    { id }: { id: string },
    context: Context
  ) => {
    const userId = resolveUserId(context)
    if (!userId) {
      return { success: false, message: 'Unauthorized', unreadCount: 0 }
    }

    try {
      const graph = await initGraph()
      // The recipient MATCH is the auth gate: a non-recipient (or unknown id)
      // matches zero rows, so the SET never runs on someone else's node.
      await graph.query(
        `
        MATCH (n:Notification {id: $id})-[:NOTIFIES]->(:Person {id: $userId})
        SET n.read = true,
            n.readAt = coalesce(n.readAt, datetime())
        `,
        { id, userId }
      )
      const unreadCount = await countUnread(userId)
      return { success: true, message: 'Notification marked read', unreadCount }
    } catch (error) {
      console.error('Error marking notification read:', error)
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to mark read',
        unreadCount: 0,
      }
    }
  },

  markAllNotificationsRead: async (
    _source: unknown,
    _args: unknown,
    context: Context
  ) => {
    const userId = resolveUserId(context)
    if (!userId) {
      return { success: false, message: 'Unauthorized', unreadCount: 0 }
    }

    try {
      const graph = await initGraph()
      // collect() before SET so the read of n.read completes before the write,
      // avoiding the Eager operator from a read/set property conflict.
      await graph.query(
        `
        MATCH (n:Notification)-[:NOTIFIES]->(:Person {id: $userId})
        WHERE coalesce(n.read, false) = false
        WITH collect(n) AS unread
        FOREACH (x IN unread |
          SET x.read = true, x.readAt = coalesce(x.readAt, datetime())
        )
        `,
        { userId }
      )
      return { success: true, message: 'All notifications marked read', unreadCount: 0 }
    } catch (error) {
      console.error('Error marking all notifications read:', error)
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to mark all read',
        unreadCount: 0,
      }
    }
  },
}
