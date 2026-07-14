/**
 * Drift guard for GOAL-288 — every node color either paint source can put on
 * the Bloom canvas must be decodable by a row in the legend.
 *
 * The canvas has two paint sources:
 *   - the native views (bloom-view.tsx) paint with `bloom-palette.ts`, and
 *   - the AI-Companion overlay (query_for_bloom → execute.ts) paints with
 *     `node-style.ts` (NODE_STYLE / UNKNOWN_NODE_STYLE).
 * The legend (LEGEND_NODES in bloom-legend.tsx) decodes rendered colors back
 * into labeled rows. GOAL-288 happened because the legend hand-mirrored the
 * overlay hexes and PromiseWeave's fuchsia was missing — assistant-rendered
 * weaves showed no legend row. This test fails the moment a palette entry is
 * added (or recolored) without a legend row that lists its color.
 */
import { LEGEND_NODES } from './bloom-legend'
import {
  NODE_STYLE,
  UNKNOWN_NODE_STYLE,
} from '@/lib/cypher-generator/node-style'
import {
  SPACE_COLOR,
  FIELD_COLOR,
  PULSE_COLOR,
  PERSON_COLOR,
  WEAVE_NODE_COLOR,
} from './bloom-palette'

/** Mirrors the component's own `norm` — legend matching is done on this. */
const norm = (c: string): string => c.toLowerCase().replace(/\s+/g, '')

/** Every color any LEGEND_NODES row can decode, normalized. */
const decodableColors = new Set(
  LEGEND_NODES.flatMap((row) => row.colors.map(norm))
)

/** Asserts with a message that names the undecodable label + color. */
function expectDecodable(source: string, color: string): void {
  if (!decodableColors.has(norm(color))) {
    throw new Error(
      `${source} paints "${color}" but no LEGEND_NODES row in bloom-legend.tsx ` +
        `lists that color — nodes of this type would render with no legend row ` +
        `(the GOAL-288 drift). Add "${color}" to an existing row's \`colors\` ` +
        `or add a new row for it.`
    )
  }
}

describe('Bloom legend decodes every paintable node color (GOAL-288 drift guard)', () => {
  describe('overlay palette (cypher-generator node-style)', () => {
    it.each(Object.entries(NODE_STYLE))(
      'NODE_STYLE.%s color has a legend row',
      (label, style) => {
        expectDecodable(`NODE_STYLE.${label}`, style.color)
      }
    )

    it('UNKNOWN_NODE_STYLE fallback color has a legend row', () => {
      expectDecodable('UNKNOWN_NODE_STYLE', UNKNOWN_NODE_STYLE.color)
    })
  })

  describe('native Bloom palette (bloom-palette)', () => {
    const nativeCases: Array<[source: string, color: string]> = [
      ...Object.entries(SPACE_COLOR).map(
        ([k, v]): [string, string] => [`SPACE_COLOR.${k}`, v]
      ),
      ...Object.entries(FIELD_COLOR).map(
        ([k, v]): [string, string] => [`FIELD_COLOR.${k}`, v]
      ),
      ...Object.entries(PULSE_COLOR).map(
        ([k, v]): [string, string] => [`PULSE_COLOR.${k}`, v]
      ),
      ['PERSON_COLOR', PERSON_COLOR],
      ['WEAVE_NODE_COLOR', WEAVE_NODE_COLOR],
    ]

    it.each(nativeCases)('%s has a legend row', (source, color) => {
      expectDecodable(source, color)
    })
  })
})
