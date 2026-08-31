import type { Session } from 'neo4j-driver'
import { Context } from '@/config/types'
import {
  createLog,
  getContextLogs,
  getUserLogs,
} from '@/lib/activity-logs/create-log'
import { initGraph } from '@/modules/graph'
import {
  canEditContext,
  canViewContext,
  viewablePulsePredicate,
} from '@/lib/permissions/pulse-visibility'

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

interface LogWeaveInput {
  action: string
  weaveId: string
  weaveName: string
  pulseIds: string[]
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
  session: Session,
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

/**
 * A weave holds 1..n pulses, so a log entry for one describes a LIST where
 * `getPulseTitles` describes a source/target pair. Guard rails:
 *
 * - The list is capped. `logResonanceActivity` is structurally limited to two
 *   ids; this input is client-supplied and unbounded, and a description does
 *   not get better past a handful of names.
 * - `UNWIND` + `MATCH (pulse:FieldPulse {id: pid})` seeks per id rather than
 *   leaning on `IN` over a label scan.
 * - Only pulses the actor can actually view come back — both for the
 *   description (never leak a title, let alone an id — Rule 1) and for the ids
 *   the caller then hangs `LOGGED_FOR` edges off, so the graph and the prose
 *   honour the same visibility.
 */
const MAX_LOGGED_WEAVE_PULSES = 50

async function getViewableWovenPulses(
  session: Session,
  pulseIds: string[],
  userId: string
): Promise<{ ids: string[]; titles: string[] }> {
  if (pulseIds.length === 0) return { ids: [], titles: [] }

  const result = await session.run(
    `
    UNWIND $pulseIds AS pid
    MATCH (pulse:FieldPulse {id: pid})
    WHERE ${viewablePulsePredicate('pulse', 'userId')}
    RETURN pulse.id AS id, coalesce(pulse.title, pulse.name) AS title
    `,
    { pulseIds: pulseIds.slice(0, MAX_LOGGED_WEAVE_PULSES), userId }
  )

  const ids: string[] = []
  const titles: string[] = []
  for (const record of result.records) {
    const id = record.get('id')
    if (id) ids.push(id)
    const title = record.get('title')
    if (title) titles.push(title)
  }
  return { ids, titles }
}

async function getPulseTitles(
  session: Session,
  sourceId: string,
  targetId: string,
  // The actor logging the resonance. Titles are only revealed for pulses this
  // user can view (the predicate filters the OPTIONAL MATCH); unviewable or
  // missing pulses fall back to a generic label — never the raw id (Rule 1).
  userId: string
): Promise<{ sourceTitle: string; targetTitle: string }> {
  const result = await session.run(
    `
    OPTIONAL MATCH (source:FieldPulse {id: $sourceId})
      WHERE ${viewablePulsePredicate('source', 'userId')}
    OPTIONAL MATCH (target:FieldPulse {id: $targetId})
      WHERE ${viewablePulsePredicate('target', 'userId')}
    RETURN
      coalesce(source.title, source.name) as sourceTitle,
      coalesce(target.title, target.name) as targetTitle
    `,
    { sourceId, targetId, userId }
  )

  const fallback = 'a pulse'
  if (result.records.length === 0) {
    return { sourceTitle: fallback, targetTitle: fallback }
  }

  const record = result.records[0]
  return {
    sourceTitle: record.get('sourceTitle') || fallback,
    targetTitle: record.get('targetTitle') || fallback,
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
        targetId,
        userId
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

  /**
   * Log promise-weave activities (created, updated, confirmed, dissolved,
   * fulfilled, deleted). Migration-built weaves stay Log-exempt like the other
   * Phase-5 structural builds — this covers the runtime authoring path only
   * (docs/promise-weave-design-spike.md §4).
   */
  logWeaveActivity: async (
    _parent: never,
    args: { input: LogWeaveInput },
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

    const { action, weaveId, weaveName, pulseIds, contextId, metadata } =
      args.input

    if (!action || !weaveId || !contextId) {
      return {
        success: false,
        message: 'Missing required fields',
        log: null,
      }
    }

    // Authorization, not just authentication (GOAL-341 review). Two distinct
    // holes close here, and both need a gate on the CALLER's relationship to
    // `contextId` rather than on the payload:
    //
    // - `getContextAndSpaceDetails` below looks the context up by id with no
    //   caller in its query, and its result is folded into `description`,
    //   which this mutation returns. Ungated, that echoes any field's title
    //   and its owning Space's name to any authenticated caller — and the ids
    //   are guessable, a MeSpace context being `context_mespace_` plus a
    //   publicly readable Person id.
    // - `weaveName` and `metadata` are client-supplied and land verbatim in
    //   that description, so a view-level gate would let a GUEST inject prose
    //   into a Space's activity feed. Hence canEditContext, not canViewContext.
    //
    // The five sibling log resolvers in this file share the same gap; they are
    // pre-existing and tracked separately rather than widened here.
    if (!(await canEditContext(await initGraph(), userId, contextId))) {
      return {
        success: false,
        message: 'You do not have permission to log activity in this field',
        log: null,
      }
    }

    try {
      const session = context.executionContext.session()

      const actionMap: Record<string, string> = {
        created: 'Wove',
        updated: 'Updated',
        confirmed: 'Confirmed',
        dissolved: 'Dissolved',
        fulfilled: 'Marked fulfilled',
        deleted: 'Removed',
      }

      const actionVerb = actionMap[action] || action
      // Both the description AND the LOGGED_FOR edges below use the viewable
      // subset, so the log never records a link to a pulse the actor could not
      // see.
      const { ids: wovenPulseIds, titles } = await getViewableWovenPulses(
        session,
        pulseIds ?? [],
        userId
      )
      const contextDetails = await getContextAndSpaceDetails(session, contextId)
      const contextLabel = contextDetails.contextName
        ? `"${contextDetails.contextName}"`
        : undefined
      const spaceDisplay = formatSpaceDisplay(contextDetails)
      const locationSuffix = spaceDisplay ? ` in ${spaceDisplay}` : ''
      const weaveLabel = weaveName || 'a promise weave'
      // The prose names a few pulses; the LOGGED_FOR edges below still get the
      // full viewable set. Without this the description ran to ~2,500 chars at
      // the 50-pulse cap, which is stored on the node and rendered verbatim in
      // the activity feed.
      const NAMED_IN_DESCRIPTION = 3
      const namedTitles = titles.slice(0, NAMED_IN_DESCRIPTION)
      const unnamedCount = titles.length - namedTitles.length
      const wovenSuffix =
        titles.length > 0
          ? ` holding ${namedTitles.map((t) => `"${t}"`).join(', ')}${
              unnamedCount > 0 ? ` and ${unnamedCount} more` : ''
            }`
          : ''
      const baseDescription =
        action === 'created'
          ? `Wove "${weaveLabel}"${wovenSuffix}`
          : `${actionVerb} promise weave "${weaveLabel}"`
      const description = contextLabel
        ? `${baseDescription} in ${contextLabel}${locationSuffix}`
        : `${baseDescription}${locationSuffix}`

      const parsedMetadata =
        typeof metadata === 'string' ? JSON.parse(metadata) : metadata

      const logId = await createLog({
        userId,
        description,
        pulseIds: wovenPulseIds,
        contextId,
        metadata: {
          ...parsedMetadata,
          weaveId,
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
        message: `Logged weave ${action}`,
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
      console.error('Error logging weave activity:', error)
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
    // The login JWT payload is { user: { id } } — there is no `sub` claim, so
    // read the canonical id field (matches every $jwt.user.id authorization
    // filter and the sibling getUserLogs/getContextLogs resolvers).
    const userId = context.jwt?.user?.id

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
    { limit = 30 }: { userId?: string; limit?: number },
    context: Context
  ) => {
    // The user feed is per-person and embeds pulse titles in its descriptions,
    // so it is ALWAYS scoped to the authenticated caller. The `userId` argument
    // is intentionally ignored — honoring a client-supplied id was an IDOR that
    // let anyone read another person's activity (the client only ever passes
    // its own id anyway).
    const userId = context.jwt?.user?.id
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
    context: Context
  ) => {
    // Context logs embed pulse titles, so they are visible only to people who
    // can access the context's Space. Require an authenticated caller who can
    // view the context — the prior code took an arbitrary contextId with no
    // check at all.
    const userId = context.jwt?.user?.id
    if (!userId) {
      throw new Error('Unauthorized: Must be logged in to view activity logs')
    }
    try {
      const graph = await initGraph()
      const allowed = await canViewContext(graph, userId, contextId)
      if (!allowed) {
        // Fail closed — same empty result whether the context is missing or
        // simply not visible to this user.
        return []
      }
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
