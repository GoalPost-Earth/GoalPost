import { DynamicStructuredTool } from '@langchain/community/tools/dynamic'
import { z } from 'zod'
import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'

/**
 * Person Search Tool Schema
 */
const PersonSearchSchema = z.object({
  name: z
    .string()
    .describe(
      'The first name, last name, or full name of the person to search for'
    ),
})

export interface PersonSearchResult {
  found: boolean
  count: number
  people?: Array<{
    id: string
    firstName: string
    lastName: string
    name: string
    /** True when the caller passes the GOAL-275 reach test for this person. */
    privateProfileVisible: boolean
    photo?: string | null
    status?: string | null
    communities?: string[]
    // ── Gated: null unless `privateProfileVisible` ────────────────────────────
    email?: string | null
    pronouns?: string | null
    location?: string | null
    passions?: string | null
    traits?: string | null
    interests?: string | null
    fieldsOfCare?: string | null
    favorites?: string | null
    connectionCount?: number
    connectedPeople?: Array<{
      id: string
      firstName?: string | null
      lastName?: string | null
      name: string
      email?: string | null
      photo?: string | null
      why?: string | null
      interests?: string | null
      sharedCommunities?: string[]
    }>
  }>
  message: string
  needsDisambiguation: boolean
}

/**
 * The GOAL-275 Person-PII reach test, expressed in raw Cypher.
 *
 * This is a hand port of the single type-level `@authorization` filter on
 * `PersonPrivateProfile` in `src/lib/graphql/schema/schema.gql`, branch for
 * branch, and of the table in `kb/02-user-roles.md`. `@authorization` only
 * governs the GraphQL read path — server-side raw Cypher runs underneath it —
 * so a tool that reads PII directly has to restate the policy or it silently
 * bypasses the gate.
 *
 * Assumes `p` (the candidate) and `caller` are in scope. `caller` may be null
 * (no identity, or no `:Person` node for the id), in which case the whole
 * expression is false and every gated field resolves to null.
 *
 * Keep in lockstep with the SDL filter. If a branch is added there, add it
 * here; `person-pii-read-auth.integration.test.ts` pins the SDL side only.
 */
const CAN_READ_PII = `(
  caller IS NOT NULL
  AND (
    // 1. self
    p.id = caller.id
    // 2. createdBy — the caller's own imported / ingested contact
    OR EXISTS { (p)-[:CREATED_BY]->(caller) }
    // 3. ownsSpaces — co-owner or co-member of any Space the person OWNS
    OR EXISTS {
      MATCH (p)-[:OWNS]->(s:Space)
      WHERE (caller)-[:OWNS]->(s)
        OR (s)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(caller)
    }
    // 4. memberOf — owner or co-member of any Space the person BELONGS TO
    OR EXISTS {
      MATCH (p)<-[:IS_MEMBER]-(:SpaceMembership)<-[:HAS_MEMBER]-(s:Space)
      WHERE (caller)-[:OWNS]->(s)
        OR (s)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(caller)
    }
    // 5. contexts — the caller can view a FieldContext holding them.
    //    HAS_CONTEXT only: a soft-deleted context (GOAL-319) hangs off
    //    HAS_DELETED_CONTEXT and withdraws the PII reach it granted.
    OR EXISTS {
      MATCH (p)<-[:HAS_PERSON]-(:FieldContext)<-[:HAS_CONTEXT]-(s:Space)
      WHERE (caller)-[:OWNS]->(s)
        OR (s)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(caller)
    }
  )
)`

/**
 * Creates a person search tool that queries Neo4j for people by name
 * and handles disambiguation when multiple matches exist.
 *
 * Two-tier result, matching the Person access model in `kb/02-user-roles.md`:
 *
 * - **Directory identity** (`id`, `firstName`, `lastName`, `name`, `photo`,
 *   `status`, `communities`) is returned for any match, so people stay findable
 *   by name across Spaces — exactly what the open fields on `Person` allow.
 * - **PII** (`email`, `pronouns`, `location`, `passions`, `traits`,
 *   `interests`, `fieldsOfCare`, `favorites`) and the `CONNECTED_TO` neighbour
 *   list are returned only when the caller passes `CAN_READ_PII` above.
 *   Otherwise they come back null / empty with `privateProfileVisible: false`,
 *   mirroring `Person.privateProfile` resolving to null.
 *
 * Passing `userId = null` is an unauthenticated call: the tool refuses outright
 * rather than serving even the directory tier, matching `createSpaceSearchTool`
 * / `createFieldContextSearchTool` / `createPulseSearchTool`. The legacy agent
 * path (`src/modules/agent/tools/index.ts`) and the unauthenticated
 * `/api/chat-test` route both pass null; the active chat surface
 * (`src/lib/simulation/chat-tools.ts`) passes the JWT-resolved `currentUserId`.
 */
