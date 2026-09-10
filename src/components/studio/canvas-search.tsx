'use client'

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FC,
  type KeyboardEvent,
  type RefObject,
} from 'react'
import { useBloomSearch, type BloomSearchScope } from './bloom-search-context'
import { matchBloomNodes } from './modes/graph-mode/bloom-search-match'
import { useDashboardTextFind } from './use-dashboard-text-find'
import { CanvasSearchBar } from './canvas-search-bar'
import { useFindQuery } from './find-query-context'
import {
  CanvasSearchResults,
  type CanvasSearchHit,
} from './canvas-search-results'
import type { CanvasView } from './studio-canvas-context'

/**
 * Canvas find — locate something on the canvas and go to it.
 *
 * One control, two backends, because the two canvas views hold entirely
 * different things:
 *
 *  - **Bloom** paints bare coloured circles with captions clipped by the node
 *    radius, so a hit is a *node* and going to it means centring the viewport
 *    and haloing it. Matches come from the registry `BloomView` publishes.
 *  - **Dashboard** is route content — cards, document rows, headings — so a
 *    hit is *text on screen* and going to it means scrolling it into view and
 *    highlighting the run. Matches come from a live scan of the rendered DOM
 *    (`use-dashboard-text-find`), which is why it also finds things no entity
 *    index carries, like a filename or a subtitle.
 *
 * Both share the find-bar shape the two backends make possible: an occurrence
 * counter, previous/next arrows that step through every hit, and a result list
 * that names them. Typing updates the counter, the highlights and the list;
 * moving the viewport is always an explicit act (Enter, the arrows, or a click
 * on a row) EXCEPT for the jump to the first hit once a query settles, so a
 * highlight is never painted somewhere the viewer can't see it.
 *
 * Distinct from the ⌘K pill in the studio chrome, which searches the whole
 * platform and navigates away. This one never leaves the canvas and never
 * fetches (ADR-011).
 */

const SCOPE_NOUN: Record<BloomSearchScope, string> = {
  field: 'this field context',
  space: 'this space',
  root: 'your spaces',
  overlay: 'this custom view',
}

/** Let typing settle before scanning the DOM / flying the canvas around. */
const QUERY_DEBOUNCE_MS = 220

interface CanvasSearchProps {
  view: CanvasView
  /** The Dashboard view's scroll container — the DOM the text find scans. */
  dashboardRootRef: RefObject<HTMLElement | null>
}

