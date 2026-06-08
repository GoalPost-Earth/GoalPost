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
 *   - Do not invent data. The schema-driven adaptations are:
 *       - `name` is mirrored to both `content` and `title` on pulses (dev's
 *         pulse types require both as non-null; this is a 1:1 rename, not new
 *         data).
 *       - Non-null reconciliation for fields prod has no faithful value for
 *         (see Phase 3c overlay + kb/08-migration.md): GoalPulse.status is
 *         coerced to the GoalStatus enum, ResourcePulse.resourceType is
 *         backfilled to a neutral default, and modifiedAt mirrors createdAt.
 *         Without these the detail drawer query nulls out (non-null
 *         propagation) and shows "entity no longer available".
 *       - Personal-authorship attribution (Phase 5e2): person-embraced /
 *         guided core values gain CREATED_BY + INITIATED_BY so they anchor in
 *         the owner's MeSpace instead of the unattributed fallback.
 *       - Each migrated User gets a MeSpace (auth requirement; one per
 *         Person invariant), now with a FieldContext for pulse anchoring.
 *       - Each prod Community becomes a WeSpace (one per Community),
 *         owned by the community's creator and with its members wired in.
 *       - Pulse placement follows the user's directive:
 *           · A pulse created by a Person that does NOT belong to a
 *             community is placed in that creator's MeSpace.
 *           · A pulse created by a Person that DOES belong to a community
 *             is placed in that community's WeSpace; its provenance to the
 *             person is preserved by the migrated CREATED_BY edge.
 *           · "Belongs to a community" = a Community points at the pulse via
 *             EMBRACES / MOTIVATED_BY / PROVIDES / HAS_ACCESS_TO in prod.
 *           · Pulses with no creator and no community (orphans) are placed
 *             in a single system fallback WeSpace ("Migrated (unattributed)")
 *             owned by and shared (ADMIN) with the migration stewards
 *             (FALLBACK_STEWARD_EMAILS) so they remain visible and movable.
 *
 * Behavior:
 *   - Wipes dev entirely, applies the schema (idempotent), then re-fills from
 *     prod. Designed to be re-run as many times as needed.
 *   - Reads from prod are wide and read-only.
 *   - After the structural build, forces a known dev password for the account
 *     named by DEV_LOGIN_EMAIL/DEV_LOGIN_PASSWORD (.env.local) so the team can
 *     always log into the refreshed dev DB. DEV-ONLY — guarded by the
 *     DEV_URI === PROD_URI refusal above; skipped if those vars are unset.
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

import bcrypt from 'bcryptjs'
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

// Server-side password pepper, read from the DEV env so the hash we write
// matches what the dev app's login route verifies against (it hashes
// `password + PEPPER` with bcrypt). Must mirror the dev app's PEPPER value.
const PEPPER = devEnv.PEPPER || ''

// After migration, force a known password for the primary dev account so the
// team can always log into the freshly-migrated dev DB. DEV-ONLY: the whole
// migration refuses to run against prod (URI-equality guard above), so this can
// never reach a production account.
//
// Both the target email and the password are read from the gitignored
// `.env.local` (NOT hardcoded here) so a weak dev password and a personal email
// never enter git history. If either is absent, Phase 5b skips with a notice.
// For the current dev DB these are set to jaedagy@gmail.com / "password".
const DEV_LOGIN_RESET = {
  email: devEnv.DEV_LOGIN_EMAIL || '',
  password: devEnv.DEV_LOGIN_PASSWORD || '',
}

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

// Default for ResourcePulse.resourceType — prod `Resource` nodes carry no
// resource-type concept, but dev's schema declares `resourceType: String!`
// (non-null). Any detail query selecting it on a null value nulls the whole
// response via GraphQL non-null propagation → the "entity no longer available"
// drawer error. Backfill a neutral default so the contract holds; stewards can
// refine later.
const DEFAULT_RESOURCE_TYPE = 'general'

