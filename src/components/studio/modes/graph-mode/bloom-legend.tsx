'use client'

import { useMemo, useState, type FC } from 'react'
import type { Node, Relationship } from '@neo4j-nvl/base'
import { cn } from '@/lib/utils'
import { useIsDarkMode } from '@/hooks'
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
 * Scope-aware legend for the Bloom canvas.
 *
 * Bloom paints native NVL nodes as bare colored circles (caption + color +
 * size only — see bloom-view.tsx), so the color is the *only* thing that
 * tells a Goal apart from a Person. Per the "no type tags on Bloom captions"
 * convention this legend is where those colors get decoded — out of the way
 * in a collapsible chip rather than baked into every node label.
 *
 * It derives its rows from the exact `nodes` / `relationships` arrays the
 * canvas is rendering: a swatch shows only when a node/edge of that color is
 * actually on screen. That makes it scope-aware for free — the root view
 * shows MeSpace/WeSpace/Person, a field view shows the pulse subtypes +
 * resonance edges, etc. — and keeps it permanently in sync with the paint.
 *
 * The native node/edge colors are imported straight from `bloom-palette.ts`,
 * and the *overlay* palette — the colors a chat "custom view" pushes — is
 * imported from the cypher generator's shared `node-style.ts`, so a swatch can
 * never drift out of sync with either paint source (GOAL-288: the overlay
 * colors used to be hand-mirrored literals here, and PromiseWeave's fuchsia
 * was missing — assistant-rendered weaves showed no legend row). The
 * surrounding chrome (glass, text) uses gp-* tokens so the panel itself themes
 * correctly in light + dark.
 *
 * Both paint sources now have a light and a dark variant (NVL can't consume
 * CSS variables, so the canvas carries its own palettes). A row therefore
 * lists BOTH variants in `colors` — the canvas hands us whichever it painted —
 * while `swatch` picks the variant matching the mode the legend itself is
 * rendering in.
 */

type LegendItem = {
  label: string
  /** Solid, AA-visible swatch shown in the row, one per mode. */
  swatch: { dark: string; light: string }
  /** Rendered node/edge colors that should surface this row when present. */
  colors: string[]
}

/**
 * An overlay color and its light-mode repaint — the canvas may hand the legend
 * either, depending on the mode it painted in.
 */
const ov = (color: string): string[] => [color, lightColorFor(color)]

// Overlay palette — imported from the same module the executor styles its
// nodes with, so every color the overlay can push is decodable here. Each
// entry expands to the dark color the executor emits plus the light color the
// canvas repaints it as.
const OVERLAY_SPACE = ov(NODE_STYLE.MeSpace.color) // Me/We/Space share one color
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

