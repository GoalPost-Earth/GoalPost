'use client'

import { useMemo, useState, type FC } from 'react'
import type { Node, Relationship } from '@neo4j-nvl/base'
import { cn } from '@/lib/utils'
import {
  SPACE_COLOR,
  FIELD_COLOR,
  PULSE_COLOR,
  PERSON_COLOR,
  STRUCTURAL_EDGE_COLOR,
  RESONANCE_EDGE_COLOR,
  INITIATED_EDGE_COLOR,
} from './bloom-palette'

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
 * The native node/edge colors are imported straight from bloom-view (its
 * exported palette consts) so a swatch can never drift out of sync with the
 * paint. Only the coarser *overlay* palette — the colors a chat "custom view"
 * pushes, which live solely inside bloom-view's `colorToInfoEntityType`
 * switch — is mirrored as literals here, with a back-reference comment. The
 * surrounding chrome (glass, text) uses gp-* tokens so the panel itself
 * themes correctly in light + dark.
 */

type LegendItem = {
  label: string
  /** Solid, AA-visible swatch color shown in the legend row. */
  swatch: string
  /** Rendered node/edge colors that should surface this row when present. */
  colors: string[]
}

// Coarse overlay palette — the colors a chat "custom view" pushes. These have
// no shared home: they live only inside bloom-view's `colorToInfoEntityType`
// switch, so they're mirrored here as literals. Keep in sync with that switch.
const OVERLAY_SPACE = '#86efac'
const OVERLAY_FIELD = '#fde68a'
const OVERLAY_PULSE = ['#93c5fd', '#a7f3d0', '#c4b5fd', '#fca5a5', '#fcd34d']
const OVERLAY_RESONANCE = ['#d8b4fe', '#e9d5ff']

// Node rows. Native scopes (root / space / field) carry fine-grained subtype
// colors imported from bloom-view; the generic `Pulse` and `Resonance` rows
// only ever match the coarser overlay palette, so they never double up with
// the subtype rows above (the two palettes are disjoint apart from Person).
const LEGEND_NODES: LegendItem[] = [
  { label: 'Your MeSpace', swatch: SPACE_COLOR.MeSpace, colors: [SPACE_COLOR.MeSpace] },
  {
    label: 'WeSpace',
    swatch: SPACE_COLOR.WeSpace,
    colors: [SPACE_COLOR.WeSpace, OVERLAY_SPACE],
  },
  {
    label: 'Field context',
    swatch: FIELD_COLOR.MeSpace,
    colors: [FIELD_COLOR.MeSpace, FIELD_COLOR.WeSpace, OVERLAY_FIELD],
  },
  { label: 'Goal', swatch: PULSE_COLOR.goal, colors: [PULSE_COLOR.goal] },
  { label: 'Resource', swatch: PULSE_COLOR.resource, colors: [PULSE_COLOR.resource] },
  { label: 'Story', swatch: PULSE_COLOR.story, colors: [PULSE_COLOR.story] },
  { label: 'Care', swatch: PULSE_COLOR.care, colors: [PULSE_COLOR.care] },
  { label: 'Core value', swatch: PULSE_COLOR.coreValue, colors: [PULSE_COLOR.coreValue] },
  { label: 'Pulse', swatch: OVERLAY_PULSE[0], colors: OVERLAY_PULSE },
  { label: 'Resonance', swatch: OVERLAY_RESONANCE[0], colors: OVERLAY_RESONANCE },
  { label: 'Person', swatch: PERSON_COLOR, colors: [PERSON_COLOR] },
]

// Edge rows. The rendered edge colors (imported from bloom-view) are
// translucent rgba — faint by design on the dark canvas — so the legend swatch
// uses a solid, AA-visible stand-in that reads on a light- or dark-mode glass
// panel. `Initiated by` (field view) and `Structure` (space/root view) never
// co-occur, so a shared slate swatch is unambiguous.
const LEGEND_EDGES: LegendItem[] = [
  { label: 'Resonance', swatch: '#a78bfa', colors: [RESONANCE_EDGE_COLOR] },
  { label: 'Initiated by', swatch: '#94a3b8', colors: [INITIATED_EDGE_COLOR] },
  { label: 'Structure', swatch: '#94a3b8', colors: [STRUCTURAL_EDGE_COLOR] },
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
          className="cursor-pointer flex items-center gap-2 h-9 px-2.5 sm:px-3 rounded-full gp-glass dark:gp-glass border border-gp-glass-border shadow-xl text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-ink-strong dark:hover:text-gp-ink-strong hover:bg-gp-ink-strong/10 dark:hover:bg-white/20 transition-all"
        >
          <span className="material-symbols-outlined text-lg leading-none">
            {open ? 'close' : 'legend_toggle'}
          </span>
          <span className="hidden sm:inline text-xs font-semibold">Legend</span>
        </button>

        {open && (
          <div className="w-48 max-w-[72vw] rounded-2xl gp-glass dark:gp-glass border border-gp-glass-border shadow-xl p-3 animate-fade-in">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gp-ink-muted dark:text-gp-ink-soft">
              Legend
            </p>

            {nodeRows.length > 0 && (
              <ul className="space-y-1.5">
                {nodeRows.map((row) => (
                  <LegendRow key={row.label} item={row} shape="dot" />
                ))}
              </ul>
            )}

            {edgeRows.length > 0 && (
              <>
                <div className="my-2.5 h-px bg-gp-ink-soft/20 dark:bg-white/10" />
                <ul className="space-y-1.5">
                  {edgeRows.map((row) => (
                    <LegendRow key={row.label} item={row} shape="line" />
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

const LegendRow: FC<{ item: LegendItem; shape: 'dot' | 'line' }> = ({
  item,
  shape,
}) => (
  <li className="flex items-center gap-2.5">
    <span
      aria-hidden
      className={cn(
        'shrink-0',
        shape === 'dot' ? 'size-3 rounded-full' : 'h-0.5 w-4 rounded-full'
      )}
      style={{ background: item.swatch }}
    />
    <span className="truncate text-xs font-medium text-gp-ink-strong dark:text-gp-ink-strong">
      {item.label}
    </span>
  </li>
)
