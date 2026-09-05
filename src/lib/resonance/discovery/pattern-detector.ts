/**
 * Resonance discovery pattern detector
 * Discovers semantic connections between pulses WITHIN the same FieldContext
 */

import { getAnalysisProvider } from '@/lib/llm'
import { initGraph } from '../../../modules/graph'
import neo4j from 'neo4j-driver'
import { z } from 'zod'
import {
  collectPulsePairEvidence,
  composeEvidenceString,
} from './evidence-collector'

const ResonancePatternSchema = z.object({
  label: z
    .string()
    .describe(
      'Short label for the resonance pattern (e.g., "grief", "momentum", "scarcity")'
    ),
  description: z.string().describe('Detailed description of the pattern'),
  pulseConnections: z
    .array(
      z.object({
        sourcePulseId: z.string(),
        targetPulseId: z.string(),
        confidence: z.number().min(0).max(1).describe('Confidence score 0-1'),
        evidence: z
          .string()
          .describe('Explanation of why these pulses resonate'),
      })
    )
    .describe('Connections between pulses showing this pattern'),
})

export interface DiscoveredResonance {
  linkId: string
  contextId: string
  label: string
  description: string
  sourcePulseId: string
  targetPulseId: string
  confidence: number
  evidence: string
}

/**
 * Time budget shared by the sweep entry points (GOAL-347).
 *
 * The nightly sweep runs inside a serverless function with a hard duration
 * ceiling (`maxDuration = 300`). A cold sweep — no `lastRunTimestamp`, every
 * Space, an LLM analysis per pulse — costs far more than that ceiling, so
 * without a budget the function is simply killed mid-run: whatever it had
 * written is durable, but it always dies at the same point in the same
 * enumeration order and the Spaces after that point are never reached, on any
 * night. `deadlineAt` turns that hard kill into a clean stop, and the
 * least-recently-swept ordering in `sweepGlobalResonances` turns the clean stop
 * into forward progress — each run resumes where the last one gave up.
 */
export interface ResonanceBudget {
  /** Epoch-ms after which no NEW unit of work is started. */
  deadlineAt?: number
}

/** True when the budget is set and already spent. */
export function budgetExhausted(budget?: ResonanceBudget): boolean {
  return budget?.deadlineAt !== undefined && Date.now() >= budget.deadlineAt
}

/**
 * Find semantically similar pulses WITHIN THE SAME CONTEXT SUBTREE using
 * vector search. "Within a context" includes the context's nested
 * sub-contexts (GOAL-295): the field is the resonance boundary —
 * sub-contexts organize a growing field, they do not partition discovery.
 */
async function findSimilarPulsesInContext(
  pulseId: string,
  contextId: string,
  threshold: number = 0.7,
  limit: number = 10
): Promise<Array<{ id: string; content: string; similarity: number }>> {
  const graph = await initGraph()

  // Get the pulse embedding
  const pulseResult = await graph.query<{
    embedding: number[]
  }>(
    `
    MATCH (p:FieldPulse {id: $pulseId})
    RETURN p.embedding as embedding
  `,
    { pulseId }
  )

  if (
    !Array.isArray(pulseResult) ||
    pulseResult.length === 0 ||
    !pulseResult[0].embedding
  ) {
    return []
  }

  const embedding = pulseResult[0].embedding

  // Use vector similarity search, filtered to same context
  const similarResult = await graph.query<{
    pulse: { id: string; content: string }
    similarity: number
  }>(
    `
    CALL db.index.vector.queryNodes('pulseContentVectorIndex', $limit * 5, $embedding)
    YIELD node, score
    WITH node, score
    MATCH (context:FieldContext {id: $contextId})-[:HAS_SUBCONTEXT*0..10]->(sc:FieldContext)-[:HAS_PULSE]->(node)
    WHERE sc.deletedAt IS NULL AND node.deletedAt IS NULL
      AND node.id <> $pulseId AND score >= $threshold
    RETURN DISTINCT {id: node.id, content: node.content} as pulse, score as similarity
    ORDER BY similarity DESC
    LIMIT $limit
  `,
    // LIMIT/SKIP reject Neo4j Floats, and the LangChain Neo4jGraph layer encodes
    // a plain JS number as a Float — so an un-wrapped `limit` throws at runtime
    // ("'10.0' is not a valid value"). Wrap in neo4j.int() (as execute.ts does).
    // $limit * 5 (the queryNodes k arg) then stays integer arithmetic too —
    // the over-fetch factor is 5 (was 3) because the subtree widens the
    // candidate pool the post-filter has to survive (GOAL-295).
    // The sc.deletedAt filter keeps a soft-deleted sub-context's pulses out;
    // *0..10 comfortably covers MAX_SUBCONTEXT_DEPTH (5).
    { pulseId, contextId, threshold, limit: neo4j.int(limit), embedding }
  )

  if (!Array.isArray(similarResult) || similarResult.length === 0) {
    return []
  }

  return similarResult.map((r) => ({
    id: r.pulse.id,
    content: r.pulse.content,
    similarity: r.similarity,
  }))
}

