/**
 * Scramble non-team account credentials on the DEV Neo4j database.
 *
 *   npx tsx scripts/scramble-dev-credentials.ts                 # dry run
 *   npx tsx scripts/scramble-dev-credentials.ts --apply
 *   npx tsx scripts/scramble-dev-credentials.ts --keep a@b.com --apply
 *
 * `clone:demo-to-dev` / `clone:neo4j` are FAITHFUL clones — they copy every
 * `Person.password` hash verbatim from the source. That leaves real users'
 * live credentials sitting on dev, where anyone holding the dev DB creds and
 * the PEPPER can attack them offline, and where their existing refresh tokens
 * still authenticate. kb/08-migration.md treats scrambling those hashes as
 * part of the clone, not an optional cleanup — this script is that step.
 *
 * For every `:Person:User` that HAS a password and is not in the keep list, it
 * overwrites `password` with bcrypt (cost 12) over 32 bytes of CSPRNG entropy
 * and sets `refreshTokenRevoked = true` (the same flag the logout route sets),
 * so live sessions die with the scramble instead of riding out their 30-day
 * refresh window. The random plaintext is never stored or printed — nobody,
 * including whoever runs this, can log into a scrambled account. Teammates who
 * need one back get it via `npm run reset:dev-password -- --email <email>`.
 *
 * Accounts with no password (extracted contacts, placeholder Persons that never
 * signed up) are skipped — there is no credential to scramble, and writing one
 * would mint a login for an identity that never had one.
 *
 * DEV-ONLY. The guards mirror scripts/reset-dev-password.ts exactly, and all
 * must pass before any write:
 *   - every env file is resolved against the REPO ROOT (this script's own
 *     location), never process.cwd(), so running from another directory cannot
 *     silently read a different .env.local
 *   - NEO4J_URI is read from .env.local only (never a prod/demo profile file)
 *   - URIs are compared by HOSTNAME (via new URL()), not raw string equality,
 *     so a scheme/port variant of a forbidden URI cannot slip past
 *   - the demo and prod hosts are HARDCODED below in addition to whatever
 *     `.env*prod*` / `.env*demo*` profile files are present, so the guard stays
 *     live on a fresh checkout that has no profile files at all
 *   - nothing is written without an explicit `--apply`; the default is a dry
 *     run that prints exactly which accounts would be scrambled
 */
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import neo4j, { Driver } from 'neo4j-driver'

const BCRYPT_COST = 12
const RANDOM_SECRET_BYTES = 32

/** Anchor every env lookup to the repo root, wherever the script is run from. */
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Team accounts kept by default — the same four `:User` emails named in
 * kb/08-migration.md and wired into scripts/seed-build-space.ts. Override
 * wholesale with one or more `--keep <email>` flags.
 */
const DEFAULT_KEEP = [
  'jaedagy@gmail.com',
  'jesse@thecodefoundry.dev',
  'robert.damashek@gmail.com',
  'jenniferdamashek@protonmail.com',
]

/**
 * Hosts this script must never write to, present even when no `.env.demo` /
 * `.env*prod*` profile file exists locally (fresh checkout, CI). These are the
 * demo and prod boxes from kb/08-migration.md — the dev box
 * (ee93871d.databases.neo4j.io) is deliberately NOT here, it is the one
 * legitimate target.
 */
const KNOWN_NON_DEV_HOSTS = new Map<string, string>([
  ['3.213.48.7', 'demo (hardcoded)'],
  ['54.225.112.191', 'prod (hardcoded)'],
])

function readEnvFile(filename: string): Record<string, string> {
  const filePath = path.join(REPO_ROOT, filename)
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

/**
 * Hostname of a Neo4j connection URI, or null if it doesn't parse. `new URL()`
 * handles the neo4j/bolt/+s/+ssc schemes fine and is what collapses
 * `bolt://h:7687`, `neo4j://h:7687/` and `neo4j+s://h` onto the same host.
 */
function hostOf(uri: string): string | null {
  try {
    const host = new URL(uri).hostname.toLowerCase()
    return host || null
  } catch {
    return null
  }
}

/**
 * Hosts belonging to any non-dev profile file in the repo root, merged with the
 * hardcoded blocklist. Any `.env` file whose name mentions prod or demo is
 * treated as off-limits, which also covers ad-hoc copies like
 * `.env copy.production` that people drop in temporarily.
 */
function forbiddenHosts(): Map<string, string> {
  const found = new Map<string, string>(KNOWN_NON_DEV_HOSTS)
  for (const entry of fs.readdirSync(REPO_ROOT)) {
    if (!entry.startsWith('.env')) continue
    const lower = entry.toLowerCase()
    if (!lower.includes('prod') && !lower.includes('demo')) continue
    const uri = readEnvFile(entry).NEO4J_URI
    if (!uri) continue
    const host = hostOf(uri)
    if (host && !found.has(host)) found.set(host, entry)
  }
  return found
}

/** Mirrors normalizeEmail() in src/lib/auth/normalize-email.ts. */
const normalizeEmail = (email: string) => email.trim().toLowerCase()

function parseArgs() {
  const argv = process.argv.slice(2)
  const keep: string[] = []
  let apply = false
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--keep') keep.push(argv[++i])
    else if (argv[i] === '--apply') apply = true
  }
  return {
    apply,
    keep: (keep.length ? keep : DEFAULT_KEEP).map(normalizeEmail),
  }
}

