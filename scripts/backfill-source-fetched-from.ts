/**
 * GOAL-356 — give the fetched-from link its own property on existing documents.
 *
 * Three different URLs had been sharing two properties, and GOAL-356 collapsed
 * the last bit of space between them:
 *
 *   - `location`        the resource ITSELF (the article's page)
 *   - `sourceUrl`       where the MEMBER found it — the sheet's `source_url`
 *                       column (GOAL-355), on any ResourcePulse
 *   - `sourceUrl` again where the BYTES were fetched from — written by
 *                       `anchorDocument` for a server-fetched article (GOAL-344)
 *
 * While a fetched article lived on its own `document_*` node those last two
 * never met. GOAL-356 attaches the file to the import row's OWN pulse, so a
 * single node can now carry a member's found-at link AND be the document — and
 * the import's idempotency check, which keyed on `sourceUrl`, started matching
 * the wrong one. A row whose `url` equalled another row's `source_url` read back
 * as an already-fetched article: it skipped its own link entirely and hung its
 * `EXTRACTED_FROM` provenance on an unrelated resource. On dev, 21 pairs already
 * have one pulse's `sourceUrl` equal to another's `location` in the same field,
 * so the collision shape is in real data.
 *
 * The fix is `sourceFetchedFrom`, which means only the third thing. New writes
 * set it on both anchor paths; this backfills it onto everything older.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Which nodes get it, and why that predicate
 * ─────────────────────────────────────────────────────────────────────────────
 * ONLY a source-backed resource whose id starts `document_`. That prefix is the
 * reliable discriminator: `anchorDocument` is the only writer that mints it, so
 * its `sourceUrl` is unambiguously the fetched link. Every other
 * `sourceUrl` in the graph is a member's `source_url` column, and copying THAT
 * into `sourceFetchedFrom` would bake the collision in permanently instead of
 * removing it.
 *
 * Rows merged by `reconcile-duplicate-document-resources.ts` keep the document's
 * id, so they carry the prefix and are covered. Rows imported after GOAL-356
 * keep their `pulse_*` id and are written correctly at ingest time, so they are
 * neither matched nor needed here.
 *
 * Also creates the index the new lookup seeks. Without it the check degrades to
 * an expand-and-filter over every pulse in the FieldContext, once per import
 * row — the regime `scripts/init-db.js` measured at 4,107 dbHits per row on a
 * 2,000-pulse context.
 *
 * Safe to re-run: the SET is idempotent and the index is IF NOT EXISTS. Does NOT
 * touch `sourceUrl` — nothing is removed, only copied.
 *
 * Dry-run by DEFAULT. Nothing is written without `--execute`.
 *
 *   DOTENV_CONFIG_PATH=.env.local npx tsx scripts/backfill-source-fetched-from.ts
 *   DOTENV_CONFIG_PATH=.env.local npx tsx scripts/backfill-source-fetched-from.ts --execute
 */

import 'dotenv/config.js'
import neo4j from 'neo4j-driver'

const EXECUTE = process.argv.includes('--execute')
const num = (value: unknown): number => Number(value ?? 0)

/**
 * The candidate set, shared by the report and the write so the two can never
 * disagree about what is about to be touched. `sourceFetchedFrom IS NULL` makes
 * a re-run a no-op rather than a rewrite.
 */
const MATCH_CANDIDATES = `
    MATCH (d:ResourcePulse)
    WHERE d.id STARTS WITH 'document_'
      AND d.sourceUrl IS NOT NULL
      AND d.sourceFetchedFrom IS NULL
      AND (d.sourceBlobKey IS NOT NULL OR d.resourceType = 'document')`

async function main() {
  const uri = process.env.NEO4J_URI
  const user = process.env.NEO4J_USERNAME || process.env.NEO4J_USER
  const password = process.env.NEO4J_PASSWORD
  if (!uri || !user || !password) {
    throw new Error(
      'NEO4J_URI / NEO4J_USERNAME / NEO4J_PASSWORD must be set — pass DOTENV_CONFIG_PATH=.env.local (or .env.demo / .env.production).'
    )
  }

  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
  const session = driver.session()

  console.log(
    `\nGOAL-356 — backfill sourceFetchedFrom  [${EXECUTE ? 'EXECUTE' : 'DRY RUN'}]`
  )
  console.log(`  target  : ${uri}`)
  console.log(`  env file: ${process.env.DOTENV_CONFIG_PATH ?? '(none)'}\n`)

  try {
    const preview = await session.run(
      `
      ${MATCH_CANDIDATES}
      RETURN d.title AS title, d.resourceType AS type, d.sourceUrl AS url
      ORDER BY title
      LIMIT 25
      `
    )
    const [countRow] = (
      await session.run(`${MATCH_CANDIDATES} RETURN count(d) AS total`)
    ).records
    const total = num(countRow?.get('total'))

    console.log(`  ${total} document(s) to backfill${total > 25 ? ' (first 25 shown)' : ''}:\n`)
    for (const r of preview.records) {
      console.log(`    "${r.get('title')}"  [${r.get('type')}]`)
      console.log(`      fetched from  ${r.get('url')}`)
    }

    // The index matters even when there is nothing to copy — the new lookup
    // seeks it on every import row regardless of how the data got here.
    const indexes = await session.run(
      `SHOW INDEXES YIELD name WHERE name = 'resource_source_fetched_from' RETURN count(*) AS c`
    )
    const hasIndex = num(indexes.records[0]?.get('c')) > 0
    console.log(
      `\n  index resource_source_fetched_from: ${hasIndex ? 'present' : 'MISSING — will be created'}`
    )

    if (!EXECUTE) {
      console.log('\n  Dry run — no writes. Re-run with --execute to apply.\n')
      return
    }

    if (!hasIndex) {
      await session.run(
        `CREATE INDEX resource_source_fetched_from IF NOT EXISTS
         FOR (r:ResourcePulse) ON (r.sourceFetchedFrom)`
      )
      console.log('    ✓ created index resource_source_fetched_from')
    }

    const [result] = (
      await session.run(`
        ${MATCH_CANDIDATES}
        SET d.sourceFetchedFrom = d.sourceUrl
        RETURN count(d) AS backfilled
      `)
    ).records
    console.log(`    ✓ backfilled ${num(result?.get('backfilled'))} document(s)`)

    const [after] = (
      await session.run(`
        MATCH (r:ResourcePulse) WHERE r.sourceFetchedFrom IS NOT NULL
        WITH count(r) AS withFetchedFrom
        MATCH (r2:ResourcePulse)
          WHERE r2.sourceBlobKey IS NOT NULL OR r2.resourceType = 'document'
        RETURN withFetchedFrom, count(r2) AS sourceBacked
      `)
    ).records
    console.log('\n  After:')
    console.log(`    source-backed resources ......... ${num(after?.get('sourceBacked'))}`)
    console.log(`    carrying sourceFetchedFrom ...... ${num(after?.get('withFetchedFrom'))}`)
    console.log(
      '\n  A source-backed resource with no sourceFetchedFrom is a browser upload,\n' +
        '  which was never fetched from anywhere — that gap is expected.\n'
    )
  } finally {
    await session.close()
    await driver.close()
  }
}

main().catch((error) => {
  console.error('\nBackfill failed:', error)
  process.exitCode = 1
})