/**
 * Analyze a cluster of similar pulses to extract resonance patterns using LLM
 */
async function analyzeResonancePattern(
  pulses: Array<{ id: string; content: string; createdAt?: string }>
): Promise<z.infer<typeof ResonancePatternSchema> | null> {
  if (pulses.length < 2) {
    return null
  }

  const provider = getAnalysisProvider()

  const prompt = `You are analyzing ${pulses.length} related pulses to discover a meaningful semantic pattern.

Pulses:
${pulses.map((p, i) => `${i + 1}. (ID: ${p.id}) ${p.content}`).join('\n')}

Your task:
1. Identify the SINGLE most meaningful resonance pattern across these pulses
2. Give it a short, evocative label (1-3 words)
3. Write a clear description explaining what the pattern represents
4. For each pair of pulses that share this resonance, explain WHY they connect and assign a confidence score (0-1)

Focus on:
- Emotional resonance (shared feelings, energy, mood)
- Thematic resonance (shared topics, concerns, aspirations)  
- Symbolic resonance (shared metaphors, meanings, values)

Be specific and evidence-based. Only create connections where the resonance is clear and meaningful.`

  try {
    const pattern = await provider.structuredOutput<
      z.infer<typeof ResonancePatternSchema>
    >(
      [
        {
          role: 'system',
          content:
            'You are an expert at discovering meaningful patterns and connections in human experiences and reflections.',
        },
        { role: 'user', content: prompt },
      ],
      {
        schema: ResonancePatternSchema,
        temperature: 0.2,
        // GOAL-297: background resonance analysis — system-attributed metering.
        meter: { source: 'resonance-analysis', principal: 'system' },
      }
    )

    return pattern as z.infer<typeof ResonancePatternSchema>
  } catch (error) {
    console.error('Failed to analyze resonance pattern:', error)
    return null
  }
}

/**
 * Create ResonanceSuggestion nodes in the database (not direct links)
 * Each suggestion represents one proposed semantic connection between two pulses
 * Users must accept/decline these suggestions before they become ResonanceLink nodes
 *
 * `scopeContextId` (GOAL-295) is the ROOT of the holding context's hierarchy —
 * the field-wide resonance boundary the candidate search ran against. The
 * containment guard checks both pulses against that root's whole subtree, so a
 * pair spanning two sub-contexts of the same field still lands. Suggestions
 * stay ANCHORED (`HAS_SUGGESTION`) on the direct holding `contextId`, which
 * keeps the soft-delete cascade's per-subtree-member suggestion sweep correct.
 * Callers without a hierarchy pass scopeContextId === contextId (unchanged
 * behavior).
 */
