import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import {
  getWeaveOriginLabel,
  getWeaveStatusLabel,
  isAwaitingReview,
  normalizeWeaveStatus,
  type WeaveStatus,
} from '@/lib/promise-weave'
import { weaveDisplayTitle } from '@/lib/promise-weave-display'

/**
 * PromiseWeave retrieval for the assistant.
 *
 * A weave is a reified connector node, NOT a pulse subtype (kb/01-glossary.md),
 * so `searchPulses` can never see one — it matches `:FieldPulse`. Before this
 * module the assistant had no weave-aware read tool at all: asking "what
 * promise weaves do I have?" fell through to `search_pulse` /
 * `search_field_context`, which looked for the literal words "promise weave" in
 * pulse text and reported nothing, while the member's weaves sat in the graph.
 * Only `query_for_bloom` could reach them, and only when the member happened to
 * ask for the canvas.
 *
 * Authorization mirrors the GOAL-343 search resolver: a weave is visible iff
 * the caller can reach the Space of a FieldContext that `HAS_WEAVE` it. Raw
 * Cypher does not inherit the type's `@authorization` READ filter, so the same
 * reach test is restated here — and again, separately, for the pulses a weave
 * `WEAVES`, because `WEAVES` routinely crosses Space boundaries.
 */

export interface PromiseWeaveRecord {
  id: string
  /**
   * Human-readable name (kb/07 Rule 3). Resolved through `weaveDisplayTitle`,
   * so an untitled weave borrows its first woven pulse's title and never falls
   * through to a raw `weave_*` id.
   */
  title: string
  /** The member's note, or the evidence AI discovery cited. */
  description: string | null
  /**
   * Display label for the lifecycle state — `getWeaveStatusLabel`, which shows
   * a legacy migration value (`Inactive`) verbatim rather than renaming it into
   * a lifecycle state it never meant. Never compare this string; branch on
   * `awaitingReview` instead.
   */
  status: string
  /**
   * True only for `proposed` weaves — the one status that gates. Derived
   * through `normalizeWeaveStatus`, which is the single place the
   * null-reads-as-active and `inactive`-is-legacy-`dissolved` rules live
   * (kb/04-state-machines.md).
   */
  awaitingReview: boolean
  /** Provenance sentence — member-woven, assistant-proposed, or migrated. */
  origin: string
  /** The person the weave is WOVEN_FOR, or null when it names no one. */
  wovenForName: string | null
  /** Titles of the pulses this weave connects — only ones the caller can view. */
  wovenPulseTitles: string[]
  contextTitles: string[]
  spaceNames: string[]
  createdByName: string | null
  createdAt: string | null
  modifiedAt: string | null
}

export interface PromiseWeaveSearchInput {
  /**
   * Keyword for a title/description/woven-pulse/woven-person match. OPTIONAL:
   * a blank query ENUMERATES every weave in scope. Unlike `searchPulses` an
   * unscoped enumeration is allowed here — "what promise weaves do I have?" is
   * the canonical question and carries no scope, and weaves are connector
   * nodes numbering far fewer than pulses.
   */
  query?: string
  /**
   * The authenticated caller's id. REQUIRED — a missing/empty userId returns
   * nothing (fail closed), never the whole graph.
   */
  userId?: string | null
  contextId?: string
  contextTitle?: string
  spaceId?: string
  spaceName?: string
  limit?: number
}

export interface PromiseWeaveSearchResult {
  found: boolean
  count: number
  weaves: PromiseWeaveRecord[]
  message: string
}

function normalizeLimit(limit?: number): number {
  if (!limit || !Number.isFinite(limit)) return 10
  return Math.max(1, Math.min(25, Math.floor(limit)))
}

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter((entry) => entry.length > 0)
}

/**
 * The Space reach test, restated for raw Cypher. `spaceVar` is a
 * caller-controlled Cypher identifier, never user input.
 */
function reachableSpacePredicate(spaceVar: string): string {
  return `(
    EXISTS { MATCH (${spaceVar})<-[:OWNS]-(:Person { id: $currentUserId }) }
    OR EXISTS {
      MATCH (${spaceVar})-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(:Person { id: $currentUserId })
    }
  )`
}

