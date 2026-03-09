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
    photo?: string
  }
  metadata?: Record<string, any>
}

/**
 * Create an activity log entry
 * Links to pulses and tracks who performed the action and when
 */
export async function createLog(input: CreateLogInput): Promise<string> {
  const graph = await initGraph()

  const logId = `log_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const now = new Date().toISOString()

  try {
    // Create Log node and link to creator
    const result = await graph.query<{ logId: string }>(
      `
      CREATE (log:Log {
        id: $logId,
        description: $description,
        createdAt: $createdAt,
        metadata: $metadata
      })
      
      WITH log
      MATCH (person:Person {id: $userId})
      CREATE (log)-[:CREATED_BY]->(person)
      
      WITH log
      // Link to pulses if provided
      UNWIND $pulseIds AS pulseId
      OPTIONAL MATCH (pulse:FieldPulse {id: pulseId})
      WHERE pulse IS NOT NULL
      CREATE (log)-[:LOGGED_FOR]->(pulse)
      
      RETURN log.id as logId
      `,
      {
        logId,
        description: input.description,
        createdAt: now,
        userId: input.userId,
        pulseIds: input.pulseIds || [],
        metadata: input.metadata || null,
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

  try {
    const results = await graph.query<{
      id: string
      description: string
      createdAt: string
      createdById: string
      createdByName: string
      createdByPhoto?: string
    }>(
      `
      MATCH (log:Log)-[:LOGGED_FOR]->(pulse:FieldPulse)-[:HAS_PULSE]-(context:FieldContext {id: $contextId})
      WITH log, pulse
      MATCH (log)-[:CREATED_BY]->(person:Person)
      RETURN 
        log.id as id,
        log.description as description,
        log.createdAt as createdAt,
        person.id as createdById,
        person.name as createdByName,
        person.photo as createdByPhoto
      ORDER BY log.createdAt DESC
      LIMIT $limit
      `,
      { contextId, limit }
    )

    return results.map((r) => ({
      id: r.id,
      description: r.description,
      createdAt: r.createdAt,
      createdBy: {
        id: r.createdById,
        name: r.createdByName,
        photo: r.createdByPhoto,
      },
    }))
  } catch (error) {
    console.error('Error fetching logs:', error)
    return []
  }
}

/**
 * Get recent logs for a specific person
 * Used for user activity/notification feed
 */
export async function getUserLogs(
  userId: string,
  limit: number = 50
): Promise<LogEntry[]> {
  const graph = await initGraph()

  try {
    const results = await graph.query<{
      id: string
      description: string
      createdAt: string
      createdById: string
      createdByName: string
      createdByPhoto?: string
    }>(
      `
      MATCH (log:Log)-[:CREATED_BY]->(person:Person {id: $userId})
      WITH log
      MATCH (log)-[:CREATED_BY]->(creator:Person)
      RETURN 
        log.id as id,
        log.description as description,
        log.createdAt as createdAt,
        creator.id as createdById,
        creator.name as createdByName,
        creator.photo as createdByPhoto
      ORDER BY log.createdAt DESC
      LIMIT $limit
      `,
      { userId, limit }
    )

    return results.map((r) => ({
      id: r.id,
      description: r.description,
      createdAt: r.createdAt,
      createdBy: {
        id: r.createdById,
        name: r.createdByName,
        photo: r.createdByPhoto,
      },
    }))
  } catch (error) {
    console.error('Error fetching user logs:', error)
    return []
  }
}
