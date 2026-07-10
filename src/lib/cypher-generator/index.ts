/**
 * Orchestrator for the AI-driven Cypher → Bloom flow.
 *
 *   generate → validate → execute → return NVL payload
 *
 * On validation failure, the validator's reason is fed back to the
 * generator as a correction hint and one retry is attempted. After two
 * total attempts the orchestrator gives up and returns a friendly,
 * name-only summary suitable for the chat surface (no ids, no raw
 * Cypher — per kb/07-ai-assistant-ux.md Rule 1).
 */

import { driver } from '@/lib/neo4j/driver'
import { generateCypher, type GeneratorInput } from './generate'
import { validateCypher } from './validate'
import { executeForBloom, type ExecutionResult } from './execute'
import type { BloomQueryResult } from './types'

export type { BloomQueryResult, NVLNode, NVLRelationship } from './types'

// Exported ONLY for unit tests (covis-detection.test.ts) — the co-visualization
// fallback's pure, DB-free logic. Not part of the module's runtime API.
export {
  anchorLabelForType,
  anchorLabelForId,
  referencedCanvasEntities,
  harvestIntentEntityIds,
  isSelfReferential,
  formatNameList,
}

export interface RunForBloomArgs {
  intent: string
  userId: string
  /**
   * The authenticated user's resolved display name (first name is enough).
   * The chat model often rewrites a first-person request ("my connection to
   * X and Y") into a third-person intent that NAMES the user instead
   * ("connections among John-Dag Addy, …") — dropping the first-person
   * pronoun the covis rescue keyed on. Matching this name in the intent lets
   * the rescue anchor the user's REAL id even when the model embedded a wrong
   * one for them. Null when the name could not be resolved.
   */
  userName?: string | null
  activeSpaceId: string | null
  activeSpaceName: string | null
  activeSpaceType: 'MeSpace' | 'WeSpace' | null
  activeFieldContextId: string | null
  activeFieldContextTitle: string | null
  focalEntity: { type: string; id: string; label?: string | null } | null
  /**
   * Entities already rendered on the canvas. Forwarded into the
   * generator prompt so the LLM can prefer an id from this list over
   * a keyword match — fixes the "show me JD's Tech Lab" failure where
   * the WeSpace is on screen but the generator's `CONTAINS toLower(…)`
   * misses on apostrophe / case mismatches.
   */
  canvasVisibleEntities?: Array<{
    id: string
    name: string
    type: string
    source: string
  }>
}

const MAX_ATTEMPTS = 2

/** Cap on how many entities a single co-visualization fallback anchors. */
const MAX_COVIS_ANCHORS = 4

/** A first-person reference in the intent ("my connection to X and Y") means
 * the current user is one of the entities to co-visualize, even when neither
 * the generator nor the intent ever named them. */
const FIRST_PERSON_RE = /\b(?:i|me|my|mine|myself)\b/i

/** A canvas entity the fallback may anchor: id + display name + surface type. */
type CanvasRef = { id: string; name: string; type: string }

/**
 * Map a canvas entity's GoalPost-level `type` (as published by the view
 * layer — see visible-entities-context.tsx) to the base label to anchor on.
 * The base-label collapse (MeSpace/WeSpace → Space, the pulse subtypes →
 * FieldPulse, User/PersonPulse → Person) matches how the `REQUIRE n.id IS
 * UNIQUE` constraints are declared per BASE label in scripts/init-db.js, so
 * `(:Label {id: $p})` seeks the id index rather than scanning the label.
 * Returns null for surface-only kinds (e.g. an overlay node, whose concrete
 * label is flattened away upstream) — the caller then tries the id prefix.
 *
 * Caveat: a label is only a fast SEEK where the id constraint was actually
 * applied to the target DB. `Organization`'s constraint exists in init-db.js
 * but was not backfilled on some migrated DBs, so an Organization anchor may
 * be a label scan — still far cheaper than the bare all-nodes scan the null
 * path falls back to.
 */
function anchorLabelForType(type: string): string | null {
  switch (type) {
    case 'MeSpace':
    case 'WeSpace':
    case 'Space':
      return 'Space'
    case 'FieldContext':
      return 'FieldContext'
    case 'GoalPulse':
    case 'ResourcePulse':
    case 'StoryPulse':
    case 'CarePulse':
    case 'CoreValuePulse':
    case 'FieldPulse':
      return 'FieldPulse'
    case 'User':
    case 'PersonPulse':
    case 'Person':
      return 'Person'
    case 'Community':
      return 'Community'
    case 'Organization':
      return 'Organization'
    case 'ResonanceLink':
      return 'ResonanceLink'
    default:
      return null
  }
}

