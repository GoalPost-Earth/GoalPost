/**
 * Migrate Person.inviteToken / Person.resetToken from plaintext storage
 * to sha256-hashed storage (Person.inviteTokenHash / Person.resetTokenHash).
 *
 * Follows GOAL-248. The runtime call sites already write/read the hashed
 * shape; this script (a) drops the plaintext-token indexes, (b) NULLs any
 * in-flight plaintext token values on existing Person nodes, and (c)
 * creates the new hash indexes. Any user with an in-flight reset / invite
 * email at the time of migration will need to request a fresh one — this
 * is acceptable since the old tokens are short-lived (30 min reset / 48 h
 * invite) and the alternative is leaving plaintext credentials on disk.
 *
 * The script is idempotent: re-running it is a no-op once the migration
 * has succeeded once.
 *
 * Strategy:
 *   1. Dry-run by default — reports counts only.
 *   2. With --apply, drops the two old indexes, NULLs in-flight tokens,
 *      creates the two new hash indexes, and verifies the post-state.
 *   3. Post-check fails loudly (exit code 2) if any Person still carries
 *      a plaintext inviteToken/resetToken property — the migration is
 *      treated as incomplete in that case.
 *
 * Usage:
 *   npx tsx scripts/hash-person-tokens.ts
 *   npx tsx scripts/hash-person-tokens.ts --apply
 *
 * After --apply succeeds, scripts/init-db.js stays in sync because the
 * new hash indexes are also declared there (so a fresh dev DB built from
 * init-db.js gets the same shape).
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
  // Count Persons that still have plaintext inviteToken or resetToken.
  // These are the credentials that the migration will invalidate.
  const inFlight = await session.run(
    `MATCH (p:Person)
     RETURN
       count(CASE WHEN p.inviteToken IS NOT NULL THEN 1 END) AS invite,
       count(CASE WHEN p.resetToken IS NOT NULL THEN 1 END) AS reset`
  )

  const invite = inFlight.records[0]?.get('invite')?.toNumber?.() ?? 0
  const reset = inFlight.records[0]?.get('reset')?.toNumber?.() ?? 0

  // Existing indexes — we'll drop the plaintext ones, create the hash ones.
  const indexes = await session.run(
    `SHOW INDEXES YIELD name, properties, labelsOrTypes
     WHERE name IN [
       'person_invite_token', 'person_reset_token',
       'person_invite_token_hash', 'person_reset_token_hash'
     ]
     RETURN name`
  )
  const present = new Set(indexes.records.map((r) => r.get('name') as string))

  return { invite, reset, present }
}

async function apply(session: Session) {
  // 1. Drop the plaintext-token indexes (no-op if absent).
  for (const name of ['person_invite_token', 'person_reset_token']) {
    await session.run(`DROP INDEX ${name} IF EXISTS`)
  }

  // 2. NULL every in-flight plaintext token + its expiry. Using REMOVE
  //    instead of SET = NULL so the properties literally drop off the
  //    node and don't keep dead values in the property store.
  const nulled = await session.run(
    `MATCH (p:Person)
     WHERE p.inviteToken IS NOT NULL
        OR p.resetToken IS NOT NULL
        OR p.inviteTokenExpires IS NOT NULL
        OR p.resetTokenExpires IS NOT NULL
     REMOVE p.inviteToken, p.resetToken,
            p.inviteTokenExpires, p.resetTokenExpires
     RETURN count(p) AS touched`
  )
  const touched = nulled.records[0]?.get('touched')?.toNumber?.() ?? 0

  // 3. Create the new hash indexes.
  await session.run(
    `CREATE INDEX person_invite_token_hash IF NOT EXISTS
     FOR (p:Person) ON (p.inviteTokenHash)`
  )
  await session.run(
    `CREATE INDEX person_reset_token_hash IF NOT EXISTS
     FOR (p:Person) ON (p.resetTokenHash)`
  )

  return { touched }
}

async function postCheck(session: Session) {
  // Hard assertion: no Person should carry a plaintext token property
  // after the migration. This catches a partially-applied migration or
  // a write race that snuck in a plaintext token during the window.
  const survivors = await session.run(
    `MATCH (p:Person)
     WHERE p.inviteToken IS NOT NULL OR p.resetToken IS NOT NULL
     RETURN count(p) AS count`
  )
  return survivors.records[0]?.get('count')?.toNumber?.() ?? 0
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
    console.log(`\n=== Hash Person tokens (GOAL-248) ===`)
    console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY RUN'}\n`)

    const { invite, reset, present } = await audit(session)
    console.log(`In-flight invite tokens: ${invite}`)
    console.log(`In-flight reset tokens:  ${reset}`)
    console.log(`Indexes present:         ${[...present].join(', ') || '(none)'}\n`)

    if (!APPLY) {
      console.log('Dry run only. Re-run with --apply to migrate.')
      console.log(
        '\nApply will: drop plaintext-token indexes, REMOVE plaintext token\n' +
          'properties on every Person, then CREATE the hash-token indexes.\n' +
          'Users with an in-flight reset/invite email will need to request a\n' +
          'fresh one (~30 min and ~48 h windows respectively).'
      )
      return
    }

    const { touched } = await apply(session)
    console.log(`✅ Removed plaintext tokens from ${touched} Person(s).`)

    const survivors = await postCheck(session)
    if (survivors > 0) {
      console.error(
        `\n❌ Post-check failed: ${survivors} Person(s) still carry a plaintext token.\n` +
          `   Investigate before considering the migration complete.`
      )
      process.exit(2)
    }

    console.log('✅ Post-check passed: no plaintext tokens remain.')
    console.log('✅ Hash indexes installed.\n')
    console.log(
      'Next: keep scripts/init-db.js in sync (the hash indexes are\n' +
        'declared there too so fresh dev DBs come up with the right shape).'
    )
  } finally {
    await session.close()
    await driver.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
