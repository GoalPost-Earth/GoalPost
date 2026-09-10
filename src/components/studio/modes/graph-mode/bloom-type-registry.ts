import type { Node, Relationship } from '@neo4j-nvl/base'
import {
  BLOOM_PALETTE_DARK as DARK,
  BLOOM_PALETTE_LIGHT as LIGHT,
} from './bloom-palette'
import {
  NODE_STYLE,
  UNKNOWN_NODE_STYLE,
  lightColorFor,
} from '@/lib/cypher-generator/node-style'

/**
 * The Bloom canvas type registry — one row per node type and per relationship
 * type the canvas can paint, and the pure transform that filters the canvas
 * down to the rows a viewer has switched on (GOAL-350).
 *
 * ## Why colour is the type key
 *
 * Bloom paints native NVL nodes as bare coloured circles — `caption`, `color`
 * and `size`, nothing else (kb/01-glossary.md, "Bloom Exploration"). There is
 * no `type` field on a painted node to filter by, so the colour IS the type
 * encoding. `BloomLegend` has always decoded it that way; GOAL-350 promotes
 * that same decoding into the filter key, which is what makes the toggle list
 * derive itself from what is on canvas instead of a hard-coded type list. Add
 * a new node or edge colour with a row here and it becomes a toggle for free —
 * and `bloom-legend.test.ts` already fails on any paintable colour that no row
 * can decode, so the registry cannot silently fall behind the paint.
 *
 * Kept free of React (and of any import that reaches back into the view) so
 * the canvas, the legend and the tests can all consume one derivation. This is
 * also why `bloom-palette.ts` exists as its own module — see its header on the
 * TDZ cycle that a legend↔view import would reintroduce.
 *
 * ## The two paint sources
 *
 * Native scopes (root / in-space / in-field) paint from `bloom-palette.ts`;
 * the AI-Companion overlay paints from the cypher generator's `node-style.ts`
 * and is repainted into its light counterparts by the view. A row therefore
 * lists every colour that should surface it in `colors`, while `swatch` holds
 * the one solid, AA-visible stand-in the legend draws per mode.
 */

export type BloomTypeKind = 'node' | 'relationship'

export interface BloomTypeRow {
  /**
   * Stable filter key. Persisted only in memory, but kept human-readable
   * because it is what `aria-*` state and the tests key off.
   */
  key: string
  label: string
  kind: BloomTypeKind
  /** Solid, AA-visible swatch shown in the row, one per mode. */
  swatch: { dark: string; light: string }
  /** Rendered node/edge colours that should surface this row when present. */
  colors: string[]
}

/**
 * An overlay colour and its light-mode repaint — the canvas may hand the
 * registry either, depending on the mode it painted in.
 */
const ov = (color: string): string[] => [color, lightColorFor(color)]

// Overlay palette — imported from the same module the executor styles its
// nodes with, so every colour the overlay can push is decodable here. Each
// entry expands to the dark colour the executor emits plus the light colour
// the canvas repaints it as.
const OVERLAY_SPACE = ov(NODE_STYLE.MeSpace.color) // Me/We/Space share one colour
const OVERLAY_FIELD = ov(NODE_STYLE.FieldContext.color)
const OVERLAY_PULSE = [
  NODE_STYLE.GoalPulse.color,
  NODE_STYLE.ResourcePulse.color,
  NODE_STYLE.StoryPulse.color,
  NODE_STYLE.CarePulse.color,
  NODE_STYLE.CoreValuePulse.color,
  NODE_STYLE.FieldPulse.color,
].flatMap(ov)
const OVERLAY_RESONANCE = [
  NODE_STYLE.ResonanceLink.color,
  NODE_STYLE.FieldResonance.color,
].flatMap(ov)

/**
 * Node rows. Native scopes carry fine-grained subtype colours from
 * `bloom-palette`; the generic `Pulse` and `Resonance` rows only ever match
 * the coarser overlay palette, so they never double up with the subtype rows
 * above (the two palettes are disjoint apart from Person, whose native and
 * overlay pinks are deliberately identical).
 *
 * Exported for the drift test — every NODE_STYLE colour must be decodable by
 * some row here (`bloom-legend.test.ts`).
 */