// Node rows. Native scopes (root / space / field) carry fine-grained subtype
// colors imported from bloom-view; the generic `Pulse` and `Resonance` rows
// only ever match the coarser overlay palette, so they never double up with
// the subtype rows above (the two palettes are disjoint apart from Person,
// whose native and overlay pinks are deliberately identical).
// Exported for the drift test only — every NODE_STYLE color must be
// decodable by some row here (bloom-legend.test.tsx).
export const LEGEND_NODES: LegendItem[] = [
  {
    label: 'Your MeSpace',
    swatch: { dark: DARK.space.MeSpace, light: LIGHT.space.MeSpace },
    colors: [DARK.space.MeSpace, LIGHT.space.MeSpace],
  },
  {
    label: 'WeSpace',
    swatch: { dark: DARK.space.WeSpace, light: LIGHT.space.WeSpace },
    colors: [DARK.space.WeSpace, LIGHT.space.WeSpace, ...OVERLAY_SPACE],
  },
  {
    label: 'Field context',
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
    label: 'Goal',
    swatch: { dark: DARK.pulse.goal, light: LIGHT.pulse.goal },
    colors: [DARK.pulse.goal, LIGHT.pulse.goal],
  },
  {
    label: 'Resource',
    swatch: { dark: DARK.pulse.resource, light: LIGHT.pulse.resource },
    colors: [DARK.pulse.resource, LIGHT.pulse.resource],
  },
  {
    label: 'Story',
    swatch: { dark: DARK.pulse.story, light: LIGHT.pulse.story },
    colors: [DARK.pulse.story, LIGHT.pulse.story],
  },
  {
    label: 'Care',
    swatch: { dark: DARK.pulse.care, light: LIGHT.pulse.care },
    colors: [DARK.pulse.care, LIGHT.pulse.care],
  },
  {
    label: 'Core value',
    swatch: { dark: DARK.pulse.coreValue, light: LIGHT.pulse.coreValue },
    colors: [DARK.pulse.coreValue, LIGHT.pulse.coreValue],
  },
  {
    label: 'Pulse',
    swatch: { dark: OVERLAY_PULSE[0], light: lightColorFor(OVERLAY_PULSE[0]) },
    colors: OVERLAY_PULSE,
  },
  {
    label: 'Resonance',
    swatch: {
      dark: OVERLAY_RESONANCE[0],
      light: lightColorFor(OVERLAY_RESONANCE[0]),
    },
    colors: OVERLAY_RESONANCE,
  },
  {
    label: 'Promise weave',
    swatch: { dark: DARK.weaveNode, light: LIGHT.weaveNode },
    colors: [
      DARK.weaveNode,
      LIGHT.weaveNode,
      ...ov(NODE_STYLE.PromiseWeave.color),
    ],
  },
  {
    label: 'Organization',
    swatch: {
      dark: NODE_STYLE.Organization.color,
      light: lightColorFor(NODE_STYLE.Organization.color),
    },
    colors: ov(NODE_STYLE.Organization.color),
  },
  {
    label: 'Community',
    swatch: {
      dark: NODE_STYLE.Community.color,
      light: lightColorFor(NODE_STYLE.Community.color),
    },
    colors: ov(NODE_STYLE.Community.color),
  },
  {
    label: 'Document',
    swatch: {
      dark: NODE_STYLE.Document.color,
      light: lightColorFor(NODE_STYLE.Document.color),
    },
    colors: ov(NODE_STYLE.Document.color),
  },
  {
    label: 'Person',
    swatch: { dark: DARK.person, light: LIGHT.person },
    colors: [DARK.person, LIGHT.person, ...ov(NODE_STYLE.Person.color)],
  },
  // Catch-all: SpaceMembership shares the executor's unknown-label fallback
  // slate, so one honest row decodes both.
  {
    label: 'Other',
    swatch: {
      dark: UNKNOWN_NODE_STYLE.color,
      light: lightColorFor(UNKNOWN_NODE_STYLE.color),
    },
    colors: ov(UNKNOWN_NODE_STYLE.color),
  },
]

// Edge rows. The rendered edge colors are translucent rgba — faint by design
// on the canvas — so the legend swatch uses a solid, AA-visible stand-in of
// the same hue that reads on a light- or dark-mode glass panel. `Initiated by`
// (field view) and `Structure` (space/root view) never co-occur, so a shared
// slate swatch is unambiguous.
const LEGEND_EDGES: LegendItem[] = [
  {
    label: 'Resonance',
    swatch: { dark: '#a78bfa', light: '#7245f7' },
    colors: [DARK.resonanceEdge, LIGHT.resonanceEdge],
  },
  {
    label: 'Weaves',
    swatch: { dark: DARK.weaveNode, light: LIGHT.weaveNode },
    colors: [DARK.weaveEdge, LIGHT.weaveEdge],
  },
  {
    label: 'Connected',
    swatch: { dark: '#f472b6', light: '#ce1073' },
    colors: [DARK.connectedEdge, LIGHT.connectedEdge],
  },
  {
    label: 'Initiated by',
    swatch: { dark: '#94a3b8', light: '#5a6d88' },
    colors: [DARK.initiatedEdge, LIGHT.initiatedEdge],
  },
  {
    label: 'Structure',
    swatch: { dark: '#94a3b8', light: '#5a6d88' },
    colors: [DARK.structuralEdge, LIGHT.structuralEdge],
  },
  {
    // GOAL-346. The whole point of the Document layer is to explain why a
    // person is on the canvas, so its edge is the one that most needs
    // decoding. Only ever present when the Documents layer is switched on —
    // `presentItems` drops the row otherwise.
    label: 'Named in',
    swatch: { dark: '#fbbf24', light: '#9e7303' },
    colors: [DARK.extractedEdge, LIGHT.extractedEdge],
  },
]

