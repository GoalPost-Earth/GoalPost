'use client'

import { useMemo, useState, type FC } from 'react'
import type { Node, Relationship } from '@neo4j-nvl/base'
import { cn } from '@/lib/utils'
import { useIsDarkMode } from '@/hooks'
import {
  countNodeTypes,
  countRelationshipTypes,
  BLOOM_NODE_TYPES,
  BLOOM_RELATIONSHIP_TYPES,
  type BloomTypeRow,
} from './bloom-type-registry'
import type { BloomTypeFilters } from './use-bloom-type-filters'

/**
 * Scope-aware legend for the Bloom canvas — and, since GOAL-350, the canvas's
 * type filter.
 *
 * Bloom paints native NVL nodes as bare coloured circles (caption + colour +
 * size only — see bloom-view.tsx), so the colour is the *only* thing that
 * tells a Goal apart from a Person. Per the "no type tags on Bloom captions"
 * convention this legend is where those colours get decoded — out of the way
 * in a collapsible chip rather than baked into every node label.
 *
 * It derives its rows from the exact `nodes` / `relationships` arrays the
 * canvas is rendering, so a swatch shows only when a node/edge of that colour
 * is actually on screen. That makes it scope-aware for free — the root view
 * shows MeSpace/WeSpace/Person, a field view shows the pulse subtypes +
 * resonance edges, etc. — and keeps it permanently in sync with the paint.
 *
 * GOAL-350 turns each of those rows into a switch. Because the rows were
 * already computed from the live canvas, the toggle list is too: a node or
 * edge type added later shows up as a control with no work here, and each
 * scope offers exactly the types it renders. The descriptor tables and the
 * filter transform they drive live in `bloom-type-registry.ts`; this file is
 * only the control surface.
 *
 * Rows are derived from the UNFILTERED canvas (`bloom-view` passes what it
 * built, not what it painted), so a type you switch off keeps its row — and
 * its way back on — instead of vanishing along with its nodes.
 */

