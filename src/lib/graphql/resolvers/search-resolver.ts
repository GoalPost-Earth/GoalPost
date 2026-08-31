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
  promiseWeaves: EntityRecord[]
}

/**
 * Neo4j node shape as returned by the driver. The resolver hands raw node
 * properties straight to GraphQL, so the nested `@relationship` fields a
 * PromiseWeave selection asks for have to be materialized here — see
 * ./relationship-fallbacks.ts for why a custom root resolver's rows carry
 * no library projection.
 */
type Neo4jNode = { properties: EntityRecord; labels: string[] }

// Label → concrete type, in resolution order. Mirrors the label arm of
// `FieldPulse.__resolveType` (resolvers/index.ts) exactly, including the bare
// `CoreValue` marker: an un-backfilled env still holds migrated values as
// `:StoryPulse:CoreValue` (GOAL-287), and a value merged into story is still a
// value — so `CoreValue` must be tested BEFORE `StoryPulse`, not just
// `CoreValuePulse`.
const PULSE_LABEL_TYPENAMES: ReadonlyArray<readonly [string, string]> = [
  ['GoalPulse', 'GoalPulse'],
  ['ResourcePulse', 'ResourcePulse'],
  ['CarePulse', 'CarePulse'],
  ['CoreValuePulse', 'CoreValuePulse'],
  ['CoreValue', 'CoreValuePulse'],
  ['StoryPulse', 'StoryPulse'],
]

/**
 * Stamp the concrete pulse type from the node's labels so
 * `FieldPulse.__resolveType` can answer without a per-row label lookup.
 * Diverging from that resolver would type the same node differently here than
 * everywhere else — and normalize it into the Apollo cache under a different
 * key — so the order above is deliberately identical to its.
 */
function pulseTypename(labels: string[]): string {
  return (
    PULSE_LABEL_TYPENAMES.find(([label]) => labels.includes(label))?.[1] ??
    'StoryPulse'
  )
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
 * - PromiseWeaves: title (GOAL-343 — the connector node migrated care points
 *   became; reached through its HAS_WEAVE FieldContext)
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
    // block would leak all 9 sessions (the finally that closes them only
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
        promiseWeaves: [],
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
    const promiseWeavesSession = context.executionContext.session()

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
        promiseWeavesResult,
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
            ORDER BY lastName, firstName, id
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
            ORDER BY s.createdAt DESC, s.id
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
            ORDER BY s.createdAt DESC, s.id
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
            ORDER BY f.createdAt DESC, f.id
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
            ORDER BY p.createdAt DESC, p.id
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
            ORDER BY p.createdAt DESC, p.id
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
            ORDER BY p.createdAt DESC, p.id
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
            ORDER BY p.createdAt DESC, p.id
            LIMIT 10
            `,
            { searchTerm, userId: currentUserId }
          )
        ),

        // Search PromiseWeaves by title - only in spaces user can access.
        // GOAL-343: a weave is a reified connector node scoped through its
        // HAS_WEAVE FieldContext, exactly as ResonanceLink is scoped through
        // HAS_RESONANCE — so the same Space reach test as every branch above,
        // restated here because @authorization does not reach raw Cypher.
        // `title` is optional on PromiseWeave; `toLower(null)` is null and
        // CONTAINS on null is null, so an untitled weave is simply filtered
        // out rather than crashing the branch.
        // The nested selection (wovenFor / context / weaves) is materialized
        // below from these collects — a custom resolver's rows carry no
        // library projection for `@relationship` fields.
        promiseWeavesSession.executeRead((tx) =>
          tx.run(
            `
            MATCH (w:PromiseWeave)<-[:HAS_WEAVE]-(f:FieldContext)<-[:HAS_CONTEXT]-(s:Space)
            WHERE toLower(w.title) CONTAINS $searchTerm
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
            WITH DISTINCT w, collect(DISTINCT f) AS contexts
            OPTIONAL MATCH (w)-[:WOVEN_FOR]->(person:Person)
            OPTIONAL MATCH (w)-[:WEAVES]->(pulse:FieldPulse)
            // WEAVES routinely crosses Space boundaries, and the reach test
            // above constrains the weave's own Space, not where its pulses
            // live — so the pulse needs its own test. Every pulse type
            // carries an authorization READ filter the library would apply
            // here; raw Cypher does not inherit it, so restate it. Filtering
            // the OPTIONAL MATCH rather than the row hides only the
            // out-of-reach pulse, exactly as that filter would: a weave
            // whose pulses are all unreachable still returns, with none.
            WHERE pulse IS NULL OR EXISTS {
              MATCH (pulse)<-[:HAS_PULSE]-(:FieldContext)<-[:HAS_CONTEXT]-(ps:Space)
              WHERE EXISTS {
                MATCH (pulseOwner)-[:OWNS]->(ps)
                WHERE pulseOwner.id = $userId
              }
              OR EXISTS {
                MATCH (ps)-[:HAS_MEMBER]->(psm:SpaceMembership)-[:IS_MEMBER]->(pmember)
                WHERE pmember.id = $userId
              }
            }
            RETURN w, contexts,
                   collect(DISTINCT person) AS people,
                   collect(DISTINCT pulse) AS wovenPulses
            ORDER BY w.createdAt DESC, w.id
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

      // A weave's nested fields are supplied by hand for the same reason the
      // pulse branches supply `context`. `wovenFor` is projected to the same
      // directory-safe columns the people branch uses — the custom resolver
      // bypasses Person's field-level @authorization, so it must never hand
      // back a whole Person node (GOAL-275). `Person.name` is a
      // @customResolver over firstName + lastName, so those two are what the
      // selection `wovenFor { name }` actually needs.
      const promiseWeaves: EntityRecord[] = promiseWeavesResult.records.map(
        (record) => {
          const weave = (record.get('w') as Neo4jNode).properties
          const contexts = (record.get('contexts') as Neo4jNode[]) ?? []
          const wovenFor = (record.get('people') as Neo4jNode[]) ?? []
          const wovenPulses = (record.get('wovenPulses') as Neo4jNode[]) ?? []
          return {
            ...weave,
            context: contexts.map((ctx) => ({
              ...ctx.properties,
              __typename: 'FieldContext',
            })),
            wovenFor: wovenFor.map((person) => ({
              id: person.properties.id,
              firstName: person.properties.firstName ?? '',
              lastName: person.properties.lastName ?? '',
              photo: person.properties.photo ?? null,
              __typename: 'Person',
            })),
            weaves: wovenPulses.map((pulse) => ({
              ...pulse.properties,
              __typename: pulseTypename(pulse.labels),
            })),
          }
        }
      )

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
        promiseWeaves,
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
        promiseWeavesSession.close(),
      ])
    }
  },
}
