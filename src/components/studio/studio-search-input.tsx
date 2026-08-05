'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FC,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

/**
 * Glass-pill search trigger in the studio chrome. Pushes to the existing
 * `/protected/search?q=…` route (which renders inside Dashboard mode) so the
 * full search experience is preserved.
 *
 * Below `md` the pill doesn't fit beside the breadcrumb and the rest of the
 * chrome controls, so it collapses to a round icon button — sized and styled
 * like its notification / theme siblings — that links straight to the search
 * page, which hosts its own full-width input. Search must stay reachable on
 * phones; hiding the pill outright left mobile with no entry point at all.
 *
 * Keyboard:
 * - Cmd/Ctrl+K from anywhere focuses the input.
 * - Enter submits the query.
 * - Escape blurs.
 */
export const StudioSearchInput: FC = () => {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')

  // Cmd/Ctrl+K → focus input. Guard against firing while the user is typing
  // inside another input (preserves text-area shortcuts).
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const isShortcut = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'
      if (!isShortcut) return
      // Never hijack the shortcut away from another editable surface. Below
      // `md` this branch now *navigates*, so without the guard a Ctrl+K while
      // composing in the chat panel or a pulse modal would discard the draft.
      const target = e.target as HTMLElement | null
      const isEditableTarget =
        target?.isContentEditable ||
        /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName ?? '')
      if (isEditableTarget && target !== inputRef.current) return
      e.preventDefault()
      // The pill is `hidden` (not unmounted) below `md`, so focusing the ref
      // there would silently do nothing while still swallowing the browser's
      // own Cmd/Ctrl+K. Send narrow viewports to the search page instead,
      // which hosts its own full-width input. Reading the media query inside
      // the handler (rather than into state) keeps this SSR- and
      // hydration-safe. Mirrors `studio-shell.tsx`'s breakpoint check.
      if (!window.matchMedia('(min-width: 768px)').matches) {
        router.push('/protected/search')
        return
      }
      inputRef.current?.focus()
      inputRef.current?.select()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router])

  const submit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      const q = value.trim()
      if (!q) {
        router.push('/protected/search')
        return
      }
      router.push(`/protected/search?q=${encodeURIComponent(q)}`)
    },
    [router, value]
  )

  const onInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      inputRef.current?.blur()
    }
  }

  return (
    <>
      <Link
        href="/protected/search"
        className="flex md:hidden size-10 shrink-0 items-center justify-center rounded-full bg-gp-surface-strong/40 dark:bg-gp-surface-dark/40 text-gp-ink-strong dark:text-gp-ink-strong hover:bg-gp-surface-strong/60 dark:hover:bg-gp-surface-dark/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gp-primary/50 transition-all"
        aria-label="Search"
      >
        <span
          className="material-symbols-outlined text-[20px]"
          aria-hidden="true"
        >
          search
        </span>
      </Link>
      <form
        onSubmit={submit}
        className="hidden md:flex items-center gap-2 rounded-full bg-gp-surface-strong/40 dark:bg-gp-surface-dark/40 px-3 py-1.5 transition-colors hover:bg-gp-surface-strong/60 dark:hover:bg-gp-surface-dark/60 focus-within:ring-2 focus-within:ring-gp-primary/50"
        role="search"
      >
        <span
          className="material-symbols-outlined text-[18px] text-gp-ink-muted dark:text-gp-ink-soft"
          aria-hidden="true"
        >
          search
        </span>
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onInputKey}
          placeholder="Search people, pulses, fields…"
          aria-label="Search"
          className="w-32 lg:w-56 bg-transparent text-sm text-gp-ink-strong dark:text-gp-ink-strong placeholder:text-gp-ink-soft dark:placeholder:text-gp-ink-soft outline-none"
        />
        <kbd className="hidden lg:inline-flex h-5 items-center gap-0.5 rounded border border-gp-glass-border bg-gp-surface-strong/50 dark:bg-gp-surface-dark/50 px-1.5 font-mono text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
          ⌘K
        </kbd>
      </form>
    </>
  )
}