export const BLOOM_NODE_TYPES: BloomTypeRow[] = [
  {
    key: 'me-space',
    label: 'Your MeSpace',
    kind: 'node',
    swatch: { dark: DARK.space.MeSpace, light: LIGHT.space.MeSpace },
    colors: [DARK.space.MeSpace, LIGHT.space.MeSpace],
  },
  {
    key: 'we-space',
    label: 'WeSpace',
    kind: 'node',
    swatch: { dark: DARK.space.WeSpace, light: LIGHT.space.WeSpace },
    colors: [DARK.space.WeSpace, LIGHT.space.WeSpace, ...OVERLAY_SPACE],
  },
  {
    key: 'field-context',
    label: 'Field context',
    kind: 'node',
    swatch: { dark: DARK.field.MeSpace, light: LIGHT.field.MeSpace },
    colors: [
      DARK.field.MeSpace,
      DARK.field.WeSpace,
      LIGHT.field.MeSpace,
      LIGHT.field.WeSpace,
      ...OVERLAY_FIELD,
    ],
  },
  {
    key: 'goal',
    label: 'Goal',
    kind: 'node',
    swatch: { dark: DARK.pulse.goal, light: LIGHT.pulse.goal },
    colors: [DARK.pulse.goal, LIGHT.pulse.goal],
  },
  {
    key: 'resource',
    label: 'Resource',
    kind: 'node',
    swatch: { dark: DARK.pulse.resource, light: LIGHT.pulse.resource },
    colors: [DARK.pulse.resource, LIGHT.pulse.resource],
  },
  {
    key: 'story',
    label: 'Story',
    kind: 'node',
    swatch: { dark: DARK.pulse.story, light: LIGHT.pulse.story },
    colors: [DARK.pulse.story, LIGHT.pulse.story],
  },
  {
    key: 'care',
    label: 'Care',
    kind: 'node',
    swatch: { dark: DARK.pulse.care, light: LIGHT.pulse.care },
    colors: [DARK.pulse.care, LIGHT.pulse.care],
  },
  {
    key: 'core-value',
    label: 'Core value',
    kind: 'node',
    swatch: { dark: DARK.pulse.coreValue, light: LIGHT.pulse.coreValue },
    colors: [DARK.pulse.coreValue, LIGHT.pulse.coreValue],
  },
  {
    key: 'pulse',
    label: 'Pulse',
    kind: 'node',
    swatch: { dark: OVERLAY_PULSE[0], light: lightColorFor(OVERLAY_PULSE[0]) },
    colors: OVERLAY_PULSE,
  },
  {
    key: 'resonance-node',
    label: 'Resonance',
    kind: 'node',
    swatch: {
      dark: OVERLAY_RESONANCE[0],
      light: lightColorFor(OVERLAY_RESONANCE[0]),
    },
    colors: OVERLAY_RESONANCE,
  },
  {
    key: 'promise-weave',
    label: 'Promise weave',
    kind: 'node',
    swatch: { dark: DARK.weaveNode, light: LIGHT.weaveNode },
    colors: [
      DARK.weaveNode,
      LIGHT.weaveNode,
      ...ov(NODE_STYLE.PromiseWeave.color),
    ],
  },
  {
    key: 'organization',
    label: 'Organization',
    kind: 'node',
    swatch: {
      dark: NODE_STYLE.Organization.color,
      light: lightColorFor(NODE_STYLE.Organization.color),
    },
    colors: ov(NODE_STYLE.Organization.color),
  },
  {
    key: 'community',
    label: 'Community',
    kind: 'node',
    swatch: {
      dark: NODE_STYLE.Community.color,
      light: lightColorFor(NODE_STYLE.Community.color),
    },
    colors: ov(NODE_STYLE.Community.color),
  },
  {
    key: 'person',
    label: 'Person',
    kind: 'node',
    swatch: { dark: DARK.person, light: LIGHT.person },
    colors: [DARK.person, LIGHT.person, ...ov(NODE_STYLE.Person.color)],
  },
  // Catch-all: SpaceMembership shares the executor's unknown-label fallback
  // slate, so one honest row decodes both.
  {
    key: 'other',
    label: 'Other',
    kind: 'node',
    swatch: {
      dark: UNKNOWN_NODE_STYLE.color,
      light: lightColorFor(UNKNOWN_NODE_STYLE.color),
    },
    colors: ov(UNKNOWN_NODE_STYLE.color),
  },
]