export function createPersonSearchTool(
  graph: Neo4jGraph,
  userId: string | null
): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: 'search_person_by_name',
    description: `Search for a specific person in the GoalPost community by their name.
    Use this tool when the user asks about a specific person, wants to find someone, or requests profile information.
    This tool will return person details if found, indicate when no match exists, or ask for clarification when multiple people match.
    Profile details are only included for people whose private profile the current user is allowed to see; otherwise only their name and photo come back and privateProfileVisible is false.`,
    schema: PersonSearchSchema as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    func: async (
      input: z.infer<typeof PersonSearchSchema>
    ): Promise<string> => {
      const { name } = input

      if (!userId) {
        return JSON.stringify({
          found: false,
          count: 0,
          message:
            'I could not identify the current user, so I cannot look people up. Please sign in and try again.',
          needsDisambiguation: false,
        })
      }

      // Build a very flexible Cypher query that handles:
      // - Single first name: "Robert" matches "Robert Damaschke"
      // - Single last name: "Damaschke" matches "Robert Damaschke"
      // - Full name: "Robert Damaschke" matches exactly
      // - Partial matches: "Rob" matches "Robert"
      // - Case insensitive matching
      //
      // Ranking and LIMIT are applied BEFORE the reach test and the two
      // enrichment subqueries, so the per-row EXISTS branches and the
      // community / connection expansion run over at most 10 people instead of
      // every CONTAINS hit in the graph.
      const query = `
        OPTIONAL MATCH (caller:Person { id: $userId })
        WITH caller,
             toLower($name) AS qLower,
             [t IN split(toLower($name), ' ') WHERE size(t) >= 2] AS qTokens
        MATCH (p:Person)
        WHERE
          // Match if search term is contained in first name
          toLower(coalesce(p.firstName, '')) CONTAINS qLower
          // Match if search term is contained in last name
          OR toLower(coalesce(p.lastName, '')) CONTAINS qLower
          // Match if search term matches full name
          OR toLower(coalesce(p.firstName, '') + ' ' + coalesce(p.lastName, '')) CONTAINS qLower
          // Match if first name starts with search term (for "Rob" -> "Robert")
          OR toLower(coalesce(p.firstName, '')) STARTS WITH qLower
          // Match if last name starts with search term
          OR toLower(coalesce(p.lastName, '')) STARTS WITH qLower
          // Casual multi-token names ("JD Addy", "Dr. Jane Doe"): accept the
          // person when the LAST typed token is contained in their lastName.
          // Handles initialisms in the first-name slot ("JD" for "John-Dag")
          // which never substring-match the firstName.
          OR (
            size(qTokens) >= 2
            AND toLower(coalesce(p.lastName, '')) CONTAINS last(qTokens)
          )
        WITH caller, p
        ORDER BY
          // Prioritize exact first name matches
          CASE WHEN toLower(p.firstName) = toLower($name) THEN 0
               WHEN toLower(p.lastName) = toLower($name) THEN 1
               WHEN toLower(p.firstName) STARTS WITH toLower($name) THEN 2
               ELSE 3 END,
          p.firstName
        LIMIT 10
        WITH p, ${CAN_READ_PII} AS canReadPii
        CALL {
          WITH p
          OPTIONAL MATCH (p)-[:BELONGS_TO]->(community:Community)
          RETURN [name IN collect(DISTINCT community.name) WHERE name IS NOT NULL] AS communities
        }
        CALL {
          WITH p, canReadPii
          // The WHERE is part of the OPTIONAL MATCH, so an unauthorized caller
          // binds conn = null: no neighbours, and connectionCount = 0.
          OPTIONAL MATCH (p)-[connectionRel:CONNECTED_TO]-(conn:Person)
          WHERE canReadPii
          OPTIONAL MATCH (p)-[:BELONGS_TO]->(sharedCommunity:Community)<-[:BELONGS_TO]-(conn)
          WITH
            conn,
            connectionRel,
            [name IN collect(DISTINCT sharedCommunity.name) WHERE name IS NOT NULL][0..3] AS sharedCommunities
          ORDER BY toLower(coalesce(conn.name, trim(coalesce(conn.firstName, '') + ' ' + coalesce(conn.lastName, ''))))
          WITH
            collect(DISTINCT {
              id: coalesce(conn.id, elementId(conn)),
              firstName: conn.firstName,
              lastName: conn.lastName,
              name: coalesce(conn.name, trim(coalesce(conn.firstName, '') + ' ' + coalesce(conn.lastName, ''))),
              email: conn.email,
              photo: conn.photo,
              why: connectionRel.why,
              interests: connectionRel.interests,
              sharedCommunities: sharedCommunities
            }) AS rawConnectedPeople,
            count(DISTINCT conn) AS connectionCount
          RETURN
            [item IN rawConnectedPeople WHERE item.id IS NOT NULL][0..10] AS connectedPeople,
            connectionCount
        }
        RETURN
          elementId(p) as id,
          p.firstName as firstName,
          p.lastName as lastName,
          coalesce(p.firstName, '') + ' ' + coalesce(p.lastName, '') as name,
          // Open directory / presence fields — readable by any authenticated
          // caller, same as the ungated scalars on the Person type.
          p.photo as photo,
          p.status as status,
          communities,
          canReadPii as privateProfileVisible,
          // Gated PII — the set on PersonPrivateProfile.
          CASE WHEN canReadPii THEN p.email END as email,
          CASE WHEN canReadPii THEN p.pronouns END as pronouns,
          CASE WHEN canReadPii THEN p.location END as location,
          CASE WHEN canReadPii THEN p.passions END as passions,
          CASE WHEN canReadPii THEN p.traits END as traits,
          CASE WHEN canReadPii THEN p.interests END as interests,
          CASE WHEN canReadPii THEN p.fieldsOfCare END as fieldsOfCare,
          CASE WHEN canReadPii THEN p.favorites END as favorites,
          connectedPeople,
          connectionCount
      `

      console.log('🔍 [DEBUG] Executing person search for:', name)

      try {
        const results = await graph.query(query, { name, userId })
        console.log(
          '🔍 [DEBUG] Query returned',
          results?.length || 0,
          'results'
        )

        if (!results) {
          return JSON.stringify({
            found: false,
            count: 0,
            message: `I encountered an error while searching for "${name}". Please try again.`,
            needsDisambiguation: false,
          })
        }

        const result: PersonSearchResult = {
          found: results.length > 0,
          count: results.length,
          people: results as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          message: '',
          needsDisambiguation: results.length > 1,
        }

        // Case 1: No person found
        if (results.length === 0) {
          console.log('❌ [DEBUG] No person found for:', name)
          result.message = `I searched the GoalPost database but could not find any person matching "${name}". There is no information about such a person in our community database. Would you like me to help you search for someone else, or explore other aspects of the community?`
          return JSON.stringify(result)
        }

        // Case 2: Multiple people found - need disambiguation.
        // `location` / `pronouns` are gated, so this line degrades to just the
        // name plus communities for people the caller cannot reach.
        if (results.length > 1) {
          console.log('🔀 [DEBUG] Multiple matches found:', results.length)
          const peopleList = results
            .map((p, idx) => {
              const details = []
              if (p.location) details.push(`from ${p.location}`)
              if (p.pronouns) details.push(`${p.pronouns}`)
              const communityInfo = p.communities?.length
                ? ` (member of ${p.communities.slice(0, 2).join(', ')}${p.communities.length > 2 ? ', ...' : ''})`
                : ''

              return `${idx + 1}. ${p.name}${details.length ? ' - ' + details.join(', ') : ''}${communityInfo}`
            })
            .join('\n')

          result.message = `I found ${results.length} people matching "${name}" in the GoalPost community:\n\n${peopleList}\n\nCould you please clarify which person you're interested in? You can mention their location, community, or any other distinguishing detail.`
          return JSON.stringify(result)
        }

        // Case 3: Exact match - return profile data
        const person = results[0]
        console.log('✅ [DEBUG] Found person:', person.name)

        if (!person.privateProfileVisible) {
          // Say so explicitly, otherwise the model reads a wall of nulls as
          // "this person has no details" and tells the user the profile is
          // empty rather than private.
          result.message = `PERSON_PROFILE_PRIVATE: ${JSON.stringify(person)}

${person.name} is in the GoalPost community, but their private profile is not shared with you, so only their name and photo are available. You can see someone's full profile when you share a Space with them, when you added them yourself, or when they are attached to a field you can view.`
          return JSON.stringify(result)
        }

        result.message = `PERSON_PROFILE_FOUND: ${JSON.stringify(person)}`

        return JSON.stringify(result)
      } catch (error) {
        // Raw error is logged server-side only; the returned message is folded
        // into the model's context, so it must stay member-safe and never carry
        // technical internals (kb/07 Rule 1).
        console.error('Error searching for person:', error)
        return JSON.stringify({
          found: false,
          count: 0,
          message: `I encountered an error while searching for "${name}". Please try again or rephrase your question.`,
          needsDisambiguation: false,
        })
      }
    },
  })
}
