import { Context } from '@/config/types'
import {
  createLog,
  getContextLogs,
  getUserLogs,
} from '@/lib/activity-logs/create-log'

interface LogPulseInput {
  action: string
  pulseId: string
  pulseType: string
  pulseName: string
  contextId: string
  metadata?: string
}

interface LogSpaceInput {
  action: string
  spaceId: string
  spaceType: string
  spaceName: string
  metadata?: string
}

interface LogMemberInput {
  action: string
  spaceId: string
  spaceName: string
  memberId: string
  memberName: string
  role?: string
  previousRole?: string
  metadata?: string
}

interface LogFieldInput {
  action: string
  fieldId: string
  fieldName: string
  contextId: string
  spaceName?: string
  metadata?: string
}

interface LogResonanceInput {
  action: string
  resonanceId: string
  label: string
  sourceId: string
  sourceName: string
  targetId: string
  targetName: string
  contextId: string
  metadata?: string
}

type ContextAndSpaceDetails = {
  contextName?: string
  spaceName?: string
  spaceType?: 'MeSpace' | 'WeSpace' | 'Space'
  ownerName?: string
}

function formatPossessive(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return ''
  return trimmed.endsWith('s') ? `${trimmed}'` : `${trimmed}'s`
}

function formatSpaceDisplay(
  details: ContextAndSpaceDetails
): string | undefined {
  if (details.spaceType === 'MeSpace') {
    return details.ownerName ? `${details.ownerName}'s me space` : 'me space'
  }

  if (details.spaceName) {
    return `"${details.spaceName}"`
  }

  if (details.spaceType === 'WeSpace') {
    return 'we space'
  }

  return undefined
}

async function getContextAndSpaceDetails(
  session: any,
  contextId: string
): Promise<ContextAndSpaceDetails> {
  const result = await session.run(
    `
    MATCH (context:FieldContext {id: $contextId})
    OPTIONAL MATCH (space:Space)-[:HAS_CONTEXT]->(context)
    OPTIONAL MATCH (space)<-[:OWNS]-(owner:Person)
    RETURN
      coalesce(context.title, context.name, context.id) as contextName,
      space.name as spaceName,
      labels(space) as spaceLabels,
      owner.name as ownerName
    `,
    { contextId }
  )

  if (result.records.length === 0) {
    return {}
  }

  const record = result.records[0]
  const spaceLabels: string[] = record.get('spaceLabels') || []
  const spaceType = spaceLabels.includes('MeSpace')
    ? 'MeSpace'
    : spaceLabels.includes('WeSpace')
      ? 'WeSpace'
      : spaceLabels.length > 0
        ? 'Space'
        : undefined

  return {
    contextName: record.get('contextName') || undefined,
    spaceName: record.get('spaceName') || undefined,
    spaceType,
    ownerName: record.get('ownerName') || undefined,
  }
}

async function getPulseTitles(
  session: any,
  sourceId: string,
  targetId: string
): Promise<{ sourceTitle: string; targetTitle: string }> {
  const result = await session.run(
    `
    OPTIONAL MATCH (source:FieldPulse {id: $sourceId})
    OPTIONAL MATCH (target:FieldPulse {id: $targetId})
    RETURN
      coalesce(source.title, source.name, source.id) as sourceTitle,
      coalesce(target.title, target.name, target.id) as targetTitle
    `,
    { sourceId, targetId }
  )

  if (result.records.length === 0) {
    return { sourceTitle: sourceId, targetTitle: targetId }
  }

  const record = result.records[0]
  return {
    sourceTitle: record.get('sourceTitle') || sourceId,
    targetTitle: record.get('targetTitle') || targetId,
  }
}

/**
 * Activity log mutations for tracking user actions across the platform.
 * All mutations automatically link logs to the current authenticated user.
 */
