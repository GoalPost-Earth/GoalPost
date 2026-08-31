/**
 * Reset a single account's password on the DEV Neo4j database.
 *
 *   npx tsx scripts/reset-dev-password.ts --email <email> --password <password>
 *   DEV_LOGIN_PASSWORD=<password> npm run reset:dev-password -- --email <email>
 *
 * Standalone equivalent of the migration's Phase 5b, which could previously
 * only be reached by re-running the whole prod->dev migration. Use it when a
 * teammate needs to log into dev as a specific migrated/cloned account and the
 * stored hash is unknown (e.g. after `clone:demo-to-dev`, which copies hashes
 * verbatim from whatever the source DB held).
 *
 * It mirrors `hashPassword` in src/app/api/auth/utils.ts exactly — bcrypt over
 * `password + PEPPER` at cost 12 — so the dev login route verifies the result.
 * PEPPER comes from .env.local and MUST match the running app's PEPPER; a
 * mismatch produces a hash that silently never verifies, so a missing PEPPER
 * aborts rather than writing a dud.
 *
 * Matching mirrors the login route (src/app/api/auth/login/route.ts), which
 * does `MATCH (user:Person {email: $email})` against a trim+lowercased email —
 * NOT `:User`. Matching `:Person` is therefore the correct target, and the
 * script refuses to write unless exactly one Person matches. Signup dual-labels
 * real accounts `:Person:User`, so a matched node WITHOUT `:User` is probably a
 * contact/extracted Person that never signed up — minting it a password would
 * mint a login for an identity that never had one, so that needs an explicit
 * `--allow-non-user` opt-in.
 *
 * DEV-ONLY. The guards, all of which must pass before any write:
 *   - every env file is resolved against the REPO ROOT (this script's own
 *     location), never process.cwd(), so running from another directory cannot
 *     silently read a different .env.local
 *   - NEO4J_URI is read from .env.local only (never a prod/demo profile file)
 *   - URIs are compared by HOSTNAME (via new URL()), not raw string equality,
 *     so a scheme/port variant of a forbidden URI cannot slip past
 *   - the demo and prod hosts are HARDCODED below in addition to whatever
 *     `.env*prod*` / `.env*demo*` profile files are present, so the guard
 *     stays live on a fresh checkout that has no profile files at all
 *   - the password must be >= 8 chars, or the login route's zod schema
 *     (`password: z.string().min(8)`) would reject it at sign-in anyway
 *
 * The write also sets `refreshTokenRevoked = true` (same flag the logout route
 * sets), so any session the previous credential holder still had dies with the
 * reset instead of living out its 30-day refresh window.
 *
 * After writing, the new hash is read back and bcrypt-compared, so a run that
 * reports success has proven the account can actually log in.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import neo4j, { Driver } from 'neo4j-driver'

const MIN_PASSWORD_LENGTH = 8
const BCRYPT_COST = 12

/** Anchor every env lookup to the repo root, wherever the script is run from. */
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

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
  let email: string | undefined
  let password = process.env.DEV_LOGIN_PASSWORD
  let allowNonUser = false
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--email') email = argv[++i]
    else if (argv[i] === '--password') password = argv[++i]
    else if (argv[i] === '--allow-non-user') allowNonUser = true
  }
  if (!email || !password) {
    throw new Error(
      'Usage: tsx scripts/reset-dev-password.ts --email <email> --password <password> [--allow-non-user]\n' +
        '       (or pass the password via DEV_LOGIN_PASSWORD to keep it out of ' +
        'shell history and the npm banner)'
    )
  }
  return { email, password, allowNonUser }
}

async function main() {
  const { email: rawEmail, password, allowNonUser } = parseArgs()
  const email = normalizeEmail(rawEmail)

  const env = readEnvFile('.env.local')
  const uri = env.NEO4J_URI
  const username = env.NEO4J_USERNAME
  const dbPassword = env.NEO4J_PASSWORD
  const pepper = env.PEPPER || ''

  if (!uri || !username || !dbPassword) {
    throw new Error(
      'Missing NEO4J_URI / NEO4J_USERNAME / NEO4J_PASSWORD in .env.local.'
    )
  }
  if (!pepper) {
    throw new Error(
      'REFUSING: PEPPER is missing from .env.local. The hash would never verify ' +
        "against the dev app's comparePassword(). Add PEPPER and re-run."
    )
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `REFUSING: password is ${password.length} chars; the login route requires at least ${MIN_PASSWORD_LENGTH}.`
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

  console.log(`[reset-password] target : ${uri}`)
  console.log(`[reset-password] account: ${email}`)

  const driver: Driver = neo4j.driver(uri, neo4j.auth.basic(username, dbPassword))
  const session = driver.session()
  try {
    const found = await session.run(
      'MATCH (p:Person {email: $email}) RETURN p.id AS id, labels(p) AS labels',
      { email }
    )
    if (found.records.length === 0) {
      throw new Error(
        `No :Person with email ${email} on dev. Check the address (stored emails are trim+lowercased).`
      )
    }
    if (found.records.length > 1) {
      throw new Error(
        `REFUSING: ${found.records.length} :Person nodes share email ${email}. Resolve the duplicate first.`
      )
    }
    const id: string = found.records[0].get('id')
    const labels: string[] = found.records[0].get('labels')
    console.log(`[reset-password] matched : ${[...labels].sort().join(':')}`)
    if (!labels.includes('User') && !allowNonUser) {
      throw new Error(
        'REFUSING: this Person is not labelled :User, so it never signed up — ' +
          'setting a password would mint a login for an identity that never had one. ' +
          'Re-run with --allow-non-user if that is genuinely what you want.'
      )
    }

    // Write by the id captured above — NOT by re-matching the email — so the
    // uniqueness check and the write cannot disagree about which node they saw.
    // Revoking the refresh token mirrors the logout route: the old credential
    // holder's session dies with the reset instead of riding out its 30 days.
    const hash = await bcrypt.hash(password + pepper, BCRYPT_COST)
    const res = await session.run(
      `MATCH (p:Person {id: $id})
       SET p.password = $hash,
           p.refreshTokenRevoked = true
       RETURN count(p) AS c`,
      { id, hash }
    )
    if (res.records[0].get('c').toNumber() !== 1) {
      throw new Error('Expected to update exactly 1 Person.')
    }

    // Read back and verify, so a "success" line means login will actually work.
    const readBack = await session.run(
      'MATCH (p:Person {id: $id}) RETURN p.password AS hash',
      { id }
    )
    const stored = readBack.records[0].get('hash')
    const ok = await bcrypt.compare(password + pepper, stored)
    if (!ok) {
      throw new Error(
        'Stored hash failed verification — password NOT usable. Check PEPPER.'
      )
    }

    console.log(`[reset-password] ✓ password updated and verified for ${email}`)
  } finally {
    await session.close()
    await driver.close()
  }
}

main().catch((e) => {
  console.error('[reset-password] FAILED:', e instanceof Error ? e.message : e)
  process.exit(1)
})
