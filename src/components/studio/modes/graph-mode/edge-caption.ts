/**
 * Edge captions for the Bloom canvas (GOAL-362).
 *
 * ## Why this exists
 *
 * Every relationship the canvas paints used to caption itself with a hardcoded
 * string — `'initiated'`, `'connected'`, `'weaves'` — regardless of what the
 * graph actually knew about the relationship. That threw away real information:
 * the ingest extractor is asked for a person's role "drawn ONLY from what the
 * document says" (`src/lib/ingest/extraction-schema.ts`), and a `CONNECTED_TO`
 * edge already carries the assistant's own `why`. Both reached the canvas and
 * were dropped one line before render, so a person who wrote a blog post read
 * as a generic `initiated` line.
 *
 * The resonance edge was the one exception — it captions from `r.label`
 * (`bloom-graph-builder.ts`). This module generalises that: a caption is the
 * edge's own words when it has any, and the relationship type's plain-English
 * name when it doesn't.
 *
 * ## Why the fallback is not the relationship type verbatim
 *
 * `INITIATED_BY` is the schema's word, not a reader's. The entity drawer has
 * always called that same edge "Authored" (`src/lib/person-related-pulses.ts`),
 * and having one surface say "Authored" while the other said "initiated" is
 * what made the relationship look absent from the canvas entirely. The canvas
 * and the legend now agree with the drawer's wording. The drawer itself still
 * hardcodes its own strings and does not read this table — worth unifying, but
 * it is a separate surface with separate copy.
 */

/**
 * Plain-English default per relationship type, used when an edge carries no
 * label of its own. Keyed by the Neo4j relationship type so the generic sweep
 * (which only knows `type(r)`) and the hand-built families resolve identically.
 */
export const DEFAULT_EDGE_CAPTIONS: Readonly<Record<string, string>> = {
  INITIATED_BY: 'Authored',
  CREATED_BY: 'Authored',
  MENTIONED_IN: 'Mentioned',
  CONNECTED_TO: 'Connected',
  EXTRACTED_FROM: 'Extracted from',
  WEAVES: 'Weaves',
  WOVEN_FOR: 'Woven for',
  HAS_SUBCONTEXT: 'Nested',
  HAS_CONTEXT: 'Has',
  HAS_PULSE: 'Has',
  HAS_PERSON: 'Has person',
  HAS_ORGANIZATION: 'Has organization',
  HAS_RESONANCE: 'Resonance',
  RESONATES_AS: 'Resonates as',
  OWNS: 'Owns',
  HAS_MEMBER: 'Member',
  IS_MEMBER: 'Member',
  UPLOADED_BY: 'Uploaded by',
  SOURCE: 'Source',
  TARGET: 'Target',
}

/**
 * Longest caption we will paint. NVL draws captions as small text directly on
 * the edge, so a free-text label ("Author of the article 'Distraction is the
 * New Poverty'") overruns its own line and collides with neighbouring edges on
 * a dense canvas. The full text still reaches the reader — the drawer shows it
 * untruncated — so clipping here costs nothing but noise.
 */
export const MAX_EDGE_CAPTION = 36

/**
 * Raw entity ids must never reach a caption (kb/07 Rule 1). An edge label is
 * model-authored text rendered verbatim to a member, so it gets the same
 * treatment as any other assistant output: a label that leaked an id is
 * dropped in favour of the type's default word rather than shown.
 *
 * Matches the project's prefixed ids (`pulse_`, `person_`, `document_`, `me_`,
 * `ws_`, `ctx_`) and bare UUIDs.
 */