export const activityLogMutations = {
  /**
   * Log pulse-related activities (create, update, delete)
   */
  logPulseActivity: async (
    _parent: never,
    args: { input: LogPulseInput },
    context: Context
  ) => {
    const userId = context.jwt?.user?.id

    if (!userId) {
      return {
        success: false,
        message: 'User not authenticated',
        log: null,
      }
    }

    const { action, pulseId, pulseType, pulseName, contextId, metadata } =
      args.input

    // Validate required fields
    if (!action || !pulseId || !pulseType || !contextId) {
      return {
        success: false,
        message: 'Missing required fields',
        log: null,
      }
    }

    try {
      const session = context.executionContext.session()

      // Map action to verb
      const actionMap: Record<string, string> = {
        created: 'Created',
        updated: 'Updated',
        deleted: 'Deleted',
      }

      const actionVerb = actionMap[action] || action

      // Generate human-readable description
      const pulseTypeLabel = pulseType.replace('Pulse', '').toLowerCase()
      const contextDetails = await getContextAndSpaceDetails(session, contextId)
      const contextLabel = contextDetails.contextName
        ? `"${contextDetails.contextName}"`
        : 'this field context'
      const spaceDisplay = formatSpaceDisplay(contextDetails)
      const locationSuffix = spaceDisplay ? ` in ${spaceDisplay}` : ''
      const description = `${actionVerb} a ${pulseTypeLabel} pulse${pulseName ? `, "${pulseName}"` : ''} in ${contextLabel}${locationSuffix}`

      // Parse metadata if it's a string
      const parsedMetadata =
        typeof metadata === 'string' ? JSON.parse(metadata) : metadata

      // Create the log
      const logId = await createLog({
        userId,
        description,
        pulseIds: [pulseId],
        contextId,
        metadata: parsedMetadata,
      })

      // Fetch the created log to return
      const result = await session.run(
        `
        MATCH (log:Log {id: $logId})-[:CREATED_BY]->(creator:Person)
        RETURN log, creator
        `,
        { logId }
      )

      if (result.records.length === 0) {
        return {
          success: false,
          message: 'Failed to retrieve created log',
          log: null,
        }
      }

      const logNode = result.records[0].get('log').properties
      const creatorNode = result.records[0].get('creator').properties

      return {
        success: true,
        message: `Logged pulse ${action}`,
        log: {
          ...logNode,
          __typename: 'Log',
          createdBy: [
            {
              ...creatorNode,
              __typename: 'Person',
            },
          ],
        },
      }
    } catch (error) {
      console.error('Error logging pulse activity:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        log: null,
      }
    }
  },

  /**
   * Log space-related activities (create, update, delete)
   */
  logSpaceActivity: async (
    _parent: never,
    args: { input: LogSpaceInput },
    context: Context
  ) => {
    const userId = context.jwt?.user?.id

    if (!userId) {
      return {
        success: false,
        message: 'User not authenticated',
        log: null,
      }
    }

    const { action, spaceId, spaceType, spaceName, metadata } = args.input

    if (!action || !spaceId || !spaceType) {
      return {
        success: false,
        message: 'Missing required fields',
        log: null,
      }
    }

    try {
      const session = context.executionContext.session()

      const actionMap: Record<string, string> = {
        created: 'Created',
        updated: 'Updated',
        deleted: 'Deleted',
      }

      const actionVerb = actionMap[action] || action
      const spaceTypeLabel =
        spaceType === 'MeSpace'
          ? 'personal space'
          : spaceType === 'WeSpace'
            ? 'collaborative space'
            : 'space'

      const description = `${actionVerb} a ${spaceTypeLabel}${spaceName ? `: "${spaceName}"` : ''}`

      const parsedMetadata =
        typeof metadata === 'string' ? JSON.parse(metadata) : metadata

      const logId = await createLog({
        userId,
        description,
        pulseIds: [],
        metadata: {
          ...parsedMetadata,
          spaceId,
          spaceType,
        },
      })

      const result = await session.run(
        `
        MATCH (log:Log {id: $logId})-[:CREATED_BY]->(creator:Person)
        RETURN log, creator
        `,
        { logId }
      )

      if (result.records.length === 0) {
        return {
          success: false,
          message: 'Failed to retrieve created log',
          log: null,
        }
      }

      const logNode = result.records[0].get('log').properties
      const creatorNode = result.records[0].get('creator').properties

      return {
        success: true,
        message: `Logged space ${action}`,
        log: {
          ...logNode,
          __typename: 'Log',
          createdBy: [
            {
              ...creatorNode,
              __typename: 'Person',
            },
          ],
        },
      }
    } catch (error) {
      console.error('Error logging space activity:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        log: null,
      }
    }
  },

  /**
   * Log member-related activities (added, removed, role-changed)
   */
  logMemberActivity: async (
    _parent: never,
    args: { input: LogMemberInput },
    context: Context
  ) => {
    const userId = context.jwt?.user?.id

    if (!userId) {
      return {
        success: false,
        message: 'User not authenticated',
        log: null,
      }
    }

    const {
      action,
      spaceId,
      spaceName,
      memberId,
      memberName,
      role,
      previousRole,
      metadata,
    } = args.input

    if (!action || !spaceId || !memberId) {
      return {
        success: false,
        message: 'Missing required fields',
        log: null,
      }
    }

    try {
      const session = context.executionContext.session()

      let description = ''
      const memberLabel = memberName || memberId
      const memberPossessive = formatPossessive(memberLabel)
      const spaceLabel = spaceName ? `"${spaceName}"` : spaceId

      switch (action) {
        case 'added':
          description = `Added ${memberLabel}${role ? ` as ${role}` : ''} to ${spaceLabel}`
          break
        case 'removed':
          description = `Removed ${memberLabel} from ${spaceLabel}`
          break
        case 'role-changed':
          description = `${memberPossessive || memberLabel} role was changed${role ? ` to ${role}` : ''} in ${spaceLabel}`
          break
        default:
          description = `${action} ${memberLabel} in ${spaceLabel}`
      }

      const parsedMetadata =
        typeof metadata === 'string' ? JSON.parse(metadata) : metadata

      const logId = await createLog({
        userId,
        description,
        pulseIds: [],
        metadata: {
          ...parsedMetadata,
          spaceId,
          memberId,
          role,
          previousRole,
        },
      })

      const result = await session.run(
        `
        MATCH (log:Log {id: $logId})-[:CREATED_BY]->(creator:Person)
        RETURN log, creator
        `,
        { logId }
      )

      if (result.records.length === 0) {
        return {
          success: false,
          message: 'Failed to retrieve created log',
          log: null,
        }
      }

      const logNode = result.records[0].get('log').properties
      const creatorNode = result.records[0].get('creator').properties

      return {
        success: true,
        message: `Logged member ${action}`,
        log: {
          ...logNode,
          __typename: 'Log',
          createdBy: [
            {
              ...creatorNode,
              __typename: 'Person',
            },
          ],
        },
      }
    } catch (error) {
      console.error('Error logging member activity:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        log: null,
      }
    }
  },

  /**
   * Log field context-related activities (create, update, delete)
   */
  logFieldActivity: async (
    _parent: never,
    args: { input: LogFieldInput },
    context: Context
  ) => {
    const userId = context.jwt?.user?.id

    if (!userId) {
      return {
        success: false,
        message: 'User not authenticated',
        log: null,
      }
    }

    const { action, fieldId, fieldName, contextId, spaceName, metadata } =
      args.input

    if (!action || !fieldId || !contextId) {
      return {
        success: false,
        message: 'Missing required fields',
        log: null,
      }
    }

    try {
      const session = context.executionContext.session()

      const actionMap: Record<string, string> = {
        created: 'Created',
        updated: 'Updated',
        deleted: 'Deleted',
      }

      const actionVerb = actionMap[action] || action
      const description = `${actionVerb} a field context: "${fieldName || fieldId}"${spaceName ? ` in "${spaceName}"` : ''}`

      const parsedMetadata =
        typeof metadata === 'string' ? JSON.parse(metadata) : metadata

      const logId = await createLog({
        userId,
        description,
        pulseIds: [],
        contextId,
        metadata: {
          ...parsedMetadata,
          fieldId,
        },
      })

      const result = await session.run(
        `
        MATCH (log:Log {id: $logId})-[:CREATED_BY]->(creator:Person)
        RETURN log, creator
        `,
        { logId }
      )

      if (result.records.length === 0) {
        return {
          success: false,
          message: 'Failed to retrieve created log',
          log: null,
        }
      }

      const logNode = result.records[0].get('log').properties
      const creatorNode = result.records[0].get('creator').properties

      return {
        success: true,
        message: `Logged field ${action}`,
        log: {
          ...logNode,
          __typename: 'Log',
          createdBy: [
            {
              ...creatorNode,
              __typename: 'Person',
            },
          ],
        },
      }
    } catch (error) {
      console.error('Error logging field activity:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        log: null,
      }
    }
  },

  /**
   * Log resonance-related activities (created, updated, deleted)
   */
  logResonanceActivity: async (
    _parent: never,
    args: { input: LogResonanceInput },
    context: Context
  ) => {
    const userId = context.jwt?.user?.id

    if (!userId) {
      return {
        success: false,
        message: 'User not authenticated',
        log: null,
      }
    }

    const {
      action,
      resonanceId,
      label,
      sourceId,
      sourceName,
      targetId,
      targetName,
      contextId,
      metadata,
    } = args.input

    if (!action || !resonanceId || !sourceId || !targetId || !contextId) {
      return {
        success: false,
        message: 'Missing required fields',
        log: null,
      }
    }

    try {
      const session = context.executionContext.session()

      const actionMap: Record<string, string> = {
        created: 'Linked',
        updated: 'Updated',
        deleted: 'Removed',
      }

      const actionVerb = actionMap[action] || action
      const { sourceTitle, targetTitle } = await getPulseTitles(
        session,
        sourceId,
        targetId
      )
      const contextDetails = await getContextAndSpaceDetails(session, contextId)
      const contextLabel = contextDetails.contextName
        ? `"${contextDetails.contextName}"`
        : undefined
      const spaceDisplay = formatSpaceDisplay(contextDetails)
      const locationSuffix = spaceDisplay ? ` in ${spaceDisplay}` : ''
      const baseDescription =
        action === 'created'
          ? `Linked "${sourceTitle}" and "${targetTitle}" via resonance "${label}"`
          : `${actionVerb} resonance "${label}" between "${sourceTitle}" and "${targetTitle}"`
      const description = contextLabel
        ? `${baseDescription} in ${contextLabel}${locationSuffix}`
        : `${baseDescription}${locationSuffix}`

      const parsedMetadata =
        typeof metadata === 'string' ? JSON.parse(metadata) : metadata

      const logId = await createLog({
        userId,
        description,
        pulseIds: [sourceId, targetId],
        contextId,
        metadata: {
          ...parsedMetadata,
          resonanceId,
          label,
        },
      })

      const result = await session.run(
        `
        MATCH (log:Log {id: $logId})-[:CREATED_BY]->(creator:Person)
        RETURN log, creator
        `,
        { logId }
      )

      if (result.records.length === 0) {
        return {
          success: false,
          message: 'Failed to retrieve created log',
          log: null,
        }
      }

      const logNode = result.records[0].get('log').properties
      const creatorNode = result.records[0].get('creator').properties

      return {
        success: true,
        message: `Logged resonance ${action}`,
        log: {
          ...logNode,
          __typename: 'Log',
          createdBy: [
            {
              ...creatorNode,
              __typename: 'Person',
            },
          ],
        },
      }
    } catch (error) {
      console.error('Error logging resonance activity:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        log: null,
      }
    }
  },
}

