/**
 * Backfill MeSpace.ownerId so the `mespace_owner_unique` UNIQUE constraint
 * (see scripts/init-db.js) can be created on existing databases without
 * failing on legacy nodes that pre-date the denormalization.
 *
 * Strategy:
 *   1. Dry-run by default — reports counts only.
 *   2. With --apply, sets ownerId = <person.id> on every MeSpace owned by
 *      exactly one Person.
 *   3. Surfaces any data-integrity violations (MeSpaces with 0 owners, >1
 *      owners, or two MeSpaces owned by the same Person) so they can be
 *      reconciled by hand before the UNIQUE constraint is enabled.
 *
 * Usage:
 *   npx tsx scripts/backfill-mespace-owner-id.ts
 *   npx tsx scripts/backfill-mespace-owner-id.ts --apply
 *
 * After a clean apply, re-run init-db.js so the new constraint installs.
 */

import dotenv from 'dotenv'
import path from 'path'
import neo4j, { type Driver, type Session } from 'neo4j-driver'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const URI = process.env.NEO4J_URI
const USERNAME = process.env.NEO4J_USERNAME
const PASSWORD = process.env.NEO4J_PASSWORD

const APPLY = process.argv.includes('--apply')

async function audit(session: Session) {
  // MeSpaces missing ownerId or with mismatched ownerId
  const missing = await session.run(
    `MATCH (m:MeSpace)
     OPTIONAL MATCH (m)<-[:OWNS]-(p:Person)
     WITH m, collect(p.id) AS owners
     WHERE m.ownerId IS NULL OR NOT m.ownerId IN owners
     RETURN m.id AS meSpaceId, owners, m.ownerId AS currentOwnerId
     ORDER BY meSpaceId`
  )

  // Persons with multiple MeSpaces (duplicates that need manual cleanup)
  const duplicates = await session.run(
    `MATCH (p:Person)-[:OWNS]->(m:MeSpace)
     WITH p, collect(m) AS spaces
     WHERE size(spaces) > 1
     RETURN p.id AS personId, p.email AS email,
            [s IN spaces | {id: s.id, name: s.name, createdAt: s.createdAt}] AS meSpaces
     ORDER BY email`
  )

  // MeSpaces with no owner at all
  const orphans = await session.run(
    `MATCH (m:MeSpace)
     WHERE NOT (m)<-[:OWNS]-(:Person)
     RETURN m.id AS meSpaceId, m.name AS name`
  )

  return { missing, duplicates, orphans }
}

async function backfill(session: Session) {
  // Set ownerId on every MeSpace that has exactly one Person owner.
  // Multi-owner / no-owner cases are skipped intentionally — they're
  // surfaced by the audit and need human reconciliation.
  const result = await session.run(
    `MATCH (m:MeSpace)<-[:OWNS]-(p:Person)
     WITH m, collect(DISTINCT p) AS owners
     WHERE size(owners) = 1
     WITH m, owners[0] AS owner
     WHERE m.ownerId IS NULL OR m.ownerId <> owner.id
     SET m.ownerId = owner.id
     RETURN count(m) AS updated`
  )
  return result.records[0]?.get('updated')?.toNumber?.() ?? 0
}

async function main() {
  if (!URI || !USERNAME || !PASSWORD) {
    console.error(
      'Missing NEO4J_URI / NEO4J_USERNAME / NEO4J_PASSWORD in .env.local'
    )
    process.exit(1)
  }

  const driver: Driver = neo4j.driver(URI, neo4j.auth.basic(USERNAME, PASSWORD))
  const session = driver.session()

  try {
    console.log(`\n=== MeSpace ownerId backfill ===`)
    console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY RUN'}\n`)

    const { missing, duplicates, orphans } = await audit(session)

    console.log(`MeSpaces missing/mismatched ownerId: ${missing.records.length}`)
    console.log(`Persons with >1 MeSpace (manual fix): ${duplicates.records.length}`)
    console.log(`MeSpaces with no Person owner: ${orphans.records.length}\n`)

    if (duplicates.records.length > 0) {
      console.log('\nDuplicates needing manual reconciliation:')
      for (const r of duplicates.records) {
        const spaces = r.get('meSpaces') as Array<{ id: string; name: string }>
        console.log(
          `  ${r.get('email')} (${r.get('personId')}): ` +
            spaces.map((s) => `${s.id} "${s.name}"`).join(', ')
        )
      }
      console.log(
        '\n⚠️  Resolve duplicates by hand before enabling the UNIQUE constraint.'
      )
    }

    if (orphans.records.length > 0) {
      console.log('\nOrphan MeSpaces (no owner):')
      for (const r of orphans.records) {
        console.log(`  ${r.get('meSpaceId')} "${r.get('name')}"`)
      }
    }

    if (!APPLY) {
      console.log('\nDry run only — re-run with --apply to write ownerId.')
      return
    }

    const updated = await backfill(session)
    console.log(`\n✅ Wrote ownerId on ${updated} MeSpaces.`)
    if (duplicates.records.length > 0 || orphans.records.length > 0) {
      console.log(
        '⚠️  Duplicates / orphans were skipped. Reconcile them before running init-db.js.'
      )
    } else {
      console.log('Next step: run `npm run init:db` to install the UNIQUE constraint.')
    }
  } finally {
    await session.close()
    await driver.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
