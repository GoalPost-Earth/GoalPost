/**
 * One-off DEV cleanup: remove ephemeral E2E accounts left behind by e2e-tester
 * runs on the reserved `@e2e.goalpost.test` domain. The browser harness the
 * e2e-tester drives has no Neo4j write access, so it can delete the fixtures it
 * seeds through GraphQL but not the signup-created User + MeSpace — those linger
 * in dev. This purge removes them.
 *
 * Safety
 * ------
 * - DEV-only: reads creds from `.env.local` and refuses to run if the dev URI
 *   matches the prod URI in `.env.production` (same guard as the migration /
 *   orphan-pulse cleanup).
 * - Only ever matches nodes whose `email` ENDS WITH `@e2e.goalpost.test` — the
 *   reserved test domain. It can never touch a real account.
 * - Report by default; pass `--apply` to delete. Refuses to delete a user whose
 *   owned Space still has child nodes hanging off it (would orphan content) —
 *   it surfaces that instead so a human can look.
 *
 *   npx tsx scripts/purge-e2e-users.ts            # report only
 *   npx tsx scripts/purge-e2e-users.ts --apply    # delete
 */

import fs from 'fs'
import path from 'path'
import neo4j, { Driver } from 'neo4j-driver'

const E2E_DOMAIN = '@e2e.goalpost.test'
const APPLY = process.argv.includes('--apply')

function readEnvFile(filename: string): Record<string, string> {
  const filePath = path.join(process.cwd(), filename)
  if (!fs.existsSync(filePath)) return {}
  const out: Record<string, string> = {}
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq < 0) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    out[key] = value
  }
  return out
}

function toInt(v: unknown): number {
  if (v == null) return 0
  const n = v as { toNumber?: () => number }
  if (typeof n.toNumber === 'function') return n.toNumber()
  return Number(v)
}

const devEnv = readEnvFile('.env.local')
const prodEnv = readEnvFile('.env.production')
const DEV_URI = devEnv.NEO4J_URI
const DEV_USERNAME = devEnv.NEO4J_USERNAME
const DEV_PASSWORD = devEnv.NEO4J_PASSWORD
const PROD_URI = prodEnv.NEO4J_URI

async function main() {
  if (!DEV_URI || !DEV_USERNAME || !DEV_PASSWORD) {
    throw new Error('Development database credentials not found in .env.local')
  }
  if (PROD_URI && DEV_URI === PROD_URI) {
    console.error(
      `\n❌ Refusing to run: DEV_URI (${DEV_URI}) === PROD_URI. This script is DEV-only.`
    )
    process.exit(1)
  }

  const driver: Driver = neo4j.driver(
    DEV_URI,
    neo4j.auth.basic(DEV_USERNAME, DEV_PASSWORD)
  )
  await driver.verifyConnectivity()
  console.log(`🔌 Connected to dev → ${DEV_URI}`)
  console.log(APPLY ? '🧹 Apply mode (will delete)\n' : '🔎 Report only (no writes)\n')

  const session = driver.session()
  try {
    // Report every reserved-domain account + what its owned Space still holds.
    const report = await session.run(
      `MATCH (u) WHERE u.email ENDS WITH $domain
       OPTIONAL MATCH (u)-[:OWNS]->(s)
       OPTIONAL MATCH (s)-->(child)
       WITH u, s, count(DISTINCT child) AS childCount
       RETURN u.email AS email, u.id AS id, labels(u) AS ulabels,
              collect(DISTINCT { id: s.id, labels: labels(s), children: childCount })
                AS spaces
       ORDER BY email`,
      { domain: E2E_DOMAIN }
    )

    if (report.records.length === 0) {
      console.log(`✅ No accounts on ${E2E_DOMAIN} — dev is clean.`)
      return
    }

    let anyNonEmpty = false
    console.log(`Found ${report.records.length} reserved-domain account(s):`)
    for (const r of report.records) {
      const spaces = (r.get('spaces') as Array<{
        id: string | null
        labels: string[]
        children: unknown
      }>).filter((s) => s.id)
      console.log(`\n   • ${r.get('email')}  (id ${r.get('id')})`)
      console.log(`     labels: ${(r.get('ulabels') as string[]).join(', ')}`)
      if (spaces.length === 0) {
        console.log('     owned spaces: none')
      }
      for (const s of spaces) {
        const children = toInt(s.children)
        if (children > 0) anyNonEmpty = true
        console.log(
          `     owns space ${s.id} [${s.labels.join(', ')}] — ${children} child node(s)` +
            (children > 0 ? '  ⚠️ non-empty' : '')
        )
      }
    }
    console.log('')

    if (!APPLY) {
      console.log('🔎 Report only. Re-run with --apply to delete.')
      return
    }

    if (anyNonEmpty) {
      console.log(
        '⚠️  Skipping the ⚠️ non-empty account(s) above — deleting them would ' +
          'orphan content, and they may not be this run’s cruft. Purging only ' +
          'accounts whose owned Space is empty.\n'
      )
    }

    // Delete only reserved-domain accounts whose owned Space(s) have zero child
    // nodes — an empty MeSpace is safe to remove with its user. Non-empty ones
    // are left untouched (reported above).
    const del = await session.run(
      `MATCH (u) WHERE u.email ENDS WITH $domain
       OPTIONAL MATCH (u)-[:OWNS]->(s)-->(child)
       WITH u, count(DISTINCT child) AS totalChildren
       WHERE totalChildren = 0
       OPTIONAL MATCH (u)-[:OWNS]->(s2)
       DETACH DELETE u, s2
       RETURN count(DISTINCT u) AS users`,
      { domain: E2E_DOMAIN }
    )
    console.log(`🧹 Deleted ${toInt(del.records[0].get('users'))} empty account(s) + owned space(s).`)

    const verify = await session.run(
      `MATCH (u) WHERE u.email ENDS WITH $domain RETURN count(u) AS remaining`,
      { domain: E2E_DOMAIN }
    )
    console.log(`✅ Remaining ${E2E_DOMAIN} accounts: ${toInt(verify.records[0].get('remaining'))}`)
  } finally {
    await session.close()
    await driver.close()
  }
}

main().catch((err) => {
  console.error('❌ Purge failed:', err)
  process.exit(1)
})