const RAW_ID = /\b([a-z]+_[0-9a-f-]{8,}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\b/i

/**
 * The caption for one edge.
 *
 * @param label        the edge's own words (`r.label`, `r.why`, a resonance's
 *                     `label`) — null/blank when the edge has none
 * @param relationship the Neo4j relationship type, used to pick the default
 * @returns a non-empty caption, UPPERCASED; never blank, so no edge renders
 *          unlabelled
 */
export function edgeCaption(
  label: string | null | undefined,
  relationship: string
): string {
  const fallback =
    DEFAULT_EDGE_CAPTIONS[relationship] ?? humanizeRelationship(relationship)
  const trimmed = (label ?? '').trim().replace(/\s+/g, ' ')
  if (!trimmed || RAW_ID.test(trimmed)) return shout(fallback)
  if (trimmed.length <= MAX_EDGE_CAPTION) return shout(trimmed)
  // Cut on a word boundary when one is near the limit, so the ellipsis doesn't
  // land mid-word for the common case.
  const clipped = trimmed.slice(0, MAX_EDGE_CAPTION)
  const lastSpace = clipped.lastIndexOf(' ')
  const stem = lastSpace > MAX_EDGE_CAPTION - 12 ? clipped.slice(0, lastSpace) : clipped
  return shout(`${stem.trimEnd()}…`)
}

/**
 * Canvas captions are uppercased.
 *
 * NVL paints a caption as small text lying along the edge, often at an angle
 * and over the background rather than a surface. Uppercase reads better at
 * that size and angle, and it visually separates the RELATIONSHIP labels from
 * the node captions (entity names, which stay as written) — so an edge label
 * is never mistaken for a node's name.
 *
 * Applied last, after truncation, so the length cap is measured on the text a
 * reader actually sees. The legend keeps title case: it is a list on a glass
 * panel, where uppercase would shout and wrap badly at 390px.
 */
function shout(caption: string): string {
  return caption.toUpperCase()
}

/**
 * Last-resort default for a relationship type the table doesn't name — which
 * is exactly what the generic sweep will hand us the first time someone adds a
 * new edge type to `ALLOWED_RELATIONSHIPS`. `SOME_NEW_EDGE` → `Some new edge`,
 * which reads as a label rather than as a leaked schema constant.
 */
function humanizeRelationship(relationship: string): string {
  const words = relationship.trim().toLowerCase().split(/[_\s]+/).filter(Boolean)
  if (words.length === 0) return 'Related'
  return words[0].charAt(0).toUpperCase() + words[0].slice(1) + (words.length > 1 ? ' ' + words.slice(1).join(' ') : '')
}


/**
 * Relationship types whose STORED direction reads backwards when drawn.
 *
 * The graph stores authorship as `(FieldPulse)-[:INITIATED_BY]->(Person)` —
 * correct for the schema, because the edge name is a property of the pulse
 * ("this pulse was initiated by…"). But a canvas draws an arrow and a caption
 * together, and "pulse —Authored→ person" reads as the pulse authoring the
 * person. The relationship a reader is looking for runs the other way: the
 * person authored the pulse.
 *
 * So these types are drawn reversed. This is a rendering decision, not a data
 * one — nothing about the stored edge changes, and the sweep still reports the
 * true `type(r)`. The alternative was captioning them "Authored by" and
 * keeping the stored arrow, which is equally truthful but leaves the canvas
 * reading backwards for the far more common question ("what did this person
 * make?").
 *
 * NOT in this set, deliberately:
 *  - `MENTIONED_IN` is stored `(Person)-[:MENTIONED_IN]->(FieldPulse)`, which
 *    already reads correctly: person —Mentioned in→ pulse.
 *  - `EXTRACTED_FROM` is stored `(Person)-[:EXTRACTED_FROM]->(pulse)` and also
 *    reads correctly. Bloom drew it document→person, which was simply wrong
 *    against the graph — fixed at the source in `document-provenance-layer.ts`
 *    rather than papered over here.
 */
export const REVERSED_ON_CANVAS: ReadonlySet<string> = new Set([
  'INITIATED_BY',
  'CREATED_BY',
])

/**
 * Endpoints as they should be DRAWN, given how the edge is stored.
 * Callers pass the stored direction; reversed types come back swapped.
 */
export function edgeEndpoints(
  storedFrom: string,
  storedTo: string,
  relationship: string
): { from: string; to: string } {
  return REVERSED_ON_CANVAS.has(relationship)
    ? { from: storedTo, to: storedFrom }
    : { from: storedFrom, to: storedTo }
}
