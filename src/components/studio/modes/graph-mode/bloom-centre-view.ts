import type { BloomCanvas } from './bloom-type-registry'

/**
 * Centre on a node (GOAL-383) — the pure derivation behind Bloom's centred view.
 *
 * A centred view is the canvas narrowed to a growing set of EXPANDED nodes and
 * everything one hop from any of them. The member starts by centring on one
 * node (`expandedIds[0]`) and every neighbour they click is appended, so the
 * view only ever grows: nodes already on screen stay, new ones join them.
 *
 * It reads the canvas Bloom has already built — after the legend's type
 * filters — and never fetches (ADR-011). Two consequences worth knowing:
 *   - a neighbour is "one hop away on this canvas", so what can be reached is
 *     bounded by the scope Bloom is showing (root / space / field / overlay);
 *   - a type switched off in the legend is neither shown nor used as a bridge,
 *     because its edges were already dropped by `applyBloomTypeFilters`.
 *
 * Nothing here is an authorization decision: it only ever hides what the
 * canvas was already allowed to paint (kb/02-user-roles.md).
 */
export function buildCentredCanvas(
  canvas: BloomCanvas,
  expandedIds: readonly string[]
): BloomCanvas {
  const present = new Set(canvas.nodes.map((n) => String(n.id)))
  const expanded = new Set(expandedIds.filter((id) => present.has(id)))
  if (expanded.size === 0) return { nodes: [], relationships: [] }

  const visible = new Set(expanded)
  for (const r of canvas.relationships) {
    const from = String(r.from)
    const to = String(r.to)
    if (expanded.has(from) && present.has(to)) visible.add(to)
    if (expanded.has(to) && present.has(from)) visible.add(from)
  }

  return {
    // Canvas order, not insertion order — NVL diffs by id, and keeping the
    // source order means nothing reshuffles when a node joins.
    nodes: canvas.nodes.filter((n) => visible.has(String(n.id))),
    // Every edge between two visible nodes, not just the ones that pulled a
    // node in: two neighbours that are connected to each other should read
    // as connected.
    relationships: canvas.relationships.filter(
      (r) => visible.has(String(r.from)) && visible.has(String(r.to))
    ),
  }
}
