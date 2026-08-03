/**
 * Person embedding service
 * Generates a profile embedding for a Person from directory + profile fields.
 *
 * This is the lean, no-LLM counterpart to person-enricher.ts, meant for the
 * resonance cron's "embedding IS NULL" sweep. Two write paths depend on that
 * sweep existing for Persons: document ingest creates PersonPulses without an
 * embedding, and update_person deliberately nulls the embedding on semantic
 * edits (see person-pulse-resolver.ts). Since GOAL-318 the ingest-created gap
 * closes at upload time too — on-upload-discovery.ts runs the same sweep
 * scoped to the upload's context, so the cron is the safety net rather than
 * the only path.
 */

import { initGraph } from '../../../modules/graph'
import { getEmbeddingsProvider } from '../../llm/factory'

export interface PersonEmbeddingResult {
  personId: string
  embedding: number[]
}

interface PersonProfile {
  name?: string
  firstName?: string
  lastName?: string
  description?: string
  // Legacy/migrated nodes store these as plain strings; enricher writes arrays.
  passions?: string[] | string
  fieldsOfCare?: string[] | string
  traits?: string[] | string
}

function asText(value: string[] | string | undefined): string {
  if (!value) return ''
  return Array.isArray(value) ? value.join(', ') : value
}

/**
 * Build the bio text a Person's embedding is derived from.
 *
 * Deliberately excludes email: this sweep covers every Person (including
 * registered Users), and the embedding is a derived artifact that outlives
 * PII gates — semantic content only.
 */
function buildPersonBioText(person: PersonProfile): string {
  const name =
    person.name ||
    [person.firstName, person.lastName].filter(Boolean).join(' ')
  const lines = [name]
  if (person.description) lines.push(person.description)
  const passions = asText(person.passions)
  if (passions) lines.push(`Passions: ${passions}`)
  const fieldsOfCare = asText(person.fieldsOfCare)
  if (fieldsOfCare) lines.push(`Fields of Care: ${fieldsOfCare}`)
  const traits = asText(person.traits)
  if (traits) lines.push(`Traits: ${traits}`)
  return lines.join('\n').trim()
}

/**
 * Generate and store the profile embedding for a single Person.
 *
 * @param personId - The Person node ID
 * @returns The stored embedding
 */
export async function generatePersonEmbedding(
  personId: string
): Promise<PersonEmbeddingResult> {
  const graph = await initGraph()

  const rows = await graph.query<{ person: PersonProfile }>(
    `
    MATCH (p:Person {id: $personId})
    RETURN {
      name: p.name,
      firstName: p.firstName,
      lastName: p.lastName,
      description: p.description,
      passions: p.passions,
      fieldsOfCare: p.fieldsOfCare,
      traits: p.traits
    } as person
  `,
    { personId }
  )

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error(`Person not found: ${personId}`)
  }

  const bioText = buildPersonBioText(rows[0].person)

  // Embedding providers reject empty input; a nameless, contentless Person
  // has nothing to embed anyway. Throw before the API call — callers that
  // sweep (the cron) filter these out up front, so this only fires on
  // direct calls.
  if (!bioText) {
    throw new Error(`Person ${personId} has no profile content to embed`)
  }

  const provider = getEmbeddingsProvider()
  // GOAL-297: background person-embedding — system-attributed usage metering.
  // Callers are the discover-resonances cron and the enricher repair path,
  // both server-run with no interactive user.
  const embeddings = await provider.embed([bioText], {
    meter: { source: 'enrichment', principal: 'system' },
  })
  const embedding = embeddings[0]

  await graph.query(
    `
    MATCH (p:Person {id: $personId})
    CALL db.create.setNodeVectorProperty(p, 'embedding', $embedding)
  `,
    { personId, embedding }
  )

  return { personId, embedding }
}
