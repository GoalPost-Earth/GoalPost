/**
 * PromiseWeave lifecycle — shared by the field-context section, the create/edit
 * modal, and the entity-info drawer so the three cannot drift on what a status
 * means or how it is spelled.
 *
 * Statuses are stored lowercase on the node, matching ResonanceLink's `status`
 * (`pending` / `confirmed` / `rejected`) rather than the uppercase convention
 * Document ingest uses. See kb/04-state-machines.md.
 *
 * The starting-point weaves the prod→dev migration built predate the lifecycle
 * and carry whatever the legacy CarePoint's status was, verbatim and
 * inconsistently cased — dev currently holds `"Active"` (5), `"Inactive"` (3)
 * and `"active"` (1). So:
 *
 * - Comparison is case-insensitive, and `inactive` is a recognised legacy
 *   alias for `dissolved`.
 * - A missing status reads as `active`, never as `proposed` — otherwise every
 *   migrated care point would sit behind a confirmation gate it never had.
 * - An unrecognised value is shown **verbatim** by `getWeaveStatusLabel`
 *   rather than forced to "Active". Only `proposed` gates, so classifying an
 *   unknown value as `active` is safe for logic while a made-up label would
 *   quietly lie to the member about a legacy state.
 */

export const WEAVE_STATUS = {
  /** AI discovery proposed it; a member must confirm before it counts. */
  PROPOSED: 'proposed',
  /** Live — authored by a member, or a proposal that was confirmed. */
  ACTIVE: 'active',
  /** The promise it holds has been kept. */
  FULFILLED: 'fulfilled',
  /** Withdrawn, or a proposal a member declined. */
  DISSOLVED: 'dissolved',
} as const

export type WeaveStatus = (typeof WEAVE_STATUS)[keyof typeof WEAVE_STATUS]

export const WEAVE_ORIGIN = {
  /** Authored by a member from a field context. */
  USER: 'user',
  /** Proposed by AI discovery, pending confirmation. */
  AI: 'ai',
} as const

export type WeaveOrigin = (typeof WEAVE_ORIGIN)[keyof typeof WEAVE_ORIGIN]

/**
 * Canonical status for LOGIC (gating, styling). Null/unrecognised reads as
 * `active` — see the module note. Use `getWeaveStatusLabel` for display, which
 * preserves a legacy value instead of renaming it.
 */
export function normalizeWeaveStatus(status?: string | null): WeaveStatus {
  const value = status?.trim().toLowerCase()
  switch (value) {
    case WEAVE_STATUS.PROPOSED:
    case WEAVE_STATUS.ACTIVE:
    case WEAVE_STATUS.FULFILLED:
    case WEAVE_STATUS.DISSOLVED:
      return value
    // Legacy CarePoint status carried through by the migration.
    case 'inactive':
      return WEAVE_STATUS.DISSOLVED
    default:
      return WEAVE_STATUS.ACTIVE
  }
}

/** True when the weave is waiting on a member's confirm/dismiss decision. */
export function isAwaitingReview(status?: string | null): boolean {
  return normalizeWeaveStatus(status) === WEAVE_STATUS.PROPOSED
}

/**
 * Display label. A lifecycle status gets its canonical label; a legacy value
 * (`Inactive`, or anything else the migration carried through) is shown as-is,
 * capitalised, rather than renamed into a lifecycle state it never meant. The
 * muted styling from `getWeaveStatusClass` already conveys "not live", so the
 * badge can stay literal.
 */
export function getWeaveStatusLabel(status?: string | null): string {
  const raw = status?.trim()
  const value = raw?.toLowerCase()
  switch (value) {
    case WEAVE_STATUS.PROPOSED:
      return 'Proposed'
    case WEAVE_STATUS.FULFILLED:
      return 'Fulfilled'
    case WEAVE_STATUS.DISSOLVED:
      return 'Dissolved'
    case WEAVE_STATUS.ACTIVE:
      return 'Active'
    default:
      // Null/blank is the migration default and reads as Active; anything
      // else is a legacy value we surface verbatim.
      return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : 'Active'
  }
}

/**
 * Badge classes per status. Tinted from `gp-*` tokens via `color-mix` in the
 * Tailwind arbitrary values so each one re-derives under every theme and in
 * both light and dark.
 */
export function getWeaveStatusClass(status?: string | null): string {
  switch (normalizeWeaveStatus(status)) {
    case WEAVE_STATUS.PROPOSED:
      return 'border-gp-accent-glow/40 bg-gp-accent-glow/10 text-gp-ink-strong dark:text-white'
    case WEAVE_STATUS.FULFILLED:
      return 'border-gp-resource/40 bg-gp-resource/10 text-gp-ink-strong dark:text-white'
    case WEAVE_STATUS.DISSOLVED:
      return 'border-gp-glass-border bg-gp-glass-bg text-gp-ink-muted dark:text-gp-ink-soft'
    default:
      return 'border-gp-primary/30 bg-gp-primary/10 text-gp-primary'
  }
}

/**
 * Where the weave came from, for the drawer's provenance line. A null origin
 * means it was built by the prod→dev migration rather than by a person or by
 * discovery (GOAL-266's starting point).
 */
export function getWeaveOriginLabel(origin?: string | null): string {
  switch (origin?.trim().toLowerCase()) {
    case WEAVE_ORIGIN.USER:
      return 'Woven by a member'
    case WEAVE_ORIGIN.AI:
      return 'Proposed by the assistant'
    default:
      return 'Carried over from a migrated care point'
  }
}
