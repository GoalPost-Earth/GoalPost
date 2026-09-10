'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * Find-in-page for the Dashboard half of the canvas.
 *
 * Bloom can be searched structurally — it publishes the nodes it painted, and
 * a hit is a node id. The Dashboard view has no such registry: it is whatever
 * route content Next.js rendered (cards, document rows, people lists, section
 * headings), and the thing the viewer is hunting for is *text on screen*. So
 * this searches the rendered text directly, which is also why it finds things
 * no entity index would — a document filename, a subtitle, a section heading.
 *
 * Two deliberate choices:
 *
 *  - **Highlighting never touches the DOM.** Hits are `Range`s handed to the
 *    CSS Custom Highlight API (`CSS.highlights` + `::highlight()` in
 *    globals.css). Wrapping matches in `<mark>` would mutate a tree React
 *    owns, and reconciliation would either fight the wrapper or blow it away
 *    on the next render. Browsers without the API paint nothing; scroll-to and
 *    the result list still work, so this degrades instead of breaking.
 *  - **The scan is on demand, not an index.** It runs per query against the
 *    live DOM, so it can never claim a hit on content that has since
 *    re-rendered away. Same honesty rule Bloom's half follows.
 */

export interface TextFindMatch {
  /** Stable within one scan — index-derived, since a text hit has no id. */
  key: string
  /** The hit with a little surrounding text, for the result list. */
  snippet: string
  /** Nearest heading above the hit, when there is one. */
  section: string | null
}

/** Shared empty result, so an inactive query never forces a re-render. */
const NO_MATCHES: TextFindMatch[] = []

const HIGHLIGHT_ALL = 'gp-find'
const HIGHLIGHT_ACTIVE = 'gp-find-active'

/** Characters of context to keep either side of a hit in the list snippet. */
const SNIPPET_PAD = 32

/**
 * Ranges the browser can style without a DOM mutation. Accessed through casts
 * rather than a global `declare` so this stays a plain module and doesn't
 * augment lib types the rest of the app shares.
 */
interface HighlightLike {
  clear?: () => void
}
type HighlightCtor = new (...ranges: Range[]) => HighlightLike

function highlightRegistry(): Map<string, HighlightLike> | null {
  if (typeof CSS === 'undefined') return null
  const registry = (
    CSS as unknown as { highlights?: Map<string, HighlightLike> }
  ).highlights
  return registry ?? null
}

function highlightCtor(): HighlightCtor | null {
  const ctor = (globalThis as unknown as { Highlight?: HighlightCtor })
    .Highlight
  return typeof ctor === 'function' ? ctor : null
}

/** Skip anything the viewer can't read: decoration, off-screen text, chrome. */
function isSearchableTextNode(node: Text): boolean {
  if (!node.nodeValue || !node.nodeValue.trim()) return false
  const el = node.parentElement
  if (!el) return false
  if (el.closest('script, style, [aria-hidden="true"], .sr-only')) return false
  // A collapsed section or a `visibility:hidden` subtree is in the document
  // but not on screen; jumping to it would scroll to nothing. The canvas host
  // hides the whole Dashboard subtree that way while Bloom is up.
  if (typeof el.checkVisibility === 'function') {
    return el.checkVisibility({
      visibilityProperty: true,
      contentVisibilityAuto: true,
    } as never)
  }
  return el.offsetParent !== null
}

/**
 * The nearest heading *above* a hit, walking up and back the way a reader
 * would. Gives each result somewhere to belong ("Uploaded documents") without
 * guessing — only headings that genuinely precede the hit are considered.
 */
function precedingHeading(from: Node, root: HTMLElement): string | null {
  let node: Node | null = from
  while (node && node !== root) {
    let sibling: Element | null =
      (node as Element).previousElementSibling ?? null
    while (sibling) {
      const heading = sibling.matches?.('h1, h2, h3, h4, h5, h6')
        ? sibling
        : (sibling.querySelector?.('h1, h2, h3, h4, h5, h6') ?? null)
      const text = heading?.textContent?.trim()
      if (text) return text.length > 48 ? `${text.slice(0, 48)}…` : text
      sibling = sibling.previousElementSibling
    }
    node = node.parentNode
  }
  return null
}

function buildSnippet(value: string, at: number, length: number): string {
  const start = Math.max(0, at - SNIPPET_PAD)
  const end = Math.min(value.length, at + length + SNIPPET_PAD)
  const body = value.slice(start, end).replace(/\s+/g, ' ').trim()
  return `${start > 0 ? '…' : ''}${body}${end < value.length ? '…' : ''}`
}

