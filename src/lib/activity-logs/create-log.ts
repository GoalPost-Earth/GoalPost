/**
 * Activity Log Creation Service
 * Centralizes log creation across the application
 * Logs are stored as Neo4j nodes and linked to pulses, spaces, or other entities
 */

import { initGraph } from '@/modules/graph'

export interface CreateLogInput {
  userId: string // Person who initiated the action
  description: string // Human-readable description of what happened
  pulseIds?: string[] // Related pulses (e.g., newly created pulse)
  spaceId?: string // Related space (for space membership changes)
  contextId?: string // Related context
  metadata?: Record<string, any> // Additional context (role changes, etc.)
}

export interface LogEntry {
  id: string
  description: string
  createdAt: string
  createdBy: {
    id: string
    name: string
    firstName?: string
    lastName?: string
    photo?: string
  }
  metadata?: Record<string, any>
}

function parseMetadata(metadata: unknown): Record<string, any> | undefined {
  if (!metadata) return undefined
  if (typeof metadata === 'string') {
    try {
      return JSON.parse(metadata) as Record<string, any>
    } catch {
      return { raw: metadata }
    }
  }
  if (typeof metadata === 'object') {
    return metadata as Record<string, any>
  }
  return { raw: metadata }
}

/**
 * Create an activity log entry
 * Links to pulses and tracks who performed the action and when
 */