// Map a legacy prod Goal.status to a valid dev `GoalStatus` enum member.
// Dev's `GoalPulse.status` is `GoalStatus!` (enum = ACTIVE | PAUSED | COMPLETED,
// non-null). Prod stores free strings ("Active" / "Inactive"); an invalid enum
// value fails coercion on the non-null field and nulls the entire detail query.
// Mapping (per migration decision): Active→ACTIVE, Inactive→PAUSED,
// already-valid values pass through, everything else (incl. missing) → ACTIVE.
function normalizeGoalStatus(raw: unknown): string {
  const v = typeof raw === 'string' ? raw.trim().toUpperCase() : ''
  switch (v) {
    case 'ACTIVE':
      return 'ACTIVE'
    case 'INACTIVE':
    case 'PAUSED':
      return 'PAUSED'
    case 'COMPLETED':
      return 'COMPLETED'
    default:
      return 'ACTIVE'
  }
}

// A prod pulse "belongs to a community" when a Community points at it via one
// of these relationship types (verified against live prod data):
//   Community -[:EMBRACES]->      CoreValue
//   Community -[:MOTIVATED_BY]->  Goal
//   Community -[:PROVIDES]->      Resource
//   Community -[:HAS_ACCESS_TO]-> Resource
// These edges are migrated 1:1 in Phase 4, so Phase 5 detects community
// membership directly in dev rather than re-reading prod.
const COMMUNITY_PULSE_RELS = [
  'EMBRACES',
  'MOTIVATED_BY',
  'PROVIDES',
  'HAS_ACCESS_TO',
]

