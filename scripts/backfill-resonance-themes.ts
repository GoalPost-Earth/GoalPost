/**
 * Backfill FieldResonance theme nodes for resonance suggestions and links that
 * predate them.
 *
 * Discovery now writes one FieldResonance per theme per Space and points each
 * pair at it with RESONATES_AS, which is what lets the review queue be grouped
 * and accepted a theme at a time. Everything written BEFORE that carries the
 * theme only as a denormalized `label` / `description` string on each pair —
 * so without this script an existing queue collapses into a single "Ungrouped"
 * bucket and the grouped review surface does nothing for exactly the people who
 * need it most: the ones already holding hundreds of pending suggestions.
 *
 * The data needed is already there. Each suggestion carries the label its
 * cluster was named with, so the themes can be reconstructed by grouping on the
 * normalized label within each Space — the same `labelKey` the live upsert uses,
 * so a backfilled theme and a freshly discovered one of the same name are the
 * same node.
 *
 * Dry by default. Nothing is written without --apply.
 *
 *   npx tsx scripts/backfill-resonance-themes.ts                  # dry run, .env.local
 *   npx tsx scripts/backfill-resonance-themes.ts --apply
 *   npx tsx scripts/backfill-resonance-themes.ts --env=.env.demo --apply
 *
 * Safe to re-run: the write MERGEs the theme and its edges, so a second pass
 * over the same data changes nothing.
 */

import dotenv from 'dotenv'
import path from 'path'
import neo4j, { Driver, Session } from 'neo4j-driver'

const args = process.argv.slice(2)
const APPLY = args.includes('--apply')
const envArg = args.find((a) => a.startsWith('--env='))
const ENV_FILE = envArg ? envArg.slice('--env='.length) : '.env.local'

dotenv.config({ path: path.join(process.cwd(), ENV_FILE) })

const URI = process.env.NEO4J_URI
const USERNAME = process.env.NEO4J_USERNAME
const PASSWORD = process.env.NEO4J_PASSWORD

/** Must match MAX_LABEL_LENGTH in the discovery path, or a backfilled theme
 *  and a freshly discovered one could key differently and split the group. */
const MAX_LABEL_LENGTH = 60

interface SpaceLabelRow {
  spaceId: string
  spaceName: string | null
  label: string
  labelKey: string
  description: string
  suggestions: number
  links: number
}

