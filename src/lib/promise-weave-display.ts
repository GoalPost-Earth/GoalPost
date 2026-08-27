/**
 * Display helpers shared by every PromiseWeave card surface (GOAL-343) — the
 * search result card and the Dashboard card view.
 *
 * They exist because `PromiseWeave.title` is OPTIONAL (kb/05-data-entities.md)
 * while every surface that names a weave has to show something, and because
 * kb/07 Rule 1 forbids ever falling through to a raw `weave_*` id. One
 * implementation keeps the two surfaces from drifting apart on either point.
 */

export interface DisplayableWeave {
  title?: string | null
  /** Pulses this weave WEAVES — the title fallback comes from here. */
  weaves?: Array<{ title?: string | null } | null> | null
  /** The Person this weave is WOVEN_FOR. */
  wovenFor?: Array<{ name?: string | null } | null> | null
}

/** Last-resort label. Never an id. */
export const WEAVE_FALLBACK_TITLE = 'Promise weave'

/**
 * Title for a weave: its own title, else the first woven pulse's title, else
 * the generic label. Blank-but-present strings count as absent, so a
 * whitespace-only title never renders an empty card.
 *
 * The woven-pulse step is a deliberate improvement on the "Promise weaves"
 * section of the FieldContext page (`field-context-sections.tsx`), which
 * still goes straight to the generic label — that section should adopt this
 * helper rather than this helper matching it.
 */
export function weaveDisplayTitle(weave: DisplayableWeave): string {
  const own = weave.title?.trim()
  if (own) return own
  const woven = (weave.weaves ?? [])
    .find((p) => p?.title?.trim())
    ?.title?.trim()
  return woven || WEAVE_FALLBACK_TITLE
}

/**
 * The person a weave is woven for, or null when it names no one. Callers
 * render their own "no one yet" copy rather than getting a placeholder name.
 */
export function weavePersonName(weave: DisplayableWeave): string | null {
  return (
    (weave.wovenFor ?? []).find((p) => p?.name?.trim())?.name?.trim() ?? null
  )
}