/**
 * Edge rows. The rendered edge colours are translucent rgba — faint by design
 * on the canvas — so the swatch uses a solid, AA-visible stand-in of the same
 * hue that reads on a light- or dark-mode glass panel. `Initiated by` (field
 * view) and `Structure` (space/root view) never co-occur, so a shared slate
 * swatch is unambiguous.
 */
export const BLOOM_RELATIONSHIP_TYPES: BloomTypeRow[] = [
  {
    key: 'resonates-with',
    label: 'Resonance',
    kind: 'relationship',
    swatch: { dark: '#a78bfa', light: '#7245f7' },
    colors: [DARK.resonanceEdge, LIGHT.resonanceEdge],
  },
  {
    key: 'weaves',
    label: 'Weaves',
    kind: 'relationship',
    swatch: { dark: DARK.weaveNode, light: LIGHT.weaveNode },
    colors: [DARK.weaveEdge, LIGHT.weaveEdge],
  },
  {
    key: 'connected-to',
    label: 'Connected',
    kind: 'relationship',
    swatch: { dark: '#f472b6', light: '#ce1073' },
    colors: [DARK.connectedEdge, LIGHT.connectedEdge],
  },
  {
    // GOAL-362: named for what the edge SAYS, not for the schema's relationship
    // type. The caption NVL paints is "Authored" (edge-caption.ts) and the
    // entity drawer has always said "Authored" too; a legend row reading
    // "Initiated by" was the third different name for one relationship.
    key: 'initiated-by',
    label: 'Authored',
    kind: 'relationship',
    swatch: { dark: '#94a3b8', light: '#5a6d88' },
    colors: [DARK.initiatedEdge, LIGHT.initiatedEdge],
  },
  {
    key: 'structural',
    label: 'Structure',
    kind: 'relationship',
    swatch: { dark: '#94a3b8', light: '#5a6d88' },
    colors: [DARK.structuralEdge, LIGHT.structuralEdge],
  },
  {
    // GOAL-346. Provenance is the only tie most extracted people have, so
    // this edge is the one that most needs decoding — it is the answer to
    // "why is this person on my canvas at all".
    //
    // The label must match the caption NVL paints on the edge itself
    // ('extracted from', document-provenance-layer.ts) — the legend is a
    // decoder for what is on the canvas, so a row named differently from the
    // thing it decodes reads as a missing row rather than a renamed one.
    key: 'extracted-from',
    label: 'Extracted from',
    kind: 'relationship',
    swatch: { dark: '#fbbf24', light: '#9e7303' },
    colors: [DARK.extractedEdge, LIGHT.extractedEdge],
  },
  {
    // GOAL-362. A person or organization the document names in a pulse without
    // authoring it. No hand-built family ever drew MENTIONED_IN, so these were
    // invisible on the canvas however many of them the field held.
    key: 'mentioned-in',
    label: 'Mentioned in',
    kind: 'relationship',
    swatch: { dark: '#38bdf8', light: '#0284c7' },
    colors: [DARK.mentionedEdge, LIGHT.mentionedEdge],
  },
  {
    // GOAL-362. The catch-all for anything the generic sweep returns that no
    // row above claims — which is how a relationship type added to the graph
    // tomorrow still arrives on the canvas with a working toggle, rather than
    // painting a colour the legend cannot decode.
    key: 'other-edge',
    label: 'Other',
    kind: 'relationship',
    swatch: { dark: '#cbd5e1', light: '#64748b' },
    colors: [DARK.otherEdge, LIGHT.otherEdge],
  },
]