function mapWeaveRecord(row: Record<string, unknown>): PromiseWeaveRecord {
  const wovenPulseTitles = toStringList(row.wovenPulseTitles)
  const wovenForName =
    typeof row.wovenForName === 'string' && row.wovenForName.trim()
      ? row.wovenForName.trim()
      : null

  // Route the label through the shared display helper rather than reading
  // `title` directly: `PromiseWeave.title` is optional, and the fallback chain
  // (own title -> first woven pulse -> "Promise weave") is the same one every
  // card surface uses, so chat and UI cannot drift on what a weave is called.
  const title = weaveDisplayTitle({
    title: typeof row.title === 'string' ? row.title : null,
    weaves: wovenPulseTitles.map((pulseTitle) => ({ title: pulseTitle })),
    wovenFor: wovenForName ? [{ name: wovenForName }] : [],
  })

  const rawStatus = typeof row.status === 'string' ? row.status : null
  const description =
    typeof row.description === 'string' && row.description.trim()
      ? row.description.trim()
      : null

  return {
    id: String(row.id ?? ''),
    title,
    description,
    status: getWeaveStatusLabel(rawStatus),
    awaitingReview: isAwaitingReview(rawStatus),
    origin: getWeaveOriginLabel(
      typeof row.origin === 'string' ? row.origin : null
    ),
    wovenForName,
    wovenPulseTitles,
    contextTitles: toStringList(row.contextTitles),
    spaceNames: toStringList(row.spaceNames),
    createdByName:
      typeof row.createdByName === 'string' && row.createdByName.trim()
        ? row.createdByName.trim()
        : null,
    createdAt: (row.createdAt as string | null) || null,
    modifiedAt: (row.modifiedAt as string | null) || null,
  }
}

/**
 * Canonical lifecycle state for a returned record, for callers that need to
 * group or count. Reads the display label back through `normalizeWeaveStatus`
 * rather than comparing it, per kb/04-state-machines.md.
 */
export function weaveLifecycleStatus(
  weave: Pick<PromiseWeaveRecord, 'status'>
): WeaveStatus {
  return normalizeWeaveStatus(weave.status)
}