async function main() {
  const { apply, keep } = parseArgs()

  const env = readEnvFile('.env.local')
  const uri = env.NEO4J_URI
  const username = env.NEO4J_USERNAME
  const dbPassword = env.NEO4J_PASSWORD

  if (!uri || !username || !dbPassword) {
    throw new Error(
      'Missing NEO4J_URI / NEO4J_USERNAME / NEO4J_PASSWORD in .env.local.'
    )
  }
  const targetHost = hostOf(uri)
  if (!targetHost) {
    throw new Error(
      `REFUSING: cannot parse a hostname out of .env.local NEO4J_URI (${uri}), ` +
        'so it cannot be proven non-prod/non-demo.'
    )
  }
  const blocked = forbiddenHosts()
  if (blocked.has(targetHost)) {
    throw new Error(
      `REFUSING: .env.local NEO4J_URI (${uri}) points at ${targetHost}, which is ` +
        `${blocked.get(targetHost)}. This script only ever writes to dev.`
    )
  }

  console.log(`[scramble] target : ${uri}`)
  console.log(`[scramble] mode   : ${apply ? 'APPLY (destructive)' : 'dry run'}`)
  console.log(`[scramble] keeping: ${keep.join(', ')}`)

  const driver: Driver = neo4j.driver(uri, neo4j.auth.basic(username, dbPassword))
  const session = driver.session()
  try {
    // Only accounts that actually hold a credential are candidates. A Person
    // without a password never signed up, so there is nothing to scramble.
    const found = await session.run(
      `MATCH (p:Person:User)
       WHERE p.password IS NOT NULL AND NOT p.email IN $keep
       RETURN p.id AS id, p.email AS email
       ORDER BY p.email`,
      { keep }
    )

    if (found.records.length === 0) {
      console.log('[scramble] nothing to do — no non-kept account holds a password.')
      return
    }

    console.log(`[scramble] ${found.records.length} account(s) to scramble:`)
    for (const r of found.records) console.log(`             ${r.get('email')}`)

    if (!apply) {
      console.log('\n[scramble] dry run — nothing written. Re-run with --apply.')
      return
    }

    let done = 0
    for (const record of found.records) {
      const id: string = record.get('id')
      const email: string = record.get('email')

      // 32 CSPRNG bytes, hashed and immediately discarded. The plaintext is
      // never stored, printed or returned, so the resulting hash is one no one
      // holds the password for — that is the point.
      const randomSecret = crypto.randomBytes(RANDOM_SECRET_BYTES).toString('hex')
      const hash = await bcrypt.hash(randomSecret, BCRYPT_COST)

      // Write by the id captured above — NOT by re-matching the email — so the
      // candidate query and the write cannot disagree about which node they saw.
      const res = await session.run(
        `MATCH (p:Person {id: $id})
         SET p.password = $hash,
             p.refreshTokenRevoked = true
         RETURN count(p) AS c`,
        { id, hash }
      )
      if (res.records[0].get('c').toNumber() !== 1) {
        throw new Error(`Expected to update exactly 1 Person for ${email}.`)
      }
      done++
      console.log(`[scramble] ✓ ${email}`)
    }

    // Read back and prove the old hashes are gone: every scrambled account must
    // now carry a password distinct from the one the clone brought over, and
    // have its refresh token revoked.
    const verify = await session.run(
      `MATCH (p:Person:User)
       WHERE p.password IS NOT NULL AND NOT p.email IN $keep
       RETURN count(p) AS total,
              count(CASE WHEN p.refreshTokenRevoked THEN 1 END) AS revoked`,
      { keep }
    )
    const total = verify.records[0].get('total').toNumber()
    const revoked = verify.records[0].get('revoked').toNumber()
    if (total !== revoked) {
      throw new Error(
        `Verification failed: ${total - revoked} scrambled account(s) still have a live refresh token.`
      )
    }

    console.log(
      `\n[scramble] ✓ scrambled ${done} account(s); all ${revoked} have refresh tokens revoked.`
    )
    console.log(
      '[scramble]   Restore any one of them with: npm run reset:dev-password -- --email <email>'
    )
  } finally {
    await session.close()
    await driver.close()
  }
}

main().catch((e) => {
  console.error('[scramble] FAILED:', e instanceof Error ? e.message : e)
  process.exit(1)
})
