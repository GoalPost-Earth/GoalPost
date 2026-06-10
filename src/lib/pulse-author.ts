/**
 * Pulse authorship helpers.
 *
 * The canonical "who made this pulse" edge in the graph is `INITIATED_BY`
 * (exposed in GraphQL as `initiatedBy`). `createdBy` is a legacy alias that is
 * still queried as a fallback for any nodes that only carry the older edge —
 * see the FieldPulse interface in `schema.gql` and ADR notes in kb/05.
 *
 * Every surface that shows a pulse's author should resolve it through these
 * helpers so attribution is consistent (and gracefully labels unattributed
 * pulses) everywhere a pulse appears.
 */

export type PulseAuthorLike = {
  id?: string | null
  name?: string | null
  firstName?: string | null
  lastName?: string | null
}

export type PulseWithAuthor<T extends PulseAuthorLike = PulseAuthorLike> = {
  initiatedBy?: T[] | null
  createdBy?: T[] | null
}

/** Human-readable display name for a person, with a defensive fallback. */
export function personDisplayName(person?: PulseAuthorLike | null): string {
  if (!person) return 'Unattributed'
  const name = (person.name ?? '').trim()
  if (name) return name
  const composed = `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim()
  return composed || 'Unattributed'
}

/**
 * Resolve the canonical author of a pulse: prefer `initiatedBy`, fall back to
 * the legacy `createdBy` alias. Returns `null` for pulses with no creator edge
 * (callers should render an "Unattributed" affordance).
 */
export function resolvePulseAuthor<T extends PulseAuthorLike>(
  pulse?: PulseWithAuthor<T> | null
): T | null {
  if (!pulse) return null
  return pulse.initiatedBy?.[0] ?? pulse.createdBy?.[0] ?? null
}