/**
 * Rows that are OFF the first time a viewer opens the canvas.
 *
 * Empty, deliberately, and the list is what has to stay empty. A filter that
 * hides something on first paint, without the viewer ever asking, reads as
 * missing data rather than as a filter — which is exactly how the old
 * default-off Documents row failed: it opened a document-heavy field as a
 * cloud of edgeless dots, because provenance was the only edge most of those
 * people had.
 *
 * GOAL-354 retired the Document row itself. A document is a ResourcePulse, so
 * it is painted — and toggled — as an ordinary Resource, and the provenance
 * edges it anchors are switched by the `extracted-from` row above.
 */
export const DEFAULT_HIDDEN_TYPE_KEYS: readonly string[] = []

/** Strip whitespace + lowercase so rgba/hex compare regardless of formatting. */
export const normalizeColor = (c: string | undefined): string =>
  (c ?? '').toLowerCase().replace(/\s+/g, '')

/**
 * Colour → row key, built once at module load.
 *
 * FIRST row wins on a collision, which makes resolution deterministic and
 * matches the order rows are listed to the viewer. There is one known
 * collision, inherited from the palettes and documented in
 * `bloom-palette.ts`: the WeSpace field tint is also the overlay's
 * Organization colour, so an Organization node in a chat overlay is governed
 * by the `Field context` toggle, and the `Organization` row is never offered
 * as a control — the legend lists only types it counts on the canvas, and a
 * shadowed colour resolves to the winning row, so the loser counts zero and
 * is never offered as a switch that does nothing). Colour is the
 * only type signal a painted NVL node carries, so this is a limit of the
 * encoding rather than of the filter — giving Organization its own colour in
 * `node-style.ts` is what would restore it as an independent toggle.
 */
function buildColorIndex(rows: BloomTypeRow[]): ReadonlyMap<string, string> {
  const index = new Map<string, string>()
  for (const row of rows) {
    for (const color of row.colors) {
      const key = normalizeColor(color)
      if (!index.has(key)) index.set(key, row.key)
    }
  }
  return index
}

const NODE_COLOR_INDEX = buildColorIndex(BLOOM_NODE_TYPES)
const RELATIONSHIP_COLOR_INDEX = buildColorIndex(BLOOM_RELATIONSHIP_TYPES)

/** The row key a painted node belongs to, or null when nothing decodes it. */
export function nodeTypeKey(node: Node): string | null {
  return NODE_COLOR_INDEX.get(normalizeColor(node.color)) ?? null
}

const NODE_LABEL_BY_KEY: ReadonlyMap<string, string> = new Map(
  BLOOM_NODE_TYPES.map((row) => [row.key, row.label])
)

/**
 * Colours more than one node row claims.
 *
 * The colour index is winner-takes-all, which is right for a *filter* — a
 * shadowed row would be a switch that can never act, so one toggle governing
 * both is honest. It is NOT right for a *label*: the WeSpace field tint is
 * also the overlay's Organization colour (see the header note), so naming the
 * winner would tell a viewer that an `:Organization` pushed onto the canvas by
 * chat is a WeSpace — inventing a Space where there is none.
 *
 * So a contested colour gets no label at all. Saying nothing about a node's
 * type is a gap; naming the wrong type is a lie.
 */
const CONTESTED_NODE_COLORS: ReadonlySet<string> = (() => {
  const claimedBy = new Map<string, Set<string>>()
  for (const row of BLOOM_NODE_TYPES) {
    for (const color of row.colors) {
      const key = normalizeColor(color)
      const owners = claimedBy.get(key) ?? new Set<string>()
      owners.add(row.key)
      claimedBy.set(key, owners)
    }
  }
  return new Set(
    [...claimedBy.entries()]
      .filter(([, owners]) => owners.size > 1)
      .map(([color]) => color)
  )
})()

/**
 * The human label a painted node's type row carries ("Goal", "Person", …), or
 * null when its colour decodes to nothing — or to more than one row.
 *
 * Used by canvas search to say what a result *is*, which is the type signal a
 * bare coloured circle can't carry on its own. This is also why the "no type
 * tags on Bloom captions" convention holds: the type belongs beside the
 * caption in a panel, never baked into the node.
 */