function sanitize(value: string, maxLength: number): string {
  return (value || '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/[`<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

/**
 * Every (Space, normalized label) that has at least one suggestion or link
 * still missing a theme edge. The longest description wins as the theme's
 * wording — they are copies of one cluster paragraph, but a truncated or empty
 * one is a poor choice of representative.
 */
async function collect(session: Session): Promise<SpaceLabelRow[]> {
  const result = await session.run(`
    MATCH (space:Space)-[:HAS_SUGGESTION]->(s:ResonanceSuggestion)
    WHERE s.label IS NOT NULL AND trim(s.label) <> ''
      AND NOT EXISTS { MATCH (s)-[:RESONATES_AS]->(:FieldResonance) }
    RETURN space.id AS spaceId, space.name AS spaceName,
           s.label AS label, s.description AS description,
           1 AS isSuggestion
    UNION ALL
    MATCH (space:Space)-[:HAS_CONTEXT]->(:FieldContext)-[:HAS_RESONANCE]->(l:ResonanceLink)
    WHERE l.label IS NOT NULL AND trim(l.label) <> ''
      AND NOT EXISTS { MATCH (l)-[:RESONATES_AS]->(:FieldResonance) }
    RETURN space.id AS spaceId, space.name AS spaceName,
           l.label AS label, l.description AS description,
           0 AS isSuggestion
  `)

  const byKey = new Map<string, SpaceLabelRow>()
  for (const record of result.records) {
    const spaceId = record.get('spaceId') as string
    const rawLabel = (record.get('label') as string) ?? ''
    const label = sanitize(rawLabel, MAX_LABEL_LENGTH)
    if (!spaceId || !label) continue

    const labelKey = label.toLowerCase()
    const description = sanitize((record.get('description') as string) ?? '', 1000)
    const isSuggestion = Number(record.get('isSuggestion')) === 1
    const mapKey = `${spaceId}\u0000${labelKey}`

    const existing = byKey.get(mapKey)
    if (existing) {
      if (description.length > existing.description.length) {
        existing.description = description
      }
      if (isSuggestion) existing.suggestions += 1
      else existing.links += 1
      continue
    }
    byKey.set(mapKey, {
      spaceId,
      spaceName: (record.get('spaceName') as string) ?? null,
      label,
      labelKey,
      description,
      suggestions: isSuggestion ? 1 : 0,
      links: isSuggestion ? 0 : 1,
    })
  }
  return [...byKey.values()].sort(
    (a, b) => b.suggestions + b.links - (a.suggestions + a.links)
  )
}

/**
 * One (Space, label) at a time, in its own transaction, so a failure part-way
 * leaves a consistent graph rather than a half-themed Space.
 *
 * MERGE on the whole `(space)-[:HAS_FIELD_RESONANCE]->(fr {labelKey})` pattern —
 * identical to the discovery-time upsert, so this never adopts another Space's
 * theme and never creates a second node for one the live path already made.
 */
async function applyOne(session: Session, row: SpaceLabelRow) {
  return session.executeWrite(async (tx) => {
    const res = await tx.run(
      `
      MATCH (space:Space {id: $spaceId})
      MERGE (space)-[:HAS_FIELD_RESONANCE]->(fr:FieldResonance {labelKey: $labelKey})
        ON CREATE SET fr.id = 'fr_' + randomUUID(),
                      fr.label = $label,
                      fr.description = $description,
                      fr.createdAt = datetime()
        ON MATCH SET fr.id = coalesce(fr.id, 'fr_' + randomUUID())
      WITH space, fr

      CALL {
        WITH space, fr
        MATCH (space)-[:HAS_SUGGESTION]->(s:ResonanceSuggestion)
        WHERE toLower(trim(s.label)) = $labelKey
          AND NOT EXISTS { MATCH (s)-[:RESONATES_AS]->(:FieldResonance) }
        MERGE (s)-[:RESONATES_AS]->(fr)
        RETURN count(*) AS linkedSuggestions
      }

      CALL {
        WITH space, fr
        MATCH (space)-[:HAS_CONTEXT]->(:FieldContext)-[:HAS_RESONANCE]->(l:ResonanceLink)
        WHERE toLower(trim(l.label)) = $labelKey
          AND NOT EXISTS { MATCH (l)-[:RESONATES_AS]->(:FieldResonance) }
        MERGE (l)-[:RESONATES_AS]->(fr)
        RETURN count(*) AS linkedLinks
      }

      RETURN fr.id AS themeId, linkedSuggestions, linkedLinks
      `,
      {
        spaceId: row.spaceId,
        labelKey: row.labelKey,
        label: row.label,
        description: row.description,
      }
    )
    const rec = res.records[0]
    return {
      themeId: rec?.get('themeId') as string,
      suggestions: Number(rec?.get('linkedSuggestions') ?? 0),
      links: Number(rec?.get('linkedLinks') ?? 0),
    }
  })
}

async function main() {
  if (!URI || !USERNAME || !PASSWORD) {
    console.error(`Missing NEO4J_URI / NEO4J_USERNAME / NEO4J_PASSWORD in ${ENV_FILE}`)
    process.exit(1)
  }

  const driver: Driver = neo4j.driver(URI, neo4j.auth.basic(USERNAME, PASSWORD))
  const session = driver.session()
  try {
    console.log(`\nResonance theme backfill — ${ENV_FILE} (${URI})`)
    console.log(APPLY ? 'MODE: APPLY (writes)\n' : 'MODE: DRY RUN (no writes)\n')

    const rows = await collect(session)
    if (rows.length === 0) {
      console.log('Nothing to backfill — every suggestion and link already has a theme.\n')
      return
    }

    const bySpace = new Map<string, SpaceLabelRow[]>()
    for (const r of rows) {
      const list = bySpace.get(r.spaceId) ?? []
      list.push(r)
      bySpace.set(r.spaceId, list)
    }

    let totalThemes = 0
    let totalSuggestions = 0
    let totalLinks = 0

    for (const [spaceId, spaceRows] of bySpace) {
      const name = spaceRows[0].spaceName ?? spaceId
      const pairs = spaceRows.reduce((n, r) => n + r.suggestions + r.links, 0)
      console.log(`  ${name} — ${spaceRows.length} themes over ${pairs} pairs`)
      for (const row of spaceRows) {
        if (APPLY) {
          const res = await applyOne(session, row)
          totalSuggestions += res.suggestions
          totalLinks += res.links
          console.log(
            `    ✓ ${row.label} (${res.suggestions} suggestions, ${res.links} links)`
          )
        } else {
          totalSuggestions += row.suggestions
          totalLinks += row.links
          console.log(
            `    · ${row.label} (${row.suggestions} suggestions, ${row.links} links)`
          )
        }
        totalThemes += 1
      }
    }

    console.log(
      `\n${APPLY ? 'Backfilled' : 'Would backfill'} ${totalThemes} themes across ` +
        `${bySpace.size} space(s): ${totalSuggestions} suggestions, ${totalLinks} links.`
    )
    if (!APPLY) console.log('Re-run with --apply to write.\n')
    else console.log('')
  } finally {
    await session.close()
    await driver.close()
  }
}

main().catch((err) => {
  console.error('Backfill failed:', err)
  process.exit(1)
})