export async function createLog(input: CreateLogInput): Promise<string> {
  const graph = await initGraph()

  const logId = `log_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const now = new Date().toISOString()
  const metadataJson = input.metadata ? JSON.stringify(input.metadata) : null

  try {
    // Create Log node and link to creator
    const result = await graph.query<{ logId: string }>(
      `
      CREATE (log:Log {
        id: $logId,
        description: $description,
        createdAt: datetime($createdAt),
        metadata: $metadataJson,
        metadataJson: $metadataJson
      })
      
      WITH log
      MATCH (person:Person {id: $userId})
      CREATE (log)-[:CREATED_BY]->(person)

      WITH log, $pulseIds AS pulseIds
      CALL {
        WITH log, pulseIds
        UNWIND pulseIds AS pulseId
        OPTIONAL MATCH (pulse:FieldPulse {id: pulseId})
        WITH log, pulse
        WHERE pulse IS NOT NULL
        CREATE (log)-[:LOGGED_FOR]->(pulse)
        RETURN count(*) AS linkedCount
      }

      RETURN log.id as logId
      `,
      {
        logId,
        description: input.description,
        createdAt: now,
        userId: input.userId,
        pulseIds: input.pulseIds || [],
        metadataJson,
      }
    )

    if (!result[0]) {
      throw new Error('Failed to create log entry')
    }

    return logId
  } catch (error) {
    console.error('Error creating log:', error)
    throw error
  }
}

/**
 * Get recent logs for a specific context or space
 * Used for displaying notifications/activity feeds
 */
export async function getContextLogs(
  contextId: string,
  limit: number = 20
): Promise<LogEntry[]> {
  const graph = await initGraph()
  const normalizedLimit = Number.isFinite(limit)
    ? Math.max(1, Math.min(Math.floor(limit), 100))
    : 20

  try {
    const results = await graph.query<{
      id: string
      description: string
      createdAt: string
      createdById: string
      createdByName: string
      createdByFirstName?: string
      createdByLastName?: string
      createdByPhoto?: string
      metadata?: string
    }>(
      `
      MATCH (log:Log)-[:LOGGED_FOR]->(pulse:FieldPulse)-[:HAS_PULSE]-(context:FieldContext {id: $contextId})
      WITH log, pulse
      MATCH (log)-[:CREATED_BY]->(person:Person)
      WITH
        log,
        person,
        trim(coalesce(person.firstName, '') + ' ' + coalesce(person.lastName, '')) AS fullName
      RETURN
        log.id as id,
        log.description as description,
        toString(log.createdAt) as createdAt,
        person.id as createdById,
        coalesce(
          person.name,
          CASE WHEN fullName = '' THEN null ELSE fullName END,
          person.email,
          person.id
        ) as createdByName,
        person.firstName as createdByFirstName,
        person.lastName as createdByLastName,
        person.photo as createdByPhoto,
        log.metadata as metadata
      ORDER BY log.createdAt DESC
      LIMIT toInteger($limit)
      `,
      { contextId, limit: normalizedLimit }
    )

    return results.map((r) => ({
      id: r.id,
      description: r.description,
      createdAt: r.createdAt,
      createdBy: {
        id: r.createdById,
        name: r.createdByName,
        firstName: r.createdByFirstName,
        lastName: r.createdByLastName,
        photo: r.createdByPhoto,
      },
      metadata: parseMetadata(r.metadata),
    }))
  } catch (error) {
    console.error('Error fetching logs:', error)
    return []
  }
}

/**
 * Get recent logs for a specific person
 * Includes:
 * - Logs created by the user
 * - Logs from any WeSpace they own
 * - Logs from any WeSpace they are a member of
 * Used for user activity/notification feed
 */
export async function getUserLogs(
  userId: string,
  limit: number = 50
): Promise<LogEntry[]> {
  const graph = await initGraph()
  const normalizedLimit = Number.isFinite(limit)
    ? Math.max(1, Math.min(Math.floor(limit), 100))
    : 50

  try {
    const results = await graph.query<{
      id: string
      description: string
      createdAt: string
      createdById: string
      createdByName: string
      createdByFirstName?: string
      createdByLastName?: string
      createdByPhoto?: string
      metadata?: string
    }>(
      `
      MATCH (currentUser:Person {id: $userId})
      
      // Get logs: user's own logs OR logs from their WeSpaces
      OPTIONAL MATCH (userLog:Log)-[:CREATED_BY]->(currentUser)
      OPTIONAL MATCH (currentUser)-[:OWNS]->(ownedSpace:WeSpace)-[:HAS_CONTEXT]->(ownedContext:FieldContext)-[:HAS_PULSE]-(ownedPulse:FieldPulse)<-[:LOGGED_FOR]-(ownedLog:Log)
      OPTIONAL MATCH (memberSpace:WeSpace)-[:HAS_MEMBER]->(membership:SpaceMembership)-[:IS_MEMBER]->(currentUser)
      OPTIONAL MATCH (memberSpace)-[:HAS_CONTEXT]->(memberContext:FieldContext)-[:HAS_PULSE]-(memberPulse:FieldPulse)<-[:LOGGED_FOR]-(memberLog:Log)
      
      // Collect and deduplicate all logs
      WITH collect(distinct userLog) + collect(distinct ownedLog) + collect(distinct memberLog) as allLogs
      
      // Filter nulls and process
      UNWIND allLogs as log
      WITH log WHERE log IS NOT NULL
      MATCH (log)-[:CREATED_BY]->(creator:Person)
      WITH
        log,
        creator,
        trim(coalesce(creator.firstName, '') + ' ' + coalesce(creator.lastName, '')) AS fullName
      
      RETURN
        log.id as id,
        log.description as description,
        toString(log.createdAt) as createdAt,
        creator.id as createdById,
        coalesce(
          creator.name,
          CASE WHEN fullName = '' THEN null ELSE fullName END,
          creator.email,
          creator.id
        ) as createdByName,
        creator.firstName as createdByFirstName,
        creator.lastName as createdByLastName,
        creator.photo as createdByPhoto,
        log.metadata as metadata
      ORDER BY log.createdAt DESC
      LIMIT toInteger($limit)
      `,
      { userId, limit: normalizedLimit }
    )

    return results.map((r) => ({
      id: r.id,
      description: r.description,
      createdAt: r.createdAt,
      createdBy: {
        id: r.createdById,
        name: r.createdByName,
        firstName: r.createdByFirstName,
        lastName: r.createdByLastName,
        photo: r.createdByPhoto,
      },
      metadata: parseMetadata(r.metadata),
    }))
  } catch (error) {
    console.error('Error fetching user logs:', error)
    return []
  }
}