export function nodeTypeLabel(node: Node): string | null {
  if (CONTESTED_NODE_COLORS.has(normalizeColor(node.color))) return null
  const key = nodeTypeKey(node)
  return key ? (NODE_LABEL_BY_KEY.get(key) ?? null) : null
}

/** The row key a painted edge belongs to, or null when nothing decodes it. */
export function relationshipTypeKey(rel: Relationship): string | null {
  return (
    RELATIONSHIP_COLOR_INDEX.get(
      normalizeColor((rel as { color?: string }).color)
    ) ?? null
  )
}

/**
 * How many elements of each type row a canvas carries, keyed by row key.
 *
 * Counted through the SAME winner-takes-all colour index the rows and the
 * filter resolve through, so a tally can never name a row the legend doesn't
 * offer, and the numbers always add up against the list they sit in. Anything
 * whose colour decodes to nothing is left uncounted rather than bucketed
 * somewhere arbitrary — matching `applyBloomTypeFilters`, which never hides
 * what it cannot name.
 *
 * Feed this the UNFILTERED canvas. A count read off the painted graph would
 * drop to zero the moment its own row was switched off, which is the one
 * moment the number matters most: the row has to keep saying how much is
 * behind the switch you just flipped.
 */
function tally<T>(
  items: T[],
  keyOf: (item: T) => string | null
): ReadonlyMap<string, number> {
  const counts = new Map<string, number>()
  for (const item of items) {
    const key = keyOf(item)
    if (!key) continue
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}

/** Per-row node counts for a canvas. See `tally` — pass the unfiltered graph. */
export function countNodeTypes(nodes: Node[]): ReadonlyMap<string, number> {
  return tally(nodes, nodeTypeKey)
}

/** Per-row edge counts for a canvas. See `tally` — pass the unfiltered graph. */
export function countRelationshipTypes(
  relationships: Relationship[]
): ReadonlyMap<string, number> {
  return tally(relationships, relationshipTypeKey)
}

export interface BloomCanvas {
  nodes: Node[]
  relationships: Relationship[]
}

/**
 * The whole filter: a pure presentational transform over the canvas the view
 * already built (no refetch, ADR-011).
 *
 * Two invariants it exists to hold:
 *
 *  1. **Hiding a node type cascades to its edges.** Every surviving edge is
 *     re-checked against the surviving node ids, so NVL is never handed an
 *     arrow to a node that isn't drawn. `bloom-view` guards each edge against
 *     its own `visibleIds` when it builds them; this re-applies that same
 *     guard against the post-filter set rather than bypassing it.
 *  2. **Hiding a relationship type hides only edges.** Endpoint nodes stay on
 *     canvas unless their own type is also switched off.
 *
 * A node or edge whose colour no row decodes is always kept. Hiding something
 * the registry cannot name would be the canvas silently dropping data, and on
 * this surface "not drawn" must never be mistaken for "not there" or "not
 * permitted" (kb/02-user-roles.md — this is a view filter, never an
 * authorization decision).
 */
export function applyBloomTypeFilters(
  canvas: BloomCanvas,
  hidden: ReadonlySet<string>
): BloomCanvas {
  if (hidden.size === 0) return canvas

  const nodes = canvas.nodes.filter((n) => {
    const key = nodeTypeKey(n)
    return key === null || !hidden.has(key)
  })

  // Short-circuit the id set only when nothing was actually dropped — the
  // common case is an edge-type toggle, where every endpoint survives.
  const dropped = nodes.length !== canvas.nodes.length
  const visibleIds = dropped ? new Set(nodes.map((n) => String(n.id))) : null

  const relationships = canvas.relationships.filter((r) => {
    const key = relationshipTypeKey(r)
    if (key !== null && hidden.has(key)) return false
    if (!visibleIds) return true
    return visibleIds.has(String(r.from)) && visibleIds.has(String(r.to))
  })

  return { nodes, relationships }
}
