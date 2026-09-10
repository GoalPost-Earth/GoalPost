/**
 * GOAL-356 INCIDENT RECOVERY — put back the `source_url` values the duplicate
 * reconcile destroyed.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * What happened
 * ─────────────────────────────────────────────────────────────────────────────
 * `reconcile-duplicate-document-resources.ts` merges a bulk-import row pulse
 * into the document node that holds its fetched article, keeping the DOCUMENT
 * and deleting the row. It carried the row's title, content, resourceType,
 * location, why, time, availability and intensity across — but not `sourceUrl`.
 *
 * That omission was silent while the two properties agreed. They do not: the
 * document's `sourceUrl` was already the URL the bytes were FETCHED from
 * (a 1drv.ms OneDrive link, written by `anchorDocument`), while the row's
 * `sourceUrl` was the sheet's `source_url` column — where the MEMBER found the
 * resource, usually a LinkedIn post (GOAL-355). The merge's
 * `coalesce(doc.sourceUrl, primary.location)` therefore always found the fetched
 * link already present, kept it, and let the member's value die with the deleted
 * node.
 *
 * Measured on demo after the run: all 10 merged titles read 1drv.ms, against 1
 * of the 14 titles the merge never touched. The reconcile is the cause, and the
 * script has since been fixed so the row's value wins.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Where the truth comes from
 * ─────────────────────────────────────────────────────────────────────────────
 * The `:ArticleImportJob` node for the sheet still carries `rowsJson` — the
 * validated rows exactly as the member uploaded them, `source_url` included.
 * That is the authoritative copy and this script reads it from the graph by
 * default. Pass `--from-file <path>` to use a saved copy instead, which matters
 * because `rowsJson` is nulled at every terminal write: if the job drains or
 * fails, the in-graph copy is gone.
 *
 * A row is matched to its node by title within the job's own FieldContext, the
 * same case-insensitive comparison `create_pulse`'s enrich branch uses, so this
 * restores exactly the nodes that import would have matched.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * What it writes
 * ─────────────────────────────────────────────────────────────────────────────
 * ONLY `sourceUrl`, and only where the graph currently disagrees with the sheet.
 * `sourceFetchedFrom` is left alone — it correctly holds the fetched link, and
 * after this runs the two properties mean two different things again, which is
 * the whole point. Nothing is deleted; no other property is touched.
 *
 * Dry-run by DEFAULT. Nothing is written without `--execute`.
 *
 *   DOTENV_CONFIG_PATH=.env.demo npx tsx scripts/restore-member-source-url.ts
 *   DOTENV_CONFIG_PATH=.env.demo npx tsx scripts/restore-member-source-url.ts --execute
 *   DOTENV_CONFIG_PATH=.env.demo npx tsx scripts/restore-member-source-url.ts --from-file rows.json --context <ctxId> --execute
 */

import 'dotenv/config.js'
import fs from 'node:fs'
import neo4j from 'neo4j-driver'

const argv = process.argv
const EXECUTE = argv.includes('--execute')
const arg = (name: string): string | null => {
  const i = argv.indexOf(name)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : null
}
const FROM_FILE = arg('--from-file')
const CONTEXT = arg('--context')

interface SheetRow {
  row?: number
  title?: string
  sourceUrl?: string
}

interface Restorable {
  contextId: string
  title: string
  sheetSourceUrl: string
}