/** Strip whitespace + lowercase so rgba/hex compare regardless of formatting. */
const norm = (c: string | undefined): string =>
  (c ?? '').toLowerCase().replace(/\s+/g, '')

function presentItems(items: LegendItem[], colors: Set<string>): LegendItem[] {
  return items.filter((item) => item.colors.some((c) => colors.has(norm(c))))
}

export const BloomLegend: FC<{
  nodes: Node[]
  relationships: Relationship[]
}> = ({ nodes, relationships }) => {
  const [open, setOpen] = useState(false)
  const isDark = useIsDarkMode()

  const { nodeRows, edgeRows } = useMemo(() => {
    const nodeColors = new Set(nodes.map((n) => norm(n.color)))
    const edgeColors = new Set(
      relationships.map((r) => norm((r as { color?: string }).color))
    )
    return {
      nodeRows: presentItems(LEGEND_NODES, nodeColors),
      edgeRows: presentItems(LEGEND_EDGES, edgeColors),
    }
  }, [nodes, relationships])

  // Nothing on the canvas to decode → no legend (loading / empty states).
  if (nodeRows.length === 0 && edgeRows.length === 0) return null

  return (
    // Sits clear of the bottom-center action bar: stacked above it on mobile,
    // pinned to the lower-left on desktop. flex-col-reverse keeps the chip at
    // the bottom and grows the panel upward when expanded.
    <div className="pointer-events-none absolute bottom-20 left-3 z-30 sm:bottom-6 sm:left-4">
      <div className="pointer-events-auto flex flex-col-reverse items-start gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Hide legend' : 'Show legend'}
          title={open ? 'Hide legend' : 'Show legend'}
          className="gp-glass-hover cursor-pointer flex items-center gap-2 h-9 px-2.5 sm:px-3 rounded-full gp-glass border border-gp-glass-border shadow-xl text-gp-ink-muted hover:text-gp-primary"
        >
          <span className="material-symbols-outlined text-lg leading-none">
            {open ? 'close' : 'legend_toggle'}
          </span>
          <span className="hidden sm:inline text-xs font-semibold">Legend</span>
        </button>

        {open && (
          <div className="w-48 max-w-[72vw] rounded-2xl gp-glass border border-gp-glass-border shadow-xl p-3 animate-fade-in">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gp-ink-muted">
              Legend
            </p>

            {nodeRows.length > 0 && (
              <ul className="space-y-1.5">
                {nodeRows.map((row) => (
                  <LegendRow
                    key={row.label}
                    item={row}
                    shape="dot"
                    isDark={isDark}
                  />
                ))}
              </ul>
            )}

            {edgeRows.length > 0 && (
              <>
                <div className="my-2.5 h-px bg-gp-glass-border" />
                <ul className="space-y-1.5">
                  {edgeRows.map((row) => (
                    <LegendRow
                      key={row.label}
                      item={row}
                      shape="line"
                      isDark={isDark}
                    />
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const LegendRow: FC<{
  item: LegendItem
  shape: 'dot' | 'line'
  isDark: boolean
}> = ({ item, shape, isDark }) => (
  <li className="flex items-center gap-2.5">
    <span
      aria-hidden
      className={cn(
        'shrink-0',
        shape === 'dot' ? 'size-3 rounded-full' : 'h-0.5 w-4 rounded-full'
      )}
      style={{ background: isDark ? item.swatch.dark : item.swatch.light }}
    />
    <span className="truncate text-xs font-medium text-gp-ink-strong">
      {item.label}
    </span>
  </li>
)
