import type { Relationship } from '@neo4j-nvl/base'
import type { BloomPalette } from './bloom-palette'
import { edgeCaption, edgeEndpoints } from './edge-caption'

/**
 * The generic edge layer (GOAL-362).
 *
 * ## Why this exists
 *
 * `buildBloomRelationships` hand-enumerates its edges: one branch per family,
 * per scope, each with a literal caption and a fixed palette entry. That makes
 * every relationship type the canvas can draw a code decision — so a type
 * nobody wrote a branch for is invisible no matter how much of it the graph
 * holds. `MENTIONED_IN` is the standing example: 237 of them in a single
 * field, never once drawn.
 *
 * This layer is the general answer. The server returns every relationship
 * among a context's own entities (`FieldContext.edges`), typed by `type(r)`
 * and carrying whatever label its writer gave it, and this turns them into NVL
 * relationships with no per-type code beyond a colour lookup — which itself
 * falls back, so an unrecognised type still paints and still gets a legend row.
 *
 * ## Why it LAYERS rather than replaces
 *
 * The hand-built families stay exactly as they are and this is merged on top,
 * deduped. Those branches encode real knowledge the sweep does not have — the
 * weave hub's spokes, the space-scope structural edges, the root "You" hub —
 * and reproducing all of it correctly in one step would risk silently changing
 * what is on screen. Layering means nothing that renders today can regress;
 * the branches can be retired one at a time, once the sweep has proven itself
 * against each.
 */

/**
 * Relationship types with no meaningful direction. `CONNECTED_TO` is stored
 * once, in whichever order it happened to be created, and both the graph and
 * the UI treat it as mutual — so its key normalises on the sorted id pair.
 * Without this the hand-built family (which orders endpoints by the `people`
 * array) and the sweep (which reports the stored order) disagree about roughly
 * half of all connections, and each one draws twice.
 */
const UNDIRECTED: ReadonlySet<string> = new Set(['CONNECTED_TO'])

/**
 * Identity of an edge for de-duplication, independent of its caption.
 *
 * Keyed on the relationship TYPE, never the rendered text. Two layers can
 * describe one relationship in different words — the hand-built author family
 * says "AUTHORED" because it reads `initiatedBy { id }`, which carries no edge
 * properties, while the sweep says "INTERVIEWEE" because it reads `r.label`.
 * A caption-keyed dedupe treats those as different edges and draws both, which
 * is precisely the duplicate this ticket exists to remove.
 */
export function edgeKey(from: string, to: string, type: string): string {
  const [a, b] = UNDIRECTED.has(type) ? [from, to].sort() : [from, to]
  return `${a}|${type}|${b}`
}

/** One row of `FieldContext.edges`. */
export interface SweptEdge {
  type: string
  fromId: string
  toId: string
  label?: string | null
}

/**
 * Palette entry per relationship type. `WEAVES` / `WOVEN_FOR` are absent on
 * purpose: they originate at `:PromiseWeave`, which the sweep's scope never
 * reaches, so a branch for them would be unreachable.
 *
 * Anything absent paints `otherEdge`,
 * which has its own legend row — so a relationship type added to the graph
 * tomorrow arrives on the canvas decodable and switchable, with no change here.
 */
function colorFor(type: string, palette: BloomPalette): string {
  switch (type) {
    case 'INITIATED_BY':
    case 'CREATED_BY':
      return palette.initiatedEdge
    case 'MENTIONED_IN':
      return palette.mentionedEdge
    case 'CONNECTED_TO':
      return palette.connectedEdge
    case 'EXTRACTED_FROM':
      return palette.extractedEdge
    default:
      return palette.otherEdge
  }
}

/**
 * The keys the sweep will draw, for the hand-built families to defer to.
 *
 * The sweep goes FIRST and wins, which inverts the obvious layering — and it
 * is the right way round: for an edge both layers know about, the sweep's
 * version carries the writer's own label while the hand-built one can only
 * produce the generic word. The families still cover what the sweep's scope
 * cannot reach (notably an author who belongs to the parent Space but carries
 * no `HAS_PERSON` on this context), so neither layer alone is sufficient.
 */
export function sweptEdgeKeys(
  edges: readonly SweptEdge[] | null | undefined,
  visibleIds: ReadonlySet<string>
): ReadonlySet<string> {
  const keys = new Set<string>()
  for (const edge of edges ?? []) {
    if (!edge?.type || !edge.fromId || !edge.toId) continue
    const { from, to } = edgeEndpoints(edge.fromId, edge.toId, edge.type)
    if (from === to) continue
    if (!visibleIds.has(from) || !visibleIds.has(to)) continue
    keys.add(edgeKey(from, to, edge.type))
  }
  return keys
}

/**
 * Build the sweep's NVL relationships.
 *
 * @param edges       rows from `FieldContext.edges`
 * @param visibleIds  ids actually rendered as nodes — an edge to anything
 *                    off-canvas is dropped, the same dangling-edge guard every
 *                    hand-built family applies
 * @param existing    `edgeKey` values already emitted by another layer, so one
 *                    relationship is never drawn twice
 */
export function buildSweptRelationships(params: {
  edges: readonly SweptEdge[] | null | undefined
  visibleIds: ReadonlySet<string>
  existing: ReadonlySet<string>
  palette: BloomPalette
}): Relationship[] {
  const { edges, visibleIds, existing, palette } = params
  if (!edges || edges.length === 0) return []

  const out: Relationship[] = []
  const seen = new Set<string>(existing)

  for (const edge of edges) {
    if (!edge?.type || !edge.fromId || !edge.toId) continue
    // Drawn direction, which for authorship is the reverse of how it is
    // stored — see REVERSED_ON_CANVAS.
    const { from, to } = edgeEndpoints(edge.fromId, edge.toId, edge.type)
    if (!visibleIds.has(from) || !visibleIds.has(to)) continue
    // A self-loop renders as an unreadable blob and says nothing; the graph
    // has produced them (a person extracted from a document that became their
    // own pulse), so guard rather than trust.
    if (from === to) continue

    const key = edgeKey(from, to, edge.type)
    if (seen.has(key)) continue
    seen.add(key)

    out.push({
      // Id derived from the same key that deduped it, so two rows can never
      // collapse to one line yet hand NVL two relationships with one id.
      id: `swept-${key}`,
      from,
      to,
      caption: edgeCaption(edge.label, edge.type),
      color: colorFor(edge.type, palette),
      width: 1.5,
    } as Relationship)
  }
  return out
}