async function main() {
  const uri = process.env.NEO4J_URI
  const user = process.env.NEO4J_USERNAME || process.env.NEO4J_USER
  const password = process.env.NEO4J_PASSWORD
  if (!uri || !user || !password) {
    throw new Error(
      'NEO4J_URI / NEO4J_USERNAME / NEO4J_PASSWORD must be set — pass DOTENV_CONFIG_PATH=.env.demo (or .env.local).'
    )
  }

  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
  const session = driver.session()

  console.log(
    `\nGOAL-356 — restore member source_url  [${EXECUTE ? 'EXECUTE' : 'DRY RUN'}]`
  )
  console.log(`  target  : ${uri}`)
  console.log(`  source  : ${FROM_FILE ?? 'ArticleImportJob.rowsJson in the graph'}\n`)

  try {
    // ---- gather the sheet rows, with the context each belongs to -----------
    const candidates: Restorable[] = []
    if (FROM_FILE) {
      if (!CONTEXT) {
        throw new Error('--from-file requires --context <fieldContextId>.')
      }
      const rows = JSON.parse(
        fs.readFileSync(FROM_FILE, 'utf8')
      ) as SheetRow[]
      for (const r of rows) {
        if (r.title?.trim() && r.sourceUrl?.trim()) {
          candidates.push({
            contextId: CONTEXT,
            title: r.title.trim(),
            sheetSourceUrl: r.sourceUrl.trim(),
          })
        }
      }
    } else {
      const jobs = await session.run(
        `
        MATCH (c:FieldContext)-[:HAS_IMPORT_JOB]->(j:ArticleImportJob)
        WHERE j.rowsJson IS NOT NULL
        RETURN j.id AS id, c.id AS contextId, j.rowsJson AS rowsJson
        `
      )
      for (const rec of jobs.records) {
        const rows = JSON.parse(rec.get('rowsJson') as string) as SheetRow[]
        for (const r of rows) {
          if (r.title?.trim() && r.sourceUrl?.trim()) {
            candidates.push({
              contextId: rec.get('contextId') as string,
              title: r.title.trim(),
              sheetSourceUrl: r.sourceUrl.trim(),
            })
          }
        }
      }
    }

    if (candidates.length === 0) {
      console.log(
        '  No sheet rows carrying source_url found.\n' +
          '  If the job has since drained, rowsJson is nulled — re-run with --from-file.\n'
      )
      return
    }

    // ---- find which of them the graph currently disagrees with -------------
    const toFix: Array<Restorable & { id: string; current: string | null }> = []
    let alreadyCorrect = 0
    let noNode = 0
    for (const c of candidates) {
      const res = await session.run(
        `
        MATCH (ctx:FieldContext {id: $contextId})-[:HAS_PULSE]->(p:ResourcePulse)
        WHERE toLower(trim(p.title)) = toLower(trim($title))
        RETURN p.id AS id, p.sourceUrl AS sourceUrl
        LIMIT 1
        `,
        { contextId: c.contextId, title: c.title }
      )
      const rec = res.records[0]
      if (!rec) {
        noNode += 1
        continue
      }
      const current = rec.get('sourceUrl') as string | null
      if (current === c.sheetSourceUrl) {
        alreadyCorrect += 1
        continue
      }
      toFix.push({ ...c, id: rec.get('id') as string, current })
    }

    console.log(`  ${candidates.length} sheet row(s) carry a source_url:`)
    console.log(`    already correct in the graph ... ${alreadyCorrect}`)
    console.log(`    no matching pulse .............. ${noNode}`)
    console.log(`    TO RESTORE ..................... ${toFix.length}\n`)
    for (const f of toFix) {
      console.log(`    "${f.title.slice(0, 52)}"`)
      console.log(`      now  ${f.current ?? '(null)'}`)
      console.log(`      -->  ${f.sheetSourceUrl}`)
    }

    if (toFix.length === 0) {
      console.log('\n  Nothing to restore.\n')
      return
    }
    if (!EXECUTE) {
      console.log('\n  Dry run — no writes. Re-run with --execute to apply.\n')
      return
    }

    console.log('\n  Restoring...')
    let restored = 0
    for (const f of toFix) {
      // Compare-and-set on the value just read, so a member who edits the field
      // between the read above and this write is never overwritten.
      const res = await session.run(
        `
        MATCH (p:ResourcePulse {id: $id})
        WHERE coalesce(p.sourceUrl, '') = coalesce($current, '')
        SET p.sourceUrl = $sheetSourceUrl,
            p.modifiedAt = datetime()
        RETURN p.id AS id
        `,
        { id: f.id, current: f.current, sheetSourceUrl: f.sheetSourceUrl }
      )
      if (res.records.length > 0) restored += 1
      else console.log(`    ! skipped "${f.title.slice(0, 40)}" — changed since the read`)
    }
    console.log(`    ✓ restored ${restored} of ${toFix.length} source_url value(s)\n`)
  } finally {
    await session.close()
    await driver.close()
  }
}

main().catch((error) => {
  console.error('\nRestore failed:', error)
  process.exitCode = 1
})
