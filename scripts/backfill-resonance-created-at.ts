/**
 * Backfill ResonanceLink.createdAt from legacy relationship timestamps.
 *
 * The main migration created resonance links with createdAt=datetime() at migration time.
 * This script restores the original relationship creation date when available.
 *
 * Usage:
 *   npx tsx scripts/backfill-resonance-created-at.ts
 *   npx tsx scripts/backfill-resonance-created-at.ts --apply
 *   npx tsx scripts/backfill-resonance-created-at.ts --apply --fallback=earliest
 */

import dotenv from 'dotenv'
import path from 'path'
import neo4j, { Driver, Session } from 'neo4j-driver'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const PROD_URI = process.env.NEO4J_PROD_URI
const PROD_USERNAME = process.env.NEO4J_PROD_USERNAME
const PROD_PASSWORD = process.env.NEO4J_PROD_PASSWORD

const DEV_URI = process.env.NEO4J_URI
const DEV_USERNAME = process.env.NEO4J_USERNAME
const DEV_PASSWORD = process.env.NEO4J_PASSWORD

const LEGACY_REL_TYPES = [
  'ALIGNED_TO',
  'APPLIED_IN',
  'APPLIED_TO',
  'CARES_FOR',
  'DEPENDS_ON',
  'ENABLED_BY',
  'ENABLES',
  'GUIDED_BY',
] as const

type FallbackMode = 'none' | 'source' | 'target' | 'earliest'

interface RelationshipRow {
  sourcePulseId: string
  targetPulseId: string
  relType: string
  relCreatedAt: unknown
  sourceCreatedAt: unknown
  targetCreatedAt: unknown
}

interface LinkBackfillRow {
  linkId: string
  createdAt: string
  timestampSource: 'relationship' | 'fallback_source' | 'fallback_target'
}

function parseArgs(argv: string[]): {
  apply: boolean
  fallback: FallbackMode
} {
  const apply = argv.includes('--apply')
  const fallbackArg = argv.find((arg) => arg.startsWith('--fallback='))
  const fallbackValue = fallbackArg?.split('=')[1] as FallbackMode | undefined

  if (
    fallbackValue &&
    !['none', 'source', 'target', 'earliest'].includes(fallbackValue)
  ) {
    throw new Error(
      `Invalid --fallback value "${fallbackValue}". Use one of: none, source, target, earliest.`
    )
  }

  return {
    apply,
    fallback: fallbackValue || 'none',
  }
}

function toIsoDateTime(value: unknown): string | null {
  if (!value) return null

  if (typeof value === 'string') {
    return value
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === 'object' && value !== null && 'toString' in value) {
    const asString = String(value)
    if (asString && asString !== '[object Object]') {
      return asString
    }
  }

  return null
}

function pickBestTimestamp(
  relationshipCreatedAt: string | null,
  sourceCreatedAt: string | null,
  targetCreatedAt: string | null,
  fallback: FallbackMode
): Pick<LinkBackfillRow, 'createdAt' | 'timestampSource'> | null {
  if (relationshipCreatedAt) {
    return {
      createdAt: relationshipCreatedAt,
      timestampSource: 'relationship',
    }
  }

  if (fallback === 'source' && sourceCreatedAt) {
    return {
      createdAt: sourceCreatedAt,
      timestampSource: 'fallback_source',
    }
  }

  if (fallback === 'target' && targetCreatedAt) {
    return {
      createdAt: targetCreatedAt,
      timestampSource: 'fallback_target',
    }
  }

  if (fallback === 'earliest') {
    const candidates = [sourceCreatedAt, targetCreatedAt].filter(
      (value): value is string => Boolean(value)
    )

    if (candidates.length === 0) {
      return null
    }

    const earliest = candidates.sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    )[0]

    return {
      createdAt: earliest,
      timestampSource:
        earliest === sourceCreatedAt ? 'fallback_source' : 'fallback_target',
    }
  }

  return null
}

