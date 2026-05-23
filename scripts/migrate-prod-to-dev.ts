/**
 * Migration Script: Production DB → Development DB (1:1)
 *
 * Mandate (from user):
 *   - No data loss. Every node and every relationship in prod must appear in dev.
 *   - Nothing is ever written to or deleted from prod.
 *   - Map legacy prod ontology (CarePoint / Resource / Goal / CoreValue) to the
 *     new dev pulse ontology (FieldPulse + StoryPulse / ResourcePulse /
 *     GoalPulse). Preserve original labels alongside the new ones so the prod
 *     provenance survives.
 *   - Do not invent properties. The only schema-driven adaptation is:
 *       - `name` is mirrored to `content` on pulses (dev's pulse type
 *         requires `content`; this is a 1:1 rename, not new data).
 *       - Each migrated User gets a MeSpace (auth requirement; one per
 *         Person invariant). MeSpaces are not used for pulse anchoring.
 *       - Each creator (any Person who authored a pulse via prod CREATED_BY)
 *         gets a WeSpace containing one FieldContext, and the pulses they
 *         authored are connected via HAS_PULSE. This is the user's
 *         directive: pulses live in WeSpaces grouped by who created them.
 *
 * Behavior:
 *   - Wipes dev entirely, applies the schema (idempotent), then re-fills from
 *     prod. Designed to be re-run as many times as needed.
 *   - Reads from prod are wide and read-only.
 *
 * Mapping (see kb/05-data-entities.md):
 *   - Person                 → Person:LifeSensor:RelationalEntity
 *   - Person:User            → Person:User:LifeSensor:RelationalEntity
 *   - Person:Member:User     → Person:User:LifeSensor:RelationalEntity  (drop :Member)
 *   - Community              → Community:LifeSensor:RelationalEntity
 *   - CarePoint              → FieldPulse:StoryPulse:CarePoint
 *   - CoreValue              → FieldPulse:StoryPulse:CoreValue
 *   - Goal                   → FieldPulse:GoalPulse:Goal
 *   - Resource               → FieldPulse:ResourcePulse:Resource
 *   - Log / Session /
 *     Response / Movie /
 *     Test / DriverTest /
 *     TestSource             → preserved as-is
 */

import fs from 'fs'
import path from 'path'
import neo4j, { Driver, Integer } from 'neo4j-driver'

// Load .env files into separate maps so prod and dev creds don't collide on
// the same NEO4J_URI key. `.env.local` holds DEV creds; `.env.production`
// holds PROD creds. Neither is mutated; both are read-only here.
function readEnvFile(filename: string): Record<string, string> {
  const filePath = path.join(process.cwd(), filename)
  if (!fs.existsSync(filePath)) return {}
  const out: Record<string, string> = {}
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq < 0) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    // Strip surrounding quotes.
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

const devEnv = readEnvFile('.env.local')
const prodEnv = readEnvFile('.env.production')

const DEV_URI = devEnv.NEO4J_URI
const DEV_USERNAME = devEnv.NEO4J_USERNAME
const DEV_PASSWORD = devEnv.NEO4J_PASSWORD

const PROD_URI = prodEnv.NEO4J_URI
const PROD_USERNAME = prodEnv.NEO4J_USERNAME
const PROD_PASSWORD = prodEnv.NEO4J_PASSWORD

// Safety: refuse to run if prod and dev URIs are the same. The wipe phase
// would otherwise destroy production.
if (DEV_URI && PROD_URI && DEV_URI === PROD_URI) {
  console.error(
    `\n❌ Refusing to run: DEV_URI (${DEV_URI}) === PROD_URI. Wipe-phase would destroy production.`
  )
  process.exit(1)
}

// Pulse-like prod labels and their dev label mappings.
// We preserve the original prod label (`:CarePoint`, `:CoreValue`, etc.) on
// each dev node alongside the new ontology labels — labels are free metadata
// that future maintainers will need to trace which dev StoryPulse came from
// a prod CarePoint vs a CoreValue (the new model merges the two).
const PULSE_LABEL_MAP: Record<string, string[]> = {
  CarePoint: ['FieldPulse', 'StoryPulse', 'CarePoint'],
  CoreValue: ['FieldPulse', 'StoryPulse', 'CoreValue'],
  Goal: ['FieldPulse', 'GoalPulse', 'Goal'],
  Resource: ['FieldPulse', 'ResourcePulse', 'Resource'],
}