/**
 * Best-effort base label from an id PREFIX, used when the canvas `type` is
 * unknown — notably `OverlayNode`, which every entity becomes once an overlay
 * is on screen (i.e. a FOLLOW-UP co-visualization request). GoalPost ids are
 * type-prefixed (`pulse_…`, `mespace_…`), so this recovers an index seek for
 * the common overlay case. A bare UUID (some migrated Persons) stays null and
 * anchors label-less — correct but a full scan, bounded by MAX_COVIS_ANCHORS.
 */
function anchorLabelForId(id: string): string | null {
  if (id.startsWith('pulse_')) return 'FieldPulse'
  if (id.startsWith('person_')) return 'Person'
  if (
    id.startsWith('mespace_') ||
    id.startsWith('wespace_') ||
    id.startsWith('me_') ||
    id.startsWith('ws_') ||
    id.startsWith('space_')
  )
    return 'Space'
  if (id.startsWith('context_') || id.startsWith('ctx_')) return 'FieldContext'
  if (id.startsWith('community_')) return 'Community'
  if (id.startsWith('organization_') || id.startsWith('org_'))
    return 'Organization'
  if (id.startsWith('resonance_link_') || id.startsWith('rl_'))
    return 'ResonanceLink'
  return null
}

/** Escape a user/DB string for safe use as a RegExp literal. */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * True when `name` appears in `intent` as a WHOLE word/phrase (not flanked by
 * letters/digits). Word-boundary matching avoids a short or prefix name
 * matching inside a larger word — "Ash" inside "Ashong", "Ed" inside "edited".
 */
function nameAppearsInIntent(intent: string, name: string): boolean {
  try {
    const re = new RegExp(
      `(?<![\\p{L}\\p{N}])${escapeRegExp(name)}(?![\\p{L}\\p{N}])`,
      'iu'
    )
    return re.test(intent)
  } catch {
    // Defensive: any RegExp construction failure degrades to a plain check.
    return intent.toLowerCase().includes(name.toLowerCase())
  }
}

/**
 * Which canvas-visible entities the intent actually refers to — by exact id
 * substring (the chat model usually embeds `[id=…]` in the intent) OR by a
 * whole-word name match. Deterministic and server-side: the ids come from the
 * forwarded canvas snapshot, never parsed out of untrusted intent text, so
 * they are safe to anchor on.
 */
function referencedCanvasEntities(
  intent: string,
  canvas: Array<{ id: string; name: string; type: string; source?: string }>
): CanvasRef[] {
  const seen = new Set<string>()
  const out: CanvasRef[] = []
  for (const e of canvas) {
    if (!e.id || seen.has(e.id)) continue
    const name = (e.name ?? '').trim()
    const idHit = intent.includes(e.id)
    // Whole-word match, and only for names long enough to be distinctive.
    const nameHit = name.length >= 2 && nameAppearsInIntent(intent, name)
    if (idHit || nameHit) {
      seen.add(e.id)
      out.push({ id: e.id, name, type: e.type })
    }
  }
  return out
}

/**
 * GoalPost ids are type-prefixed (`pulse_…`, `person_…`, `mespace_…`). The
 * chat model embeds each named entity's id in the query_for_bloom intent as
 * `Name [id=<id>]` — it echoes the exact format it is shown in the SESSION
 * CONTEXT canvas block (`session-context-prompt.ts`, the `[id=${entity.id}]`
 * line). Crucially it reproduces those markers even when THIS turn's
 * `canvasVisibleEntities` snapshot is empty/stale, because it learned the ids
 * earlier in the conversation — which is exactly the case this harvest exists
 * to rescue. (If session-context-prompt.ts ever drops the `[id=…]` rendering,
 * this recovery weakens — keep the two in sync.) Longest prefixes first so
 * `resonance_link_…`/`mespace_…` aren't shadowed by `rl`/`me`.
 */
const INTENT_ID_RE =
  /\b(?:resonance_link|organization|community|context|wespace|mespace|person|pulse|space|ctx|org|rl|me|ws)_[A-Za-z0-9-]{6,}/gi

/**
 * Harvest anchorable GoalPost ids directly from the intent text. Deterministic
 * and safe to anchor on: every id is bound as a Cypher PARAMETER (never
 * inlined) and `executeForBloom` re-gates every returned node through the
 * Space authorization post-filter, so a stale, wrong, or unauthorised id
 * simply yields no node — it can never surface data the user may not see. Only
 * ids whose prefix maps to a known base label are kept.
 */
function harvestIntentEntityIds(intent: string): CanvasRef[] {
  const seen = new Set<string>()
  const out: CanvasRef[] = []
  for (const match of intent.matchAll(INTENT_ID_RE)) {
    const id = match[0]
    if (seen.has(id)) continue
    // Only harvest ids we can map to a base label for an index seek. Type is
    // left blank so tryCovisualizationFallback derives the label from the id
    // prefix via anchorLabelForId.
    if (anchorLabelForId(id) === null) continue
    seen.add(id)
    out.push({ id, name: '', type: '' })
  }
  return out
}

