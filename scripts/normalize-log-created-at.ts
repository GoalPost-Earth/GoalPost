/**
 * Normalize Log.createdAt from ISO string to a Neo4j temporal (GOAL-307).
 *
 * `create-log.ts` historically wrote `Log.createdAt` as a plain ISO string
 * (`new Date().toISOString()`), while the SDL declares it `DateTime!`. That
 * mismatch left the audit stream with mixed types: migration/backfill rows and
 * `logResonanceActivity` write temporals, older `createLog` rows are strings.
 * `ORDER BY log.createdAt DESC` across mixed types is fragile, and a string
 * value can't be consumed by anything expecting a temporal (`.epochMillis`,
 * duration math). `create-log.ts` now writes `datetime($createdAt)`; this
 * one-shot converts the remaining string rows so the whole label is temporal.
 *
 * Idempotent: only rows whose `createdAt` is still a STRING are touched, so
 * re-runs are no-ops. Every string produced by `createLog` was a valid ISO
 * 8601 timestamp (`toISOString()`), so `datetime()` parses each without loss.
 *
 * Targets the DB in `.env.local` (dev by default). To fix another environment
 * point DOTENV_CONFIG_PATH / .env.local at it.
 *
 * Usage:
 *   npx tsx scripts/normalize-log-created-at.ts           # dry run
 *   npx tsx scripts/normalize-log-created-at.ts --apply   # convert
 */

import dotenv from 'dotenv'
import path from 'path'
import neo4j from 'neo4j-driver'

dotenv.config({
  path: process.env.DOTENV_CONFIG_PATH || path.join(process.cwd(), '.env.local'),
})

const URI = process.env.NEO4J_URI
const USERNAME = process.env.NEO4J_USERNAME
const PASSWORD = process.env.NEO4J_PASSWORD

const APPLY = process.argv.includes('--apply')

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

  try {
    // Count by type so the dry run reports exactly what will change. The type
    // predicate `IS :: STRING` isolates the legacy string rows; everything
    // else is already temporal (or null, which we leave alone).
    const before = await session.run(
      `MATCH (l:Log)
       RETURN
         count(*) AS total,
         sum(CASE WHEN l.createdAt IS :: STRING THEN 1 ELSE 0 END) AS stringRows,
         sum(CASE WHEN l.createdAt IS :: LOCAL DATETIME
                    OR l.createdAt IS :: ZONED DATETIME THEN 1 ELSE 0 END) AS temporalRows,
         sum(CASE WHEN l.createdAt IS NULL THEN 1 ELSE 0 END) AS nullRows`
    )
    const b = before.records[0]
    const total = b.get('total').toNumber()
    const stringRows = b.get('stringRows').toNumber()
    const temporalRows = b.get('temporalRows').toNumber()
    const nullRows = b.get('nullRows').toNumber()

    console.log(
      `${APPLY ? '🔧 APPLY' : '👀 DRY RUN'} — Log rows: ${total} total | ` +
        `${stringRows} string | ${temporalRows} temporal | ${nullRows} null`
    )

    if (stringRows === 0) {
      console.log('✓ Nothing to do — no Log.createdAt string rows remain.')
      return
    }

    if (!APPLY) {
      console.log(
        `\nRe-run with --apply to convert ${stringRows} string row(s) to datetime.`
      )
      return
    }

    const result = await session.run(
      `MATCH (l:Log)
       WHERE l.createdAt IS :: STRING
       SET l.createdAt = datetime(l.createdAt)
       RETURN count(l) AS converted`
    )
    const converted = result.records[0].get('converted').toNumber()
    console.log(`\n✓ Converted ${converted} Log.createdAt string row(s) to datetime.`)

    // Post-verify: no string rows may remain.
    const after = await session.run(
      `MATCH (l:Log)
       RETURN sum(CASE WHEN l.createdAt IS :: STRING THEN 1 ELSE 0 END) AS stillString`
    )
    const stillString = after.records[0].get('stillString').toNumber()
    console.log(`✓ Verify: ${stillString} string row(s) remaining.`)
    if (stillString > 0) {
      console.error('❌ Verification failed — some rows are still strings.')
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