export async function searchPromiseWeaves(
  graph: Neo4jGraph,
  input: PromiseWeaveSearchInput
): Promise<PromiseWeaveSearchResult> {
  const query = input.query?.trim() || ''
  const contextId = input.contextId?.trim() || null
  const contextTitle = input.contextTitle?.trim() || null
  const spaceId = input.spaceId?.trim() || null
  const spaceName = input.spaceName?.trim() || null
  const limit = normalizeLimit(input.limit)
  const currentUserId = input.userId?.trim() || null

  // Fail closed: without an authenticated caller we never read weaves, so an
  // unauthenticated/spoofed request can't enumerate the graph.
  if (!currentUserId) {
    return {
      found: false,
      count: 0,
      weaves: [],
      message: 'You need to be signed in to look up promise weaves.',
    }
  }

  // A blank query lists every weave in scope. Keyword mode also matches the
  // woven pulse's title and the woven person's name, because those are exactly
  // what an untitled weave DISPLAYS as (`weaveDisplayTitle` / `weavePersonName`)
  // — a member searching for the name they can see on a card would otherwise
  // get nothing back.
  const textClause = query
    ? `(
        toLower(coalesce(weave.title, '')) CONTAINS toLower($query)
        OR toLower(coalesce(weave.description, '')) CONTAINS toLower($query)
        OR EXISTS {
          MATCH (weave)-[:WEAVES]->(qp:FieldPulse)
          WHERE toLower(coalesce(qp.title, '')) CONTAINS toLower($query)
        }
        OR EXISTS {
          MATCH (weave)-[:WOVEN_FOR]->(qf:Person)
          WHERE toLower(coalesce(qf.name, '')) CONTAINS toLower($query)
        }
      )`
    : 'true'

  const orderClause = query
    ? `ORDER BY
        CASE
          WHEN toLower(trim(coalesce(weave.title, ''))) = toLower(trim($query)) THEN 0
          WHEN toLower(coalesce(weave.title, '')) STARTS WITH toLower($query) THEN 1
          ELSE 2
        END,
        weave.createdAt DESC`
    : `ORDER BY weave.createdAt DESC`

  // `HAS_CONTEXT` (never a wildcard) keeps soft-deleted fields out: deletion
  // re-points that edge to `HAS_DELETED_CONTEXT`, so a weave in a deleted field
  // drops out of this read for free.
  //
  // The `WITH DISTINCT weave ... LIMIT` sits BEFORE the projection OPTIONAL
  // MATCHes so those expansions run for the returned rows only, mirroring
  // `searchPulses`. The ordering keys are weave-only and the final RETURN
  // re-applies `orderClause`, so it is order-preserving.
  const cypher = `
    MATCH (weave:PromiseWeave)<-[:HAS_WEAVE]-(context:FieldContext)<-[:HAS_CONTEXT]-(space:Space)
    WHERE ${textClause}
      AND ${reachableSpacePredicate('space')}
      AND ($contextId IS NULL OR context.id = $contextId)
      AND (
        $contextTitle IS NULL
        OR toLower(coalesce(context.title, '')) CONTAINS toLower($contextTitle)
      )
      AND ($spaceId IS NULL OR space.id = $spaceId)
      AND (
        $spaceName IS NULL
        OR toLower(coalesce(space.name, '')) CONTAINS toLower($spaceName)
      )
    WITH DISTINCT weave
    ${orderClause}
    LIMIT toInteger($limit)
    OPTIONAL MATCH (homeSpace:Space)-[:HAS_CONTEXT]->(homeContext:FieldContext)-[:HAS_WEAVE]->(weave)
    WHERE ${reachableSpacePredicate('homeSpace')}
    OPTIONAL MATCH (weave)-[:WOVEN_FOR]->(wovenFor:Person)
    OPTIONAL MATCH (weave)-[:CREATED_BY]->(creator:Person)
    OPTIONAL MATCH (weave)-[:WEAVES]->(pulse:FieldPulse)
    WHERE EXISTS {
      MATCH (pulse)<-[:HAS_PULSE]-(:FieldContext)<-[:HAS_CONTEXT]-(pulseSpace:Space)
      WHERE ${reachableSpacePredicate('pulseSpace')}
    }
    WITH
      weave,
      [title IN collect(DISTINCT homeContext.title) WHERE title IS NOT NULL] AS contextTitles,
      [name IN collect(DISTINCT homeSpace.name) WHERE name IS NOT NULL] AS spaceNames,
      head([name IN collect(DISTINCT wovenFor.name) WHERE name IS NOT NULL]) AS wovenForName,
      head([name IN collect(DISTINCT creator.name) WHERE name IS NOT NULL]) AS createdByName,
      [title IN collect(DISTINCT pulse.title) WHERE title IS NOT NULL] AS wovenPulseTitles
    RETURN
      weave.id AS id,
      weave.title AS title,
      weave.description AS description,
      weave.status AS status,
      weave.origin AS origin,
      toString(weave.createdAt) AS createdAt,
      toString(weave.modifiedAt) AS modifiedAt,
      wovenForName,
      createdByName,
      contextTitles,
      spaceNames,
      wovenPulseTitles
    ${orderClause}
  `

  const raw = await graph.query<Record<string, unknown>>(cypher, {
    query,
    contextId,
    contextTitle,
    spaceId,
    spaceName,
    limit,
    currentUserId,
  })

  const weaves = (raw || []).map(mapWeaveRecord)

  if (weaves.length === 0) {
    return {
      found: false,
      count: 0,
      weaves: [],
      message: query
        ? `I could not find any promise weaves matching "${query}".`
        : 'I did not find any promise weaves in that scope.',
    }
  }

  const noun = weaves.length === 1 ? 'promise weave' : 'promise weaves'
  // A listing that fills the page (=limit) is almost certainly truncated, so
  // say so rather than letting the model relay the cap as the total
  // (kb/07 truthfulness) — the same guard `searchPulses` uses.
  const truncated = weaves.length === limit
  const awaiting = weaves.filter((weave) => weave.awaitingReview).length
  const awaitingNote =
    awaiting > 0
      ? ` ${awaiting} of them ${awaiting === 1 ? 'is' : 'are'} proposed and waiting on a confirm or dismiss.`
      : ''

  return {
    found: true,
    count: weaves.length,
    weaves,
    message: truncated
      ? `Here are ${weaves.length} ${noun} — there may be more; ask me to narrow to a field or Space.${awaitingNote}`
      : `I found ${weaves.length} ${noun}.${awaitingNote}`,
  }
}