// For Phase 4: when reading a prod edge whose endpoints have labels like
// [Person, Member, User] or [CoreValue], we need to know what labels those
// endpoints have in dev so we can disambiguate id collisions (e.g., prod
// id "2" is both a CoreValue and a Community node).
function devLabelsForProdLabels(prodLabels: string[]): string[] {
  const out = new Set<string>()
  for (const l of prodLabels) {
    switch (l) {
      case 'Person':
        out.add('Person')
        out.add('LifeSensor')
        out.add('RelationalEntity')
        break
      case 'User':
        out.add('User')
        break
      case 'Member':
        out.add('Member')
        break
      case 'Community':
        out.add('Community')
        out.add('LifeSensor')
        out.add('RelationalEntity')
        break
      case 'CarePoint':
        out.add('FieldPulse')
        out.add('StoryPulse')
        out.add('CarePoint')
        break
      case 'CoreValue':
        out.add('FieldPulse')
        out.add('StoryPulse')
        out.add('CoreValue')
        break
      case 'Goal':
        out.add('FieldPulse')
        out.add('GoalPulse')
        out.add('Goal')
        break
      case 'Resource':
        out.add('FieldPulse')
        out.add('ResourcePulse')
        out.add('Resource')
        break
      default:
        out.add(l)
    }
  }
  return Array.from(out)
}

// Non-pulse prod labels preserved verbatim (no mapping).
const PASSTHROUGH_LABELS = [
  'Log',
  'Session',
  'Response',
  'Movie',
  'Test',
  'DriverTest',
  'TestSource',
]

let prodDriver: Driver
let devDriver: Driver

function toInt(v: unknown): number {
  if (v == null) return 0
  if (typeof v === 'number') return v
  if (v instanceof Integer) return v.toNumber()
  // neo4j-driver Integer.toNumber duck-typed
  if (typeof (v as { toNumber?: () => number }).toNumber === 'function') {
    return (v as { toNumber: () => number }).toNumber()
  }
  return Number(v)
}

async function connectDatabases() {
  console.log('🔌 Connecting to databases...')

  if (!PROD_URI || !PROD_USERNAME || !PROD_PASSWORD) {
    throw new Error('Production database credentials not found in environment')
  }
  if (!DEV_URI || !DEV_USERNAME || !DEV_PASSWORD) {
    throw new Error('Development database credentials not found in environment')
  }

  prodDriver = neo4j.driver(
    PROD_URI,
    neo4j.auth.basic(PROD_USERNAME, PROD_PASSWORD)
  )
  devDriver = neo4j.driver(
    DEV_URI,
    neo4j.auth.basic(DEV_USERNAME, DEV_PASSWORD)
  )

  await prodDriver.verifyConnectivity()
  await devDriver.verifyConnectivity()

  console.log(`   prod → ${PROD_URI}`)
  console.log(`   dev  → ${DEV_URI}`)
  console.log('✅ Connected\n')
}

async function closeDatabases() {
  if (prodDriver) await prodDriver.close()
  if (devDriver) await devDriver.close()
}

/**
 * Phase 1: Wipe dev. The mandate is to delete nothing from prod, but dev
 * needs a clean slate after the partial failed run.
 */
async function phase1_wipeDev() {
  console.log('━━━ Phase 1: Wipe dev ━━━')
  const session = devDriver.session()
  try {
    // Drop in batches to avoid huge transactions.
    let deleted = 0
    while (true) {
      const result = await session.run(
        `MATCH (n)
         WITH n LIMIT 5000
         DETACH DELETE n
         RETURN count(n) AS c`
      )
      const c = toInt(result.records[0].get('c'))
      deleted += c
      if (c === 0) break
    }
    console.log(`✅ Deleted ${deleted} nodes from dev\n`)
  } finally {
    await session.close()
  }
}

/**
 * Phase 2: Ensure dev schema (constraints + vector indexes). Idempotent.
 * Mirrors scripts/init-db.js but without the destructive seed.
 */
