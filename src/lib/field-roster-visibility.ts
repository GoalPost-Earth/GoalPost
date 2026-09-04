/**
 * GOAL-346: shared rule for which of a FieldContext's attached people belong
 * on the visible People roster.
 *
 * Document ingestion attaches every person it identifies to the field via
 * `HAS_PERSON` — the same edge that means "on this field's roster" — so after
 * a few uploads the roster is dominated by extracted names. In the demo every
 * roster was 100% extracted people with zero real members. Those people are
 * already surfaced under the Document they came from, so the roster hides
 * them and shows only people a human put there.
 *
 * This is deliberately a PRESENTATION-ONLY filter, applied client-side over
 * data the field surfaces already hold. Nothing here narrows the underlying
 * `HAS_PERSON` edge, because ten authorization and reach gates read it — most
 * critically the `PersonPrivateProfile` READ filter, for which this edge is a
 * PersonPulse's ONLY tie to a Space. Narrowing it server-side would blank
 * every extracted person's profile rather than merely tidy a list. The ingest
 * extractor also pre-loads the full roster to deduplicate against
 * (`field-context-roster.ts`), so filtering at the source would make
 * re-extracts mint duplicate people.
 *
 * Hiding keys off `EXTRACTED_FROM`, which ingestion has always written, and
 * `curatedPersonIds` only ever *un-hides*.
 *
 * A DATA MIGRATION IS REQUIRED — `scripts/backfill-curated-roster.js`. An
 * earlier version of this note claimed otherwise, on the reasoning that
 * hand-added people carry no `EXTRACTED_FROM`. That holds only at the instant
 * of deploy: `update_person` (`hitl.ts` ~1990) stamps `EXTRACTED_FROM` onto
 * people who ALREADY exist, so a member added by hand would be evicted from
 * the roster the first time any document happened to name them. The backfill
 * marks every pre-existing hand-added edge curated, after which an uncurated
 * edge reliably means "attached by ingestion" — which is what this rule
 * assumes.
 */

/** Minimal shape needed from a document — matches GET_DOCUMENTS_BY_FIELD_CONTEXT. */
export interface RosterDocument {
  extractedPeople?: { id: string }[] | null
}

/** Minimal shape needed from a roster person. */
export interface RosterPerson {
  id: string
}

/**
 * Ids of people who reached this field only because a document named them.
 * A person extracted from several documents appears once.
 */
export function extractedPersonIds(
  documents: readonly RosterDocument[] | null | undefined
): Set<string> {
  const ids = new Set<string>()
  for (const doc of documents ?? []) {
    // `doc?.` matches the same guard in `buildDocumentProvenanceLayer`. Not
    // reachable from today's call sites (both pass GraphQL result arrays,
    // which carry no null elements), but the two modules read the same shape
    // and should not disagree about how defensively they read it.
    for (const person of doc?.extractedPeople ?? []) {
      if (person?.id) ids.add(person.id)
    }
  }
  return ids
}

/**
 * Split a field's attached people into the ones the roster shows and the ones
 * it defers to the document list.
 *
 * `curatedPersonIds` wins over extraction: promoting someone through
 * `addPersonToFieldContext` marks their edge curated, and they return to the
 * roster while keeping their `EXTRACTED_FROM` provenance intact — promotion
 * is additive, it never rewrites where the person came from.
 *
 * Callers that cannot supply `documents` (a surface that doesn't load them)
 * get every attached person back, i.e. today's behaviour. That is the safe
 * direction to fail: an un-tidied list, never a person silently vanishing
 * from a surface that had no way to explain their absence.
 */
export function partitionFieldRoster<T extends RosterPerson>(
  people: readonly T[] | null | undefined,
  documents: readonly RosterDocument[] | null | undefined,
  curatedPersonIds: readonly string[] | null | undefined
): { roster: T[]; fromDocuments: T[] } {
  const attached = people ?? []
  if (!documents || documents.length === 0) {
    return { roster: [...attached], fromDocuments: [] }
  }

  const extracted = extractedPersonIds(documents)
  const curated = new Set(curatedPersonIds ?? [])

  const roster: T[] = []
  const fromDocuments: T[] = []
  for (const person of attached) {
    if (extracted.has(person.id) && !curated.has(person.id)) {
      fromDocuments.push(person)
    } else {
      roster.push(person)
    }
  }
  return { roster, fromDocuments }
}
