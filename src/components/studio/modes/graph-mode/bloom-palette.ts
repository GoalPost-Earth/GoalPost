/**
 * Shared Bloom color palette — the single source of truth for the resolved
 * colors NVL paints on the Bloom canvas, in both light and dark mode.
 *
 * This lives in its own module (rather than on bloom-view) so both the canvas
 * (`bloom-view.tsx`, which paints the nodes/edges) and the legend
 * (`bloom-legend.tsx`, which decodes them) can import it without forming an
 * import cycle. A cycle here is fatal: the legend builds its descriptor tables
 * at module-eval time, so a `const` referencing a still-uninitialised import
 * across the cycle throws "Cannot access 'X' before initialization" (TDZ).
 * Keep this module free of React and of any app import.
 *
 * ## Why there are two palettes
 *
 * Everything else in GoalPost themes through CSS variables. NVL cannot: it
 * paints to a `<canvas>` from resolved color strings passed in JS, so a token
 * never reaches it. The canvas therefore carries its own light/dark pair,
 * selected by `getBloomPalette(useIsDarkMode())` at the two call sites. This is
 * the documented exception to the design skill's "don't branch on the mode"
 * rule — not a licence to branch anywhere else.
 *
 * ## How the light values were derived
 *
 * The dark palette (unchanged — it is what the canvas has always painted)
 * mirrors the `--gp-*` entity tokens and reads at 6.5–11.7:1 against the dark
 * surface `#101c22`. Those same colors collapse to 1.4–2.5:1 against the light
 * surface `#f6f7f8`, which is what made Bloom unusable in light mode.
 *
 * Each light value is its dark counterpart with the hue preserved, the
 * saturation floored (so pastels stay vivid rather than turning muddy), and the
 * lightness lowered until the contrast ratio against `#f6f7f8` lands in a
 * 3.1–5.6 band — brighter source colors targeting the low end of the band and
 * darker ones the high end, so the palette keeps its internal lightness
 * ordering (a field tint still reads as a lighter sibling of its space accent).
 * Every value clears the 3:1 WCAG non-text bar. Two collisions are deliberate
 * and mirror the dark palette: the WeSpace field tint doubles as the overlay
 * Organization color, and the weave edge shares its node's color so a hub and
 * its spokes read as one unit.
 *
 * Recoloring an entity? Change BOTH palettes, then add the new color to a
 * legend row — `bloom-legend.test.ts` fails on any color no row can decode.
 */

export type PulseKind = 'goal' | 'resource' | 'story' | 'care' | 'coreValue'

export interface BloomPalette {
  /** Space hub nodes (root + in-space anchor). */
  space: Record<'MeSpace' | 'WeSpace', string>
  /**
   * Field-context bubbles — a softer sibling of the parent space's accent so
   * the in-space cluster reads as "the same space, one level deeper."
   */
  field: Record<'MeSpace' | 'WeSpace', string>
  /** Pulse nodes, mirroring the `--gp-{goal|resource|...}` entity tokens. */
  pulse: Record<PulseKind, string>
  /** Person nodes — pulse initiators, space owners/members, the "You" hub. */
  person: string
  /**
   * PromiseWeave connector nodes — deliberately outside the violet
   * resonance/story/coreValue cluster so a weave reads as its own kind of
   * connector. Migrated care points surface here (see kb/05-data-entities.md).
   */
  weaveNode: string
  /**
   * Hub-and-spoke scaffolding edges (owns / member / has). Deliberately
   * fainter than the resonance edge so connective tissue reads as secondary.
   */
  structuralEdge: string
  /** RESONATES_WITH — the signature violet pulse↔pulse semantic link. */
  resonanceEdge: string
  /** INITIATED_BY / CREATED_BY — the faintest connector, pulse → its author. */
  initiatedEdge: string
  /** WEAVES — a PromiseWeave hub out to each pulse it weaves. */
  weaveEdge: string
  /** CONNECTED_TO — interpersonal relationships between people. */
  connectedEdge: string
  /**
   * Document nodes in the in-field view (GOAL-346). Deliberately the SAME
   * slate the cypher generator's `styleFor` gives a Document
   * (`lib/cypher-generator/node-style.ts:63`), because the assistant's chat
   * overlay already paints Document nodes on this very canvas — a second
   * Document colour would make one entity read as two.
   */
  documentNode: string
  /**
   * EXTRACTED_FROM — a document out to each person it named.
   *
   * Amber, NOT the document's own slate. Slate would share its RGB with both
   * `initiatedEdge` and `structuralEdge`, and `initiated` edges are exactly
   * the ones that co-occur with this in the in-field view — leaving alpha as
   * the only cue, which is not a cue. Amber also matches how Documents are
   * already dressed everywhere else in the product (the drawer's icon tile
   * and concept chips), so the edge reads as "document" on sight.
   */
  extractedEdge: string
}