async function phase2_applySchema() {
  console.log('━━━ Phase 2: Apply dev schema ━━━')
  const session = devDriver.session()
  try {
    const constraints = [
      `CREATE CONSTRAINT conversation_chunk_id IF NOT EXISTS
       FOR (n:ConversationChunk) REQUIRE n.id IS UNIQUE`,
      `CREATE CONSTRAINT person_id IF NOT EXISTS
       FOR (n:Person) REQUIRE n.id IS UNIQUE`,
      `CREATE CONSTRAINT community_id IF NOT EXISTS
       FOR (n:Community) REQUIRE n.id IS UNIQUE`,
      `CREATE CONSTRAINT space_id IF NOT EXISTS
       FOR (n:Space) REQUIRE n.id IS UNIQUE`,
      `CREATE CONSTRAINT mespace_owner_unique IF NOT EXISTS
       FOR (n:MeSpace) REQUIRE n.ownerId IS UNIQUE`,
      `CREATE CONSTRAINT context_id IF NOT EXISTS
       FOR (n:FieldContext) REQUIRE n.id IS UNIQUE`,
      `CREATE CONSTRAINT pulse_id IF NOT EXISTS
       FOR (n:FieldPulse) REQUIRE n.id IS UNIQUE`,
      `CREATE CONSTRAINT resonance_id IF NOT EXISTS
       FOR (n:FieldResonance) REQUIRE n.id IS UNIQUE`,
      `CREATE CONSTRAINT resonance_link_id IF NOT EXISTS
       FOR (n:ResonanceLink) REQUIRE n.id IS UNIQUE`,
      `CREATE CONSTRAINT conversation_thread_id IF NOT EXISTS
       FOR (n:ConversationThread) REQUIRE n.id IS UNIQUE`,
      `CREATE CONSTRAINT conversation_thread_ownerId IF NOT EXISTS
       FOR (n:ConversationThread) REQUIRE n.ownerId IS UNIQUE`,
      `CREATE CONSTRAINT conversation_turn_id IF NOT EXISTS
       FOR (n:ConversationTurn) REQUIRE n.id IS UNIQUE`,
      `CREATE CONSTRAINT context_extraction_id IF NOT EXISTS
       FOR (n:ContextExtraction) REQUIRE n.id IS UNIQUE`,
      `CREATE CONSTRAINT document_id IF NOT EXISTS
       FOR (n:Document) REQUIRE n.id IS UNIQUE`,
      `CREATE CONSTRAINT assistant_feedback_id IF NOT EXISTS
       FOR (n:AssistantFeedback) REQUIRE n.id IS UNIQUE`,
    ]
    for (const c of constraints) {
      try {
        await session.run(c)
      } catch (e) {
        const code = (e as { code?: string }).code
        if (code !== 'Neo.ClientError.Schema.EquivalentSchemaRuleAlreadyExists')
          throw e
      }
    }
    console.log(`✓ ${constraints.length} constraints ensured`)
    console.log('✅ Schema applied\n')
  } finally {
    await session.close()
  }
}

/**
 * Stream every node of a given prod label set and write them to dev. The
 * `decorate` callback returns the dev label list and an optional property
 * overlay to merge onto the prod properties.
 */
