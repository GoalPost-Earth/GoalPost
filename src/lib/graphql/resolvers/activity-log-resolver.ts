import { Context } from '@/config/types'
import { createLog } from '@/lib/activity-logs/create-log'

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
      // Map action to verb
      const actionMap: Record<string, string> = {
        created: 'Created',
        updated: 'Updated',
        deleted: 'Deleted',
      }

      const actionVerb = actionMap[action] || action

      // Generate human-readable description
      const pulseTypeLabel = pulseType.replace('Pulse', '')
      const description = `${actionVerb} a ${pulseTypeLabel} pulse${pulseName ? `: "${pulseName}"` : ''}`

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
      const session = context.executionContext.session()
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

      const session = context.executionContext.session()
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
      let description = ''

      switch (action) {
        case 'added':
          description = `Added ${memberName || memberId}${role ? ` as ${role}` : ''} to "${spaceName || spaceId}"`
          break
        case 'removed':
          description = `Removed ${memberName || memberId} from "${spaceName || spaceId}"`
          break
        case 'role-changed':
          description = `Changed ${memberName || memberId}'s role${previousRole ? ` from ${previousRole}` : ''}${role ? ` to ${role}` : ''} in "${spaceName || spaceId}"`
          break
        default:
          description = `${action} ${memberName || memberId} in "${spaceName || spaceId}"`
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

      const session = context.executionContext.session()
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

      const session = context.executionContext.session()
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
      const actionMap: Record<string, string> = {
        created: 'Discovered',
        updated: 'Updated',
        deleted: 'Removed',
      }

      const actionVerb = actionMap[action] || action
      const description = `${actionVerb} resonance "${label}" between "${sourceName || sourceId}" and "${targetName || targetId}"`

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

      const session = context.executionContext.session()
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