// Stewards of the fallback ("Migrated (unattributed)") WeSpace. Orphaned pulses
// land here, and these users get ADMIN access so they can triage and move the
// content into the right spaces. Matched by email (these accounts have no
// `name` property). The first one present (in this order) owns the space; the
// rest are added as ADMIN members. If none exist in the dataset, ownership
// falls back to the first :User by id.
const FALLBACK_STEWARD_EMAILS = [
  'jaedagy@gmail.com', // JD Addy
  'robert.damashek@gmail.com', // Robert Damashek
]

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
      `CREATE CONSTRAINT space_membership_id IF NOT EXISTS
       FOR (n:SpaceMembership) REQUIRE n.id IS UNIQUE`,
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

  // 3c. Pulse-like nodes — mirror name → content AND title if name exists.
  // The dev pulse types (GoalPulse/ResourcePulse/StoryPulse) require BOTH
  // `content: String!` and `title: String!`; legacy nodes only carry `name`,
  // so it seeds both. Without `title`, any GraphQL query selecting it throws
  // INTERNAL_SERVER_ERROR (a non-null field resolving to null).
  for (const [prodLabel, devLabels] of Object.entries(PULSE_LABEL_MAP)) {
    const count = await migrateNodesByLabel(prodLabel, devLabels, (props) => {
      const patch: Record<string, unknown> = {}
      if (props.name != null && props.content == null) patch.content = props.name
      if (props.name != null && props.title == null) patch.title = props.name
      // modifiedAt is read by several dev surfaces; legacy nodes lack it.
      // Mirror createdAt so the property is always present (matches the seed).
      if (props.modifiedAt == null && props.createdAt != null)
        patch.modifiedAt = props.createdAt
      // status normalization. GoalPulse.status is a non-null GoalStatus enum;
      // ResourcePulse/StoryPulse.status are free Strings. BUT the GraphQL layer
      // cross-reads `status` against the GoalStatus enum whenever a FieldPulse
      // *interface* list is queried (e.g. context.pulses with a
      // `... on GoalPulse { status }` fragment): a sibling Resource/Story whose
      // status is the legacy "Active"/"Inactive" then fails enum coercion and
      // nulls the whole response. So normalize status to a valid GoalStatus
      // member on *every* pulse: Goal always (required, fills missing), and
      // Resource/Story whenever a legacy status is present.
      if (prodLabel === 'Goal') {
        patch.status = normalizeGoalStatus(props.status)
      } else if (props.status != null) {
        patch.status = normalizeGoalStatus(props.status)
      }
      // ResourcePulse.resourceType: backfill the non-null default when absent.
      if (prodLabel === 'Resource' && props.resourceType == null)
        patch.resourceType = DEFAULT_RESOURCE_TYPE
      return patch
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
 * Pulse placement (user directive):
 *   - A pulse created by a Person that does NOT belong to a community →
 *     anchored in that creator's MeSpace.
 *   - A pulse that belongs to a community → anchored in that community's
 *     WeSpace. Its CREATED_BY edge (migrated in Phase 4) preserves the link
 *     back to the authoring Person.
 *   - Orphan pulses (no creator and no community) → anchored in a single
 *     system fallback WeSpace so they stay visible in the app.
 *
 * Structures built:
 *   - One MeSpace per :User (auth + one-per-Person invariant), each with a
 *     FieldContext to anchor the user's non-community pulses.
 *   - One WeSpace per Community (id `wespace_<communityId>`), owned by the
 *     community's creator, with members wired via the canonical
 *     Space -[:HAS_MEMBER]-> SpaceMembership -[:IS_MEMBER]-> Person pattern,
 *     and a FieldContext anchoring the community's pulses.
 *   - One fallback WeSpace (`wespace_migrated_unattributed`) for orphans.
 */
async function phase5_buildDevStructure(): Promise<{
  meSpaces: number
  weSpaces: number
  contexts: number
  haspulse: number
}> {
  console.log('━━━ Phase 5: Build dev Space/Context scaffolding ━━━')
  const session = devDriver.session()
  const rels = COMMUNITY_PULSE_RELS
  try {
    // 5a. MeSpace per :User (auth requirement + one-per-Person invariant).
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

    // 5b. FieldContext per MeSpace (anchors the owner's non-community pulses).
    const msCtx = await session.run(
      `MATCH (u:User)-[:OWNS]->(ms:MeSpace)
       WHERE NOT (ms)-[:HAS_CONTEXT]->(:FieldContext)
       CREATE (ctx:FieldContext {
         id: 'context_mespace_' + u.id,
         title: 'My migrated content',
         createdAt: datetime()
       })
       CREATE (ms)-[:HAS_CONTEXT]->(ctx)
       RETURN count(ctx) AS c`
    )
    let contexts = toInt(msCtx.records[0].get('c'))
    console.log(`   ✓ MeSpace FieldContexts created: ${contexts}`)

    // 5c. WeSpace per Community (id `wespace_<communityId>`), owned by the
    // community's creator. head(collect(...)) collapses any (rare) duplicate
    // CREATED_BY so we never try to create the same WeSpace id twice.
    const ws = await session.run(
      `MATCH (c:Community)
       WHERE NOT EXISTS { MATCH (:WeSpace {id: 'wespace_' + c.id}) }
       OPTIONAL MATCH (c)-[:CREATED_BY]->(cr:Person)
       WITH c, head(collect(cr)) AS creator
       CREATE (ws:Space:WeSpace {
         id: 'wespace_' + c.id,
         name: coalesce(c.name, 'Community ' + c.id),
         communityOriginId: c.id,
         creatorOriginId: creator.id,
         visibility: 'SHARED',
         createdAt: datetime()
       })
       FOREACH (_ IN CASE WHEN creator IS NULL THEN [] ELSE [1] END |
         CREATE (creator)-[:OWNS]->(ws)
       )
       RETURN count(ws) AS c`
    )
    let weSpaces = toInt(ws.records[0].get('c'))
    console.log(`   ✓ WeSpaces created (one per community): ${weSpaces}`)

    // 5d. Community WeSpace memberships. The owner (the single creator chosen
    // in 5c, recorded as creatorOriginId) joins first as ADMIN — deriving it
    // from creatorOriginId keeps admin selection identical to ownership even if
    // a community had co-creators. Then every BELONGS_TO / MEMBER_OF person
    // joins as MEMBER, skipping anyone already wired (e.g. the owner).
    const adminMembers = await session.run(
      `MATCH (ws:WeSpace)
       WHERE ws.creatorOriginId IS NOT NULL AND ws.communityOriginId IS NOT NULL
       MATCH (p:Person {id: ws.creatorOriginId})
       WHERE NOT EXISTS {
         MATCH (ws)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(p)
       }
       CREATE (sm:SpaceMembership {
         id: 'membership_' + p.id + '_' + ws.communityOriginId,
         role: 'ADMIN',
         addedAt: datetime()
       })
       CREATE (ws)-[:HAS_MEMBER]->(sm)
       CREATE (sm)-[:IS_MEMBER]->(p)
       RETURN count(sm) AS c`
    )
    // WITH DISTINCT collapses a Person who has BOTH BELONGS_TO and MEMBER_OF to
    // the same community into a single row — otherwise the two edges stream two
    // rows and (with no SpaceMembership.id constraint historically) create two
    // duplicate-id memberships. This case is real in prod data.
    const members = await session.run(
      `MATCH (c:Community)
       MATCH (ws:WeSpace {id: 'wespace_' + c.id})
       MATCH (p:Person)-[:BELONGS_TO|MEMBER_OF]->(c)
       WITH DISTINCT c, ws, p
       WHERE NOT EXISTS {
         MATCH (ws)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(p)
       }
       CREATE (sm:SpaceMembership {
         id: 'membership_' + p.id + '_' + c.id,
         role: 'MEMBER',
         addedAt: datetime()
       })
       CREATE (ws)-[:HAS_MEMBER]->(sm)
       CREATE (sm)-[:IS_MEMBER]->(p)
       RETURN count(sm) AS c`
    )
    console.log(
      `   ✓ Community memberships created: ${toInt(
        adminMembers.records[0].get('c')
      )} admin, ${toInt(members.records[0].get('c'))} member`
    )

    // 5e. FieldContext per community WeSpace.
    const wsCtx = await session.run(
      `MATCH (c:Community)
       MATCH (ws:WeSpace {id: 'wespace_' + c.id})
       WHERE NOT (ws)-[:HAS_CONTEXT]->(:FieldContext)
       CREATE (ctx:FieldContext {
         id: 'context_' + c.id + '_field',
         title: coalesce(c.name, 'Community') + ' Field',
         createdAt: datetime()
       })
       CREATE (ws)-[:HAS_CONTEXT]->(ctx)
       RETURN count(ctx) AS c`
    )
    contexts += toInt(wsCtx.records[0].get('c'))
    console.log(`   ✓ Community FieldContexts created: ${toInt(wsCtx.records[0].get('c'))}`)

    // 5e2. Personal-authorship attribution. In prod, a person's own pulses are
    // not always linked by CREATED_BY — core values especially are linked by
    // (Person)-[:EMBRACES|GUIDED_BY]->(CoreValue). Without a recognized creator,
    // 5g can't place them in the owner's MeSpace and they fall through to the
    // "Migrated (unattributed)" fallback. Wire CREATED_BY + INITIATED_BY from the
    // authoring :User so the existing 5g placement anchors them in that user's
    // MeSpace. Only :User persons (auth-capable, guaranteed a MeSpace via 5a)
    // qualify. Community-owned pulses are excluded so community EMBRACES still
    // routes to the community WeSpace (5f) — i.e. community precedence is kept.
    const attributed = await session.run(
      `MATCH (person:Person:User)-[:EMBRACES|GUIDED_BY]->(pulse:FieldPulse)
       WHERE NOT (pulse)-[:CREATED_BY]->(:Person)
         AND NOT EXISTS {
           MATCH (c:Community)-[r]->(pulse) WHERE type(r) IN $rels
         }
       WITH DISTINCT pulse, person
       MERGE (pulse)-[:CREATED_BY]->(person)
       MERGE (pulse)-[:INITIATED_BY]->(person)
       RETURN count(*) AS c`,
      { rels }
    )
    console.log(
      `   ✓ Personal-authorship attributions (EMBRACES/GUIDED_BY → CREATED_BY): ${toInt(
        attributed.records[0].get('c')
      )}`
    )

    // 5e3. INITIATED_BY mirror. Dev surfaces (e.g. "my pulses", resonance) read
    // INITIATED_BY, and the seed script wires both CREATED_BY and INITIATED_BY
    // "so any resolver picks it up". Migrated pulses only have the prod
    // CREATED_BY edge — mirror it so behaviour matches seeded content.
    const initiated = await session.run(
      `MATCH (pulse:FieldPulse)-[:CREATED_BY]->(person:Person)
       WHERE NOT (pulse)-[:INITIATED_BY]->(person)
       MERGE (pulse)-[:INITIATED_BY]->(person)
       RETURN count(*) AS c`
    )
    console.log(
      `   ✓ INITIATED_BY mirrored from CREATED_BY: ${toInt(
        initiated.records[0].get('c')
      )}`
    )

    // 5f. HAS_PULSE: community pulses → their community's FieldContext. Covers
    // pulses with and without a creator, and dual-community pulses (anchored
    // in both communities' contexts).
    // MERGE (not CREATE): a pulse can be tied to one community by more than one
    // rel type (e.g. Resource via PROVIDES and HAS_ACCESS_TO), which streams
    // duplicate (ctx, pulse) rows. MERGE collapses them into one edge.
    const hpCommunity = await session.run(
      `MATCH (c:Community)-[r]->(pulse:FieldPulse)
       WHERE type(r) IN $rels
       MATCH (ws:WeSpace {id: 'wespace_' + c.id})-[:HAS_CONTEXT]->(ctx:FieldContext)
       WITH DISTINCT ctx, pulse
       MERGE (ctx)-[:HAS_PULSE]->(pulse)
       RETURN count(*) AS c`,
      { rels }
    )
    let haspulse = toInt(hpCommunity.records[0].get('c'))
    console.log(`   ✓ HAS_PULSE (community pulses): ${haspulse}`)

    // 5g. HAS_PULSE: non-community pulses created by a user → that creator's
    // MeSpace FieldContext. A pulse with multiple creators lands in each
    // creator's MeSpace.
    const hpMeSpace = await session.run(
      `MATCH (pulse:FieldPulse)-[:CREATED_BY]->(p:Person)-[:OWNS]->(:MeSpace)-[:HAS_CONTEXT]->(ctx:FieldContext)
       WHERE NOT EXISTS {
         MATCH (cc:Community)-[r]->(pulse) WHERE type(r) IN $rels
       }
       WITH DISTINCT ctx, pulse
       MERGE (ctx)-[:HAS_PULSE]->(pulse)
       RETURN count(*) AS c`,
      { rels }
    )
    const hpMe = toInt(hpMeSpace.records[0].get('c'))
    haspulse += hpMe
    console.log(`   ✓ HAS_PULSE (MeSpace pulses): ${hpMe}`)

    // 5h. Fallback WeSpace for orphans (no creator-with-MeSpace, no community).
    // Owned by and shared with the migration stewards (FALLBACK_STEWARD_EMAILS)
    // so they have ADMIN access to triage and move orphaned content into the
    // right spaces. Ownership goes to the first present steward (by priority);
    // if none exist in the dataset, it falls back to the first :User by id.
    const ownerRes = await session.run(
      `MATCH (u:User)
       WITH u ORDER BY u.id
       WITH collect(u) AS users
       RETURN [e IN $emails WHERE e IN [x IN users | x.email]][0] AS ownerEmail,
              users[0].id AS firstUserId`,
      { emails: FALLBACK_STEWARD_EMAILS }
    )
    const ownerEmail = ownerRes.records[0]?.get('ownerEmail') ?? null
    const firstUserId = ownerRes.records[0]?.get('firstUserId') ?? null

    const fb = await session.run(
      `MATCH (owner:User)
       WHERE ($ownerEmail IS NOT NULL AND owner.email = $ownerEmail)
          OR ($ownerEmail IS NULL AND owner.id = $firstUserId)
       WITH owner LIMIT 1
       WHERE NOT EXISTS { MATCH (:WeSpace {id: 'wespace_migrated_unattributed'}) }
       CREATE (ws:Space:WeSpace {
         id: 'wespace_migrated_unattributed',
         name: 'Migrated (unattributed)',
         visibility: 'SHARED',
         createdAt: datetime()
       })
       CREATE (owner)-[:OWNS]->(ws)
       CREATE (ctx:FieldContext {
         id: 'context_migrated_unattributed',
         title: 'Unattributed migrated content',
         createdAt: datetime()
       })
       CREATE (ws)-[:HAS_CONTEXT]->(ctx)
       RETURN count(ws) AS c`,
      { ownerEmail, firstUserId }
    )
    const fallbackCreated = toInt(fb.records[0].get('c'))
    weSpaces += fallbackCreated
    contexts += fallbackCreated
    if (fallbackCreated > 0) {
      console.log(`   ✓ Fallback WeSpace created for orphans`)
    }

    // Grant ADMIN to the owner plus every present steward, so each can move
    // orphaned pulses out of the fallback space. Idempotent: SpaceMembership is
    // MERGEd on its unique id, so a re-run (or owner == steward) never dupes.
    if (fallbackCreated > 0) {
      const adminRes = await session.run(
        `MATCH (ws:WeSpace {id: 'wespace_migrated_unattributed'})
         MATCH (owner:User)-[:OWNS]->(ws)
         MATCH (u:User)
         WHERE u = owner OR u.email IN $emails
         MERGE (ws)-[:HAS_MEMBER]->(sm:SpaceMembership {
           id: 'membership_' + u.id + '_migrated_unattributed'
         })
           ON CREATE SET sm.role = 'ADMIN', sm.addedAt = datetime()
         MERGE (sm)-[:IS_MEMBER]->(u)
         RETURN count(DISTINCT u) AS c`,
        { emails: FALLBACK_STEWARD_EMAILS }
      )
      const admins = toInt(adminRes.records[0].get('c'))
      console.log(`   ✓ Fallback WeSpace ADMINs (stewards): ${admins}`)
    }

    // Anchor every still-unanchored pulse (the 42 true orphans + any pulse
    // whose only creator has no MeSpace) into the fallback context.
    const hpOrphan = await session.run(
      `MATCH (ctx:FieldContext {id: 'context_migrated_unattributed'})
       MATCH (pulse:FieldPulse)
       WHERE NOT EXISTS { MATCH (:FieldContext)-[:HAS_PULSE]->(pulse) }
       MERGE (ctx)-[:HAS_PULSE]->(pulse)
       RETURN count(*) AS c`
    )
    const hpOrphans = toInt(hpOrphan.records[0].get('c'))
    haspulse += hpOrphans
    console.log(`   ✓ HAS_PULSE (orphan pulses → fallback): ${hpOrphans}`)

    // Invariant: after fallback anchoring, NO pulse may be left unanchored.
    // The only way to reach here with stragglers is a degenerate prod with no
    // :User (so the fallback space was never created). Fail loudly rather than
    // let pulses silently disappear from the app — the migration's contract is
    // "no data loss".
    const unanchored = await session.run(
      `MATCH (pulse:FieldPulse)
       WHERE NOT EXISTS { MATCH (:FieldContext)-[:HAS_PULSE]->(pulse) }
       RETURN count(pulse) AS c`
    )
    const stragglers = toInt(unanchored.records[0].get('c'))
    if (stragglers > 0) {
      throw new Error(
        `Phase 5 left ${stragglers} FieldPulse(s) unanchored (no HAS_PULSE). ` +
          `The fallback WeSpace requires at least one :User to exist. Aborting ` +
          `to avoid silently dropping pulses.`
      )
    }

    console.log('✅ Dev structure built\n')
    return { meSpaces, weSpaces, contexts, haspulse }
  } finally {
    await session.close()
  }
}

/**
 * Phase 5b: Set a known dev login password for the primary account.
 *
 * Prod auth stores `Person.password` as a bcrypt hash of `password + PEPPER`
 * (cost 12 — see src/app/api/auth/utils.ts `hashPassword`). We mirror that
 * exactly so the dev login route verifies the hash. DEV-ONLY and safe: the
 * migration aborts when DEV_URI === PROD_URI, so a production account can never
 * be rewritten here. If PEPPER is absent from .env.local the resulting hash
 * won't match the dev app, so we warn loudly rather than write a dud silently.
 */
async function phase5b_setDevLoginPassword() {
  console.log('━━━ Phase 5b: Set dev login password ━━━')
  const { email, password } = DEV_LOGIN_RESET
  if (!email || !password) {
    console.log(
      '   ⏭️  DEV_LOGIN_EMAIL / DEV_LOGIN_PASSWORD not set in .env.local — skipping.'
    )
    console.log('✅ Dev login password step skipped\n')
    return
  }
  if (!PEPPER) {
    console.log(
      '   ⚠️  PEPPER missing from .env.local — the hash will NOT match the dev app. ' +
        'Add PEPPER to .env.local and re-run if login fails.'
    )
  }
  const hash = await bcrypt.hash(password + PEPPER, 12)
  const session = devDriver.session()
  try {
    const res = await session.run(
      `MATCH (u:User {email: $email})
       SET u.password = $hash
       RETURN count(u) AS c`,
      { email, hash }
    )
    const c = toInt(res.records[0].get('c'))
    if (c === 0) {
      console.log(`   ⚠️  No :User with email ${email} — password not set`)
    } else {
      console.log(`   ✓ Password for ${email} set to the dev default`)
    }
  } finally {
    await session.close()
  }
  console.log('✅ Dev login password set\n')
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
    await phase5b_setDevLoginPassword()
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
