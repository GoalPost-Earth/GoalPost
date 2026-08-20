'use client'

import { useSyncExternalStore } from 'react'

/**
 * Whether the app is currently painting in dark mode.
 *
 * **Use this only for surfaces that cannot consume CSS variables.** Per the
 * design skill, tokens (`bg-gp-surface`, `text-gp-ink-muted`, `color-mix(...)`)
 * are how every normal surface flips between light and dark — branching on the
 * mode in component logic produces drift. The one case tokens can't cover is a
 * `<canvas>`: Neo4j NVL paints nodes and relationships from *resolved* color
 * strings handed to it in JS, so the Bloom palette has to be selected in code
 * (see `bloom-palette.ts`).
 *
 * Dark mode in GoalPost is a bare `dark` class on `<html>`, and two things can
 * set it — the `next-themes` provider in `layout.tsx` (pre-hydration, from the
 * system preference) and `StudioChrome`'s own toggle, which mutates the class
 * directly. Neither exposes a context both paths update, so we observe the
 * class attribute itself: that is the actual painted state regardless of which
 * one wrote it.
 *
 * The server snapshot is `false` (light) so the hydration render matches the
 * server HTML; React re-reads the live snapshot immediately after.
 */

const DARK_CLASS = 'dark'

function subscribe(onStoreChange: () => void): () => void {
  const observer = new MutationObserver(onStoreChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
  return () => observer.disconnect()
}

function getSnapshot(): boolean {
  return document.documentElement.classList.contains(DARK_CLASS)
}

function getServerSnapshot(): boolean {
  return false
}

export function useIsDarkMode(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