/**
 * True when the intent is self-referential — the current user is one of the
 * entities to co-visualize, so their real id should be anchored. Two signals:
 *   - a first-person pronoun ("show MY connection to X and Y"), OR
 *   - the model rewrote the request in the third person and NAMED the user
 *     (matched against their resolved display name, whole-word) — the reported
 *     failure, where the model wrote "connections among John-Dag Addy, …" with
 *     a WRONG id for the user, so only the name recovers them.
 *
 * The name branch requires a reasonably distinctive name (≥ 3 chars) so a very
 * short or common-word first name doesn't match incidental prose. A residual
 * false positive is harmless: it injects only the AUTHENTICATED user's own
 * node, and only on the already-empty-result fallback path.
 */
function isSelfReferential(intent: string, userName?: string | null): boolean {
  if (FIRST_PERSON_RE.test(intent)) return true
  const name = (userName ?? '').trim()
  if (name.length < 3) return false
  return nameAppearsInIntent(intent, name)
}

/** "A" / "A and B" / "A, B and C" from a list of names. */
function formatNameList(names: string[]): string {
  const clean = names.map((n) => n.trim()).filter(Boolean)
  if (clean.length === 0) return 'the entities you named'
  if (clean.length === 1) return clean[0]
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`
  return `${clean.slice(0, -1).join(', ')} and ${clean[clean.length - 1]}`
}

/**
 * Deterministic co-visualization rescue for "show my connection to X and
 * Y" / "connections among X, Y and Z" style requests.
 *
 * The LLM generator is SUPPOSED to emit the multi-entity OPTIONAL-anchor
 * shape (see generate.ts) that returns each named entity even when nothing
 * connects them. When it doesn't — it built a query that required a path,
 * or otherwise returned zero nodes — the orchestrator would answer
 * `found: false`, the canvas would render nothing, and the chat model,
 * denied the "here they are, unconnected" result, tends to INVENT a
 * "likely reading" of how they might connect (the exact bug the user
 * reported: "if there is no connection, just show the nodes without
 * connections and say that").
 *
 * So when the request names ≥2 canvas-visible entities (whose ids we
 * already hold) and the generated query came back empty, we anchor each
 * entity by id in its own OPTIONAL MATCH and return the nodes. `executeForBloom`
 * still applies the Space authorization post-filter (fail-closed) AND draws
 * any real direct edges between the kept nodes via its fill-in step — so a
 * genuine connection surfaces, and its absence renders as isolated nodes.
 * Returns null when the fallback doesn't apply or still finds nothing.
 */
async function tryCovisualizationFallback(
  args: RunForBloomArgs,
  referenced: CanvasRef[]
): Promise<BloomQueryResult | null> {
  if (referenced.length < 2) return null
  const anchors = referenced.slice(0, MAX_COVIS_ANCHORS)

  const params: Record<string, unknown> = {}
  const matchLines: string[] = []
  const returnVars: string[] = []
  anchors.forEach((e, i) => {
    const v = `n${i}`
    const p = `a${i}`
    // Ids are bound as parameters (never inlined) — no injection surface
    // even though the id list originates client-side. Prefer the type-derived
    // label; fall back to the id prefix so an OverlayNode still index-seeks.
    params[p] = e.id
    const label = anchorLabelForType(e.type) ?? anchorLabelForId(e.id)
    matchLines.push(
      label
        ? `OPTIONAL MATCH (${v}:${label} {id: $${p}})`
        : `OPTIONAL MATCH (${v} {id: $${p}})`
    )
    returnVars.push(v)
  })

  // The `MATCH (user:Person {id: $userId})` is a validity guard / driving row
  // (a bad user id yields zero rows ⇒ empty canvas, fail closed); `user` is not
  // returned. Each anchor rides its OWN OPTIONAL MATCH so one stale id yields a
  // null column instead of dropping the whole row.
  const cypher = [
    'MATCH (user:Person {id: $userId})',
    ...matchLines,
    `RETURN ${returnVars.join(', ')}`,
    'LIMIT 1',
  ].join('\n')

  let execResult: ExecutionResult
  try {
    execResult = await executeForBloom({ cypher, userId: args.userId, params })
  } catch (error) {
    console.warn(
      '[cypher-generator] covisualization fallback failed:',
      error instanceof Error ? error.message : error
    )
    return null
  }
  if (!execResult.ok || execResult.nodes.length === 0) return null

  // Name what ACTUALLY rendered (post auth-filter), not every anchor we asked
  // for — so the summary can never claim a node the canvas doesn't show, which
  // would re-invite the exact speculation this fix removes.
  const nameList = formatNameList(execResult.nodes.map((n) => n.caption ?? ''))
  const summary =
    execResult.relationships.length === 0
      ? `Placed ${nameList} on the canvas. No direct connection between them surfaced — they appear here without connecting edges.`
      : `Placed ${nameList} on the canvas, along with the direct connections found between them.`

  return {
    found: true,
    summary,
    nodes: execResult.nodes,
    relationships: execResult.relationships,
  }
}

export async function generateAndRunForBloom(
  args: RunForBloomArgs
): Promise<BloomQueryResult> {
  const referenced = referencedCanvasEntities(
    args.intent,
    args.canvasVisibleEntities ?? []
  )
  // Also anchor any GoalPost ids the model embedded straight in the intent
  // (e.g. `Name [id=pulse_…]`). This is the load-bearing recovery for the
  // reported failure: the chat model knew the entities' ids from earlier in
  // the conversation but `canvasVisibleEntities` arrived empty/stale, so the
  // canvas match above found nothing and the rescue never fired. Dedup by id —
  // a canvas ref (which carries a proper type) always wins over a bare intent
  // id (whose label is derived from its prefix).
  for (const ref of harvestIntentEntityIds(args.intent)) {
    if (!referenced.some((e) => e.id === ref.id)) referenced.push(ref)
  }
  // "show my connection to X and Y": the current user is an implicit entity
  // the generator/intent may never name, so their self↔X / self↔Y edges would
  // otherwise be missing. Add them when the request is self-referential (see
  // isSelfReferential) and they aren't already referenced (deduped by id). The
  // name-match branch also rescues the case where the model embedded a WRONG
  // id for the user, since we anchor their real id here, not the intent's.
  if (
    isSelfReferential(args.intent, args.userName) &&
    !referenced.some((e) => e.id === args.userId)
  ) {
    referenced.push({ id: args.userId, name: 'you', type: 'User' })
  }
  let correction: string | null = null
  let lastReason: string | null = null

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const input: GeneratorInput = {
      intent: args.intent,
      activeSpaceId: args.activeSpaceId,
      activeSpaceName: args.activeSpaceName,
      activeSpaceType: args.activeSpaceType,
      activeFieldContextId: args.activeFieldContextId,
      activeFieldContextTitle: args.activeFieldContextTitle,
      focalEntity: args.focalEntity,
      canvasVisibleEntities: args.canvasVisibleEntities ?? [],
      correction,
      userId: args.userId,
    }

    let generated
    try {
      generated = await generateCypher(input)
    } catch (error) {
      lastReason = error instanceof Error ? error.message : 'Generation failed.'
      break
    }

    console.log('[cypher-generator] Attempt', attempt, {
      rationale: generated.rationale,
      cypher: generated.cypher,
    })

    const session = driver.session()
    let validation
    try {
      validation = await validateCypher(generated.cypher, session)
    } finally {
      await session.close()
    }

    if (!validation.ok) {
      console.warn('[cypher-generator] Validation failed:', validation.reason)
      lastReason = validation.reason
      correction = validation.reason
      continue
    }

    const execResult = await executeForBloom({
      cypher: generated.cypher,
      userId: args.userId,
    })

    if (!execResult.ok) {
      console.warn('[cypher-generator] Execution failed:', execResult.reason)
      lastReason = execResult.reason
      correction = `Execution failed: ${execResult.reason}`
      continue
    }

    if (execResult.nodes.length === 0) {
      // The generated query returned nothing. If the request names ≥2
      // canvas-visible entities, this is a co-visualization the generator
      // fumbled — rescue it deterministically so the user sees the nodes
      // (connected or not) instead of an empty canvas + speculation.
      const fallback = await tryCovisualizationFallback(args, referenced)
      if (fallback) return fallback
      return {
        found: false,
        summary:
          'I could not find any matching graph data you have access to for that request.',
        nodes: [],
        relationships: [],
      }
    }

    return {
      found: true,
      summary: generated.rationale,
      nodes: execResult.nodes,
      relationships: execResult.relationships,
    }
  }

  // Both generation attempts failed (generation error / validation /
  // execution). Before giving up, try the same deterministic co-visualization
  // rescue — a multi-entity request should still land its named entities on
  // the canvas even when the LLM never produced a runnable query.
  const fallback = await tryCovisualizationFallback(args, referenced)
  if (fallback) return fallback

  return {
    found: false,
    summary: lastReason
      ? `I was not able to build a safe graph query for that request (${lastReason}).`
      : 'I was not able to build a safe graph query for that request.',
    nodes: [],
    relationships: [],
  }
}