function scan(
  root: HTMLElement,
  query: string
): { ranges: Range[]; matches: TextFindMatch[] } {
  const needle = query.trim().toLowerCase()
  const ranges: Range[] = []
  const matches: TextFindMatch[] = []
  if (!needle) return { ranges, matches }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      isSearchableTextNode(node as Text)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  })

  let textNode = walker.nextNode() as Text | null
  while (textNode) {
    const value = textNode.nodeValue ?? ''
    const haystack = value.toLowerCase()
    let at = haystack.indexOf(needle)
    while (at !== -1) {
      const range = document.createRange()
      range.setStart(textNode, at)
      range.setEnd(textNode, at + needle.length)
      ranges.push(range)
      matches.push({
        key: `${matches.length}`,
        snippet: buildSnippet(value, at, needle.length),
        section: precedingHeading(textNode, root),
      })
      at = haystack.indexOf(needle, at + needle.length)
    }
    textNode = walker.nextNode() as Text | null
  }

  return { ranges, matches }
}

export interface DashboardTextFind {
  matches: TextFindMatch[]
  /** Scroll hit `index` into view and paint it as the active one. */
  goTo: (index: number) => void
  /** Drop every highlight. Safe to call when nothing is painted. */
  clear: () => void
}

export function useDashboardTextFind(
  rootRef: React.RefObject<HTMLElement | null>,
  query: string,
  enabled: boolean
): DashboardTextFind {
  const [matches, setMatches] = useState<TextFindMatch[]>(NO_MATCHES)
  const rangesRef = useRef<Range[]>([])

  const clear = useCallback(() => {
    const registry = highlightRegistry()
    registry?.delete(HIGHLIGHT_ALL)
    registry?.delete(HIGHLIGHT_ACTIVE)
    rangesRef.current = []
  }, [])

  const runScan = useCallback(() => {
    const root = rootRef.current
    const active = enabled && root !== null && query.trim().length > 0
    const { ranges, matches: found } = active
      ? scan(root, query)
      : { ranges: [] as Range[], matches: NO_MATCHES }

    rangesRef.current = ranges

    const registry = highlightRegistry()
    const Ctor = highlightCtor()
    // The active hit is re-established by the next `goTo`; leaving the old one
    // painted would mark a position in a result set that no longer exists.
    registry?.delete(HIGHLIGHT_ACTIVE)
    if (registry && Ctor && ranges.length > 0) {
      registry.set(HIGHLIGHT_ALL, new Ctor(...ranges))
    } else {
      registry?.delete(HIGHLIGHT_ALL)
    }

    setMatches(found)
  }, [rootRef, query, enabled])

  // Scan when the query (already debounced by the caller) changes.
  //
  // This is the effect exception the rule's own guidance names: the hook is
  // synchronising React state with an EXTERNAL system — the live DOM — which
  // can only be read after the render that produced it.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- DOM scan result; the rendered DOM is the external system this hook synchronises with
    runScan()
  }, [runScan])

  // …and again whenever the page changes underneath us.
  //
  // This is not belt-and-braces, it is the load-bearing half. Sections reveal
  // their matching rows in response to the SAME query, but they learn about it
  // through a context set in an effect — so their reveal lands a render AFTER
  // the scan above has already run and concluded the page holds nothing. That
  // is precisely the "0/0 for a row that is right there" bug.
  //
  // Observing the DOM covers it without either side knowing about the other,
  // and covers everything else that arrives late too — a lazy list, a settling
  // refetch. Safe from feedback: highlighting paints through the CSS Custom
  // Highlight API and scrolling moves the viewport, so neither mutates the
  // tree we are watching. Coalesced onto one frame so a burst of mutations
  // costs a single scan.
  useEffect(() => {
    const root = rootRef.current
    if (!enabled || !root || !query.trim()) return
    let frame = 0
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(runScan)
    })
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    })
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [rootRef, enabled, query, runScan])

  // Highlights live on a global registry, so they have to be torn down when
  // the control unmounts or the view flips away — otherwise a stale paint
  // outlives the search that produced it.
  useEffect(() => clear, [clear])

  const goTo = useCallback((index: number) => {
    const range = rangesRef.current[index]
    if (!range) return
    const registry = highlightRegistry()
    const Ctor = highlightCtor()
    if (registry && Ctor) registry.set(HIGHLIGHT_ACTIVE, new Ctor(range))
    // Scroll the element that CONTAINS the hit: a Range has no
    // scrollIntoView of its own, and its parent is the smallest thing that
    // reliably has one.
    const target =
      range.startContainer.parentElement ??
      (range.startContainer as HTMLElement | null)
    target?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [])

  return useMemo(() => ({ matches, goTo, clear }), [matches, goTo, clear])
}