class ResonanceCreatedAtBackfiller {
  private prodDriver: Driver
  private devDriver: Driver

  constructor() {
    if (!PROD_URI || !PROD_USERNAME || !PROD_PASSWORD) {
      throw new Error(
        'Missing production Neo4j credentials. Set NEO4J_PROD_URI, NEO4J_PROD_USERNAME, and NEO4J_PROD_PASSWORD.'
      )
    }

    if (!DEV_URI || !DEV_USERNAME || !DEV_PASSWORD) {
      throw new Error(
        'Missing development Neo4j credentials. Set NEO4J_URI/USERNAME/PASSWORD.'
      )
    }

    if (PROD_URI === DEV_URI) {
      throw new Error(
        'NEO4J_PROD_URI and NEO4J_URI are identical. Configure a distinct production source URI to avoid backfilling from the wrong database.'
      )
    }

    this.prodDriver = neo4j.driver(
      PROD_URI,
      neo4j.auth.basic(PROD_USERNAME, PROD_PASSWORD)
    )
    this.devDriver = neo4j.driver(
      DEV_URI,
      neo4j.auth.basic(DEV_USERNAME, DEV_PASSWORD)
    )
  }

  async close(): Promise<void> {
    await this.prodDriver.close()
    await this.devDriver.close()
  }

  async collectBackfillRows(fallback: FallbackMode): Promise<{
    rows: LinkBackfillRow[]
    skippedNoTimestamp: number
  }> {
    const prodSession = this.prodDriver.session()

    try {
      const result = await prodSession.run(
        `
        MATCH (source)-[rel]->(target)
        WHERE type(rel) IN $relationshipTypes
          AND (source:Goal OR source:Resource OR source:CarePoint OR source:CoreValue)
          AND (target:Goal OR target:Resource OR target:CarePoint OR target:CoreValue)
        RETURN
          'pulse_' + source.id as sourcePulseId,
          'pulse_' + target.id as targetPulseId,
          type(rel) as relType,
          rel.createdAt as relCreatedAt,
          source.createdAt as sourceCreatedAt,
          target.createdAt as targetCreatedAt
      `,
        {
          relationshipTypes: [...LEGACY_REL_TYPES],
        }
      )

      const earliestByLinkId = new Map<string, LinkBackfillRow>()
      let skippedNoTimestamp = 0

      for (const record of result.records) {
        const row: RelationshipRow = {
          sourcePulseId: record.get('sourcePulseId'),
          targetPulseId: record.get('targetPulseId'),
          relType: record.get('relType'),
          relCreatedAt: record.get('relCreatedAt'),
          sourceCreatedAt: record.get('sourceCreatedAt'),
          targetCreatedAt: record.get('targetCreatedAt'),
        }

        const sourcePulseId = row.sourcePulseId
        const targetPulseId = row.targetPulseId
        const relType = row.relType

        if (!sourcePulseId || !targetPulseId || !relType) {
          continue
        }

        const best = pickBestTimestamp(
          toIsoDateTime(row.relCreatedAt),
          toIsoDateTime(row.sourceCreatedAt),
          toIsoDateTime(row.targetCreatedAt),
          fallback
        )

        if (!best) {
          skippedNoTimestamp++
          continue
        }

        const linkId = `resonance_${sourcePulseId}_${relType}_${targetPulseId}`
        const existing = earliestByLinkId.get(linkId)

        if (!existing) {
          earliestByLinkId.set(linkId, {
            linkId,
            createdAt: best.createdAt,
            timestampSource: best.timestampSource,
          })
          continue
        }

        const existingMs = new Date(existing.createdAt).getTime()
        const nextMs = new Date(best.createdAt).getTime()
        if (Number.isFinite(nextMs) && nextMs < existingMs) {
          earliestByLinkId.set(linkId, {
            linkId,
            createdAt: best.createdAt,
            timestampSource: best.timestampSource,
          })
        }
      }

      return {
        rows: [...earliestByLinkId.values()],
        skippedNoTimestamp,
      }
    } finally {
      await prodSession.close()
    }
  }