async function createResonanceSuggestionsInDatabase(
  contextId: string,
  spaceId: string,
  pattern: z.infer<typeof ResonancePatternSchema>,
  scopeContextId: string = contextId
): Promise<DiscoveredResonance[]> {
  const graph = await initGraph()

  const suggestions: DiscoveredResonance[] = []

  // Create individual ResonanceSuggestion nodes for each pulse connection.
  // Before the write we enrich the LLM's narrative evidence with graph-derived
  // rationale (shared contexts, shared authors, prior resonance neighbors) so
  // admin reviewers see verifiable structure ahead of the prose explanation —
  // first step toward Robert's "graph semantics over vector embeddings" goal.
  for (const connection of pattern.pulseConnections) {
    let enrichedEvidence = connection.evidence
    try {
      const graphFacts = await collectPulsePairEvidence(
        connection.sourcePulseId,
        connection.targetPulseId
      )
      enrichedEvidence = composeEvidenceString(graphFacts, connection.evidence)
    } catch (evidenceError) {
      // Evidence enrichment is best-effort — never block the suggestion
      // because the rationale Cypher hiccupped. Fall back to the LLM's
      // narrative and log so ops can catch a sustained failure.
      console.warn(
        '[ResonanceSuggestion] Evidence enrichment failed; falling back to LLM-only evidence:',
        evidenceError instanceof Error ? evidenceError.message : evidenceError
      )
    }

    // Create ResonanceSuggestion and connect it to the space, context, source, and target.
    // Deduped symmetrically: if these two pulses are already joined by any
    // ResonanceSuggestion or ResonanceLink (in either direction), we skip the
    // CREATE and return no row. This makes repeated SEQUENTIAL discovery runs
    // safe — on-upload (GOAL-294) and the daily cron both flow through here, and
    // without the guard every re-run would pile up duplicate suggestions for the
    // same pair. It is read-then-create within one statement with no uniqueness
    // constraint on the pair, so two CONCURRENT runs over the same context (e.g.
    // an on-upload after() racing the cron) could each observe "none" and both
    // create; that residual duplicate is acceptable here and, unlike the accept
    // path, stays invisible until a human promotes one of the pair.
    const suggestionResult = await graph.query<{ suggestionId: string }>(
      `
      MATCH (space:Space {id: $spaceId})
      MATCH (space)-[:HAS_CONTEXT]->(context:FieldContext {id: $contextId})
      MATCH (scope:FieldContext {id: $scopeContextId})
      MATCH (source:FieldPulse {id: $sourcePulseId})
      MATCH (target:FieldPulse {id: $targetPulseId})

      // Ensure source and target are both inside the resonance scope — the
      // root field's live subtree (GOAL-295) — AND that the holding context
      // belongs to this Space. EXISTS keeps the row count at exactly 1 so the
      // CREATEs below never multiply.
      //
      // The Space predicate is deliberate redundancy (GOAL-347). Without it,
      // "no suggestion crosses a Space boundary" — the guarantee ADR-003 rests
      // on — is not enforced here at all; it is inherited from the separate
      // invariant that a HAS_SUBCONTEXT hierarchy never spans Spaces. That
      // invariant does hold, by construction in sub-context.ts (a child is
      // created under its parent's Space, and the move path refuses a
      // different one) and in data (verified: zero cross-Space HAS_SUBCONTEXT
      // edges on dev, demo and production). But it is enforced one hop away
      // from the thing it protects: a single stray edge from a script, a
      // migration, or the assistant would quietly turn every discovery run
      // into a cross-Space suggestion writer, with nothing here to stop it.
      // Naming the Space costs one index lookup and makes the boundary
      // self-enforcing. Safe to require: every subtree context carries its own
      // HAS_CONTEXT edge (verified zero exceptions on all three databases).
      WHERE EXISTS {
          MATCH (scope)-[:HAS_SUBCONTEXT*0..10]->(x:FieldContext)-[:HAS_PULSE]->(source)
          WHERE x.deletedAt IS NULL AND (space)-[:HAS_CONTEXT]->(x)
        }
        AND EXISTS {
          MATCH (scope)-[:HAS_SUBCONTEXT*0..10]->(x:FieldContext)-[:HAS_PULSE]->(target)
          WHERE x.deletedAt IS NULL AND (space)-[:HAS_CONTEXT]->(x)
        }

      // Symmetric duplicate check — a ResonanceSuggestion or ResonanceLink that
      // already touches BOTH pulses (SOURCE/TARGET either way round) means this
      // pair is already proposed/confirmed; don't create another.
      OPTIONAL MATCH (source)<-[:SOURCE|TARGET]-(existing)-[:SOURCE|TARGET]->(target)
      WHERE existing:ResonanceSuggestion OR existing:ResonanceLink
      WITH space, context, source, target, existing
      WHERE existing IS NULL

      // Create ResonanceSuggestion
      CREATE (suggestion:ResonanceSuggestion {
        id: 'rs_' + randomUUID(),
        label: $label,
        description: $description,
        confidence: $confidence,
        evidence: $evidence,
        status: 'pending',
        createdAt: datetime()
      })

      // Connect to space, context and pulses
      CREATE (space)-[:HAS_SUGGESTION]->(suggestion)
      CREATE (context)-[:HAS_SUGGESTION]->(suggestion)
      CREATE (suggestion)-[:SOURCE]->(source)
      CREATE (suggestion)-[:TARGET]->(target)

      RETURN suggestion.id as suggestionId
    `,
      {
        spaceId,
        contextId,
        scopeContextId,
        sourcePulseId: connection.sourcePulseId,
        targetPulseId: connection.targetPulseId,
        label: pattern.label,
        description: pattern.description,
        confidence: connection.confidence,
        evidence: enrichedEvidence,
      }
    )

    const suggestionId =
      Array.isArray(suggestionResult) && suggestionResult.length > 0
        ? suggestionResult[0].suggestionId
        : null

    if (suggestionId) {
      suggestions.push({
        linkId: suggestionId, // Using linkId field for backwards compatibility
        contextId,
        label: pattern.label,
        description: pattern.description,
        sourcePulseId: connection.sourcePulseId,
        targetPulseId: connection.targetPulseId,
        confidence: connection.confidence,
        evidence: enrichedEvidence,
      })
    }
  }

  return suggestions
}

