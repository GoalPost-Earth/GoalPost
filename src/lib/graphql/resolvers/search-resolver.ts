import { Context } from '@/config/types'

type EntityRecord = Record<string, unknown>

// Mirrors the schema's SearchResults type exactly. carePulses is declared
// non-null there but not searched (manual-only pulse type with no real
// content yet) — it must still be present as an empty array or selecting
// it errors with "Cannot return null for non-nullable field".
// coreValuePulses IS searched: since GOAL-287 migrated core values are
// :CoreValuePulse (they used to surface through the StoryPulse branch).
interface SearchResults {
  people: EntityRecord[]
  meSpaces: EntityRecord[]
  weSpaces: EntityRecord[]
  contexts: EntityRecord[]
  goalPulses: EntityRecord[]
  resourcePulses: EntityRecord[]
  storyPulses: EntityRecord[]
  carePulses: EntityRecord[]
  coreValuePulses: EntityRecord[]
}

/**
 * Global search resolver that finds entities by substring matching.
 * Returns up to 10 results of each entity type.
 *
 * Searches:
 * - People: full name — "firstName lastName" concatenation, so both single
 *   tokens ("Serena") and copied full names ("Serena Yeung-Levy") match
 *   (name only — GOAL-275; never email/PII, and the projection returns only
 *   directory-safe columns id/firstName/lastName/photo)
 * - MeSpaces: name
 * - WeSpaces: name
 * - FieldContexts: title
 * - GoalPulses: content
 * - ResourcePulses: content
 * - StoryPulses: content
 * - CoreValuePulses: content (GOAL-287 — migrated values are :CoreValuePulse)
 */
