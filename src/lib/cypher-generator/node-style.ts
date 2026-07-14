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

export function styleFor(labels: string[]): NodeStyle {
  const byLabel = NODE_STYLE as Record<string, NodeStyle>
  for (const l of labels) {
    if (byLabel[l]) return byLabel[l]
  }
  return UNKNOWN_NODE_STYLE
}