/**
 * Discover resonances for a specific pulse WITHIN ITS CONTEXT
 * Creates ResonanceSuggestion nodes (pending approval) instead of direct links
 */
export async function discoverResonancesForPulse(
  pulseId: string,
  spaceId?: string
): Promise<DiscoveredResonance[]> {
  const graph = await initGraph()

  // Get the pulse, its holding context, and the ROOT of that context's
  // hierarchy (GOAL-295): resonance scopes to the whole field, so a pulse in
  // a nested sub-context searches the root's entire subtree. For a flat
  // (top-level) context root = context and behavior is unchanged.
  const pulseResult = await graph.query<{
    pulse: { id: string; content: string; createdAt: string }
    contextId: string
    scopeContextId: string
    spaceId: string
  }>(
    spaceId
      ? `
        MATCH (space:Space {id: $spaceId})-[:HAS_CONTEXT]->(context:FieldContext)-[:HAS_PULSE]->(p:FieldPulse {id: $pulseId})
        OPTIONAL MATCH (root:FieldContext)-[:HAS_SUBCONTEXT*1..10]->(context)
        WHERE NOT (:FieldContext)-[:HAS_SUBCONTEXT]->(root)
        RETURN {
          id: p.id,
          content: p.content,
          createdAt: toString(p.createdAt)
        } as pulse,
        context.id as contextId,
        coalesce(root.id, context.id) as scopeContextId,
        space.id as spaceId
      `
      : `
        MATCH (context:FieldContext)-[:HAS_PULSE]->(p:FieldPulse {id: $pulseId})
        OPTIONAL MATCH (root:FieldContext)-[:HAS_SUBCONTEXT*1..10]->(context)
        WHERE NOT (:FieldContext)-[:HAS_SUBCONTEXT]->(root)
        RETURN {
          id: p.id,
          content: p.content,
          createdAt: toString(p.createdAt)
        } as pulse,
        context.id as contextId,
        coalesce(root.id, context.id) as scopeContextId,
        null as spaceId
      `,
    spaceId ? { pulseId, spaceId } : { pulseId }
  )

  if (!Array.isArray(pulseResult) || pulseResult.length === 0) {
    console.warn(`Pulse not found or has no context: ${pulseId}`)
    return []
  }

  const {
    pulse,
    contextId,
    scopeContextId,
    spaceId: foundSpaceId,
  } = pulseResult[0]

  // Find similar pulses WITHIN THE FIELD (root context subtree)
  const similarPulses = await findSimilarPulsesInContext(
    pulseId,
    scopeContextId,
    0.7,
    10
  )

  if (similarPulses.length === 0) {
    console.log(
      `No similar pulses found for ${pulseId} in context ${contextId}`
    )
    return []
  }

  // Analyze for resonance patterns
  const pulsesToAnalyze = [pulse, ...similarPulses]
  const pattern = await analyzeResonancePattern(pulsesToAnalyze)

  if (!pattern) {
    return []
  }

  // If spaceId not provided, use the one found from the query
  const effectiveSpaceId = spaceId || foundSpaceId
  if (!effectiveSpaceId) {
    console.warn(
      `Cannot create suggestions: no space associated with pulse ${pulseId}`
    )
    return []
  }

  // Create resonance suggestions in database — the containment guard runs
  // against the same root-subtree scope the candidate search used, so a
  // cross-sub-context pair is written, not silently dropped (GOAL-295).
  const suggestions = await createResonanceSuggestionsInDatabase(
    contextId,
    effectiveSpaceId,
    pattern,
    scopeContextId
  )

  return suggestions
}

/**
 * Discover resonances within a SINGLE FieldContext.
 *
 * This is the narrow entry point behind both the space sweep
 * (`discoverResonancesForSpace`, which loops every context through here) and
 * the on-upload trigger (GOAL-294), which scopes discovery to just the context
 * an upload landed in so results surface when the member is looking. Pulses are
 * expected to already be embedded — callers that create fresh pulses (upload,
 * import) must embed them first (see `runContextResonanceDiscovery`), otherwise
 * `findSimilarPulsesInContext` returns nothing and no suggestion is produced.
 */
