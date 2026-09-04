/**
 * Backfill: mark pre-existing extraction-found people so the FieldContext
 * People roster can filter them out (GOAL-346).
 *
 * `Person.extractionFound` is written going forward by `create_person` in
 * `src/lib/chat/hitl.ts`, whenever a source Document is in scope. Everyone
 * Document Ingestion attached BEFORE that shipped has no marker at all, so they
 * still fill the roster — the exact symptom GOAL-346 was filed for. This script
 * stamps them retroactively.
 *
 * The seed is the `EXTRACTED_FROM` edge, which the ingest paths have written
 * since GOAL-242 and which is the only durable record of "a document extractor
 * put this person here". Two deliberate narrowings:
 *
 *   • `NOT p:User` — a registered account attached to a field is a real
 *     participant, not a document artifact. The `create_person` self-link
 *     branch gives the UPLOADER an EXTRACTED_FROM edge, so without this guard
 *     the backfill would sweep the field's one real person out of its own
 *     roster. (On dev today that is exactly 1 of the 148 candidates.)
 *   • `HAS_PERSON` required — the marker only means anything for someone
 *     currently on a roster. A person with no context edge is left untouched,
 *     so a later hand-attach shows up as intended.
 *
 * Extraction-found people who carry NO `EXTRACTED_FROM` edge (a handful predate
 * the provenance edge, and Bulk Article Import row authors never had a document
 * to point at) are deliberately NOT marked — the same rule the runtime write
 * follows. Beyond there being no safe signal separating them from hand-added
 * people, `Document.extractedPeople` is the only surface a hidden person is
 * reachable from, so marking someone with no Document would strand them: gone
 * from the roster, on no document, impossible to promote or detach. A person
 * staying visible is the recoverable failure; remove them by hand if they do
 * not belong.
 *
 * Idempotent: only `extractionFound IS NULL` is touched, so a person a member
 * has already promoted (`false`) is never re-hidden, and re-runs are no-ops.
 * Reversible: `--undo` joins on this script's own audit `:Log` rows, so it
 * reverses exactly what it wrote and leaves people marked by the live
 * extraction paths afterwards alone.
 *
 * Targets the DB in `.env.local` (dev by default). To fix another environment
 * (e.g. the demo box), point DOTENV_CONFIG_PATH / .env.local at it — and
 * confirm with a human first, per kb/08-migration.md.
 *
 * Usage:
 *   npx tsx scripts/backfill-extraction-found.ts           # dry run
 *   npx tsx scripts/backfill-extraction-found.ts --apply   # mark
 *   npx tsx scripts/backfill-extraction-found.ts --undo    # unmark (dry run)
 *   npx tsx scripts/backfill-extraction-found.ts --undo --apply
 */

import dotenv from 'dotenv'
import path from 'path'
import neo4j from 'neo4j-driver'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const URI = process.env.NEO4J_URI
const USERNAME = process.env.NEO4J_USERNAME
const PASSWORD = process.env.NEO4J_PASSWORD

const APPLY = process.argv.includes('--apply')
const UNDO = process.argv.includes('--undo')

/**
 * The one definition of "extraction put this person on a roster". Shared by the
 * dry run, the write and the verify so they can never drift apart.
 */
const CANDIDATE_MATCH = `
  MATCH (p:Person)
  WHERE NOT p:User
    AND EXISTS { (p)-[:EXTRACTED_FROM]->(:Document) }
    AND EXISTS { (:FieldContext)-[:HAS_PERSON]->(p) }
`

/** Deterministic audit-row id, so re-runs never duplicate and UNDO can join. */
const LOG_ID = `'log_goal346_extraction_found_' + p.id`

/** Unmarked candidates — what a BACKFILL run writes. */
const BACKFILL_MATCH = `${CANDIDATE_MATCH} AND p.extractionFound IS NULL`

/**
 * Exactly the rows a BACKFILL run wrote, identified by its own audit Log. A
 * person the live extraction paths marked afterwards carries no such row and
 * is therefore never touched by UNDO.
 */
const UNDO_MATCH = `
  MATCH (log:Log)-[:LOGGED_FOR]->(p:Person)
  WHERE log.id = ${LOG_ID} AND p.extractionFound = true
`

const LIST_TAIL = `
  RETURN p.id AS id,
         coalesce(p.name, trim(coalesce(p.firstName, '') + ' ' + coalesce(p.lastName, ''))) AS name
  ORDER BY name
`

