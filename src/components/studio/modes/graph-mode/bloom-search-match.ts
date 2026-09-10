import type { Node } from '@neo4j-nvl/base'
import { nodeTypeLabel } from './bloom-type-registry'

/**
 * Canvas search — the pure half.
 *
 * Bloom paints bare coloured circles whose captions get clipped by the node
 * radius (kb/01-glossary.md, "Bloom Exploration"), so on a field with a
 * hundred-plus pulses and people the only way to find a specific node is to
 * pan around hunting for it. This module turns the canvas the viewer is
 * already looking at into something they can type at.
 *
 * Deliberately searches the PAINTED canvas and nothing else: no fetch, no
 * index, no widening past the type filters. Bloom's rule is that it is a pure
 * visual transform of the Apollo-cached data (ADR-011), and the same honesty
 * the visible-entities channel keeps — never claim to see something the canvas
 * isn't showing — applies to a result list. A node switched off in the legend
 * is off the canvas, so it is off this list too, and jumping to it would land
 * the viewport on nothing.
 *
 * Kept free of React so the ranking can be tested directly.
 */

export interface BloomSearchEntry {
  id: string
  /** The node's full caption — NVL clips it on canvas, this doesn't. */
  caption: string
  /** Painted colour, reused as the result-row swatch. */
  color?: string
  /** Decoded type row label ("Goal", "Person", …), or null when undecodable. */
  typeLabel: string | null
}

/**
 * How many rows the panel RENDERS. Not a cap on matching: the counter and the
 * next/previous arrows walk every hit, so a capped list can never make the
 * control lie about how many there are. A field canvas can carry hundreds of
 * nodes and past a couple of screenfuls a longer list is scroll, not signal —
 * but "50 of 120" has to say 120.
 */
export const BLOOM_SEARCH_RENDER_LIMIT = 100

/** Painted NVL nodes → searchable entries, in canvas order. */
export function toSearchEntries(nodes: Node[]): BloomSearchEntry[] {
  return nodes.map((node) => ({
    id: String(node.id),
    caption: typeof node.caption === 'string' ? node.caption : String(node.id),
    color: node.color,
    typeLabel: nodeTypeLabel(node),
  }))
}

/**
 * Match tiers, best first. Ranking by *where* the query lands means typing
 * "rob" surfaces "Robert Damashek" above "Problem framing" — a plain
 * substring filter buries the thing you were reaching for under incidental
 * mid-word hits.
 */
const EXACT = 0
const PREFIX = 1
const WORD_START = 2
const SUBSTRING = 3

function tierOf(caption: string, query: string): number | null {
  const c = caption.toLowerCase()
  if (c === query) return EXACT
  if (c.startsWith(query)) return PREFIX
  const at = c.indexOf(query)
  if (at === -1) return null
  // A word start is any position preceded by something that isn't a letter or
  // digit — space, hyphen, slash, quote, em dash. Covers "Robert Damashek",
  // "AI-native", "The Agora Series: Notes" alike.
  //
  // Probed against the LOWERCASED caption, the same string the offset came
  // from. `toLowerCase()` is not always length-preserving ('İ' lowercases to
  // two code units), so indexing the original with an offset found in the
  // lowercased copy can land on the wrong character.
  return /[^\p{L}\p{N}]/u.test(c[at - 1] ?? '') ? WORD_START : SUBSTRING
}

/**
 * Rank `entries` against `query`.
 *
 * An empty query returns the canvas as-is — the panel doubles as a browsable
 * index of what is on screen, which is the other half of "I want to find the
 * node I'm looking for". `limit` is uncapped by default so callers get the
 * true match count; the UI slices for rendering separately.
 *
 * Ties break on caption length (the shorter caption is the tighter match) and
 * then on canvas order, so the list never reshuffles between identical
 * queries.
 */
export function matchBloomNodes(
  entries: BloomSearchEntry[],
  query: string,
  limit: number = Number.POSITIVE_INFINITY
): BloomSearchEntry[] {
  const q = query.trim().toLowerCase()
  if (!q)
    return limit === Number.POSITIVE_INFINITY
      ? entries
      : entries.slice(0, limit)

  const scored: Array<{ entry: BloomSearchEntry; tier: number; at: number }> =
    []
  entries.forEach((entry, at) => {
    const tier = tierOf(entry.caption, q)
    if (tier !== null) scored.push({ entry, tier, at })
  })

  scored.sort(
    (a, b) =>
      a.tier - b.tier ||
      a.entry.caption.length - b.entry.caption.length ||
      a.at - b.at
  )

  return scored.slice(0, limit).map((s) => s.entry)
}