export async function discoverResonancesForContext(
  spaceId: string,
  contextId: string,
  lastRunTimestamp?: string,
  budget?: ResonanceBudget
): Promise<DiscoveredResonance[]> {
  const graph = await initGraph()

  // Get pulses in this context (bounded — the vector search + LLM analysis per
  // pulse is the expensive part; the cap keeps a single run inside the
  // serverless duration ceiling).
  // GOAL-295: the context's scope includes its nested sub-contexts, so an
  // upload landing in (or a sweep hitting) a parent also refreshes the
  // pulses filed under its children. Soft-deleted sub-contexts are skipped.
  // Dedup on the node (a pulse shared by two subtree contexts appears once)
  // and order by the TEMPORAL createdAt before projecting — ordering the
  // stringified form would sort trimmed/offset datetime renderings wrongly
  // and change which pulses survive the LIMIT.
  const query = lastRunTimestamp
    ? `MATCH (context:FieldContext {id: $contextId})-[:HAS_SUBCONTEXT*0..10]->(sc:FieldContext)-[:HAS_PULSE]->(p:FieldPulse)
       WHERE sc.deletedAt IS NULL
         AND (p.modifiedAt > datetime($lastRunTimestamp)
          OR p.createdAt > datetime($lastRunTimestamp))
       WITH DISTINCT p
       ORDER BY p.createdAt DESC
       LIMIT 50
       RETURN {id: p.id, content: p.content, createdAt: toString(p.createdAt)} as pulse`
    : `MATCH (context:FieldContext {id: $contextId})-[:HAS_SUBCONTEXT*0..10]->(sc:FieldContext)-[:HAS_PULSE]->(p:FieldPulse)
       WHERE sc.deletedAt IS NULL
       WITH DISTINCT p
       ORDER BY p.createdAt DESC
       LIMIT 30
       RETURN {id: p.id, content: p.content, createdAt: toString(p.createdAt)} as pulse`

  const pulsesResult = await graph.query<{
    pulse: { id: string; content: string; createdAt: string }
  }>(query, lastRunTimestamp ? { contextId, lastRunTimestamp } : { contextId })

  if (!Array.isArray(pulsesResult) || pulsesResult.length < 2) {
    console.log(
      `[Context Discovery] Not enough pulses in context ${contextId}, skipping`
    )
    return []
  }

  const pulses = pulsesResult.map((r) => r.pulse)

  console.log(
    `[Context Discovery] Found ${pulses.length} pulses in context ${contextId}`
  )

  const discovered: DiscoveredResonance[] = []
  for (const pulse of pulses) {
    // Finest-grained budget check in the sweep: one iteration is a vector
    // search plus an LLM analysis, the single most expensive unit of work
    // here, so this is where a run must be able to stop. Suggestions already
    // written are durable and deduped, so the next run re-walks this context
    // cheaply and continues past where we stopped.
    if (budgetExhausted(budget)) {
      console.log(
        `[Context Discovery] Time budget spent in context ${contextId}; stopping after ${discovered.length} suggestion(s).`
      )
      break
    }
    try {
      const resonances = await discoverResonancesForPulse(pulse.id, spaceId)
      discovered.push(...resonances)
    } catch (error) {
      console.error(
        `[Context Discovery] Failed to discover resonances for pulse ${pulse.id}:`,
        error
      )
    }
  }

  return discovered
}

/**
 * Discover resonances for a specific space
 * Processes all contexts within the space independently
 */