async function migrateNodesByLabel(
  prodLabel: string,
  devLabels: string[],
  propertyOverlay?: (
    props: Record<string, unknown>
  ) => Record<string, unknown>
): Promise<number> {
  const prodSession = prodDriver.session()
  const devSession = devDriver.session()
  let migrated = 0
  try {
    // Read with a stable order so iteration is deterministic.
    const result = await prodSession.run(
      `MATCH (n:${prodLabel})
       RETURN id(n) AS internalId, properties(n) AS props, labels(n) AS labels
       ORDER BY id(n)`
    )
    for (const record of result.records) {
      const props = record.get('props') as Record<string, unknown>
      const prodLabels = record.get('labels') as string[]
      // Skip if a previous iteration already wrote this id under a different
      // prod label (e.g., a node tagged both :Person and :User is reached
      // when we iterate :Person; iterating :User would otherwise hit a
      // uniqueness constraint).
      // Some prod fixtures have integer ids (TestSource: 1, 2, 3) or no
      // id at all (Movie, DriverTest). Preserve them either way — the user
      // wants every node migrated. Nodes without an id can't participate in
      // Phase 4's relationship migration, but if they're orphaned in prod
      // that's fine.
      const overlay = propertyOverlay ? propertyOverlay(props) : {}
      const finalProps = { ...props, ...overlay }
      const labelTag = devLabels.map((l) => `\`${l}\``).join(':')
      try {
        await devSession.run(
          `CREATE (n:${labelTag}) SET n = $props`,
          { props: finalProps }
        )
        migrated++
      } catch (err) {
        const code = (err as { code?: string }).code
        // Person:Member:User in prod arrives under :Person iteration first;
        // when we later iterate :User and :Member we'll hit the same id.
        // Skip with a quiet count rather than throwing.
        if (
          code === 'Neo.ClientError.Schema.ConstraintValidationFailed'
        ) {
          // Already created when iterating a different label of the same node.
          continue
        }
        // Surface unfamiliar prod labels so we can decide if they matter.
        if (prodLabels.length > 1) {
          console.warn(
            `   ⚠️  Node ${props.id} (labels=${prodLabels.join(',')}) failed: ${String(err)}`
          )
        }
        throw err
      }
    }
  } finally {
    await prodSession.close()
    await devSession.close()
  }
  return migrated
}

/**
 * Add extra labels to an existing dev node. Used to layer the :User /
 * :LifeSensor / :RelationalEntity labels onto Persons that were already
 * created by an earlier label pass.
 */
async function addLabelsToExisting(
  prodLabel: string,
  extraLabels: string[]
): Promise<number> {
  const prodSession = prodDriver.session()
  const devSession = devDriver.session()
  let touched = 0
  try {
    const result = await prodSession.run(
      `MATCH (n:${prodLabel})
       WHERE n.id IS NOT NULL
       RETURN n.id AS id`
    )
    const ids = result.records.map((r) => r.get('id'))
    const labelTag = extraLabels.map((l) => `\`${l}\``).join(':')
    const r = await devSession.run(
      `UNWIND $ids AS id
       MATCH (n {id: id})
       SET n:${labelTag}
       RETURN count(n) AS c`,
      { ids }
    )
    touched = toInt(r.records[0].get('c'))
  } finally {
    await prodSession.close()
    await devSession.close()
  }
  return touched
}

/**
 * Phase 3: Migrate every node from prod to dev.
 * Strategy: iterate by label, write once, layer on extra labels afterward.
 */
async function phase3_migrateNodes(): Promise<{ totals: Record<string, number> }> {
  console.log('━━━ Phase 3: Migrate nodes ━━━')
  const totals: Record<string, number> = {}

  // 3a. Persons (any label combination — we read by :Person which covers all).
  // For pulses we mirror name → content; Persons don't need that.
  const personsMigrated = await migrateNodesByLabel(
    'Person',
    ['Person', 'LifeSensor', 'RelationalEntity']
  )
  totals.Person = personsMigrated
  console.log(`   ✓ Person → Person:LifeSensor:RelationalEntity (${personsMigrated})`)

  // Layer :User on top of any Person that was :User in prod.
  const usersTagged = await addLabelsToExisting('User', ['User'])
  console.log(`   ✓ Added :User to ${usersTagged} existing Persons`)

  // Layer :Member on top for traceability (prod's auth-tier label).
  const membersTagged = await addLabelsToExisting('Member', ['Member'])
  console.log(`   ✓ Added :Member to ${membersTagged} existing Persons`)

  // 3b. Communities.
  const communities = await migrateNodesByLabel(
    'Community',
    ['Community', 'LifeSensor', 'RelationalEntity']
  )
  totals.Community = communities
  console.log(`   ✓ Community → Community:LifeSensor:RelationalEntity (${communities})`)

  // 3c. Pulse-like nodes — mirror name → content if name exists.
  for (const [prodLabel, devLabels] of Object.entries(PULSE_LABEL_MAP)) {
    const count = await migrateNodesByLabel(prodLabel, devLabels, (props) => {
      if (props.name != null && props.content == null) {
        return { content: props.name }
      }
      return {}
    })
    totals[prodLabel] = count
    console.log(`   ✓ ${prodLabel} → ${devLabels.join(':')} (${count})`)
  }

  // 3d. Pass-through nodes (Log, Session, Response, Movie, Test, ...).
  for (const label of PASSTHROUGH_LABELS) {
    const count = await migrateNodesByLabel(label, [label])
    totals[label] = count
    console.log(`   ✓ ${label} (${count})`)
  }

  console.log('✅ Nodes migrated\n')
  return { totals }
}

