/**
 * Shared Bloom color palette — the single source of truth for the resolved
 * colors NVL paints on the Bloom canvas.
 *
 * This lives in its own module (rather than on bloom-view) so both the canvas
 * (`bloom-view.tsx`, which paints the nodes/edges) and the legend
 * (`bloom-legend.tsx`, which decodes them) can import it without forming an
 * import cycle. A cycle here is fatal: the legend builds its descriptor tables
 * at module-eval time, so a `const` referencing a still-uninitialised import
 * across the cycle throws "Cannot access 'X' before initialization" (TDZ).
 *
 * Hex/rgba values are duplicated from the `--gp-*` tokens in globals.css
 * because NVL needs resolved colors at render time — it can't consume CSS
 * variables. Keep these in sync with the entity tokens.
 */

export const SPACE_COLOR = {
  MeSpace: '#f59e0b', // amber — matches the Me Space card accent
  WeSpace: '#14b8a6', // teal — matches the We Space card accent
} as const

// Field-context bubbles inherit a softer tint of their parent's palette so
// the in-space cluster reads as "the same space, one level deeper."
export const FIELD_COLOR = {
  MeSpace: '#fbbf24', // amber-400 — slightly warmer than space accent
  WeSpace: '#5eead4', // teal-300 — slightly lighter than space accent
} as const

// Pulse palette mirrors `--gp-{goal|resource|story|care|coreValue}` from
// globals.css so Bloom nodes read with the same semantics as everywhere else
// in the app.
export const PULSE_COLOR: Record<
  'goal' | 'resource' | 'story' | 'care' | 'coreValue',
  string
> = {
  goal: '#38bdf8',
  resource: '#4ade80',
  story: '#c084fc',
  care: '#10b981',
  coreValue: '#8b5cf6',
}

// Person nodes (pulse initiators + the field/space owner) use the same pink
// the overlay color map already treats as 'Person' (colorToInfoEntityType),
// so a clicked person resolves consistently however it arrived on the canvas.
export const PERSON_COLOR = '#f9a8d4'

// PromiseWeave connector nodes — teal, deliberately outside the violet
// resonance/story/coreValue cluster so a weave reads as its own kind of
// connector. Migrated care points surface here (see kb/05-data-entities.md).
export const WEAVE_NODE_COLOR = '#2dd4bf'

// Slate scaffolding color for the hub-and-spoke structural edges (owns /
// member / has). Tuned for the always-dark canvas, deliberately fainter than
// the resonance violet so the connective tissue reads as secondary.
export const STRUCTURAL_EDGE_COLOR = 'rgba(148, 163, 184, 0.40)'

// Edge palette — named (vs the old inline literals) so the legend matches the
// painted edges exactly. RESONATES_WITH reads as the signature violet;
// INITIATED_BY is the faint white initiator connector.
export const RESONANCE_EDGE_COLOR = 'rgba(167, 139, 250, 0.55)'
export const INITIATED_EDGE_COLOR = 'rgba(255, 255, 255, 0.22)'
// WEAVES — the teal connector edges from a PromiseWeave hub out to the
// pulses it weaves. Matches WEAVE_NODE_COLOR so the hub + its spokes read as
// one unit, distinct from the resonance violet.
export const WEAVE_EDGE_COLOR = 'rgba(45, 212, 191, 0.55)'
// CONNECTED_TO — interpersonal relationship edges between people (the current
// user and the people in their world, or two people they know). Rose to echo
// the person node color and stay distinct from resonance violet / weave teal.
export const CONNECTED_EDGE_COLOR = 'rgba(244, 114, 182, 0.55)'