  async previewMatch(rows: LinkBackfillRow[]): Promise<{
    matched: number
    missingLinks: number
    matchedRows: LinkBackfillRow[]
  }> {
    if (rows.length === 0) {
      return { matched: 0, missingLinks: 0, matchedRows: [] }
    }

    const devSession = this.devDriver.session()

    try {
      const result = await devSession.run(
        `
        UNWIND $rows as row
        OPTIONAL MATCH (link:ResonanceLink {id: row.linkId})
        RETURN row.linkId as linkId, count(link) > 0 as exists
      `,
        { rows }
      )

      const existsById = new Map<string, boolean>()
      for (const record of result.records) {
        existsById.set(record.get('linkId'), record.get('exists'))
      }

      const matchedRows = rows.filter((row) => existsById.get(row.linkId))
      return {
        matched: matchedRows.length,
        missingLinks: rows.length - matchedRows.length,
        matchedRows,
      }
    } finally {
      await devSession.close()
    }
  }

  async applyBackfill(rows: LinkBackfillRow[]): Promise<number> {
    if (rows.length === 0) return 0

    const BATCH_SIZE = 500
    let updated = 0

    for (let index = 0; index < rows.length; index += BATCH_SIZE) {
      const batch = rows.slice(index, index + BATCH_SIZE)
      const session: Session = this.devDriver.session()

      try {
        const result = await session.run(
          `
          UNWIND $rows as row
          MATCH (link:ResonanceLink {id: row.linkId})
          SET link.createdAt = datetime(row.createdAt)
          RETURN count(link) as updatedCount
        `,
          { rows: batch }
        )

        updated += result.records[0]?.get('updatedCount').toNumber() ?? 0
      } finally {
        await session.close()
      }
    }

    return updated
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('ResonanceLink createdAt Backfill')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Mode: ${args.apply ? 'APPLY' : 'DRY RUN'}`)
  console.log(`Fallback mode: ${args.fallback}\n`)
  console.log(`Source (prod): ${PROD_URI}`)
  console.log(`Target (dev):  ${DEV_URI}\n`)

  const backfiller = new ResonanceCreatedAtBackfiller()

  try {
    const { rows, skippedNoTimestamp } = await backfiller.collectBackfillRows(
      args.fallback
    )
    const { matched, missingLinks, matchedRows } =
      await backfiller.previewMatch(rows)

    console.log(`Legacy relationships mapped to link IDs: ${rows.length}`)
    console.log(`Mapped links found in dev:             ${matched}`)
    console.log(`Mapped links missing in dev:           ${missingLinks}`)
    console.log(`Rows skipped (no timestamp source):    ${skippedNoTimestamp}`)

    const relTimestampCount = rows.filter(
      (row) => row.timestampSource === 'relationship'
    ).length
    const fallbackTimestampCount = rows.length - relTimestampCount
    console.log(`Using relationship timestamp:          ${relTimestampCount}`)
    console.log(
      `Using fallback timestamp:              ${fallbackTimestampCount}\n`
    )

    if (matchedRows.length > 0) {
      const previewRows = matchedRows.slice(0, 10)
      console.log('Preview (first 10 updates):')
      for (const row of previewRows) {
        console.log(
          `  - ${row.linkId} -> ${row.createdAt} [${row.timestampSource}]`
        )
      }
      console.log('')
    }

    if (!args.apply) {
      console.log('Dry run complete. Re-run with --apply to write updates.\n')
      return
    }

    const updated = await backfiller.applyBackfill(matchedRows)
    console.log(`✅ Updated ResonanceLink.createdAt on ${updated} links\n`)
  } finally {
    await backfiller.close()
  }
}

main().catch((error) => {
  console.error('❌ Backfill failed:', error)
  process.exit(1)
})