export async function discoverResonancesForSpace(
  spaceId: string,
  lastRunTimestamp?: string,
  budget?: ResonanceBudget
): Promise<DiscoveredResonance[]> {
  const graph = await initGraph()

  // Verify space exists
  const spaceResult = await graph.query<{ spaceId: string }>(
    `MATCH (space:Space {id: $spaceId}) RETURN space.id as spaceId`,
    { spaceId }
  )

  if (!Array.isArray(spaceResult) || spaceResult.length === 0) {
    console.error(`Space not found: ${spaceId}`)
    return []
  }

  // Get all ROOT contexts for this space. Nested sub-contexts (GOAL-295)
  // also carry a direct HAS_CONTEXT edge, but the per-context entry point
  // already sweeps each root's whole subtree — enumerating children here
  // would process every nested pulse twice per run.
  const contextsResult = await graph.query<{
    contextId: string
    contextTitle: string
  }>(
    `
    MATCH (space:Space {id: $spaceId})-[:HAS_CONTEXT]->(context:FieldContext)
    WHERE NOT (:FieldContext)-[:HAS_SUBCONTEXT]->(context)
    RETURN context.id as contextId, context.title as contextTitle
  `,
    { spaceId }
  )

  if (!Array.isArray(contextsResult) || contextsResult.length === 0) {
    console.log(`No contexts found in space ${spaceId}`)
    return []
  }

  const contexts = contextsResult

  console.log(
    `[Space Discovery] Analyzing ${contexts.length} contexts in space ${spaceId} for resonances...`
  )

  const allDiscoveredResonances: DiscoveredResonance[] = []

  // Process each context independently through the context-scoped entry point.
  for (const { contextId, contextTitle } of contexts) {
    if (budgetExhausted(budget)) {
      console.log(
        `[Space Discovery] Time budget spent in space ${spaceId}; stopping before context ${contextId}.`
      )
      break
    }
    try {
      console.log(
        `[Space Discovery] Processing context: ${contextTitle} (${contextId})`
      )
      const resonances = await discoverResonancesForContext(
        spaceId,
        contextId,
        lastRunTimestamp,
        budget
      )
      allDiscoveredResonances.push(...resonances)
    } catch (error) {
      console.error(
        `[Space Discovery] Failed to process context ${contextId}:`,
        error
      )
    }
  }

  console.log(
    `[Space Discovery] Discovered ${allDiscoveredResonances.length} resonance suggestions in space ${spaceId}`
  )

  return allDiscoveredResonances
}

// ---------------------------------------------------------------------------
// Cross-context discovery (GOAL-293)
//
// The functions above only ever match a candidate pulse WITHIN the same
// FieldContext as the source. Robert's goal is for an upload to surface
// connections across a member's whole world — every FieldContext they can
// access. The helpers below take a source pulse and vector-match it against
// pulses in the member's OTHER accessible contexts, then create pending
// cross-context `ResonanceSuggestion`s anchored to the uploader's Space and
// context (so they surface in the existing per-Space suggestions listing).
//
// Space authorization is enforced by construction: `accessibleContextIds` is
// the caller's viewable-context set (see getAccessibleFieldContexts), and every
// query below intersects candidate pulses with that set — a pulse in a Space
// the member cannot view is never read, and a suggestion is never written into
// one. See kb/06-adr.md (data sovereignty).
// ---------------------------------------------------------------------------

/**
 * Vector-search for pulses similar to `pulseId` that live in one of the
 * member's OTHER accessible contexts. Restricted to `accessibleContextIds`
 * (authorization) and excluding `excludeContextId` (the upload's own context —
 * that pairing is handled by the within-context pass). Only embedded pulses are
 * reachable via the vector index, so un-embedded candidates are silently — and
 * correctly — skipped.
 */
async function findSimilarPulsesAcrossContexts(
  pulseId: string,
  accessibleContextIds: string[],
  excludeContextId: string,
  threshold: number = 0.7,
  limit: number = 10
): Promise<Array<{ id: string; content: string; similarity: number }>> {
  if (accessibleContextIds.length === 0) return []

  const graph = await initGraph()

  const pulseResult = await graph.query<{ embedding: number[] }>(
    `MATCH (p:FieldPulse {id: $pulseId}) RETURN p.embedding as embedding`,
    { pulseId }
  )
  if (
    !Array.isArray(pulseResult) ||
    pulseResult.length === 0 ||
    !pulseResult[0].embedding
  ) {
    return []
  }
  const embedding = pulseResult[0].embedding

  const similarResult = await graph.query<{
    pulse: { id: string; content: string }
    similarity: number
  }>(
    `
    CALL db.index.vector.queryNodes('pulseContentVectorIndex', $limit * 3, $embedding)
    YIELD node, score
    WITH node, score
    WHERE node.id <> $pulseId AND score >= $threshold
      // Node qualifies iff it is reachable through at least one context the
      // member can view that is NOT the upload's own context. EXISTS avoids
      // row-multiplication when a pulse lives in several contexts, and gates
      // out any pulse in a Space the member cannot access.
      AND EXISTS {
        MATCH (ctx:FieldContext)-[:HAS_PULSE]->(node)
        WHERE ctx.id IN $accessibleContextIds AND ctx.id <> $excludeContextId
      }
    RETURN {id: node.id, content: node.content} as pulse, score as similarity
    ORDER BY similarity DESC
    LIMIT $limit
    `,
    {
      pulseId,
      accessibleContextIds,
      excludeContextId,
      threshold,
      limit: neo4j.int(limit),
      embedding,
    }
  )

  if (!Array.isArray(similarResult) || similarResult.length === 0) return []

  return similarResult.map((r) => ({
    id: r.pulse.id,
    content: r.pulse.content,
    similarity: r.similarity,
  }))
}

