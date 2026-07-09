/**
 * Evidence collector for ResonanceSuggestion rows.
 *
 * Robert's direction (May follow-up call): graph semantics over vector
 * embeddings. Vector ANN still picks candidate pairs, but the *why* a pair
 * resonates must come from graph traversal — shared contexts, shared
 * authors, prior resonance neighbors — so admins reviewing the suggestion
 * queue see concrete rationale, not a naked confidence number.
 *
 * This module is the minimum step toward that: after the LLM produces a
 * narrative evidence string in `pattern-detector.ts`, we enrich it with
 * graph-derived facts captured in a single Cypher round-trip. The full
 * graph-traversal-first candidate selection refactor is a separate ticket;
 * this one closes the explainability gap.
 *
 * Output is plain text suitable for the existing `ResonanceSuggestion.evidence`
 * field — no shape changes. Names only, never raw IDs (kb/07-ai-assistant-ux
 * Rule 1).
 */

import { initGraph } from '@/modules/graph'

export interface PulsePairEvidence {
  sharedContexts: string[]
  sharedAuthors: string[]
  priorResonanceLinks: number
}

interface CollectorRow {
  sharedContexts: string[]
  sharedAuthors: string[]
  priorResonanceLinks: number | { low: number; high: number }
}

/**
 * Collect graph-derived rationale for a pulse pair. Cypher captures:
 *
 *  - shared FieldContexts (both pulses live in)
 *  - shared authors (one Person created both)
 *  - count of prior ResonanceLinks that connect the two pulses (catches the
 *    "we've seen this pair resonate before" case)
 *
 * Author names fall back through `name → firstName + lastName → "someone"`
 * because the dev/prod data set has rows where one of those fields is
 * populated and the others aren't.
 */
export async function collectPulsePairEvidence(
  p1Id: string,
  p2Id: string
): Promise<PulsePairEvidence> {
  const graph = await initGraph()

  // The prior-resonance match anchors on `p1` (bounded by its resonance
  // degree) rather than scanning every ResonanceLink (which would scale
  // with total RL count). Cypher review patch — ~93% dbHit reduction on
  // dev (365 → 24 dbHits per pair) and scales as resonance discovery's
  // cron runs O(pulses × topK) per cycle.
  const rows = await graph.query<CollectorRow>(
    `
    MATCH (p1:FieldPulse {id: $p1Id}), (p2:FieldPulse {id: $p2Id})
    OPTIONAL MATCH (ctx:FieldContext)-[:HAS_PULSE]->(p1)
      WHERE (ctx)-[:HAS_PULSE]->(p2)
    WITH p1, p2, collect(DISTINCT ctx.title) AS sharedContexts
    // Authorship lives on TWO live edges: INITIATED_BY (assistant/doc-ingest
    // paths, incl. attribution to extracted persons) and CREATED_BY (dashboard
    // flow, imports). Either alone misses the other surface's pulses, so
    // shared-author evidence must match the alternation on both legs.
    OPTIONAL MATCH (p1)-[:INITIATED_BY|CREATED_BY]->(person:Person)<-[:INITIATED_BY|CREATED_BY]-(p2)
    WITH p1, p2, sharedContexts,
      collect(DISTINCT
        CASE
          // No shared author at all (OPTIONAL MATCH miss) must yield null —
          // aggregates skip nulls — or every vector-only pair gets a false
          // "Shared author: someone." and the no-shared-edges fallback in
          // composeEvidenceString never fires.
          WHEN person IS NULL THEN null
          WHEN person.name IS NOT NULL AND person.name <> '' THEN person.name
          WHEN coalesce(person.firstName, '') <> '' OR coalesce(person.lastName, '') <> ''
            THEN trim(coalesce(person.firstName, '') + ' ' + coalesce(person.lastName, ''))
          ELSE 'someone'
        END
      ) AS sharedAuthors
    OPTIONAL MATCH (p1)<-[:SOURCE|TARGET]-(rl:ResonanceLink)-[:SOURCE|TARGET]->(p2)
    WITH sharedContexts, sharedAuthors, count(DISTINCT rl) AS priorResonanceLinks
    RETURN sharedContexts, sharedAuthors, priorResonanceLinks
    `,
    { p1Id, p2Id }
  )

  if (!Array.isArray(rows) || rows.length === 0) {
    return { sharedContexts: [], sharedAuthors: [], priorResonanceLinks: 0 }
  }

  const row = rows[0]
  // Neo4j integers come back as `{low, high}` when accessed via the
  // langchain Neo4jGraph helper without unboxing — fold that here.
  const prior =
    typeof row.priorResonanceLinks === 'number'
      ? row.priorResonanceLinks
      : (row.priorResonanceLinks?.low ?? 0)
  return {
    sharedContexts: (row.sharedContexts ?? []).filter(
      (c) => typeof c === 'string' && c.length > 0
    ),
    sharedAuthors: (row.sharedAuthors ?? []).filter(
      (a) => typeof a === 'string' && a.length > 0
    ),
    priorResonanceLinks: prior,
  }
}

/**
 * Compose the final evidence string. Prepends the graph-derived facts to
 * the LLM's narrative — the reviewer sees the verifiable structure first,
 * then the prose explanation. When the traversal finds zero shared edges,
 * the prefix says so explicitly so the reviewer knows this is a
 * vector-only match.
 *
 * Names only — never raw IDs (kb/07-ai-assistant-ux Rule 1).
 */
export function composeEvidenceString(
  graphFacts: PulsePairEvidence,
  llmEvidence: string
): string {
  const parts: string[] = []
  if (graphFacts.sharedContexts.length > 0) {
    const list = graphFacts.sharedContexts
      .slice(0, 3)
      .map((c) => `"${c}"`)
      .join(', ')
    parts.push(
      graphFacts.sharedContexts.length === 1
        ? `Shared field: ${list}.`
        : `Shared fields: ${list}.`
    )
  }
  if (graphFacts.sharedAuthors.length > 0) {
    const list = graphFacts.sharedAuthors.slice(0, 3).join(', ')
    parts.push(
      graphFacts.sharedAuthors.length === 1
        ? `Shared author: ${list}.`
        : `Shared authors: ${list}.`
    )
  }
  if (graphFacts.priorResonanceLinks > 0) {
    parts.push(
      `${graphFacts.priorResonanceLinks} prior resonance${
        graphFacts.priorResonanceLinks === 1 ? '' : 's'
      } already link these.`
    )
  }
  const prefix =
    parts.length > 0
      ? parts.join(' ')
      : 'Vector similarity only — no shared contexts, authors, or resonance neighbors.'

  const narrative = llmEvidence?.trim() ?? ''
  return narrative ? `${prefix} ${narrative}` : prefix
}
