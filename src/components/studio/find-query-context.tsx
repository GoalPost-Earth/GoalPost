'use client'

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

/**
 * The query canvas find is currently looking for, broadcast to the page.
 *
 * The Dashboard half of canvas find scans the live DOM, which has one blind
 * spot: a `SectionList` renders only its first few rows and folds the rest
 * behind a modal, so searching for someone sitting at position twelve of
 * twenty-four found nothing — the page genuinely didn't contain them.
 *
 * The fix is to stop hiding them while a search is running. Sections subscribe
 * to this query and reveal their matching rows in place, so by the time the
 * find control scans the DOM the matches are simply *there*: they highlight,
 * they scroll to, they count, and previous/next walks them like any other hit.
 *
 * This is deliberately not a registry of hidden content that the find control
 * reads and then acts on. That version worked, but selecting a result yanked
 * the viewer into a modal — a big, disorienting move in response to a
 * keystroke. Revealing in place keeps the page the thing you are searching,
 * and keeps every result somewhere you can actually see.
 */

interface FindQueryContextValue {
  /** Settled query, or '' when the find control is closed or in Bloom. */
  query: string
  setQuery: (next: string) => void
}

const FindQueryContext = createContext<FindQueryContextValue | null>(null)

export function FindQueryProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('')
  const value = useMemo<FindQueryContextValue>(
    () => ({ query, setQuery }),
    [query]
  )
  return (
    <FindQueryContext.Provider value={value}>
      {children}
    </FindQueryContext.Provider>
  )
}

/** Safe outside the provider — no query, no-op setter. */
export function useFindQuery(): FindQueryContextValue {
  return useContext(FindQueryContext) ?? { query: '', setQuery: () => {} }
}