/**
 * Phase 4: Migrate every relationship in prod to dev. Generic, type-by-type.
 */
async function phase4_migrateRelationships(): Promise<Record<string, number>> {
  console.log('━━━ Phase 4: Migrate relationships ━━━')
  const prodSession = prodDriver.session()
  const devSession = devDriver.session()
  const counts: Record<string, number> = {}
  try {
    const typesResult = await prodSession.run(
      `CALL db.relationshipTypes() YIELD relationshipType RETURN relationshipType ORDER BY relationshipType`
    )
    const relTypes = typesResult.records.map((r) =>
      r.get('relationshipType')
    ) as string[]

    for (const relType of relTypes) {
      const edges = await prodSession.run(
        `MATCH (a)-[r:\`${relType}\`]->(b)
         WHERE a.id IS NOT NULL AND b.id IS NOT NULL
         RETURN a.id AS aId, b.id AS bId,
                labels(a) AS aLabels, labels(b) AS bLabels,
                properties(r) AS props`
      )
      let migrated = 0
      for (const rec of edges.records) {
        const aId = rec.get('aId')
        const bId = rec.get('bId')
        const aLabels = rec.get('aLabels') as string[]
        const bLabels = rec.get('bLabels') as string[]
        const props = rec.get('props') as Record<string, unknown>
        // Two prod nodes can share an `id` property if they have different
        // labels (prod id "2" is a CoreValue, a Community AND a TestSource).
        // We dropped the source-specific labels in dev (per user directive),
        // so map prod labels to their dev equivalents before matching.
        const devALabels = devLabelsForProdLabels(aLabels)
        const devBLabels = devLabelsForProdLabels(bLabels)
        const result = await devSession.run(
          `MATCH (a {id: $aId})
           WHERE any(l IN $devALabels WHERE l IN labels(a))
           MATCH (b {id: $bId})
           WHERE any(l IN $devBLabels WHERE l IN labels(b))
           CREATE (a)-[r:\`${relType}\`]->(b)
           SET r = $props
           RETURN r`,
          { aId, bId, devALabels, devBLabels, props }
        )
        migrated += result.records.length
      }
      counts[relType] = migrated
      console.log(`   ✓ ${relType}: ${migrated}`)
    }
  } finally {
    await prodSession.close()
    await devSession.close()
  }
  console.log('✅ Relationships migrated\n')
  return counts
}

/**
 * Phase 5: Build dev structural scaffolding.
 *
 *   - One MeSpace per :User (required for auth + the one-per-Person invariant).
 *   - One WeSpace per creator (any Person who has at least one pulse pointing
 *     at them via CREATED_BY). The user's directive: pulses get placed in
 *     WeSpaces grouped by who created them in prod.
 *   - One FieldContext per WeSpace, with HAS_PULSE edges to every pulse that
 *     creator authored. The creator is OWNed on the WeSpace and also added as
 *     a HAS_MEMBER (matching the dev schema's direct membership edge).
 */
