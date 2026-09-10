/**
 * GOAL-356 — set `ResourcePulse.sourceBacked` on every resource that holds a file.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Why this flag exists at all
 * ─────────────────────────────────────────────────────────────────────────────
 * "This resource came from a file" is defined by `sourceBlobKey`
 * (`src/lib/ingest/source-resource-node.ts` — `SOURCE_BACKED_RESOURCE`). Every
 * raw-Cypher site uses that. The two SDL `@authorization` rules that need the
 * same predicate cannot: `sourceBlobKey` is deliberately
 * `@filterable(byValue: false)` so a client cannot infer S3 keys through
 * filters, and that gate must not be loosened. `sourceBacked` is a plain
 * boolean mirror of it, written only by `anchorDocument` and
 * `attachSourceFileToResource`, which the rules can filter on:
 *
 *   - `Document` READ  — without it, an imported document 404s in the detail
 *     drawer while showing in the list beside it.
 *   - `ResourcePulse` DELETE — without it, the generated `deleteResourcePulses`
 *     root will hard-delete a document, orphaning its S3 object forever and
 *     stranding every pulse whose `location` is that document's download
 *     locator (GOAL-321). A right-to-erasure failure, not untidy state.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Why a backfill is required, and not only for new rows
 * ─────────────────────────────────────────────────────────────────────────────
 * Both rules keep their original `resourceType = 'document'` arm, so an
 * untouched legacy document still matches without this. The gap is the set
 * `reconcile-duplicate-document-resources.ts` (GOAL-354) created: it gives a
 * merged resource the row pulse's identity, so an uploaded PDF ends up typed
 * `article` / `book` / `event` while keeping its `sourceBlobKey`. Those match
 * NEITHER arm — 27 of dev's 56 blob-backed resources when this was written —
 * and have therefore been invisible-and-deletable since GOAL-354, before
 * GOAL-356 existed. This closes that.
 *
 * The invariant to hold afterwards:
 *
 *     d.sourceBlobKey IS NOT NULL  ⟺  d.sourceBacked = true
 *
 * Idempotent, and safe to re-run after any migration that mints or re-types
 * blob-backed resources.
 *
 * Dry-run by DEFAULT. Nothing is written without `--execute`.
 *
 *   npx tsx scripts/backfill-source-backed-flag.ts
 *   npx tsx scripts/backfill-source-backed-flag.ts --execute
 */

import 'dotenv/config.js'
import { initGraph } from '../src/modules/graph.js'

const num = (value: unknown): number => Number(value ?? 0)

const EXECUTE = process.argv.includes('--execute')

async function main() {
  const graph = await initGraph()

  console.log(
    `\nGOAL-356 — backfill ResourcePulse.sourceBacked  [${
      EXECUTE ? 'EXECUTE' : 'DRY RUN'
    }]`
  )
  console.log(`  target : ${process.env.NEO4J_URI ?? '(unset)'}`)
  console.log(`  env file: ${process.env.DOTENV_CONFIG_PATH ?? '(none)'}\n`)

  const [before] = await graph.query<Record<string, unknown>>(
    `
    MATCH (d:ResourcePulse)
    WITH collect(d) AS docs
    RETURN
      size(docs) AS resources,
      size([d IN docs WHERE d.sourceBlobKey IS NOT NULL]) AS blobBacked,
      size([d IN docs WHERE d.sourceBlobKey IS NOT NULL AND d.sourceBacked IS NULL]) AS needsFlag,
      // The population the two SDL rules currently miss entirely: it has a file,
      // it is not typed 'document', and it has no flag.
      size([d IN docs WHERE d.sourceBlobKey IS NOT NULL
              AND coalesce(d.resourceType, '') <> 'document'
              AND d.sourceBacked IS NULL]) AS invisibleToSdl,
      // Should always be 0 — a flag with no file would let an ordinary resource
      // masquerade as a document. Reported so a regression is loud.
      size([d IN docs WHERE d.sourceBlobKey IS NULL AND d.sourceBacked = true]) AS flaggedWithoutFile
    `,
    {}
  )

  console.log('  Before:')
  console.log(`    :ResourcePulse total ................... ${num(before?.resources)}`)
  console.log(`    blob-backed (sourceBlobKey set) ........ ${num(before?.blobBacked)}`)
  console.log(`    missing the flag ....................... ${num(before?.needsFlag)}`)
  console.log(`      of which invisible to the SDL rules .. ${num(before?.invisibleToSdl)}`)
  console.log(`    flagged WITHOUT a file (must be 0) ..... ${num(before?.flaggedWithoutFile)}`)

  if (num(before?.flaggedWithoutFile) > 0) {
    console.log(
      '\n  ⚠  Some resources claim sourceBacked without a sourceBlobKey. Nothing but\n' +
        '     anchorDocument / attachSourceFileToResource should write that flag —\n' +
        '     investigate before running with --execute.\n'
    )
  }

  if (num(before?.needsFlag) === 0) {
    console.log('\n  Nothing to backfill.\n')
    return
  }

  if (!EXECUTE) {
    console.log('\n  Dry run — no writes. Re-run with --execute to apply.\n')
    return
  }

  const [result] = await graph.query<Record<string, unknown>>(
    `
    MATCH (d:ResourcePulse)
    WHERE d.sourceBlobKey IS NOT NULL AND d.sourceBacked IS NULL
    SET d.sourceBacked = true
    RETURN count(d) AS flagged
    `,
    {}
  )
  console.log(`\n    ✓ flagged ${num(result?.flagged)} resource(s)`)

  const [after] = await graph.query<Record<string, unknown>>(
    `
    MATCH (d:ResourcePulse)
    WITH collect(d) AS docs
    RETURN
      size([d IN docs WHERE d.sourceBlobKey IS NOT NULL AND d.sourceBacked IS NULL]) AS stillMissing,
      size([d IN docs WHERE d.sourceBlobKey IS NULL AND d.sourceBacked = true]) AS flaggedWithoutFile
    `,
    {}
  )
  console.log('\n  After:')
  console.log(`    still missing the flag (must be 0) ..... ${num(after?.stillMissing)}`)
  console.log(`    flagged WITHOUT a file (must be 0) ..... ${num(after?.flaggedWithoutFile)}`)
  console.log(
    '\n  The invariant is  sourceBlobKey IS NOT NULL  <=>  sourceBacked = true.\n' +
      '  Re-run this after any migration that mints or re-types blob-backed resources.\n'
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\nBackfill failed:', error)
    process.exit(1)
  })
