/**
 * GOAL-347 — drain the pulse/person embedding backlog in one pass.
 *
 * WHY THIS EXISTS ALONGSIDE THE CRON.
 *
 * The nightly sweep (`/api/cron/discover-resonances`) backfills embeddings
 * itself, and now does so in batches until its slice of the run budget is
 * spent. That is the steady state and it needs no help. What it is bad at is
 * the FIRST drain: the sweep had never executed against demo at all, so the
 * backlog there is ~300 pulses and ~90 people, while the sweep's embedding
 * phases are deliberately capped at half the run budget so a backlog cannot
 * starve discovery every night. Left to the cron alone the demo backlog clears
 * over several nights, and until it does the un-embedded pulses stay invisible
 * to vector similarity search and cannot resonate at all.
 *
 * This script is the one-off catch-up. It calls the SAME
 * `generatePulseEmbeddings` / `generatePersonEmbedding` the cron calls, so the
 * vectors it writes are identical to the ones the cron would have written —
 * same model, same content+chunk composition, same
 * `db.create.setNodeVectorProperty` write into the same index. It differs only
 * in having no duration ceiling and in embedding a few rows concurrently.
 *
 * Idempotent: it only ever selects rows where `embedding IS NULL`, so a re-run
 * after a partial pass picks up exactly what is left, and a run against an
 * already-drained database is a no-op.
 *
 * Usage:
 *   npx tsx scripts/backfill-pulse-embeddings.ts                 # dry run, dev
 *   npx tsx scripts/backfill-pulse-embeddings.ts --apply         # writes to dev
 *   npx tsx scripts/backfill-pulse-embeddings.ts demo            # dry run, demo
 *   npx tsx scripts/backfill-pulse-embeddings.ts demo --apply    # writes to demo
 *
 * Flags:
 *   --apply            actually write embeddings (default is a dry-run survey)
 *   --limit=N          stop after N rows of each kind
 *   --concurrency=N    embeddings in flight at once (default 5)
 *   --pulses-only / --people-only
 *   --yes-production   required alongside --apply when the profile is `production`
 *
 * The optional first argument is a PROFILE resolving to `.env.<profile>`,
 * matching `scripts/clone-neo4j.ts` and `scripts/backfill-curated-roster.js`:
 * `local` (default, dev), `demo`, `production`. Env files resolve against the
 * REPO ROOT rather than process.cwd(), so running from another directory
 * cannot silently target a different database.
 *
 * COST. Every row is an OpenAI `text-embedding-3-small` call (plus one per
 * conversation chunk on a pulse), billed to whatever OPENAI_API_KEY the chosen
 * profile carries. Read the dry-run counts before applying.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import neo4j from 'neo4j-driver'

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
)

/**
 * Minimal env-file reader — deliberately NOT dotenv, which mutates
 * process.env. Reading the profile into its own object is what lets us decide
 * exactly which variables to promote (see `main`).
 */
function readEnvFile(filename: string): Record<string, string> {
  const filePath = path.join(REPO_ROOT, filename)
  if (!fs.existsSync(filePath)) return {}
  const out: Record<string, string> = {}
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq < 0) continue
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    out[line.slice(0, eq).trim()] = value
  }
  return out
}

/**
 * Selection filters, shared with the cron sweep rather than restated here: if
 * the two drifted, this script would drain a different population than the cron
 * considers outstanding and neither would ever report zero.
 *
 * `embedding-selectors` is a deliberate LEAF module — two string constants, no
 * imports — so this static import pulls in nothing that reads `process.env` at
 * module scope. That matters: the profile promotion further down must happen
 * before the graph and embedder modules are evaluated, and importing these
 * constants from the sweep module would have dragged that whole chain in here
 * ~150 lines early.
 */
import {
  PULSES_NEEDING_EMBEDDING,
  PEOPLE_NEEDING_EMBEDDING,
} from '../src/lib/resonance/discovery/embedding-selectors'