/**
 * Create ONE cross-context `ResonanceSuggestion` between `sourcePulseId` (which
 * MUST live in `sourceContextId`) and `targetPulseId` (which lives in a
 * different, member-accessible context). The suggestion is anchored to the
 * uploader's Space + context via HAS_SUGGESTION so the existing per-Space
 * listing (`GET /api/resonance/suggestions?spaceId=…`) surfaces it for review.
 *
 * Deduped symmetrically against any existing ResonanceSuggestion/ResonanceLink
 * that already joins the pair (either direction) — repeated uploads never pile
 * up duplicates. Returns the new suggestion id, or null when the pair was
 * already proposed/confirmed (dedup skip) or the anchors could not be matched.
 */
async function createCrossContextResonanceSuggestion(params: {
  sourceSpaceId: string
  sourceContextId: string
  sourcePulseId: string
  targetPulseId: string
  accessibleContextIds: string[]
  label: string
  description: string
  confidence: number
  evidence: string
}): Promise<string | null> {
  const graph = await initGraph()

  const result = await graph.query<{ suggestionId: string }>(
    `
    MATCH (space:Space {id: $sourceSpaceId})
    MATCH (context:FieldContext {id: $sourceContextId})
    MATCH (space)-[:HAS_CONTEXT]->(context)
    MATCH (context)-[:HAS_PULSE]->(source:FieldPulse {id: $sourcePulseId})
    MATCH (target:FieldPulse {id: $targetPulseId})
    WHERE source <> target
      // Structural authorization (defense in depth): the target MUST live in a
      // context the caller can access. Callers already filter candidates to the
      // accessible set, but enforcing it in the write means a mis-call can never
      // link an out-of-scope pulse.
      AND EXISTS {
        MATCH (a:FieldContext)-[:HAS_PULSE]->(target)
        WHERE a.id IN $accessibleContextIds
      }

    // Symmetric duplicate check across BOTH suggestion and link nodes.
    OPTIONAL MATCH (source)<-[:SOURCE|TARGET]-(existing)-[:SOURCE|TARGET]->(target)
    WHERE existing:ResonanceSuggestion OR existing:ResonanceLink
    WITH space, context, source, target, existing
    WHERE existing IS NULL

    CREATE (suggestion:ResonanceSuggestion {
      id: 'rs_' + randomUUID(),
      label: $label,
      description: $description,
      confidence: $confidence,
      evidence: $evidence,
      status: 'pending',
      crossContext: true,
      createdAt: datetime()
    })
    CREATE (space)-[:HAS_SUGGESTION]->(suggestion)
    CREATE (context)-[:HAS_SUGGESTION]->(suggestion)
    CREATE (suggestion)-[:SOURCE]->(source)
    CREATE (suggestion)-[:TARGET]->(target)
    RETURN suggestion.id as suggestionId
    `,
    { ...params }
  )

  return Array.isArray(result) && result.length > 0
    ? result[0].suggestionId
    : null
}

/**
 * Discover cross-context resonances for a single source pulse: vector-match it
 * against the member's other accessible contexts, run the same LLM pattern
 * analysis used within-context, and write a pending cross-context suggestion
 * for every returned connection that is incident to the source pulse.
 *
 * Only connections that touch `sourcePulseId` are created — target↔target pairs
 * the LLM may surface between two OTHER contexts are out of scope for THIS
 * upload and are dropped.
 */
