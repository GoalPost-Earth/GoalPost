/**
 * Backfill: relabel migrated Core Values from StoryPulse to CoreValuePulse (GOAL-287).
 *
 * Earlier revisions of `migrate-prod-to-dev.ts` merged prod `CoreValue` nodes
 * into `StoryPulse` (`FieldPulse:StoryPulse:CoreValue`) because `CoreValuePulse`
 * did not yet exist as a distinct type. The GraphQL layer derives `__typename`
 * from labels (`@node(labels: [...])`), so those pulses materialize as genuine
 * `StoryPulse` objects and every dashboard/Bloom surface shows them as "Story".
 *
 * This script moves them onto the current ontology (`kb/05-data-entities.md`):
 * add `:CoreValuePulse`, drop `:StoryPulse`, keep `:CoreValue` for provenance —
 * matching how migrated Goals/Resources keep `:Goal`/`:Resource`. Properties
 * and relationships are untouched; both GraphQL types require the same
 * non-null fields (id/title/content/createdAt), so no read path can null out.
 *
 * Each relabeled pulse gets an audit `:Log` row (deterministic id, so re-runs
 * don't duplicate). The logs carry no CREATED_BY person — this is a system
 * migration, not a user action — which keeps them out of user activity feeds
 * (those inner-MATCH on CREATED_BY) while staying auditable via Cypher.
 *
 * Targets the DB in `.env.local` (dev by default). To fix another environment
 * (e.g. the demo box), point DOTENV_CONFIG_PATH / .env.local at it.
 *
 * Usage:
 *   npx tsx scripts/backfill-corevalue-pulse-labels.ts           # dry run
 *   npx tsx scripts/backfill-corevalue-pulse-labels.ts --apply   # relabel
 */

import dotenv from 'dotenv'
import path from 'path'
import neo4j from 'neo4j-driver'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const URI = process.env.NEO4J_URI
const USERNAME = process.env.NEO4J_USERNAME
const PASSWORD = process.env.NEO4J_PASSWORD

const APPLY = process.argv.includes('--apply')

const LOG_METADATA = JSON.stringify({
  action: 'system_backfill',
  jira: 'GOAL-287',
  change: 'pulse_label_relabel',
  from: 'StoryPulse',
  to: 'CoreValuePulse',
})

async function main() {
  if (!URI || !USERNAME || !PASSWORD) {
    console.error('❌ NEO4J_URI / NEO4J_USERNAME / NEO4J_PASSWORD missing from .env.local')
    process.exit(1)
  }

  const driver = neo4j.driver(URI, neo4j.auth.basic(USERNAME, PASSWORD))
  const session = driver.session()

  console.log(`Target DB: ${URI}`)

  try {
    const candidates = await session.run(
      `MATCH (p:FieldPulse:StoryPulse:CoreValue)
       WHERE NOT p:CoreValuePulse
       RETURN p.id AS id, p.title AS title
       ORDER BY p.id`
    )

    console.log(
      `${APPLY ? '🔧 APPLY' : '👀 DRY RUN'} — migrated Core Values still labeled StoryPulse: ${candidates.records.length}`
    )
    for (const r of candidates.records) {
      console.log(`   ${r.get('id')}  ${JSON.stringify(r.get('title'))}`)
    }

    if (candidates.records.length === 0) {
      console.log('✓ Nothing to do — all Core Values already carry :CoreValuePulse.')
      return
    }

    if (!APPLY) {
      console.log('\nRe-run with --apply to relabel these nodes.')
      return
    }

    const result = await session.run(
      `MATCH (p:FieldPulse:StoryPulse:CoreValue)
       WHERE NOT p:CoreValuePulse
       SET p:CoreValuePulse
       REMOVE p:StoryPulse
       WITH p
       MERGE (log:Log {id: 'log_goal287_relabel_' + p.id})
       ON CREATE SET
         log.description = 'System backfill (GOAL-287): relabeled migrated Core Value from StoryPulse to CoreValuePulse',
         log.createdAt = datetime($createdAt),
         log.metadata = $metadataJson,
         log.metadataJson = $metadataJson
       MERGE (log)-[:LOGGED_FOR]->(p)
       RETURN count(DISTINCT p) AS relabeled`,
      { createdAt: new Date().toISOString(), metadataJson: LOG_METADATA }
    )
    const relabeled = result.records[0].get('relabeled').toNumber()
    console.log(`\n✓ Relabeled ${relabeled} pulses (audit :Log row per pulse).`)

    // Post-verify: the mislabel must be gone and every :CoreValue must now be
    // a :CoreValuePulse.
    const verify = await session.run(
      `MATCH (p:FieldPulse:CoreValue)
       RETURN
         sum(CASE WHEN p:StoryPulse THEN 1 ELSE 0 END) AS stillStory,
         sum(CASE WHEN p:CoreValuePulse THEN 1 ELSE 0 END) AS asCoreValuePulse,
         count(*) AS total`
    )
    const v = verify.records[0]
    const stillStory = v.get('stillStory').toNumber()
    const asCoreValuePulse = v.get('asCoreValuePulse').toNumber()
    const total = v.get('total').toNumber()
    console.log(
      `✓ Verify: ${asCoreValuePulse}/${total} migrated Core Values carry :CoreValuePulse; ${stillStory} still :StoryPulse.`
    )
    if (stillStory > 0 || asCoreValuePulse !== total) {
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