async function phase5_buildDevStructure(): Promise<{
  meSpaces: number
  weSpaces: number
  contexts: number
  haspulse: number
}> {
  console.log('━━━ Phase 5: Build dev Space/Context scaffolding ━━━')
  const session = devDriver.session()
  try {
    // MeSpace per :User (auth requirement; not used for pulse anchoring).
    const ms = await session.run(
      `MATCH (u:User)
       WHERE NOT (u)-[:OWNS]->(:MeSpace)
       CREATE (ms:Space:MeSpace {
         id: 'mespace_' + u.id,
         name: coalesce(u.firstName, u.email, u.id) + "'s Space",
         ownerId: u.id,
         visibility: 'PRIVATE',
         createdAt: datetime()
       })
       CREATE (u)-[:OWNS]->(ms)
       RETURN count(ms) AS c`
    )
    const meSpaces = toInt(ms.records[0].get('c'))
    console.log(`   ✓ MeSpaces created: ${meSpaces}`)

    // WeSpace per creator (any Person who authored at least one pulse). The
    // creator is :OWNS the space and is wired as its sole member via the
    // canonical Space -[:HAS_MEMBER]-> SpaceMembership -[:IS_MEMBER]-> Person
    // pattern (see kb/05-data-entities.md).
    const ws = await session.run(
      `MATCH (p:Person)<-[:CREATED_BY]-(:FieldPulse)
       WITH DISTINCT p
       WHERE NOT (p)-[:OWNS]->(:WeSpace {creatorOriginId: p.id})
       CREATE (ws:Space:WeSpace {
         id: 'wespace_' + p.id,
         name: coalesce(p.firstName, p.email, p.id) + "'s Migrated Content",
         creatorOriginId: p.id,
         visibility: 'PRIVATE',
         createdAt: datetime()
       })
       CREATE (p)-[:OWNS]->(ws)
       CREATE (sm:SpaceMembership {
         id: 'sm_migrated_' + p.id,
         role: 'ADMIN',
         addedAt: datetime()
       })
       CREATE (ws)-[:HAS_MEMBER]->(sm)
       CREATE (sm)-[:IS_MEMBER]->(p)
       RETURN count(ws) AS c`
    )
    const weSpaces = toInt(ws.records[0].get('c'))
    console.log(`   ✓ WeSpaces created (one per creator): ${weSpaces}`)

    // FieldContext per WeSpace.
    const fc = await session.run(
      `MATCH (p:Person)-[:OWNS]->(ws:WeSpace {creatorOriginId: p.id})
       WHERE NOT (ws)-[:HAS_CONTEXT]->(:FieldContext)
       CREATE (ctx:FieldContext {
         id: 'context_migrated_' + p.id,
         title: 'Migrated content',
         createdAt: datetime()
       })
       CREATE (ws)-[:HAS_CONTEXT]->(ctx)
       RETURN count(ctx) AS c`
    )
    const contexts = toInt(fc.records[0].get('c'))
    console.log(`   ✓ FieldContexts created: ${contexts}`)

    // HAS_PULSE: wire each WeSpace's FieldContext to the pulses its creator
    // authored.
    const hp = await session.run(
      `MATCH (p:Person)-[:OWNS]->(ws:WeSpace {creatorOriginId: p.id})-[:HAS_CONTEXT]->(ctx:FieldContext)
       MATCH (pulse:FieldPulse)-[:CREATED_BY]->(p)
       WHERE NOT (ctx)-[:HAS_PULSE]->(pulse)
       CREATE (ctx)-[:HAS_PULSE]->(pulse)
       RETURN count(*) AS c`
    )
    const haspulse = toInt(hp.records[0].get('c'))
    console.log(`   ✓ HAS_PULSE edges created: ${haspulse}`)

    console.log('✅ Dev structure built\n')
    return { meSpaces, weSpaces, contexts, haspulse }
  } finally {
    await session.close()
  }
}

/**
 * Phase 6: Validate parity. Compares prod and dev node/relationship counts
 * label-by-label, type-by-type.
 */