export const searchResolvers = {
  searchAll: async (
    _parent: never,
    args: {
      query: string
    },
    context: Context
  ): Promise<SearchResults> => {
    // Extract user ID from context, or null if unauthenticated
    const currentUserId = context.jwt?.user.id || null

    // Require authentication to use search
    if (!currentUserId) {
      throw new Error('Authentication required to search. Please log in.')
    }

    const searchTerm = args.query.toLowerCase().trim()

    // A blank term would CONTAINS-match every node (`x CONTAINS ''` is always
    // true), returning 10 arbitrary rows per entity type. Short-circuit
    // BEFORE opening any driver session — an early return after the session
    // block would leak all 8 sessions (the finally that closes them only
    // covers the try).
    if (!searchTerm) {
      return {
        people: [],
        meSpaces: [],
        weSpaces: [],
        contexts: [],
        goalPulses: [],
        resourcePulses: [],
        storyPulses: [],
        carePulses: [],
        coreValuePulses: [],
      }
    }

    // Create separate sessions for each query to avoid transaction conflicts
    const peopleSession = context.executionContext.session()
    const meSpacesSession = context.executionContext.session()
    const weSpacesSession = context.executionContext.session()
    const contextsSession = context.executionContext.session()
    const goalPulsesSession = context.executionContext.session()
    const resourcePulsesSession = context.executionContext.session()
    const storyPulsesSession = context.executionContext.session()
    const coreValuePulsesSession = context.executionContext.session()

    try {
      // Execute all searches in parallel using separate sessions
      const [
        peopleResult,
        meSpacesResult,
        weSpacesResult,
        contextsResult,
        goalPulsesResult,
        resourcePulsesResult,
        storyPulsesResult,
        coreValuePulsesResult,
      ] = await Promise.all([
        // Search people by name only. GOAL-275: this custom resolver bypasses
        // the Person type's field-level @authorization, so it MUST NOT search
        // by (or return) PII. Searching `email CONTAINS` allowed cross-Space
        // email enumeration; returning the whole node leaked every PII scalar.
        // We match on name and project ONLY directory-safe fields.
        // Matching runs against the "firstName lastName" concatenation so a
        // full name copied from elsewhere in the app ("Hao Zhu") matches —
        // per-field CONTAINS can never span both fields. Single-field
        // substrings still match, since each field is a substring of the
        // concatenation. Interior whitespace runs are collapsed (names copied
        // from PDFs often carry doubled or non-breaking spaces) — scoped to
        // this query so pulse/space content matching keeps exact whitespace.
        // Perf: bounded label scan; toLower(...)+CONTAINS on a computed
        // concatenation cannot use an index. If the Person directory grows to
        // ~10k nodes, move to a FULLTEXT index on firstName/lastName.
        peopleSession.executeRead((tx) =>
          tx.run(
            `
            MATCH (p:Person)
            WHERE toLower(coalesce(p.firstName, '') + ' ' + coalesce(p.lastName, ''))
              CONTAINS $searchTerm
            RETURN p.id AS id, coalesce(p.firstName, '') AS firstName,
                   coalesce(p.lastName, '') AS lastName, p.photo AS photo
            LIMIT 10
            `,
            { searchTerm: searchTerm.replace(/\s+/g, ' ') }
          )
        ),

        // Search MeSpaces by name - only if user is the owner
        // MeSpaces are personal spaces and cannot be shared with members
        meSpacesSession.executeRead((tx) =>
          tx.run(
            `
            MATCH (s:MeSpace)
            WHERE toLower(s.name) CONTAINS $searchTerm
            AND $userId IS NOT NULL
            AND EXISTS {
              MATCH (owner)-[r:OWNS]->(s)
              WHERE owner.id = $userId
            }
            RETURN s
            LIMIT 10
            `,
            { searchTerm, userId: currentUserId }
          )
        ),

        // Search WeSpaces by name - only if user is owner or member
        weSpacesSession.executeRead((tx) =>
          tx.run(
            `
            MATCH (s:WeSpace)
            WHERE toLower(s.name) CONTAINS $searchTerm
            AND $userId IS NOT NULL
            AND (
              EXISTS {
                MATCH (owner)-[r:OWNS]->(s)
                WHERE owner.id = $userId
              }
              OR
              EXISTS {
                MATCH (s)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(member)
                WHERE member.id = $userId
              }
            )
            RETURN s
            LIMIT 10
            `,
            { searchTerm, userId: currentUserId }
          )
        ),

        // Search FieldContexts by title - only in spaces user can access
        contextsSession.executeRead((tx) =>
          tx.run(
            `
            MATCH (f:FieldContext)<-[:HAS_CONTEXT]-(s:Space)
            WHERE toLower(f.title) CONTAINS $searchTerm
            AND (
              EXISTS {
                MATCH (owner)-[r:OWNS]->(s)
                WHERE owner.id = $userId
              }
              OR
              EXISTS {
                MATCH (s)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(member)
                WHERE member.id = $userId
              }
            )
            RETURN f
            LIMIT 10
            `,
            { searchTerm, userId: currentUserId }
          )
        ),

        // Search GoalPulses by content - only in spaces user can access
        goalPulsesSession.executeRead((tx) =>
          tx.run(
            `
            MATCH (p:GoalPulse)<-[:HAS_PULSE]-(ctx:FieldContext)<-[:HAS_CONTEXT]-(s:Space)
            WHERE (toLower(p.content) CONTAINS $searchTerm
               OR toLower(p.title) CONTAINS $searchTerm)
            AND (
              EXISTS {
                MATCH (owner)-[r:OWNS]->(s)
                WHERE owner.id = $userId
              }
              OR
              EXISTS {
                MATCH (s)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(member)
                WHERE member.id = $userId
              }
            )
            WITH DISTINCT p, collect(DISTINCT ctx) as contexts
            RETURN p, contexts
            LIMIT 10
            `,
            { searchTerm, userId: currentUserId }
          )
        ),

        // Search ResourcePulses by content - only in spaces user can access
        resourcePulsesSession.executeRead((tx) =>
          tx.run(
            `
            MATCH (p:ResourcePulse)<-[:HAS_PULSE]-(ctx:FieldContext)<-[:HAS_CONTEXT]-(s:Space)
            WHERE (toLower(p.content) CONTAINS $searchTerm
               OR toLower(p.title) CONTAINS $searchTerm)
            AND (
              EXISTS {
                MATCH (owner)-[r:OWNS]->(s)
                WHERE owner.id = $userId
              }
              OR
              EXISTS {
                MATCH (s)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(member)
                WHERE member.id = $userId
              }
            )
            WITH DISTINCT p, collect(DISTINCT ctx) as contexts
            RETURN p, contexts
            LIMIT 10
            `,
            { searchTerm, userId: currentUserId }
          )
        ),

        // Search StoryPulses by content - only in spaces user can access
        storyPulsesSession.executeRead((tx) =>
          tx.run(
            `
            MATCH (p:StoryPulse)<-[:HAS_PULSE]-(ctx:FieldContext)<-[:HAS_CONTEXT]-(s:Space)
            WHERE (toLower(p.content) CONTAINS $searchTerm
               OR toLower(p.title) CONTAINS $searchTerm)
            AND (
              EXISTS {
                MATCH (owner)-[r:OWNS]->(s)
                WHERE owner.id = $userId
              }
              OR
              EXISTS {
                MATCH (s)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(member)
                WHERE member.id = $userId
              }
            )
            WITH DISTINCT p, collect(DISTINCT ctx) as contexts
            RETURN p, contexts
            LIMIT 10
            `,
            { searchTerm, userId: currentUserId }
          )
        ),

        // Search CoreValuePulses by content - only in spaces user can access.
        // GOAL-287: migrated core values are :CoreValuePulse (previously
        // :StoryPulse, where the branch above found them).
        coreValuePulsesSession.executeRead((tx) =>
          tx.run(
            `
            MATCH (p:CoreValuePulse)<-[:HAS_PULSE]-(ctx:FieldContext)<-[:HAS_CONTEXT]-(s:Space)
            WHERE (toLower(p.content) CONTAINS $searchTerm
               OR toLower(p.title) CONTAINS $searchTerm)
            AND (
              EXISTS {
                MATCH (owner)-[r:OWNS]->(s)
                WHERE owner.id = $userId
              }
              OR
              EXISTS {
                MATCH (s)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(member)
                WHERE member.id = $userId
              }
            )
            WITH DISTINCT p, collect(DISTINCT ctx) as contexts
            RETURN p, contexts
            LIMIT 10
            `,
            { searchTerm, userId: currentUserId }
          )
        ),
      ])

      // Extract properties from Neo4j records
      const extractProperties = (
        records: Array<{ get: (key: string) => { properties: EntityRecord } }>,
        key: string
      ): EntityRecord[] => records.map((record) => record.get(key).properties)

      // Extract pulse properties with related contexts (aggregated)
      const extractPulsesWithContexts = (
        records: Array<{ get: (key: string) => unknown }>,
        pulseKey: string,
        contextsKey: string
      ): EntityRecord[] =>
        records.map((record) => {
          const pulse = (record.get(pulseKey) as { properties: EntityRecord })
            .properties
          const contextsArray = record.get(contextsKey) as Array<{
            properties: EntityRecord
          }>
          const contexts = Array.isArray(contextsArray)
            ? contextsArray.map((ctx) => ctx.properties)
            : []
          return {
            ...pulse,
            context: contexts,
          }
        })

      // People are projected to directory-safe scalar columns (not a node),
      // so map them explicitly rather than via extractProperties (which reads
      // `.properties` off a Node). Keeps PII out of the search response.
      const people: EntityRecord[] = peopleResult.records.map((record) => ({
        id: record.get('id'),
        firstName: record.get('firstName'),
        lastName: record.get('lastName'),
        photo: record.get('photo'),
      }))

      return {
        people,
        meSpaces: extractProperties(meSpacesResult.records, 's'),
        weSpaces: extractProperties(weSpacesResult.records, 's'),
        contexts: extractProperties(contextsResult.records, 'f'),
        goalPulses: extractPulsesWithContexts(
          goalPulsesResult.records,
          'p',
          'contexts'
        ),
        resourcePulses: extractPulsesWithContexts(
          resourcePulsesResult.records,
          'p',
          'contexts'
        ),
        storyPulses: extractPulsesWithContexts(
          storyPulsesResult.records,
          'p',
          'contexts'
        ),
        carePulses: [],
        coreValuePulses: extractPulsesWithContexts(
          coreValuePulsesResult.records,
          'p',
          'contexts'
        ),
      }
    } catch (error) {
      console.error('❌ Search error:', error)
      throw error
    } finally {
      // Close all sessions
      await Promise.all([
        peopleSession.close(),
        meSpacesSession.close(),
        weSpacesSession.close(),
        contextsSession.close(),
        goalPulsesSession.close(),
        resourcePulsesSession.close(),
        storyPulsesSession.close(),
        coreValuePulsesSession.close(),
      ])
    }
  },
}
