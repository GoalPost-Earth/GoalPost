/**
 * Cypher fragments naming the rows that still need an embedding (GOAL-347).
 *
 * DELIBERATELY A LEAF MODULE: no imports, no side effects, nothing that touches
 * a driver or a provider. `scripts/backfill-pulse-embeddings.ts` targets a
 * database by promoting a chosen profile into `process.env` BEFORE importing
 * anything that reads it, so a shared constant it needs at the top of the file
 * must not drag the graph/LLM modules in behind it. Keeping these here means
 * that ordering is enforced by the module graph rather than by an invariant
 * someone has to remember.
 *
 * Both the nightly sweep and the one-off backfill script select with these, so
 * the population the script drains is by construction the population the cron
 * counts as outstanding.
 */

/**
 * Pulses awaiting an embedding.
 *
 * The filters mirror the invariants that make a row embeddable at all:
 * soft-deleted pulses (GOAL-319) are awaiting the purge cron and must never
 * cost an embedding call, and a pulse with neither content nor conversation
 * chunks has nothing to embed — the provider rejects empty input, so such a row
 * would fail, stay `embedding IS NULL`, and be re-selected first on every
 * subsequent run, burning the phase budget forever.
 *
 * Binds `p`. Note this is narrower than "every pulse without an embedding":
 * see `EmbeddingPhaseReport.remainingEmbeddable`.
 */
export const PULSES_NEEDING_EMBEDDING = `
      MATCH (p:FieldPulse)
      WHERE p.embedding IS NULL
        AND p.deletedAt IS NULL
        AND (trim(coalesce(p.content, '')) <> ''
             OR EXISTS { (p)-[:HAS_CHUNK]->(:ConversationChunk) })
`

/**
 * People awaiting an embedding. Two write paths depend on this sweep: document
 * ingest creates PersonPulses without an embedding, and `update_person` nulls
 * the embedding on a semantic edit (person-pulse-resolver.ts). Until they carry
 * one, those people are invisible to person vector search.
 *
 * The trim() filter skips nameless, contentless Person nodes — there is nothing
 * to embed and they would otherwise error on every run. Known gap (safe
 * direction): the filter checks name/description only, while the embedder can
 * also embed passions/fieldsOfCare/traits — a person whose ONLY content is
 * enriched arrays is never swept. Arrays can't be string-concatenated here, and
 * such nodes don't occur in practice (enrichment implies a named person).
 *
 * Binds `p`.
 */
export const PEOPLE_NEEDING_EMBEDDING = `
      MATCH (p:Person)
      WHERE p.embedding IS NULL
        AND trim(coalesce(p.name, '') + coalesce(p.firstName, '')
          + coalesce(p.lastName, '') + coalesce(p.description, '')) <> ''
`
