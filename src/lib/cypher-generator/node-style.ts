/**
 * Overlay node palette — the colors and sizes the AI Companion's "custom
 * view" (query_for_bloom) paints on the Bloom canvas.
 *
 * This lives in its own dependency-free module so BOTH sides of the overlay
 * can import it (GOAL-288):
 *   - the server-side executor (`execute.ts`, which imports the neo4j driver
 *     and therefore must never be pulled into a client bundle) styles the
 *     nodes it returns, and
 *   - the client legend (`bloom-legend.tsx`) decodes those colors back into
 *     labels.
 * Before this module existed the legend hand-mirrored these hex values as
 * literals, and the copies drifted — PromiseWeave's overlay fuchsia was
 * missing from the legend entirely, so an assistant query that rendered
 * weaves showed no "Promise weave" legend row.
 *
 * Adding a label here? Give it a distinct color, then check the legend rows
 * in `bloom-legend.tsx` decode it (there is a drift test in
 * `bloom-legend.test.ts` that fails if a color is left undecodable).
 *
 * EXCEPTION — provenance/marker labels (e.g. `:CoreValue`, which rides
 * alongside `:FieldPulse` and a subtype rather than replacing them). A map
 * entry alone does NOT work for those: `styleFor` returns the first label that
 * hits the map, and the node's own base label usually hits first. Give them a
 * precedence branch at the top of `styleFor` that reuses the canonical
 * subtype's color instead — reusing the color also keeps the legend decodable
 * with no new row.
 * Known pre-existing ambiguity: '#5eead4' doubles as the native WeSpace
 * field tint (bloom-palette FIELD_COLOR.WeSpace) and the overlay
 * Organization color, so a native WeSpace field view also surfaces the
 * "Organization" legend row.
 */

export type NodeStyle = { color: string; size: number }

// `as const satisfies` keeps keyed accesses (NODE_STYLE.PromiseWeave.color in
// the legend) typo-safe at compile time — a misspelled key here would
// otherwise throw at module-eval inside a client component.
export const NODE_STYLE = {
  MeSpace: { color: '#86efac', size: 42 },
  WeSpace: { color: '#86efac', size: 42 },
  Space: { color: '#86efac', size: 42 },
  Community: { color: '#fdba74', size: 38 }, // orange-300 — public collective
  Organization: { color: '#5eead4', size: 30 }, // teal-300 — named org/cooperative (GOAL-298)
  FieldContext: { color: '#fde68a', size: 34 },
  GoalPulse: { color: '#93c5fd', size: 26 },
  ResourcePulse: { color: '#a7f3d0', size: 26 },
  StoryPulse: { color: '#c4b5fd', size: 26 },
  CarePulse: { color: '#fca5a5', size: 26 },
  CoreValuePulse: { color: '#fcd34d', size: 26 },
  FieldPulse: { color: '#93c5fd', size: 26 },
  Person: { color: '#f9a8d4', size: 30 },
  User: { color: '#f9a8d4', size: 30 },
  PersonPulse: { color: '#f9a8d4', size: 26 },
  ResonanceLink: { color: '#d8b4fe', size: 22 },
  FieldResonance: { color: '#e9d5ff', size: 22 },
  // Connective container, styled as a sibling of ResonanceLink (both are
  // reified connector nodes) but with a distinct fuchsia hue so the two are
  // tellable apart on the canvas.
  PromiseWeave: { color: '#f0abfc', size: 22 },
  // Uploaded source document — slate/steel hue, distinct from the pulses it
  // was extracted into. Captioned by filename (see captionFor in execute.ts).
  Document: { color: '#94a3b8', size: 24 },
  SpaceMembership: { color: '#cbd5e1', size: 18 },
} as const satisfies Record<string, NodeStyle>

/**
 * Fallback style for labels not in the map. Shares SpaceMembership's slate,
 * so the legend's catch-all row decodes both. Frozen — it is returned by
 * reference from styleFor.
 */
export const UNKNOWN_NODE_STYLE: NodeStyle = Object.freeze({
  color: '#cbd5e1',
  size: 24,
})

