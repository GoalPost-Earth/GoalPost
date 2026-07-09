/**
 * De-duplicate pulse author edges.
 *
 * Legacy migrations (see backfill-pulse-creators.ts) wrote CREATED_BY on
 * pulses that later also received the canonical INITIATED_BY edge to the
 * SAME person, leaving ~126 dev pulses with two parallel author edges.
 * Readers match the [:INITIATED_BY|CREATED_BY] alternation, so the
 * duplicate yields two rows per pulse — halving LIMIT budgets in graph
 * sweeps and drawing twin edges on the Bloom canvas.
 *
 * This script deletes a pulse's CREATED_BY edge ONLY when an INITIATED_BY
 * edge to the same Person exists — a pure de-dup:
 *   - display (resolvePulseAuthor) prefers initiatedBy and keeps returning
 *     the same person;
 *   - alternation readers keep matching via the surviving edge;
 *   - pulses with a CREATED_BY-only author (dashboard flow, imports) are
 *     untouched;
 *   - CREATED_BY on Log/FieldContext/PromiseWeave is out of scope (those
 *     anchor on different node types and are not pulse-author aliases).
 *
 * Idempotent — a second run finds nothing to delete.
 *
 * Usage (dry-run by default; targets whichever DB .env.local names):
 *   npx tsx scripts/dedupe-author-edges.ts
 *   npx tsx scripts/dedupe-author-edges.ts --apply
 */

import dotenv from 'dotenv'
import path from 'path'
import neo4j from 'neo4j-driver'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const APPLY = process.argv.includes('--apply')

const uri = process.env.NEO4J_URI
const username = process.env.NEO4J_USERNAME || process.env.NEO4J_USER
const password = process.env.NEO4J_PASSWORD

async function main() {
  // No localhost/password fallback: silently dry-running against the wrong
  // DB prints "0 redundant edges", which reads as "already clean".
  if (!uri || !username || !password) {
    console.error(
      'NEO4J_URI / NEO4J_USERNAME / NEO4J_PASSWORD must be set (via .env.local). Refusing to guess a target.'
    )
    process.exit(1)
  }
  console.log(`Target: ${uri} (${APPLY ? 'APPLY' : 'dry run'})`)
  const driver = neo4j.driver(uri, neo4j.auth.basic(username, password))
  const session = driver.session()
  try {
    const dupes = await session.executeRead((tx) =>
      tx.run(`
        MATCH (p:FieldPulse)-[c:CREATED_BY]->(person:Person)
        // NOT p:Person is defense-in-depth: no node should carry both labels,
        // but the Person PII @authorization branches ride Person→CREATED_BY→
        // Person edges, so an anomalous legacy node must never match here.
        WHERE (p)-[:INITIATED_BY]->(person) AND NOT p:Person
        RETURN count(c) AS dupes
      `)
    )
    const count = dupes.records[0].get('dupes').toNumber()
    console.log(
      `${count} redundant CREATED_BY author edge(s) shadowed by INITIATED_BY to the same person`
    )

    if (!APPLY) {
      console.log('Dry run — pass --apply to delete them.')
      return
    }

    const res = await session.executeWrite((tx) =>
      tx.run(`
        MATCH (p:FieldPulse)-[c:CREATED_BY]->(person:Person)
        // NOT p:Person is defense-in-depth: no node should carry both labels,
        // but the Person PII @authorization branches ride Person→CREATED_BY→
        // Person edges, so an anomalous legacy node must never match here.
        WHERE (p)-[:INITIATED_BY]->(person) AND NOT p:Person
        DELETE c
        RETURN count(c) AS deleted
      `)
    )
    console.log(
      `Deleted ${res.records[0].get('deleted').toNumber()} redundant edge(s).`
    )

    const remaining = await session.executeRead((tx) =>
      tx.run(`
        MATCH (p:FieldPulse)-[c:CREATED_BY]->(person:Person)
        // NOT p:Person is defense-in-depth: no node should carry both labels,
        // but the Person PII @authorization branches ride Person→CREATED_BY→
        // Person edges, so an anomalous legacy node must never match here.
        WHERE (p)-[:INITIATED_BY]->(person) AND NOT p:Person
        RETURN count(c) AS dupes
      `)
    )
    console.log(
      `Remaining duplicates after apply: ${remaining.records[0].get('dupes').toNumber()} (expected 0)`
    )
  } finally {
    await session.close()
    await driver.close()
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