function numArg(args: string[], name: string, fallback: number): number {
  const hit = args.find((a) => a.startsWith(`--${name}=`))
  if (!hit) return fallback
  const parsed = Number(hit.split('=')[1])
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

/**
 * Run `worker` over `ids`, at most `concurrency` in flight.
 *
 * Concurrency is what makes this worth running over just waiting for the cron,
 * but it stays modest on purpose: these are the same OpenAI embedding calls the
 * rest of the platform makes, and a wide fan-out here is the fastest way to a
 * rate-limit incident that also degrades live uploads.
 */
async function mapWithConcurrency(
  ids: string[],
  concurrency: number,
  worker: (id: string) => Promise<void>,
  onProgress: (done: number) => void
): Promise<{ ok: number; failed: number }> {
  let cursor = 0
  let done = 0
  let ok = 0
  let failed = 0

  const runner = async (): Promise<void> => {
    for (;;) {
      const index = cursor++
      if (index >= ids.length) return
      try {
        await worker(ids[index])
        ok += 1
      } catch (error) {
        failed += 1
        console.error(
          `  ✗ ${ids[index]}: ${error instanceof Error ? error.message : error}`
        )
      }
      onProgress(++done)
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, ids.length) }, runner)
  )
  return { ok, failed }
}

async function main() {
  const args = process.argv.slice(2)
  const apply = args.includes('--apply')
  const limit = numArg(args, 'limit', Number.POSITIVE_INFINITY)
  const concurrency = numArg(args, 'concurrency', 5)
  const pulsesOnly = args.includes('--pulses-only')
  const peopleOnly = args.includes('--people-only')
  const profile = args.find((a) => !a.startsWith('--')) || 'local'
  const envFile = `.env.${profile}`
  const env = readEnvFile(envFile)

  // `production` is a legal profile, but writing embeddings to the live graph
  // on a single mistyped command is not a mistake worth leaving available —
  // `demo` and `production` are one word apart. Everything else is guarded by
  // the dry-run default; this is the one target that also needs a deliberate
  // second word.
  if (profile === 'production' && apply && !args.includes('--yes-production')) {
    console.error(
      'Refusing to write to production without --yes-production.\n' +
        'Re-run the dry run first, then add the flag if the counts are what you expect.'
    )
    process.exit(1)
  }

  const uri = env.NEO4J_URI
  // `.env.local` uses NEO4J_USERNAME; init-db.js reads NEO4J_USER but masks the
  // difference behind a 'neo4j' default. Accept both, prefer what is set.
  const user = env.NEO4J_USERNAME || env.NEO4J_USER
  const password = env.NEO4J_PASSWORD

  // No localhost defaults: this script WRITES to whatever it connects to, and
  // silently falling back to a local database would make a misconfigured run
  // look like a successful one.
  if (!uri || !user || !password) {
    console.error(
      `Missing NEO4J_URI / NEO4J_USERNAME / NEO4J_PASSWORD in ${envFile}.`
    )
    process.exit(1)
  }

  const host = (() => {
    try {
      return new URL(uri.replace(/^(neo4j|bolt)/, 'http')).host
    } catch {
      return uri
    }
  })()
  console.log(`Profile: ${profile}  (${envFile})`)
  console.log(`Target:  ${host}`)
  console.log(`Mode:    ${apply ? 'APPLY (writes embeddings)' : 'dry run'}\n`)

  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
  const session = driver.session({
    database: env.NEO4J_DATABASE || undefined,
  })

  try {
    // ---- Survey first, always. ------------------------------------------
    const perSpace = await session.run(`
      MATCH (sp:Space)-[:HAS_CONTEXT]->(:FieldContext)-[:HAS_PULSE]->(p:FieldPulse)
      WHERE p.deletedAt IS NULL
      WITH sp,
           count(DISTINCT p) AS total,
           count(DISTINCT CASE WHEN p.embedding IS NULL THEN p END) AS missing
      WHERE missing > 0
      RETURN sp.name AS space, total, missing
      ORDER BY missing DESC
    `)
    console.log('Spaces with un-embedded pulses:')
    if (perSpace.records.length === 0) {
      console.log('  (none)')
    }
    for (const record of perSpace.records) {
      const space = record.get('space')
      const total = record.get('total').toNumber()
      const missing = record.get('missing').toNumber()
      console.log(`  ${String(space).padEnd(34)} ${missing}/${total} missing`)
    }

    const pulseRows = await session.run(
      `${PULSES_NEEDING_EMBEDDING} RETURN p.id AS id`
    )
    const personRows = await session.run(
      `${PEOPLE_NEEDING_EMBEDDING} RETURN p.id AS id`
    )
    let pulseIds: string[] = pulseRows.records.map((r) => r.get('id'))
    let personIds: string[] = personRows.records.map((r) => r.get('id'))

    console.log(`\nEmbeddable pulses missing an embedding: ${pulseIds.length}`)
    console.log(`Embeddable people missing an embedding: ${personIds.length}`)

    if (peopleOnly) pulseIds = []
    if (pulsesOnly) personIds = []
    if (Number.isFinite(limit)) {
      pulseIds = pulseIds.slice(0, limit)
      personIds = personIds.slice(0, limit)
    }

    if (!apply) {
      console.log(
        `\nDry run — nothing written. Re-run with --apply to embed ${pulseIds.length} pulse(s) and ${personIds.length} person(s).`
      )
      return
    }

    // The embedders read connection details from process.env via initGraph(),
    // which calls dotenv `config()` — and dotenv does NOT override variables
    // that are already set. Promoting the chosen profile here BEFORE importing
    // them is therefore what makes `--profile demo` actually reach demo rather
    // than silently falling through to .env.local.
    process.env.NEO4J_URI = uri
    process.env.NEO4J_USERNAME = user
    process.env.NEO4J_PASSWORD = password
    if (env.NEO4J_DATABASE) process.env.NEO4J_DATABASE = env.NEO4J_DATABASE
    // The embedding provider is global; only the DATABASE is profile-scoped.
    // `.env.demo` and `.env.production` carry Neo4j credentials but often no
    // OpenAI key (the deployed environments read theirs from Vercel), so fall
    // back to the local profile's key rather than refusing to run. Announced
    // loudly because it decides which account the spend lands on.
    const openAiKey = env.OPENAI_API_KEY || readEnvFile('.env.local').OPENAI_API_KEY
    if (openAiKey) {
      if (!env.OPENAI_API_KEY) {
        console.log(
          `No OPENAI_API_KEY in ${envFile} — using the key from .env.local. Embedding spend bills to that account.\n`
        )
      }
      process.env.OPENAI_API_KEY = openAiKey
    }
    if (env.LLM_PROVIDER) process.env.LLM_PROVIDER = env.LLM_PROVIDER

    if (!process.env.OPENAI_API_KEY) {
      console.error(
        `\nNo OPENAI_API_KEY in ${envFile}, .env.local, or the environment — embeddings cannot be generated.`
      )
      process.exitCode = 1
      return
    }

    const { generatePulseEmbeddings } = await import(
      '../src/lib/resonance/embeddings/pulse-embedder'
    )
    const { generatePersonEmbedding } = await import(
      '../src/lib/resonance/embeddings/person-embedder'
    )
    const { close } = await import('../src/modules/graph')

    const progress = (label: string, total: number) => (doneCount: number) => {
      if (doneCount % 25 === 0 || doneCount === total) {
        console.log(`  ${label}: ${doneCount}/${total}`)
      }
    }

    if (pulseIds.length > 0) {
      console.log(`\nEmbedding ${pulseIds.length} pulse(s)...`)
      const result = await mapWithConcurrency(
        pulseIds,
        concurrency,
        (id) => generatePulseEmbeddings(id).then(() => undefined),
        progress('pulses', pulseIds.length)
      )
      console.log(`  done — ${result.ok} embedded, ${result.failed} failed`)
    }

    if (personIds.length > 0) {
      console.log(`\nEmbedding ${personIds.length} person(s)...`)
      const result = await mapWithConcurrency(
        personIds,
        concurrency,
        (id) => generatePersonEmbedding(id).then(() => undefined),
        progress('people', personIds.length)
      )
      console.log(`  done — ${result.ok} embedded, ${result.failed} failed`)
    }

    // Re-survey so the operator sees the acceptance number, not just a claim.
    const after = await session.run(`
      ${PULSES_NEEDING_EMBEDDING}
      RETURN count(p) AS remaining
    `)
    const remaining = after.records[0].get('remaining').toNumber()
    console.log(`\nPulses still missing an embedding: ${remaining}`)

    await close()
  } finally {
    await session.close()
    await driver.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