/**
 * Labels that are the GENERIC base of a family whose specific member carries
 * the meaning: every pulse is a `FieldPulse`, every human a `Person`, every
 * space a `Space`. They have styles of their own (a node may legitimately
 * arrive with nothing else), but they must never win over the subtype.
 */
const BASE_LABELS = new Set(['FieldPulse', 'Person', 'Space'])

export function styleFor(labels: string[]): NodeStyle {
  const byLabel = NODE_STYLE as Record<string, NodeStyle>

  // A migrated core value carries a `:CoreValue` provenance marker alongside
  // its base labels, and in an un-backfilled env it carries ONLY
  // `FieldPulse:StoryPulse:CoreValue` (GOAL-287) — the subtype label present is
  // `StoryPulse`, so subtype precedence alone would paint it as a story.
  // Resolve the value marker FIRST, mirroring the precedence
  // `pulseProjectionCypher()` applies in pulse.service.ts.
  if (labels.includes('CoreValue') || labels.includes('CoreValuePulse')) {
    return NODE_STYLE.CoreValuePulse
  }

  // Neo4j gives NO ordering guarantee on `labels`, so a plain first-match loop
  // painted a node with whichever label happened to come back first: a
  // `["FieldPulse","StoryPulse"]` story rendered in FieldPulse blue —
  // indistinguishable from a goal — and a `["Person","PersonPulse"]` non-member
  // rendered at the larger member size. Take the specific subtype first, and
  // fall back to the base label only when there is no subtype at all.
  for (const l of labels) {
    if (!BASE_LABELS.has(l) && byLabel[l]) return byLabel[l]
  }
  for (const l of labels) {
    if (byLabel[l]) return byLabel[l]
  }
  return UNKNOWN_NODE_STYLE
}

/**
 * Light-mode counterpart of every color above, keyed by the dark color the
 * executor actually emits.
 *
 * The palette above is a set of 200/300-level pastels chosen to glow on the
 * dark Bloom canvas; against the light surface (`#f6f7f8`) they read at
 * 1.3–2.5:1 and the overlay dissolves into the background. The executor runs
 * on the server and cannot know the viewer's theme, so it keeps emitting the
 * dark colors and the *client* remaps them at paint time
 * (`bloom-view.tsx`) — see `bloom-palette.ts` for the derivation method
 * (hue preserved, saturation floored, lightness lowered to a 3.1–5.6:1 band
 * that keeps the palette's internal lightness ordering).
 *
 * Keyed by color rather than by label on purpose: overlay nodes cached from
 * older chat threads can arrive without `labels`, and the color is the one
 * field every overlay node has always carried.
 *
 * Two values intentionally match `BLOOM_PALETTE_LIGHT`, mirroring collisions
 * the dark palettes already have: Person (`#f9a8d4`) and Organization
 * (`#5eead4`, which doubles as the native WeSpace field tint).
 */
export const LIGHT_NODE_COLOR: Record<string, string> = {
  '#86efac': '#149844', // MeSpace / WeSpace / Space
  '#fdba74': '#bc6103', // Community
  '#5eead4': '#13907d', // Organization
  '#fde68a': '#ab8a03', // FieldContext
  '#93c5fd': '#0472ee', // GoalPulse / FieldPulse
  '#a7f3d0': '#169f5f', // ResourcePulse
  '#c4b5fd': '#7a58fa', // StoryPulse
  '#fca5a5': '#ea0808', // CarePulse
  '#fcd34d': '#a27c03', // CoreValuePulse
  '#f9a8d4': '#e21082', // Person / User / PersonPulse
  '#d8b4fe': '#9e45fd', // ResonanceLink
  '#e9d5ff': '#ab5eff', // FieldResonance
  '#f0abfc': '#ca08eb', // PromiseWeave
  '#94a3b8': '#5a6d88', // Document
  '#cbd5e1': '#6583a6', // SpaceMembership / unknown-label fallback
}

/**
 * The color to paint `color` with in light mode. Returns the input unchanged
 * for anything not in the map, so an overlay node carrying a color from
 * outside this palette still renders (just without a light-mode correction).
 */
export function lightColorFor(color: string): string {
  return LIGHT_NODE_COLOR[color.toLowerCase()] ?? color
}