/**
 * Activity Log Query Resolvers
 * These wrap the service layer functions for GraphQL queries
 */
export const activityLogQueries = {
  /**
   * Get activity logs for the authenticated user
   */
  getMyRecentLogs: async (
    _source: unknown,
    { limit = 30 }: { limit?: number },
    context: Context
  ) => {
    // Extract user ID from JWT claims
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (context.jwt as any)?.sub

    if (!userId) {
      throw new Error('Unauthorized: Must be logged in to view activity logs')
    }

    try {
      const normalizedLimit = Math.max(
        1,
        Math.min(Number.parseInt(String(limit), 10) || 30, 100)
      )
      const logs = await getUserLogs(userId, normalizedLimit)

      // Transform LogEntry to GraphQL schema format
      return logs.map((log) => ({
        ...log,
        __typename: 'Log',
        // Convert metadata object to JSON string for GraphQL
        metadata: log.metadata ? JSON.stringify(log.metadata) : null,
        // Convert createdBy to array format expected by GraphQL
        createdBy: [
          {
            ...log.createdBy,
            // Ensure non-nullable fields have fallback values
            firstName: log.createdBy.firstName || '',
            lastName: log.createdBy.lastName || '',
            __typename: 'Person',
          },
        ],
      }))
    } catch (error) {
      console.error('Error fetching recent logs:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch activity logs'
      )
    }
  },

  /**
   * Get activity logs for a specific user
   */
  getUserLogs: async (
    _source: unknown,
    { userId, limit = 30 }: { userId: string; limit?: number },
    _context: Context
  ) => {
    try {
      const normalizedLimit = Math.max(
        1,
        Math.min(Number.parseInt(String(limit), 10) || 30, 100)
      )
      const logs = await getUserLogs(userId, normalizedLimit)

      // Transform LogEntry to GraphQL schema format
      return logs.map((log) => ({
        ...log,
        __typename: 'Log',
        metadata: log.metadata ? JSON.stringify(log.metadata) : null,
        createdBy: [
          {
            ...log.createdBy,
            // Ensure non-nullable fields have fallback values
            firstName: log.createdBy.firstName || '',
            lastName: log.createdBy.lastName || '',
            __typename: 'Person',
          },
        ],
      }))
    } catch (error) {
      console.error('Error fetching user logs:', error)
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to fetch user activity logs'
      )
    }
  },

  /**
   * Get activity logs for a specific context (FieldContext)
   */
  getContextLogs: async (
    _source: unknown,
    { contextId, limit = 30 }: { contextId: string; limit?: number },
    _context: Context
  ) => {
    try {
      const normalizedLimit = Math.max(
        1,
        Math.min(Number.parseInt(String(limit), 10) || 30, 100)
      )
      const logs = await getContextLogs(contextId, normalizedLimit)

      // Transform LogEntry to GraphQL schema format
      return logs.map((log) => ({
        ...log,
        __typename: 'Log',
        metadata: log.metadata ? JSON.stringify(log.metadata) : null,
        createdBy: [
          {
            ...log.createdBy,
            // Ensure non-nullable fields have fallback values
            firstName: log.createdBy.firstName || '',
            lastName: log.createdBy.lastName || '',
            __typename: 'Person',
          },
        ],
      }))
    } catch (error) {
      console.error('Error fetching context logs:', error)
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to fetch context activity logs'
      )
    }
  },
}