/** Painted when `<html>` carries the `dark` class. Tuned for `#101c22`. */
export const BLOOM_PALETTE_DARK: BloomPalette = {
  space: {
    MeSpace: '#f59e0b', // amber — matches the Me Space card accent
    WeSpace: '#14b8a6', // teal — matches the We Space card accent
  },
  field: {
    MeSpace: '#fbbf24', // amber-400 — slightly warmer than space accent
    WeSpace: '#5eead4', // teal-300 — slightly lighter than space accent
  },
  pulse: {
    goal: '#38bdf8',
    resource: '#4ade80',
    story: '#c084fc',
    care: '#10b981',
    coreValue: '#8b5cf6',
  },
  person: '#f9a8d4',
  weaveNode: '#2dd4bf',
  structuralEdge: 'rgba(148, 163, 184, 0.40)',
  resonanceEdge: 'rgba(167, 139, 250, 0.55)',
  initiatedEdge: 'rgba(255, 255, 255, 0.22)',
  weaveEdge: 'rgba(45, 212, 191, 0.55)',
  connectedEdge: 'rgba(244, 114, 182, 0.55)',
  documentNode: '#94a3b8',
  extractedEdge: 'rgba(251, 191, 36, 0.65)',
}

/** Painted in light mode. Tuned for `#f6f7f8` — see the header for the method. */
export const BLOOM_PALETTE_LIGHT: BloomPalette = {
  space: {
    MeSpace: '#9c6506', // deep amber
    WeSpace: '#0d796e', // deep teal
  },
  field: {
    MeSpace: '#9e7303',
    WeSpace: '#13907d',
  },
  pulse: {
    goal: '#0678aa',
    resource: '#198a43',
    story: '#922bfa',
    care: '#0b7b56',
    coreValue: '#6f35f4',
  },
  person: '#e21082',
  weaveNode: '#198376',
  // Edges carry a little more alpha than their dark counterparts: a
  // translucent stroke loses more of itself against a light backdrop.
  structuralEdge: 'rgba(90, 109, 136, 0.55)',
  resonanceEdge: 'rgba(114, 69, 247, 0.60)',
  // The dark palette's faint white; on light it has to be a faint *ink*, or
  // the author connector paints white-on-white and disappears entirely.
  initiatedEdge: 'rgba(90, 109, 136, 0.32)',
  weaveEdge: 'rgba(25, 131, 118, 0.60)',
  connectedEdge: 'rgba(206, 16, 115, 0.60)',
  // The light-mode Document slate, per node-style.ts's own light override.
  documentNode: '#5a6d88',
  extractedEdge: 'rgba(158, 115, 3, 0.70)',
}

/** Both palettes, for exhaustive checks (legend decoding, drift tests). */
export const BLOOM_PALETTES = [
  BLOOM_PALETTE_DARK,
  BLOOM_PALETTE_LIGHT,
] as const

export function getBloomPalette(isDark: boolean): BloomPalette {
  return isDark ? BLOOM_PALETTE_DARK : BLOOM_PALETTE_LIGHT
}