export const CanvasSearch: FC<CanvasSearchProps> = ({
  view,
  dashboardRootRef,
}) => {
  const { scope, entries, focusNode } = useBloomSearch()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const restoreFocusRef = useRef(false)
  const listId = useId()

  const isBloom = view === 'bloom'
  const noun = isBloom ? SCOPE_NOUN[scope] : 'this page'

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedQuery(query),
      QUERY_DEBOUNCE_MS
    )
    return () => window.clearTimeout(timer)
  }, [query])

  // --- the two backends -----------------------------------------------------

  const bloomHits = useMemo(
    () => (isBloom ? matchBloomNodes(entries, debouncedQuery) : []),
    [isBloom, entries, debouncedQuery]
  )
  const textFind = useDashboardTextFind(
    dashboardRootRef,
    open && !isBloom ? debouncedQuery : '',
    open && !isBloom
  )

  // Broadcast the settled query to the page. Sections subscribe and reveal
  // their matching rows in place, so by the time the DOM scan below runs, a
  // row that was folded behind "Show all" is simply on the page and behaves
  // like any other hit. Nothing here has to know those sections exist.
  const { setQuery: setFindQuery } = useFindQuery()
  const broadcastQuery = open && !isBloom ? debouncedQuery : ''
  useEffect(() => {
    setFindQuery(broadcastQuery)
  }, [broadcastQuery, setFindQuery])

  // Clear the broadcast when the control goes away entirely, so a page-wide
  // reveal can't outlive the search that asked for it.
  useEffect(() => () => setFindQuery(''), [setFindQuery])

  /** One shape for the list, whichever backend produced it. */
  const hits = useMemo<CanvasSearchHit[]>(
    () =>
      isBloom
        ? bloomHits.map((hit) => ({
            key: hit.id,
            label: hit.caption,
            sublabel: hit.typeLabel,
            color: hit.color,
          }))
        : textFind.matches.map((match) => ({
            key: match.key,
            label: match.snippet,
            sublabel: match.section,
            color: undefined as string | undefined,
          })),
    [isBloom, bloomHits, textFind.matches]
  )

  // Stable across renders (useCallback with no deps in the hook), unlike the
  // memo object it hangs off — so `close` doesn't get a new identity every
  // time the match list changes and re-register its listeners.
  const clearTextFind = textFind.clear

  const goToRef = useRef<(index: number) => void>(() => {})
  goToRef.current = (index: number) => {
    if (isBloom) {
      const hit = bloomHits[index]
      if (hit) focusNode(hit.id)
      return
    }
    textFind.goTo(index)
  }

  // --- navigation -----------------------------------------------------------

  // Read the current index off a ref rather than a setState updater: an
  // updater must stay pure, and React runs it twice under StrictMode — which
  // would fire the jump twice per press.
  const activeIndexRef = useRef(0)
  activeIndexRef.current = activeIndex

  const step = useCallback(
    (delta: number) => {
      if (hits.length === 0) return
      const next = (activeIndexRef.current + delta + hits.length) % hits.length
      setActiveIndex(next)
      goToRef.current(next)
      inputRef.current?.focus()
    },
    [hits.length]
  )

  const select = useCallback((index: number) => {
    setActiveIndex(index)
    goToRef.current(index)
    inputRef.current?.focus()
  }, [])

  // A settled query lands you on its first hit. Without this the Dashboard
  // could paint a highlight below the fold and Bloom could match a node that
  // is off-viewport — a hit you cannot see is not a hit you have found.
  const settledKey = `${debouncedQuery}|${hits.length}`
  const lastSettledRef = useRef<string | null>(null)
  useEffect(() => {
    if (!open) {
      lastSettledRef.current = null
      return
    }
    if (lastSettledRef.current === settledKey) return
    lastSettledRef.current = settledKey
    if (!debouncedQuery.trim() || hits.length === 0) return
    setActiveIndex(0)
    goToRef.current(0)
  }, [open, settledKey, debouncedQuery, hits.length])

  const close = useCallback(
    (restoreFocus: boolean) => {
      restoreFocusRef.current = restoreFocus
      setOpen(false)
      setQuery('')
      setDebouncedQuery('')
      setActiveIndex(0)
      clearTextFind()
      // Bloom's halo belongs to an open search. An empty id is the clear.
      if (isBloom) focusNode('')
    },
    [isBloom, focusNode, clearTextFind]
  )

  // Escape returns focus to the trigger so a keyboard user keeps their place
  // in the header. An outside click does not — the pointer has already moved
  // focus somewhere deliberate.
  useEffect(() => {
    if (open || !restoreFocusRef.current) return
    restoreFocusRef.current = false
    triggerRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as globalThis.Node)) {
        close(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, close])

  // Flipping the canvas view swaps the backend under the control; anything
  // matched against the old one is stale.
  useEffect(() => {
    if (open) close(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  useEffect(() => {
    if (!open) return
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      close(true)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      step(e.shiftKey ? -1 : 1)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      step(1)
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      step(-1)
    }
  }

  // Bloom with nothing painted has nothing to search. The Dashboard always
  // has text, so it always offers the control.
  if (isBloom && entries.length === 0) return null

  const hasQuery = debouncedQuery.trim().length > 0

  if (!open) {
    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setOpen(true)
          requestAnimationFrame(() => inputRef.current?.focus())
        }}
        aria-label={`Search within ${noun}`}
        title={`Search within ${noun}`}
        className="flex items-center justify-center size-7 rounded-md text-gp-ink-muted hover:text-gp-ink-strong hover:bg-gp-ink-strong/10 transition-colors cursor-pointer"
      >
        <span
          className="material-symbols-outlined text-[18px] leading-none"
          aria-hidden="true"
        >
          search
        </span>
      </button>
    )
  }

  return (
    <div ref={containerRef} className="relative flex items-center">
      <CanvasSearchBar
        inputRef={inputRef}
        listId={listId}
        noun={noun}
        isBloom={isBloom}
        query={query}
        onQueryChange={setQuery}
        onKeyDown={onKeyDown}
        hasQuery={hasQuery}
        matchCount={hits.length}
        activeIndex={activeIndex}
        onStep={step}
        onClose={() => close(true)}
      />

      <CanvasSearchResults
        listId={listId}
        listRef={listRef}
        isBloom={isBloom}
        noun={noun}
        query={debouncedQuery}
        hits={hits}
        activeIndex={activeIndex}
        onSelect={select}
      />
    </div>
  )
}
