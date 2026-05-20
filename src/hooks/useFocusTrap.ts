'use client'

import { useEffect, type RefObject } from 'react'

/**
 * Selector for elements that can receive keyboard focus. Excludes
 * elements with negative tabindex (intentionally skipped) and disabled
 * controls. We also filter at runtime for visibility — display:none
 * elements still match the selector but shouldn't trap focus.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',')

function isVisible(el: HTMLElement) {
  return (
    el.offsetWidth > 0 ||
    el.offsetHeight > 0 ||
    el.getClientRects().length > 0
  )
}

/**
 * Traps Tab / Shift+Tab inside the referenced container while `active`
 * is true. On activation, focus moves to the first focusable inside the
 * container (or the container itself if nothing focusable is present).
 * On deactivation, focus returns to whichever element was focused
 * before the trap was installed.
 *
 * Used by modal drawers (EntityInfoDrawer, PersonPanel) to keep
 * keyboard users from tabbing into the dimmed canvas behind. Pair with
 * `role="dialog"` + `aria-modal="true"` so assistive tech recognizes
 * the same boundary.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean
) {
  useEffect(() => {
    if (!active) return
    const container = ref.current
    if (!container) return

    const previouslyFocused = document.activeElement as HTMLElement | null

    const focusables = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter(isVisible)

    // Defer one frame so children rendered conditionally on open have
    // mounted before we look for the first focusable.
    const raf = requestAnimationFrame(() => {
      const first = focusables()[0]
      if (first) {
        first.focus()
      } else {
        // Fallback: focus the container itself (requires tabIndex=-1 on
        // the host element so it's programmatically focusable).
        container.focus()
      }
    })

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const list = focusables()
      if (list.length === 0) {
        e.preventDefault()
        return
      }
      const first = list[0]
      const last = list[list.length - 1]
      const current = document.activeElement as HTMLElement | null

      // If focus has somehow escaped the container, pull it back in.
      if (!container.contains(current)) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
        return
      }

      if (e.shiftKey && current === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && current === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKeyDown)
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus()
      }
    }
    // `ref` is a stable RefObject — including it would cause React
    // Strict Mode's double-invoke to restore focus to whatever the first
    // cleanup focused (usually <body>), defeating the trigger-restore.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])
}