async function phase6_validate(
  expectedNodeTotals: Record<string, number>,
  relCounts: Record<string, number>
): Promise<{ pass: boolean; report: string[] }> {
  console.log('━━━ Phase 6: Validate parity ━━━')
  const prodSession = prodDriver.session()
  const devSession = devDriver.session()
  const report: string[] = []
  let pass = true
  try {
    // All prod labels are preserved in dev for traceability — no expected drops.
    const DROPPED_LABELS = new Set<string>()

    // Node parity: every prod label should have ≥ that many nodes in dev,
    // except for labels we intentionally drop.
    const labelsResult = await prodSession.run(
      `CALL db.labels() YIELD label
       CALL { WITH label MATCH (n) WHERE label IN labels(n) RETURN count(n) AS c }
       RETURN label, c`
    )
    for (const r of labelsResult.records) {
      const label = r.get('label') as string
      const prodCount = toInt(r.get('c'))
      const devCountRes = await devSession.run(
        `MATCH (n) WHERE $label IN labels(n) RETURN count(n) AS c`,
        { label }
      )
      const devCount = toInt(devCountRes.records[0].get('c'))
      if (DROPPED_LABELS.has(label)) {
        report.push(
          `  • ${label}: prod=${prodCount}, dev=${devCount} (intentionally dropped)`
        )
        continue
      }
      const ok = devCount >= prodCount
      if (!ok) pass = false
      const mark = ok ? '✓' : '✗'
      report.push(`  ${mark} ${label}: prod=${prodCount}, dev=${devCount}`)
    }

    // Validate the merged dev pulse counts match the sum of their prod
    // sources. This is the real "no data loss" check for the renamed nodes.
    const pulseMerges = [
      { devLabel: 'StoryPulse', prodLabels: ['CarePoint', 'CoreValue'] },
      { devLabel: 'GoalPulse', prodLabels: ['Goal'] },
      { devLabel: 'ResourcePulse', prodLabels: ['Resource'] },
    ]
    for (const m of pulseMerges) {
      const prodSumResult = await prodSession.run(
        `UNWIND $labels AS lbl
         CALL { WITH lbl MATCH (n) WHERE lbl IN labels(n) RETURN count(n) AS c }
         RETURN sum(c) AS total`,
        { labels: m.prodLabels }
      )
      const prodTotal = toInt(prodSumResult.records[0].get('total'))
      const devTotalResult = await devSession.run(
        `MATCH (n) WHERE $label IN labels(n) RETURN count(n) AS c`,
        { label: m.devLabel }
      )
      const devTotal = toInt(devTotalResult.records[0].get('c'))
      const ok = devTotal === prodTotal
      if (!ok) pass = false
      const mark = ok ? '✓' : '✗'
      report.push(
        `  ${mark} ${m.devLabel} merge: prod(${m.prodLabels.join('+')})=${prodTotal}, dev=${devTotal}`
      )
    }

    // Relationship parity.
    report.push('')
    const relsResult = await prodSession.run(
      `CALL db.relationshipTypes() YIELD relationshipType
       CALL { WITH relationshipType MATCH ()-[r]->() WHERE type(r) = relationshipType RETURN count(r) AS c }
       RETURN relationshipType, c`
    )
    for (const r of relsResult.records) {
      const relType = r.get('relationshipType') as string
      const prodCount = toInt(r.get('c'))
      const devCountRes = await devSession.run(
        `MATCH ()-[rel]->() WHERE type(rel) = $relType RETURN count(rel) AS c`,
        { relType }
      )
      const devCount = toInt(devCountRes.records[0].get('c'))
      const ok = devCount >= prodCount
      if (!ok) pass = false
      const mark = ok ? '✓' : '✗'
      report.push(`  ${mark} :${relType}: prod=${prodCount}, dev=${devCount}`)
    }

    // Suppress unused-warning for the prepared inputs.
    void expectedNodeTotals
    void relCounts
  } finally {
    await prodSession.close()
    await devSession.close()
  }
  console.log(report.join('\n'))
  console.log(pass ? '✅ Parity OK\n' : '❌ Parity FAILED\n')
  return { pass, report }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║  PROD → DEV  ·  1:1 MIGRATION  (rewrite)                  ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')
  try {
    await connectDatabases()
    await phase1_wipeDev()
    await phase2_applySchema()
    const { totals } = await phase3_migrateNodes()
    const relCounts = await phase4_migrateRelationships()
    await phase5_buildDevStructure()
    const { pass } = await phase6_validate(totals, relCounts)

    if (!pass) {
      console.log(
        '⚠️  Run finished with parity gaps — see report above. Re-run after fixing the script.'
      )
      process.exit(2)
    }
    console.log('🎉 Migration complete.\n')
  } catch (err) {
    console.error('\n❌ Migration failed:', err)
    process.exit(1)
  } finally {
    await closeDatabases()
  }
}

main()