const LOG_METADATA = JSON.stringify({
  action: 'system_backfill',
  jira: 'GOAL-346',
  change: 'person_extraction_found',
})

async function main() {
  if (!URI || !USERNAME || !PASSWORD) {
    console.error(
      '❌ NEO4J_URI / NEO4J_USERNAME / NEO4J_PASSWORD missing from .env.local'
    )
    process.exit(1)
  }

  const driver = neo4j.driver(URI, neo4j.auth.basic(USERNAME, PASSWORD))
  const session = driver.session()

  console.log(`Target DB: ${URI}`)
  console.log(`Mode: ${UNDO ? 'UNDO' : 'BACKFILL'}`)

  try {
    // UNDO joins on this script's OWN audit row rather than re-running the
    // candidate predicate. The predicate cannot tell a row this script wrote
    // from one the live extraction paths wrote afterwards, so a rollback a week
    // later would silently un-hide fresh extraction output.
    const candidates = await session.run(
      UNDO ? UNDO_MATCH + LIST_TAIL : BACKFILL_MATCH + LIST_TAIL
    )

    console.log(
      `${APPLY ? '🔧 APPLY' : '👀 DRY RUN'} — people to ${UNDO ? 'unmark' : 'mark'}: ${candidates.records.length}`
    )
    for (const r of candidates.records.slice(0, 20)) {
      console.log(`   ${r.get('id')}  ${JSON.stringify(r.get('name'))}`)
    }
    if (candidates.records.length > 20) {
      console.log(`   … and ${candidates.records.length - 20} more`)
    }

    if (candidates.records.length === 0) {
      console.log('✓ Nothing to do.')
      return
    }

    if (!APPLY) {
      console.log('\nRe-run with --apply to write these changes.')
      return
    }

    if (UNDO) {
      // The audit row goes with the property it recorded — leaving it behind
      // would make a later re-run skip the ON CREATE SET and write no audit
      // trail at all (MERGE would just find the orphan).
      const undone = await session.run(
        `${UNDO_MATCH}
         REMOVE p.extractionFound
         DETACH DELETE log
         RETURN count(p) AS unmarked`
      )
      console.log(
        `\n✓ Unmarked ${undone.records[0].get('unmarked').toNumber()} people (audit rows removed with them).`
      )
      return
    }

    const result = await session.run(
      `${BACKFILL_MATCH}
       SET p.extractionFound = true
       WITH p
       // Deterministic id so re-runs don't duplicate. No CREATED_BY person —
       // this is a system migration, not a user action — which keeps it out of
       // user activity feeds while staying auditable via Cypher.
       MERGE (log:Log {id: ${LOG_ID}})
       ON CREATE SET
         log.description = 'System backfill (GOAL-346): marked as found by document extraction; held out of the field People roster',
         log.createdAt = datetime($createdAt),
         log.metadata = $metadataJson,
         log.metadataJson = $metadataJson
       MERGE (log)-[:LOGGED_FOR]->(p)
       RETURN count(DISTINCT p) AS marked`,
      { createdAt: new Date().toISOString(), metadataJson: LOG_METADATA }
    )
    console.log(
      `\n✓ Marked ${result.records[0].get('marked').toNumber()} people (audit :Log row per person).`
    )

    // Post-verify: no candidate left unmarked, and no `:User` was ever touched.
    // Both are subquery counts rather than a second MATCH — an aggregating WITH
    // followed by `MATCH (u:User)` yields zero rows on a DB with no users, and
    // then reading records[0] throws.
    const verify = await session.run(
      `RETURN
         COUNT { ${BACKFILL_MATCH} RETURN p } AS unmarked,
         COUNT { MATCH (u:User) WHERE u.extractionFound = true RETURN u } AS markedUsers`
    )
    const unmarked = verify.records[0].get('unmarked').toNumber()
    const markedUsers = verify.records[0].get('markedUsers').toNumber()
    console.log(
      `✓ Verify: ${unmarked} candidates left unmarked; ${markedUsers} :User nodes marked (both must be 0).`
    )
    if (unmarked > 0 || markedUsers > 0) {
      console.error('❌ Verification failed — inspect the nodes above manually.')
      process.exit(1)
    }
  } finally {
    await session.close()
    await driver.close()
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