export async function discoverCrossContextResonancesForPulse(
  sourcePulseId: string,
  sourceSpaceId: string,
  sourceContextId: string,
  accessibleContextIds: string[]
): Promise<DiscoveredResonance[]> {
  const graph = await initGraph()

  const sourceRows = await graph.query<{
    pulse: { id: string; content: string; createdAt: string }
  }>(
    `MATCH (p:FieldPulse {id: $sourcePulseId})
     RETURN {id: p.id, content: p.content, createdAt: toString(p.createdAt)} as pulse`,
    { sourcePulseId }
  )
  if (!Array.isArray(sourceRows) || sourceRows.length === 0) return []
  const sourcePulse = sourceRows[0].pulse

  const similar = await findSimilarPulsesAcrossContexts(
    sourcePulseId,
    accessibleContextIds,
    sourceContextId
  )
  if (similar.length === 0) return []

  const candidateIds = new Set(similar.map((s) => s.id))
  const pattern = await analyzeResonancePattern([sourcePulse, ...similar])
  if (!pattern) return []

  const created: DiscoveredResonance[] = []
  for (const connection of pattern.pulseConnections) {
    // Normalize so the created suggestion always has the upload pulse as SOURCE
    // and a valid cross-context candidate as TARGET. Skip connections that do
    // not involve the source pulse, or whose other end is not one of the
    // cross-context candidates (guards against the LLM inventing an id).
    let targetId: string | null = null
    if (connection.sourcePulseId === sourcePulseId) {
      targetId = connection.targetPulseId
    } else if (connection.targetPulseId === sourcePulseId) {
      targetId = connection.sourcePulseId
    }
    if (!targetId || !candidateIds.has(targetId)) continue

    let enrichedEvidence = connection.evidence
    try {
      const graphFacts = await collectPulsePairEvidence(sourcePulseId, targetId)
      enrichedEvidence = composeEvidenceString(graphFacts, connection.evidence)
    } catch (evidenceError) {
      console.warn(
        '[CrossContextResonance] Evidence enrichment failed; using LLM-only evidence:',
        evidenceError instanceof Error ? evidenceError.message : evidenceError
      )
    }

    const suggestionId = await createCrossContextResonanceSuggestion({
      sourceSpaceId,
      sourceContextId,
      sourcePulseId,
      targetPulseId: targetId,
      accessibleContextIds,
      label: pattern.label,
      description: pattern.description,
      confidence: connection.confidence,
      evidence: enrichedEvidence,
    })

    if (suggestionId) {
      created.push({
        linkId: suggestionId,
        contextId: sourceContextId,
        label: pattern.label,
        description: pattern.description,
        sourcePulseId,
        targetPulseId: targetId,
        confidence: connection.confidence,
        evidence: enrichedEvidence,
      })
    }
  }

  return created
}

/**
 * Cross-context discovery scoped to one upload's context: take the recent
 * (embedded) pulses in `sourceContextId` and, for each, discover resonances
 * against the member's OTHER accessible contexts. Bounded to keep a single
 * on-upload run inside the ingest route's duration ceiling.
 *
 * AUTHORIZATION: `accessibleContextIds` MUST already be the uploader's viewable
 * set (getAccessibleFieldContexts) — this function trusts it and never widens
 * scope beyond it.
 */
export async function discoverCrossContextResonancesForContext(params: {
  sourceSpaceId: string
  sourceContextId: string
  accessibleContextIds: string[]
  maxSourcePulses?: number
}): Promise<DiscoveredResonance[]> {
  const {
    sourceSpaceId,
    sourceContextId,
    accessibleContextIds,
    // Bounded to keep the on-upload after() run (embeddings + within-context
    // LLM analysis + this cross-context LLM analysis) inside the ingest route's
    // maxDuration ceiling. Anything beyond this is picked up on the next upload
    // or by the daily cron.
    maxSourcePulses = 15,
  } = params

  // Nothing to compare against beyond the upload's own context.
  const otherContexts = accessibleContextIds.filter(
    (id) => id !== sourceContextId
  )
  if (otherContexts.length === 0) return []

  const graph = await initGraph()

  const sourcePulseRows = await graph.query<{ id: string }>(
    `MATCH (:FieldContext {id: $sourceContextId})-[:HAS_PULSE]->(p:FieldPulse)
     WHERE p.embedding IS NOT NULL
     RETURN p.id AS id
     ORDER BY p.createdAt DESC
     LIMIT $limit`,
    { sourceContextId, limit: neo4j.int(maxSourcePulses) }
  )
  const sourcePulseIds = Array.isArray(sourcePulseRows)
    ? sourcePulseRows.map((r) => r.id)
    : []
  if (sourcePulseIds.length === 0) return []

  const discovered: DiscoveredResonance[] = []
  for (const sourcePulseId of sourcePulseIds) {
    try {
      const resonances = await discoverCrossContextResonancesForPulse(
        sourcePulseId,
        sourceSpaceId,
        sourceContextId,
        accessibleContextIds
      )
      discovered.push(...resonances)
    } catch (error) {
      console.error(
        `[CrossContextResonance] Failed for pulse ${sourcePulseId}:`,
        error
      )
    }
  }

  return discovered
}