export const BloomLegend: FC<{
  /** The canvas BEFORE type filtering — see the note above. */
  nodes: Node[]
  relationships: Relationship[]
  filters: BloomTypeFilters
}> = ({ nodes, relationships, filters }) => {
  const [open, setOpen] = useState(false)
  const isDark = useIsDarkMode()
  const { hidden, toggle, showAll } = filters

  const { nodeRows, edgeRows, counts } = useMemo(() => {
    // Only types this canvas actually holds get a row. A legend of mostly
    // zeroes is a wall of dead entries that pushes the rows that matter off
    // screen — and on a canvas, a row you cannot act on reads as a control
    // that is broken rather than as information.
    //
    // GOAL-362 switched presence from the registry's colour index to these
    // COUNTS. Same result for every ordinary type, and strictly more accurate
    // for the registry's one known colour collision (Organization shares the
    // WeSpace field tint): a shadowed row can never be resolved back from a
    // painted node, so it counts 0 and is now correctly absent rather than
    // offered as a switch that does nothing.
    //
    // Counted off the UNFILTERED arrays, so the number beside a label keeps
    // saying how much of that type the canvas holds while the type is switched
    // off. A count read off the paint would read 0 exactly when the viewer
    // most needs to know what is behind the switch they just flipped.
    const counts = new Map([
      ...countNodeTypes(nodes),
      ...countRelationshipTypes(relationships),
    ])
    const present = (row: { key: string }) => (counts.get(row.key) ?? 0) > 0
    return {
      nodeRows: BLOOM_NODE_TYPES.filter(present),
      edgeRows: BLOOM_RELATIONSHIP_TYPES.filter(present),
      counts,
    }
  }, [nodes, relationships])

  // Every listed row is a type this canvas holds, so a hidden one is always a
  // filter the viewer actually set.
  const hiddenCount = useMemo(
    () =>
      [...nodeRows, ...edgeRows].filter((row) => hidden.has(row.key)).length,
    [nodeRows, edgeRows, hidden]
  )

  // Nothing on the canvas to decode → no legend (loading / empty states).
  if (nodeRows.length === 0 && edgeRows.length === 0) return null

  const panelId = 'bloom-legend-panel'

  return (
    // Sits clear of the bottom-centre action bar, which shares this corner.
    // The bar is `inset-x-0 ... justify-center` (canvas-action-bar.tsx) and
    // wraps, so on a narrow canvas — or any canvas showing the Suggestions
    // pill — it becomes a two- or three-row block spanning nearly the full
    // width, and its leftmost pill lands on top of this chip. A fixed offset
    // cannot solve that: it has to clear whatever the bar currently measures.
    //
    // So the bar publishes its measured height as `--gp-canvas-bar-h` on the
    // container that parents both of us (canvas-host), and this offset is that
    // height plus the bar's own 1.5rem bottom inset plus a 0.75rem gap. The
    // 3.25rem fallback is a one-row bar, which is what renders for the frame
    // before the first measurement. flex-col-reverse keeps the chip at the
    // bottom and grows the panel upward.
    <div className="pointer-events-none absolute left-3 z-30 sm:left-4 bottom-[calc(1.5rem+var(--gp-canvas-bar-h,3.25rem)+0.75rem)]">
      <div className="pointer-events-auto flex flex-col-reverse items-start gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={
            open
              ? 'Hide legend and type filters'
              : hiddenCount > 0
                ? `Show legend and type filters — ${hiddenCount} ${
                    hiddenCount === 1 ? 'type' : 'types'
                  } hidden`
                : 'Show legend and type filters'
          }
          title={open ? 'Hide legend' : 'Legend and type filters'}
          className={cn(
            'gp-glass-hover cursor-pointer flex items-center gap-2 h-9 px-2.5 sm:px-3',
            'rounded-full gp-glass border shadow-xl',
            // Tinted while a filter is on, so a canvas that is hiding
            // something never looks like a canvas that has nothing.
            hiddenCount > 0
              ? 'border-gp-primary/40 text-gp-primary'
              : 'border-gp-glass-border text-gp-ink-muted hover:text-gp-primary'
          )}
        >
          <span className="material-symbols-outlined text-lg leading-none">
            {open ? 'close' : 'legend_toggle'}
          </span>
          <span className="hidden sm:inline text-xs font-semibold">Legend</span>
          {hiddenCount > 0 && (
            <span
              aria-hidden
              className="shrink-0 rounded-full bg-gp-primary/15 px-1.5 text-[10px] font-bold tabular-nums text-gp-primary"
            >
              {hiddenCount}
            </span>
          )}
        </button>

        {open && (
          <div
            id={panelId}
            className="w-52 max-w-[72vw] rounded-2xl gp-glass border border-gp-glass-border shadow-xl p-3 animate-fade-in"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="min-w-0 truncate text-[10px] font-bold uppercase tracking-[0.18em] text-gp-ink-muted">
                Legend
              </p>
              {hiddenCount > 0 && (
                <button
                  type="button"
                  onClick={showAll}
                  className="gp-menu-item shrink-0 cursor-pointer rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gp-primary"
                >
                  Show all
                </button>
              )}
            </div>

            {/* Caps the list on a phone: the legend is a floating canvas
                overlay, so a field with every type present has to scroll
                rather than grow up into the header chrome. */}
            <div className="max-h-[45vh] overflow-y-auto overscroll-contain sm:max-h-[60vh]">
              {nodeRows.length > 0 && (
                <ul className="space-y-0.5">
                  {nodeRows.map((row) => (
                    <TypeToggleRow
                      key={row.key}
                      row={row}
                      shape="dot"
                      isDark={isDark}
                      count={counts.get(row.key) ?? 0}
                      visible={!hidden.has(row.key)}
                      onToggle={toggle}
                    />
                  ))}
                </ul>
              )}

              {edgeRows.length > 0 && (
                <>
                  <div className="my-2 h-px bg-gp-glass-border" />
                  <ul className="space-y-0.5">
                    {edgeRows.map((row) => (
                      <TypeToggleRow
                        key={row.key}
                        row={row}
                        shape="line"
                        isDark={isDark}
                        count={counts.get(row.key) ?? 0}
                        visible={!hidden.has(row.key)}
                        onToggle={toggle}
                      />
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * One type, as a switch.
 *
 * `role="switch"` + `aria-checked` is what makes this a real control rather
 * than a colour chip: assistive tech announces the type name and whether it is
 * on, which a swatch alone cannot carry. The swatch stays `aria-hidden` — it
 * is decoration next to the name, not the name itself. `.gp-menu-item` gives
 * the row its hover AND keyboard-focus highlight, re-derived from the themed
 * primary so the affordance survives every theme and both modes.
 */
const TypeToggleRow: FC<{
  row: BloomTypeRow
  shape: 'dot' | 'line'
  isDark: boolean
  /** How many of this type the canvas holds, filtered or not. */
  count: number
  visible: boolean
  onToggle: (key: string) => void
}> = ({ row, shape, isDark, count, visible, onToggle }) => (
  <li>
    <button
      type="button"
      role="switch"
      aria-checked={visible}
      onClick={() => onToggle(row.key)}
      title={
        visible
          ? `Hide ${row.label} on the canvas`
          : `Show ${row.label} on the canvas`
      }
      // The count rides in the accessible name rather than as a separate
      // element: a screen reader should hear "Resource, 24, on" as one switch,
      // not trip over a bare number between the label and the state.
      aria-label={`${row.label} — ${count} on this canvas`}
      className="gp-menu-item flex w-full cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1 text-left"
    >
      <span
        aria-hidden
        className={cn(
          'shrink-0 transition-opacity',
          shape === 'dot' ? 'size-3 rounded-full' : 'h-0.5 w-4 rounded-full',
          // Dimmed rather than removed: the colour still has to be readable
          // while off, or you cannot tell which type you are switching back on.
          visible ? 'opacity-100' : 'opacity-30'
        )}
        style={{ background: isDark ? row.swatch.dark : row.swatch.light }}
      />
      <span
        className={cn(
          'min-w-0 flex-1 truncate text-xs font-medium',
          visible ? 'text-gp-ink-strong' : 'text-gp-ink-muted line-through'
        )}
      >
        {row.label}
      </span>
      {/* Volume, not just vocabulary — "Person" tells you the pink circles are
          people, "Person 68" tells you why the canvas looks the way it does,
          and tells you what you are hiding before you flip the switch.
          `tabular-nums` keeps the column from jittering as counts change. */}
      <span
        aria-hidden
        className={cn(
          'shrink-0 text-[10px] font-bold tabular-nums',
          visible ? 'text-gp-ink-muted' : 'text-gp-ink-soft'
        )}
      >
        {count}
      </span>
      <span
        aria-hidden
        className={cn(
          'material-symbols-outlined shrink-0 text-base leading-none',
          visible ? 'text-gp-ink-muted' : 'text-gp-ink-soft'
        )}
      >
        {visible ? 'visibility' : 'visibility_off'}
      </span>
    </button>
  </li>
)
