/**
 * Cleanup pass: strip orphaned fixture pulses from the DEV Neo4j DB.
 *
 * Why this exists
 * ---------------
 * The prod→dev migration (`scripts/migrate-prod-to-dev.ts`) wipes dev in Phase 1
 * and rebuilds every pulse with at least one `HAS_PULSE` anchor — so a correct
 * migration NEVER leaves a `FieldPulse` with zero relationships. But day-to-day
 * dev usage (e2e runs, UI spikes, load fixtures) can create throwaway pulses
 * that are never wired into a FieldContext or attributed to a creator. They have
 * a dev-native `pulse_<uuid>` id, no prod-origin label (`Goal`/`Resource`/
 * `CoreValue`/`CarePoint`), and — crucially — no edges at all, so they are
 * unreachable through any Space and invisible in the app, yet they pollute pulse
 * counts and the "every FieldPulse has INITIATED_BY" invariant.
 *
 * This script removes exactly those: `FieldPulse` nodes with NO relationships.
 * An edgeless pulse is dead weight in every case (no Space anchor = unreachable),
 * so deleting it loses nothing recoverable. Migrated and seeded content always
 * carry edges and are never touched.
 *
 * Usage
 * -----
 *   npm run clean:orphan-pulses            # report + delete (DEV only)
 *   npm run clean:orphan-pulses -- --dry-run   # report only, no writes
 *
 * Safety: DEV-only. Reads dev creds from `.env.local` and refuses to run if the
 * dev URI matches the prod URI in `.env.production` (same guard the migration
 * uses), so it can never touch production.
 */

import fs from 'fs'
import path from 'path'
import neo4j, { Driver, Integer } from 'neo4j-driver'

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
  if (typeof v === 'number') return v
  if (v instanceof Integer) return v.toNumber()
  if (typeof (v as { toNumber?: () => number }).toNumber === 'function') {
    return (v as { toNumber: () => number }).toNumber()
  }
  return Number(v)
}

const devEnv = readEnvFile('.env.local')
const prodEnv = readEnvFile('.env.production')

const DEV_URI = devEnv.NEO4J_URI
const DEV_USERNAME = devEnv.NEO4J_USERNAME
const DEV_PASSWORD = devEnv.NEO4J_PASSWORD
const PROD_URI = prodEnv.NEO4J_URI

const DRY_RUN = process.argv.includes('--dry-run')

// Orphaned fixture pulses: a FieldPulse with no relationships of any kind. A
// correct migration never produces one (every pulse is HAS_PULSE-anchored), so
// any match is dev runtime/test cruft.
const ORPHAN_MATCH = `MATCH (p:FieldPulse) WHERE NOT (p)--()`

async function main() {
  if (!DEV_URI || !DEV_USERNAME || !DEV_PASSWORD) {
    throw new Error('Development database credentials not found in .env.local')
  }
  // Same guard as the migration: never operate against production.
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
  console.log(DRY_RUN ? '🔎 Dry run (no writes)\n' : '🧹 Cleanup mode\n')

  const session = driver.session()
  try {
    // Report what we found, grouped by title, before deleting anything.
    const report = await session.run(
      `${ORPHAN_MATCH}
       RETURN coalesce(p.title, p.name, p.id, '<untitled>') AS title,
              [l IN labels(p) WHERE l <> 'FieldPulse'][0] AS subtype,
              count(*) AS cnt
       ORDER BY cnt DESC, title`
    )
    const total = report.records.reduce((n, r) => n + toInt(r.get('cnt')), 0)

    if (total === 0) {
      console.log('✅ No orphaned fixture pulses found — dev is clean.')
      return
    }

    console.log(`Found ${total} orphaned (edgeless) FieldPulse node(s):`)
    for (const r of report.records) {
      console.log(
        `   • ${toInt(r.get('cnt'))}× "${r.get('title')}" [${r.get('subtype')}]`
      )
    }
    console.log('')

    if (DRY_RUN) {
      console.log('🔎 Dry run — nothing deleted. Re-run without --dry-run to delete.')
      return
    }

    const del = await session.run(`${ORPHAN_MATCH} DELETE p RETURN count(p) AS c`)
    console.log(`🧹 Deleted ${toInt(del.records[0].get('c'))} orphaned pulse(s).`)
  } finally {
    await session.close()
    await driver.close()
  }
}

main().catch((err) => {
  console.error('❌ Cleanup failed:', err)
  process.exit(1)
})
