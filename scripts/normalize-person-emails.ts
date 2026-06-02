/**
 * Normalize Person.email to trim + lowercase, the prerequisite for the
 * `person_email_unique` constraint (scripts/init-db.js).
 *
 * The app now normalizes email at every write + auth-match boundary
 * (src/lib/auth/normalize-email.ts), but pre-existing rows may carry
 * mixed-case or whitespace-padded values. This backfill rewrites them so the
 * uniqueness constraint can come online and so existing users can still log in
 * (login normalizes the typed email, so the stored value must match).
 *
 * SAFETY: it never merges Person nodes. If two or more DISTINCT Persons would
 * collapse to the same normalized email (a case-insensitive collision), it
 * reports them and ABORTS without writing — resolving a duplicate identity is
 * a deliberate, reviewed operation, not something to automate blindly.
 *
 * Targets whatever database NEO4J_URI points at (dev by default). Dry-run
 * unless --apply is passed.
 *
 * Usage:
 *   npx tsx scripts/normalize-person-emails.ts            # dry run
 *   npx tsx scripts/normalize-person-emails.ts --apply    # write
 */

import dotenv from 'dotenv'
import path from 'path'
import neo4j, { Driver } from 'neo4j-driver'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const URI = process.env.NEO4J_URI
const USERNAME = process.env.NEO4J_USERNAME
const PASSWORD = process.env.NEO4J_PASSWORD
const DATABASE = process.env.NEO4J_DATABASE || 'neo4j'

interface CollisionRow {
  normalized: string
  count: number
  variants: string[]
  ids: string[]
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'toNumber' in value) {
    return (value as { toNumber: () => number }).toNumber()
  }
  return Number(value ?? 0)
}

async function findCollisions(driver: Driver): Promise<CollisionRow[]> {
  const session = driver.session({ database: DATABASE })
  try {
    const result = await session.run(
      `
      MATCH (p:Person)
      WHERE p.email IS NOT NULL AND p.email <> ''
      WITH toLower(trim(p.email)) AS normalized,
           collect(DISTINCT p.email) AS variants,
           collect(DISTINCT p.id) AS ids
      WHERE size(ids) > 1
      RETURN normalized, size(ids) AS count, variants, ids
      ORDER BY count DESC
      `
    )
    return result.records.map((r) => ({
      normalized: r.get('normalized'),
      count: toNumber(r.get('count')),
      variants: r.get('variants'),
      ids: r.get('ids'),
    }))
  } finally {
    await session.close()
  }
}

async function countToNormalize(driver: Driver): Promise<number> {
  const session = driver.session({ database: DATABASE })
  try {
    const result = await session.run(
      `
      MATCH (p:Person)
      WHERE p.email IS NOT NULL AND p.email <> '' AND p.email <> toLower(trim(p.email))
      RETURN count(p) AS c
      `
    )
    return toNumber(result.records[0]?.get('c'))
  } finally {
    await session.close()
  }
}

async function applyNormalization(driver: Driver): Promise<number> {
  const session = driver.session({ database: DATABASE })
  try {
    const result = await session.run(
      `
      MATCH (p:Person)
      WHERE p.email IS NOT NULL AND p.email <> '' AND p.email <> toLower(trim(p.email))
      SET p.email = toLower(trim(p.email))
      RETURN count(p) AS c
      `
    )
    return toNumber(result.records[0]?.get('c'))
  } finally {
    await session.close()
  }
}

async function main() {
  const apply = process.argv.slice(2).includes('--apply')

  if (!URI || !USERNAME || !PASSWORD) {
    throw new Error(
      'Missing Neo4j credentials. Set NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD.'
    )
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Person.email normalization (trim + lowercase)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Mode:     ${apply ? 'APPLY' : 'DRY RUN'}`)
  console.log(`Target:   ${URI} (db: ${DATABASE})\n`)

  const driver = neo4j.driver(URI, neo4j.auth.basic(USERNAME, PASSWORD))

  try {
    // 1. Abort if normalization would collapse distinct Persons onto one email.
    const collisions = await findCollisions(driver)
    if (collisions.length > 0) {
      console.error(
        `❌ ABORT: ${collisions.length} case-insensitive email collision(s) found.`
      )
      console.error(
        '   Normalizing would create duplicate emails. Resolve these manually'
      )
      console.error(
        '   (merge or correct the duplicate Person nodes) before re-running:\n'
      )
      for (const c of collisions) {
        console.error(
          `   ${c.normalized} ← ${c.count} persons: ${c.variants.join(', ')}`
        )
      }
      console.error('')
      process.exitCode = 1
      return
    }

    // 2. Report / apply the lowercase rewrite.
    const toFix = await countToNormalize(driver)
    console.log(`Persons with non-normalized email: ${toFix}`)

    if (toFix === 0) {
      console.log('✅ Nothing to do — all emails already normalized.\n')
      return
    }

    if (!apply) {
      console.log('\nDry run complete. Re-run with --apply to write changes.\n')
      return
    }

    const updated = await applyNormalization(driver)
    console.log(`\n✅ Normalized email on ${updated} Person node(s).`)
    console.log(
      '   Run `npm run init:db` NEXT to bring the person_email_unique'
    )
    console.log(
      '   constraint online. Do it promptly (ideally with the app paused):'
    )
    console.log(
      '   a mixed-case signup/invite landing in the window between this'
    )
    console.log(
      '   backfill and the constraint could reintroduce a collision and'
    )
    console.log('   fail the constraint creation.\n')
  } finally {
    await driver.close()
  }
}

main().catch((error) => {
  console.error('❌ Normalization failed:', error)
  process.exit(1)
})
