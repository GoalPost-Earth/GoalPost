/**
 * Migration Script: Production DB → Development DB (1:1)
 *
 * Mandate (from user):
 *   - No data loss, with ONE deliberate exception: pulses that cannot be
 *     attributed to any owner (no creator-with-MeSpace and no community) are
 *     LEFT OUT of dev rather than parked in a fallback bucket (see Phase 5h).
 *     Every other prod node and relationship must appear in dev. Phase 6's
 *     parity report subtracts the intentional drop from its expectations.
 *   - Nothing is ever written to or deleted from prod.
 *   - Map legacy prod ontology to the new dev ontology: Resource / Goal /
 *     CoreValue → pulses (FieldPulse + ResourcePulse / GoalPulse / StoryPulse),
 *     and CarePoint → a PromiseWeave connector node (NOT a pulse). Preserve
 *     original labels alongside the new ones so the prod provenance survives.
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
 *       - Personal-authorship attribution (Phase 5e2): pulses a :User embraces,
 *         is guided by, provides, or is motivated by gain CREATED_BY +
 *         INITIATED_BY so they anchor in the owner's MeSpace instead of being
 *         dropped as unattributable.
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
 *           · Pulses with no creator-with-MeSpace and no community (orphans /
 *             unattributable) are LEFT OUT of dev entirely — DETACH DELETEd in
 *             Phase 5h rather than parked in a fallback bucket. Phase 6 records
 *             the intentional drop so parity stays meaningful.
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
 *   - CarePoint              → PromiseWeave:CarePoint   (connector, NOT a pulse)
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
// We preserve the original prod label (`:CoreValue`, `:Goal`, etc.) on each dev
// node alongside the new ontology labels — labels are free metadata that future
// maintainers use to trace which dev StoryPulse came from a prod CoreValue, etc.
//
// NOTE: `CarePoint` is intentionally absent here — it is NOT a pulse. A prod
// CarePoint becomes a `PromiseWeave` connector node (see CAREPOINT_WEAVE_LABELS
// and Phase 5d), per the promise-weave design (kb/05-data-entities.md, GOAL-266).
const PULSE_LABEL_MAP: Record<string, string[]> = {
  CoreValue: ['FieldPulse', 'StoryPulse', 'CoreValue'],
  Goal: ['FieldPulse', 'GoalPulse', 'Goal'],
  Resource: ['FieldPulse', 'ResourcePulse', 'Resource'],
}

// A prod `CarePoint` migrates to a bare `PromiseWeave` connector node (its own
// label, like `ResonanceLink` — NOT a pulse subtype). The prod `:CarePoint`
// label is kept for provenance. Phase 5d anchors each weave in its FieldContext
// via `HAS_WEAVE` and wires `WOVEN_FOR` / `WEAVES`.
const CAREPOINT_WEAVE_LABELS = ['PromiseWeave', 'CarePoint']

// PromiseWeave lifecycle status seeded on migrated care points (spike §6.5:
// proposed → active → fulfilled | dissolved). Migrated weaves start `active`.
const DEFAULT_WEAVE_STATUS = 'active'

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

// Dedicated, single-member test WeSpace rebuilt on every migration run (Phase
// 5c). Owned SOLELY by JD — no other members — so the team can exercise the
// invite-by-email flow against a clean, isolated space. GoalPost visibility
// flows exclusively through shared Space membership, so a person invited here
// is visible ONLY to JD, never to other migrated users (e.g. Robert), who are
// not members of this space. Stable ids make it predictable across runs; Phase
// 1 wipes dev, so each migration re-creates it fresh.
const JD_TEST_SPACE = {
  ownerEmail: 'jaedagy@gmail.com', // JD Addy — sole owner/member
  spaceId: 'wespace_jd_test',
  spaceName: 'JD Test Space',
  contextId: 'context_jd_test_field',
  contextTitle: 'Test Field',
  membershipId: 'membership_jd_test',
}

// Phase 5c2 (GOAL-299): mastress's migrated "The Artisans Cooperative" resource
// is ALSO a first-class :Organization (GOAL-298 — the glossary's canonical
// Organization example). Because a straight migration leaves it a private
// ResourcePulse in mastress's MeSpace, Space-authorization hides it from other
// members (Robert reported "This entity is no longer available"). This constant
// drives Phase 5c2, which reproduces the dual-type overlay + a shared WeSpace
// (owner + member) on every run, so a dev refresh never silently reverts the
// fix. The owner/member emails are real personal addresses, so — following the
// Phase 5b convention (kb/08-migration.md) — they are read from the gitignored
// `.env.local` (ARTISANS_OWNER_EMAIL / ARTISANS_MEMBER_EMAIL) rather than
// committed here. If either is unset (or the resource isn't in the dataset) the
// phase warns and skips (non-fatal), exactly like Phase 5b/5c.
const ARTISANS_ORG = {
  resourceId: '1b07343c-1071-41a2-9df1-9f83708452f6',
  ownerEmail: devEnv.ARTISANS_OWNER_EMAIL || '', // cooperative creator → owner/ADMIN
  memberEmail: devEnv.ARTISANS_MEMBER_EMAIL || '', // tester → MEMBER
  spaceId: 'wespace_artisans_shared',
  spaceName: 'Artisans Cooperative Circle',
  spaceDescription:
    'Shared space for the Artisans Cooperative — the cooperative creator and a member.',
  contextId: 'context_artisans_shared_field',
  contextTitle: 'Artisans Cooperative',
  ownerMembershipId: 'sm_artisans_mastress',
  memberMembershipId: 'sm_artisans_robert',
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
        // CarePoint is a PromiseWeave connector in dev, not a pulse.
        out.add('PromiseWeave')
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
      `CREATE CONSTRAINT promise_weave_id IF NOT EXISTS
       FOR (n:PromiseWeave) REQUIRE n.id IS UNIQUE`,
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

  // 3c2. CarePoints → PromiseWeave connector nodes (NOT pulses). The dev
  // `PromiseWeave` type carries `title`, `status`, `createdAt`, `modifiedAt`
  // (no `content`/`resourceType`). Seed `title` from the legacy `name`, default
  // `status` to active, and mirror `modifiedAt` from `createdAt` like the seed.
  const carePoints = await migrateNodesByLabel(
    'CarePoint',
    CAREPOINT_WEAVE_LABELS,
    (props) => {
      const patch: Record<string, unknown> = {}
      if (props.name != null && props.title == null) patch.title = props.name
      if (props.status == null) patch.status = DEFAULT_WEAVE_STATUS
      if (props.modifiedAt == null && props.createdAt != null)
        patch.modifiedAt = props.createdAt
      return patch
    }
  )
  totals.CarePoint = carePoints
  console.log(`   ✓ CarePoint → ${CAREPOINT_WEAVE_LABELS.join(':')} (${carePoints})`)

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
 *   - Orphan / unattributable pulses (no creator-with-MeSpace and no community)
 *     → LEFT OUT of dev: DETACH DELETEd in Phase 5h, not bucketed anywhere.
 *
 * Structures built:
 *   - One MeSpace per :User (auth + one-per-Person invariant), each with a
 *     FieldContext to anchor the user's non-community pulses.
 *   - One WeSpace per Community (id `wespace_<communityId>`), owned by the
 *     community's creator, with members wired via the canonical
 *     Space -[:HAS_MEMBER]-> SpaceMembership -[:IS_MEMBER]-> Person pattern,
 *     and a FieldContext anchoring the community's pulses.
 */
async function phase5_buildDevStructure(): Promise<{
  meSpaces: number
  weSpaces: number
  contexts: number
  haspulse: number
  cloneCountsByLabel: Record<string, number>
  droppedByLabel: Record<string, number>
  droppedByRelType: Record<string, number>
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
    const weSpaces = toInt(ws.records[0].get('c'))
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
    // not always linked by CREATED_BY — they are often linked by one of:
    //   (Person)-[:EMBRACES|GUIDED_BY]->(CoreValue)   — values they hold
    //   (Person)-[:PROVIDES]->(Resource)              — resources they offer
    //   (Person)-[:MOTIVATED_BY]->(Goal)              — goals that drive them
    // All four are equally strong "this is mine" signals. Without a recognized
    // creator, 5g can't place the pulse in the owner's MeSpace and it would be
    // dropped as unattributable (5h). Wire CREATED_BY + INITIATED_BY from the
    // authoring :User so the existing 5g placement anchors it in that user's
    // MeSpace. Only :User persons (auth-capable, guaranteed a MeSpace via 5a)
    // qualify. Community-owned pulses are excluded so a community EMBRACES /
    // PROVIDES / MOTIVATED_BY still routes to the community WeSpace (5f) — i.e.
    // community precedence is kept. A pulse offered/embraced by several :Users
    // gains one CREATED_BY per user; 5g anchors it in each MeSpace and 5g2 then
    // splits it into independent per-owner copies (same path as shared values).
    const attributed = await session.run(
      `MATCH (person:Person:User)-[:EMBRACES|GUIDED_BY|PROVIDES|MOTIVATED_BY]->(pulse:FieldPulse)
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
      `   ✓ Personal-authorship attributions (EMBRACES/GUIDED_BY/PROVIDES/MOTIVATED_BY → CREATED_BY): ${toInt(
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

    // 5g2. Split shared personal pulses into independent per-owner copies.
    // A MeSpace is a private/personal space, so a pulse that 5g anchored in
    // MORE THAN ONE MeSpace (a core value created/embraced by several users —
    // e.g. "Love") is currently a single node shared across owners: deleting it
    // from one MeSpace would delete it from the others. Per the directive, each
    // owner must get their own copy. We keep the original for the first owner
    // (lowest id, deterministic) and clone it for each additional owner, MOVING
    // that owner's person↔pulse edges (CREATED_BY/INITIATED_BY/EMBRACES/
    // GUIDED_BY) and their MeSpace HAS_PULSE onto the clone — so the two copies
    // share no relationships and can be edited/deleted independently. Edges that
    // don't belong to a specific owner (e.g. a Goal's ALIGNED_TO) stay on the
    // original (the first owner's copy). Only MeSpace (personal) pulses are
    // split; WeSpace (community) pulses are shared by design.
    const sharedRes = await session.run(
      `MATCH (p:FieldPulse)
       WHERE NOT EXISTS {
         MATCH (c:Community)-[r]->(p) WHERE type(r) IN $rels
       }
       MATCH (ctx:FieldContext)-[:HAS_PULSE]->(p)
       WHERE ctx.id STARTS WITH 'context_mespace_'
       MATCH (owner:Person)-[:OWNS]->(:MeSpace)-[:HAS_CONTEXT]->(ctx)
       WITH p, collect(DISTINCT {ownerId: owner.id, ctxId: ctx.id}) AS owners
       WHERE size(owners) > 1
       RETURN p.id AS pulseId, labels(p) AS labels, owners`,
      { rels }
    )
    const cloneCountsByLabel: Record<string, number> = {}
    let clonesCreated = 0
    for (const rec of sharedRes.records) {
      const pulseId = rec.get('pulseId') as string
      const labels = rec.get('labels') as string[]
      const owners = (
        rec.get('owners') as { ownerId: string; ctxId: string }[]
      )
        .slice()
        .sort((a, b) => (a.ownerId < b.ownerId ? -1 : a.ownerId > b.ownerId ? 1 : 0))
      // owners[0] keeps the original; clone for each additional owner.
      for (const extra of owners.slice(1)) {
        const cloneId = `${pulseId}__ms_${extra.ownerId}`
        await session.run(
          `MATCH (orig:FieldPulse {id: $pulseId})
           MATCH (owner:Person {id: $ownerId})
           MATCH (ctx:FieldContext {id: $ctxId})
           // clone the node with identical labels + properties, new id
           CALL apoc.create.node(
             labels(orig),
             apoc.map.setKey(properties(orig), 'id', $cloneId)
           ) YIELD node AS clone
           CREATE (ctx)-[:HAS_PULSE]->(clone)
           // move this owner's outgoing pulse→owner edges (CREATED_BY,
           // INITIATED_BY) onto the clone
           WITH orig, owner, ctx, clone
           CALL {
             WITH orig, owner, clone
             MATCH (orig)-[e:CREATED_BY|INITIATED_BY]->(owner)
             CALL apoc.create.relationship(clone, type(e), properties(e), owner)
               YIELD rel
             DELETE e
             RETURN count(*) AS outMoved
           }
           // move this owner's incoming owner→pulse edges (EMBRACES, GUIDED_BY)
           CALL {
             WITH orig, owner, clone
             MATCH (owner)-[e:EMBRACES|GUIDED_BY]->(orig)
             CALL apoc.create.relationship(owner, type(e), properties(e), clone)
               YIELD rel
             DELETE e
             RETURN count(*) AS inMoved
           }
           // detach the original from this owner's MeSpace context
           CALL {
             WITH orig, ctx
             MATCH (ctx)-[hp:HAS_PULSE]->(orig)
             DELETE hp
             RETURN count(*) AS hpRemoved
           }
           RETURN clone.id AS cloneId`,
          { pulseId, ownerId: extra.ownerId, ctxId: extra.ctxId, cloneId }
        )
        clonesCreated++
        for (const l of labels) {
          cloneCountsByLabel[l] = (cloneCountsByLabel[l] ?? 0) + 1
        }
      }
    }
    haspulse += clonesCreated
    console.log(
      `   ✓ Shared MeSpace pulses split into per-owner copies: ${clonesCreated} clone(s)`
    )

    // 5h. Drop unattributable pulses. Per the migration directive, a pulse we
    // cannot tie to a real owner is LEFT OUT of dev rather than parked in a
    // "Migrated (unattributed)" fallback bucket. After community anchoring (5f),
    // MeSpace anchoring (5g) and the per-owner split (5g2), any FieldPulse that
    // still lacks a HAS_PULSE anchor is exactly that set: no community owns it,
    // and it has no creator-with-MeSpace (covers pulses with no creator at all,
    // pulses whose only author is a non-:User Person, and pulses carrying only
    // structural/log edges). We record what we drop — by node label and by
    // incident relationship type — so Phase 6 can subtract the intentional loss
    // from its parity expectations, then DETACH DELETE so no dangling edges
    // remain. This INTENTIONALLY relaxes strict prod→dev parity for the dropped
    // nodes/edges; Phase 6 accounts for it explicitly.
    const UNANCHORED = `MATCH (pulse:FieldPulse)
       WHERE NOT EXISTS { MATCH (:FieldContext)-[:HAS_PULSE]->(pulse) }`

    const droppedByLabel: Record<string, number> = {}
    const dropLabelsRes = await session.run(
      `${UNANCHORED}
       UNWIND labels(pulse) AS label
       RETURN label, count(*) AS c`
    )
    for (const r of dropLabelsRes.records) {
      droppedByLabel[r.get('label') as string] = toInt(r.get('c'))
    }

    // count(DISTINCT rel) so an edge between two dropped pulses (traversed from
    // both ends) is counted once — matching the single directed edge Phase 6's
    // relationship parity counts and removes.
    const droppedByRelType: Record<string, number> = {}
    const dropRelsRes = await session.run(
      `${UNANCHORED}
       MATCH (pulse)-[rel]-()
       RETURN type(rel) AS relType, count(DISTINCT rel) AS c`
    )
    for (const r of dropRelsRes.records) {
      droppedByRelType[r.get('relType') as string] = toInt(r.get('c'))
    }

    const dropRes = await session.run(
      `${UNANCHORED}
       DETACH DELETE pulse
       RETURN count(pulse) AS c`
    )
    const dropped = toInt(dropRes.records[0].get('c'))
    console.log(`   ✓ Unattributable pulses dropped (left out of dev): ${dropped}`)

    // Invariant: the drop targeted exactly the unanchored set, so zero pulses
    // may remain unanchored. A nonzero count means a pulse was created without
    // anchoring AND survived the drop filter (a logic bug) — fail loudly rather
    // than ship a pulse the UI can never surface.
    const unanchored = await session.run(
      `${UNANCHORED}
       RETURN count(pulse) AS c`
    )
    const stragglers = toInt(unanchored.records[0].get('c'))
    if (stragglers > 0) {
      throw new Error(
        `Phase 5 left ${stragglers} FieldPulse(s) unanchored after the ` +
          `unattributable-drop step — anchoring logic bug. Aborting.`
      )
    }

    // 5i. Community authorship attribution. Every remaining pulse is now anchored
    // (5f community, 5g MeSpace), but a COMMUNITY pulse can still lack any creator
    // edge — in prod, core values and shared resources are often linked to a
    // Community, not a Person, so 5e2's personal-authorship pass never reached
    // them. The UI attributes every pulse to a person ("who is this from?"), so
    // attribute each remaining creatorless pulse to the OWNER of its
    // (deterministically first) space — that space's steward. Personal MeSpace
    // pulses already have a creator (5g keys off it), so in practice this only
    // touches community-anchored pulses. Idempotent: MERGE on both edges.
    const ownerFallback = await session.run(
      `MATCH (pulse:FieldPulse)
       WHERE NOT EXISTS { (pulse)-[:INITIATED_BY|CREATED_BY]->(:Person) }
       CALL {
         WITH pulse
         MATCH (owner:Person)-[:OWNS]->(s:Space)
               -[:HAS_CONTEXT]->(:FieldContext)-[:HAS_PULSE]->(pulse)
         RETURN owner ORDER BY s.name, s.id LIMIT 1
       }
       MERGE (pulse)-[:CREATED_BY]->(owner)
       MERGE (pulse)-[:INITIATED_BY]->(owner)
       RETURN count(pulse) AS c`
    )
    console.log(
      `   ✓ Community authorship attribution (creatorless pulses → space owner): ${toInt(
        ownerFallback.records[0].get('c')
      )}`
    )

    console.log('✅ Dev structure built\n')
    return {
      meSpaces,
      weSpaces,
      contexts,
      haspulse,
      cloneCountsByLabel,
      droppedByLabel,
      droppedByRelType,
    }
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
 * Phase 5c: Dedicated single-member test WeSpace for JD.
 *
 * Rebuilds a clean WeSpace owned SOLELY by JD on every migration run so the
 * invite-by-email flow can be exercised against an isolated space. GoalPost
 * visibility flows exclusively through shared Space membership, so a person
 * invited into this space is visible ONLY to JD — never to other migrated
 * users (e.g. Robert), who are not members. JD joins as ADMIN so
 * `canManageMembers` (OWNS or ADMIN) lets the invite mutation through.
 * DEV-ONLY (same URI guard as the rest of the migration). Idempotent: guarded
 * CREATE + MERGEd membership, so a re-run never dupes. Parity-safe: only adds
 * non-prod-label nodes/edges, so Phase 6's `dev >= prod` checks still hold.
 */
async function phase5c_buildJdTestSpace() {
  console.log('━━━ Phase 5c: Build JD test WeSpace ━━━')
  const {
    ownerEmail,
    spaceId,
    spaceName,
    contextId,
    contextTitle,
    membershipId,
  } = JD_TEST_SPACE
  const session = devDriver.session()
  try {
    const created = await session.run(
      `MATCH (owner:User {email: $ownerEmail})
       WITH owner LIMIT 1
       WHERE NOT EXISTS { MATCH (:WeSpace {id: $spaceId}) }
       CREATE (ws:Space:WeSpace {
         id: $spaceId,
         name: $spaceName,
         visibility: 'SHARED',
         createdAt: datetime()
       })
       CREATE (owner)-[:OWNS]->(ws)
       CREATE (ctx:FieldContext {
         id: $contextId,
         title: $contextTitle,
         createdAt: datetime()
       })
       CREATE (ws)-[:HAS_CONTEXT]->(ctx)
       RETURN count(ws) AS c`,
      { ownerEmail, spaceId, spaceName, contextId, contextTitle }
    )
    const c = toInt(created.records[0]?.get('c') ?? 0)
    if (c === 0) {
      // The guarded CREATE produced nothing: either JD isn't in this dataset,
      // or the space already exists. Both are non-fatal — warn and continue
      // rather than abort the whole migration.
      const exists = await session.run(
        `RETURN EXISTS { MATCH (:WeSpace {id: $spaceId}) } AS e`,
        { spaceId }
      )
      if (!exists.records[0]?.get('e')) {
        console.log(
          `   ⚠️  No :User with email ${ownerEmail} — JD test WeSpace not created`
        )
        console.log('✅ JD test WeSpace step skipped\n')
        return
      }
      // Phase 1 wipes dev every run and main() calls this once, so in normal
      // operation the space is never pre-existing — this branch only matters
      // for a hypothetical partial/re-entrant run. Kept for safe idempotency.
      console.log(`   ✓ JD test WeSpace already present (${spaceId})`)
    } else {
      console.log(
        `   ✓ JD test WeSpace created (${spaceId}, owner ${ownerEmail})`
      )
    }

    // Owner joins as ADMIN so canManageMembers() lets JD invite into the space.
    // MERGE on the stable membership id keeps it idempotent across re-runs.
    await session.run(
      `MATCH (ws:WeSpace {id: $spaceId})
       MATCH (owner:User {email: $ownerEmail})-[:OWNS]->(ws)
       MERGE (ws)-[:HAS_MEMBER]->(sm:SpaceMembership { id: $membershipId })
         ON CREATE SET sm.role = 'ADMIN', sm.addedAt = datetime()
       MERGE (sm)-[:IS_MEMBER]->(owner)`,
      { spaceId, ownerEmail, membershipId }
    )
    console.log(`   ✓ JD added as ADMIN of the test WeSpace`)
  } finally {
    await session.close()
  }
  console.log('✅ JD test WeSpace built\n')
}

/**
 * Phase 5d: Anchor migrated care-point PromiseWeaves.
 *
 * A prod CarePoint migrates (Phase 3c2) to a bare `:PromiseWeave:CarePoint`
 * connector node — modelled exactly like ResonanceLink (its own node, NOT a
 * pulse subtype), surfaced within a FieldContext via a HAS_WEAVE context edge
 * analogous to HAS_RESONANCE (docs/promise-weave-design-spike.md, GOAL-266;
 * decision: the care point *is* the weave, per GOAL sync 2026-06-16).
 *
 * Because a weave is not a `:FieldPulse`, the Phase 5 pulse placement (HAS_PULSE)
 * and the 5h unattributable drop never touch it. This phase gives weaves the
 * parallel treatment pulses get:
 *   - HAS_WEAVE placement (community context, else creator's MeSpace context),
 *   - WOVEN_FOR (the person each weave concerns — mirrored from CREATED_BY),
 *   - WEAVES → the care point's neighbour pulses (its navigable neighbourhood,
 *     drawn from the already-migrated prod edges),
 *   - and the same "leave out unattributable" drop: a weave with no community
 *     and no creator-with-MeSpace has no HAS_WEAVE anchor and is DETACH DELETEd.
 *
 * The `CREATED_BY` edge already exists (migrated 1:1 in Phase 4). HAS_WEAVE /
 * WOVEN_FOR / WEAVES are dev-only edge types (absent in prod), so they never
 * affect prod→dev relationship parity. Dropped-weave counts (by label and
 * rel-type) are returned so Phase 6 subtracts them, exactly like the pulse drop.
 *
 * Like the other Phase 5 structural builds, this writes no activity :Log row.
 */
async function phase5d_buildPromiseWeaves(): Promise<{
  built: number
  droppedByLabel: Record<string, number>
  droppedByRelType: Record<string, number>
}> {
  console.log('━━━ Phase 5d: Anchor migrated care-point PromiseWeaves ━━━')
  const session = devDriver.session()
  const rels = COMMUNITY_PULSE_RELS
  try {
    // 5d-a. Community weaves → their community's FieldContext (HAS_WEAVE).
    const wcom = await session.run(
      `MATCH (c:Community)-[r]->(w:PromiseWeave)
       WHERE type(r) IN $rels
       MATCH (ws:WeSpace {id: 'wespace_' + c.id})-[:HAS_CONTEXT]->(ctx:FieldContext)
       WITH DISTINCT ctx, w
       MERGE (ctx)-[:HAS_WEAVE]->(w)
       RETURN count(*) AS c`,
      { rels }
    )
    // 5d-b. Non-community weaves created by a user → that creator's MeSpace
    // FieldContext. A weave with multiple creators anchors in each (shared
    // connector — weaves are not split per-owner the way personal pulses are).
    const wme = await session.run(
      `MATCH (w:PromiseWeave)-[:CREATED_BY]->(:Person)-[:OWNS]->(:MeSpace)-[:HAS_CONTEXT]->(ctx:FieldContext)
       WHERE NOT EXISTS { MATCH (cc:Community)-[r]->(w) WHERE type(r) IN $rels }
       WITH DISTINCT ctx, w
       MERGE (ctx)-[:HAS_WEAVE]->(w)
       RETURN count(*) AS c`,
      { rels }
    )
    const anchored = toInt(wcom.records[0].get('c')) + toInt(wme.records[0].get('c'))
    console.log(`   ✓ HAS_WEAVE anchored (care-point weaves): ${anchored}`)

    // 5d-c. Drop unattributable weaves (no community, no creator-with-MeSpace)
    // — same rule as the Phase 5h pulse drop. Capture counts for Phase 6.
    const UNANCHORED_W = `MATCH (w:PromiseWeave)
       WHERE NOT EXISTS { MATCH (:FieldContext)-[:HAS_WEAVE]->(w) }`
    const droppedByLabel: Record<string, number> = {}
    const dl = await session.run(
      `${UNANCHORED_W} UNWIND labels(w) AS label RETURN label, count(*) AS c`
    )
    for (const r of dl.records) {
      droppedByLabel[r.get('label') as string] = toInt(r.get('c'))
    }
    const droppedByRelType: Record<string, number> = {}
    const dr = await session.run(
      `${UNANCHORED_W} MATCH (w)-[rel]-() RETURN type(rel) AS relType, count(DISTINCT rel) AS c`
    )
    for (const r of dr.records) {
      droppedByRelType[r.get('relType') as string] = toInt(r.get('c'))
    }
    const dropRes = await session.run(
      `${UNANCHORED_W} DETACH DELETE w RETURN count(w) AS c`
    )
    const droppedW = toInt(dropRes.records[0].get('c'))
    if (droppedW > 0) {
      console.log(`   ✓ Unattributable weaves dropped (left out of dev): ${droppedW}`)
    }

    // 5d-d. WOVEN_FOR mirror — the person each surviving weave concerns.
    await session.run(
      `MATCH (w:PromiseWeave)-[:CREATED_BY]->(p:Person)
       WHERE NOT (w)-[:WOVEN_FOR]->(p)
       MERGE (w)-[:WOVEN_FOR]->(p)`
    )

    // 5d-e. WEAVES → the care point's neighbour pulses (its navigable
    // neighbourhood), drawn from the already-migrated prod relationships. Only
    // :FieldPulse neighbours qualify (Goals/Resources the care point cares for,
    // depends on, or enables) — this is what `PromiseWeave.weaves` surfaces.
    const wv = await session.run(
      `MATCH (w:PromiseWeave)-[nbr]-(p:FieldPulse)
       WHERE type(nbr) IN ['CARES_FOR','DEPENDS_ON','ENABLES','ENABLED_BY','APPLIED_IN']
       MERGE (w)-[:WEAVES]->(p)
       RETURN count(DISTINCT p) AS c`
    )
    console.log(
      `   ✓ WEAVES neighbourhood edges wired: ${toInt(wv.records[0].get('c'))}`
    )

    console.log('✅ Care-point PromiseWeaves anchored\n')
    return { built: anchored, droppedByLabel, droppedByRelType }
  } finally {
    await session.close()
  }
}

/**
 * Phase 5c2: Artisans Cooperative Organization overlay + shared space (GOAL-299).
 *
 * mastress's migrated "The Artisans Cooperative" resource is also a first-class
 * :Organization (GOAL-298). A plain migration leaves it a private ResourcePulse
 * in mastress's MeSpace, so Space-authorization hides it from other members
 * (Robert hit "This entity is no longer available"). This phase reproduces the
 * one-off backfill on every run: it (1) builds a SHARED WeSpace owned by
 * mastress (ADMIN) with Robert as MEMBER + a FieldContext, and (2) overlays
 * :Organization:LifeSensor:RelationalEntity on the resource (keeping its
 * ResourcePulse labels — a dual-type node) and attaches it to that context via
 * HAS_ORGANIZATION, the only Space tie the Organization read gate keys on. The
 * resource stays anchored in mastress's MeSpace (HAS_PULSE), so the private
 * ResourcePulse view never leaks to Robert — he sees only the Organization.
 *
 * DEV-only (uses devDriver behind the same URI guard), idempotent (MERGE on
 * stable ids), and parity-safe: it only SETs dev-only labels and MERGEs
 * dev-only structural edges — the node keeps its ResourcePulse label, so Phase
 * 6's ResourcePulse exact-equality is unaffected. If the resource or either
 * :Person:User isn't in the dataset, it warns and skips (non-fatal), like 5c.
 */
async function phase5c2_buildArtisansCooperativeOrg() {
  console.log(
    '━━━ Phase 5c2: Artisans Cooperative Organization + shared space ━━━'
  )
  const {
    resourceId,
    ownerEmail,
    memberEmail,
    spaceId,
    spaceName,
    spaceDescription,
    contextId,
    contextTitle,
    ownerMembershipId,
    memberMembershipId,
  } = ARTISANS_ORG
  if (!ownerEmail || !memberEmail) {
    console.log(
      '   ⏭️  ARTISANS_OWNER_EMAIL / ARTISANS_MEMBER_EMAIL not set in .env.local — skipping.'
    )
    console.log('✅ Artisans Cooperative org step skipped\n')
    return
  }
  const session = devDriver.session()
  try {
    const exists = await session.run(
      `RETURN EXISTS { MATCH (:ResourcePulse {id: $resourceId}) } AS e`,
      { resourceId }
    )
    if (!exists.records[0]?.get('e')) {
      console.log(
        `   ⚠️  No :ResourcePulse ${resourceId} in dataset — Artisans org step skipped`
      )
      console.log('✅ Artisans Cooperative org step skipped\n')
      return
    }

    // 1. Shared WeSpace (mastress owner/ADMIN, Robert MEMBER) + FieldContext.
    const space = await session.run(
      `MATCH (owner:Person:User {email: $ownerEmail})
       MATCH (member:Person:User {email: $memberEmail})
       MERGE (ws:Space:WeSpace {id: $spaceId})
         ON CREATE SET ws.name = $spaceName,
                       ws.description = $spaceDescription,
                       ws.visibility = 'SHARED',
                       ws.createdAt = datetime()
       MERGE (owner)-[:OWNS]->(ws)
       MERGE (ctx:FieldContext {id: $contextId})
         ON CREATE SET ctx.title = $contextTitle, ctx.createdAt = datetime()
       MERGE (ws)-[:HAS_CONTEXT]->(ctx)
       MERGE (ownerSm:SpaceMembership {id: $ownerMembershipId})
         ON CREATE SET ownerSm.role = 'ADMIN', ownerSm.addedAt = datetime()
       MERGE (ws)-[:HAS_MEMBER]->(ownerSm)
       MERGE (ownerSm)-[:IS_MEMBER]->(owner)
       MERGE (memberSm:SpaceMembership {id: $memberMembershipId})
         ON CREATE SET memberSm.role = 'MEMBER', memberSm.addedAt = datetime()
       MERGE (ws)-[:HAS_MEMBER]->(memberSm)
       MERGE (memberSm)-[:IS_MEMBER]->(member)
       RETURN count(ws) AS c`,
      {
        ownerEmail,
        memberEmail,
        spaceId,
        spaceName,
        spaceDescription,
        contextId,
        contextTitle,
        ownerMembershipId,
        memberMembershipId,
      }
    )
    if (toInt(space.records[0]?.get('c') ?? 0) === 0) {
      console.log(
        `   ⚠️  ${ownerEmail} / ${memberEmail} not both :Person:User — Artisans shared space not built`
      )
      console.log('✅ Artisans Cooperative org step skipped\n')
      return
    }
    console.log(
      `   ✓ Shared WeSpace ${spaceId} (owner ${ownerEmail} ADMIN, ${memberEmail} MEMBER)`
    )

    // 2. Overlay the Organization type + attach to the shared context. Backfills
    //    Organization.name (non-null) from title if the node lacks a name.
    await session.run(
      `MATCH (o:ResourcePulse {id: $resourceId})
       SET o:Organization:LifeSensor:RelationalEntity
       SET o.name = coalesce(o.name, o.title)
       SET o.updatedAt = datetime()
       WITH o
       MATCH (ctx:FieldContext {id: $contextId})
       MERGE (ctx)-[:HAS_ORGANIZATION]->(o)`,
      { resourceId, contextId }
    )
    console.log(
      `   ✓ "${contextTitle}" overlaid as :Organization + attached to the shared context`
    )
  } finally {
    await session.close()
  }
  console.log('✅ Artisans Cooperative Organization built\n')
}

/**
 * Phase 6: Validate parity. Compares prod and dev node/relationship counts
 * label-by-label, type-by-type.
 */
async function phase6_validate(
  expectedNodeTotals: Record<string, number>,
  relCounts: Record<string, number>,
  cloneCountsByLabel: Record<string, number> = {},
  droppedByLabel: Record<string, number> = {},
  droppedByRelType: Record<string, number> = {}
): Promise<{ pass: boolean; report: string[] }> {
  console.log('━━━ Phase 6: Validate parity ━━━')
  const prodSession = prodDriver.session()
  const devSession = devDriver.session()
  const report: string[] = []
  let pass = true
  try {
    // Node parity: every prod label should have ≥ that many nodes in dev, minus
    // any pulses we intentionally dropped in Phase 5h (unattributable). Dropped
    // nodes keep their prod labels, so a label that appeared on N dropped pulses
    // legitimately shows up to N fewer in dev.
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
      const dropped = droppedByLabel[label] ?? 0
      const ok = devCount >= prodCount - dropped
      if (!ok) pass = false
      const mark = ok ? '✓' : '✗'
      const dropNote = dropped > 0 ? ` (−${dropped} dropped)` : ''
      report.push(
        `  ${mark} ${label}: prod=${prodCount}, dev=${devCount}${dropNote}`
      )
    }

    // Validate the merged dev pulse counts match the sum of their prod
    // sources. This is the real "no data loss" check for the renamed nodes.
    // NOTE: CarePoint is NOT here — it migrates to a PromiseWeave (checked
    // separately below), so StoryPulse derives from CoreValue alone now.
    const pulseMerges = [
      { devLabel: 'StoryPulse', prodLabels: ['CoreValue'] },
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
      // Phase 5g2 intentionally clones shared personal pulses (one copy per
      // MeSpace owner), so dev gains `clones` of this label; Phase 5h drops
      // unattributable pulses, so dev loses `dropped`. The exact expectation is
      // prod + clones − dropped. IMPORTANT: count drops by the PROD source
      // labels, not the dev pulse label — a dev DB shared with the test suite can
      // hold dev-only fixture pulses (e.g. a `GoalPulse` with no `Goal` label)
      // that Phase 5h also drops; those never came from prod and aren't in dev
      // anymore, so they must not be subtracted from the prod→dev merge identity.
      const clones = cloneCountsByLabel[m.devLabel] ?? 0
      const dropped = m.prodLabels.reduce(
        (n, l) => n + (droppedByLabel[l] ?? 0),
        0
      )
      const expected = prodTotal + clones - dropped
      const ok = devTotal === expected
      if (!ok) pass = false
      const mark = ok ? '✓' : '✗'
      const cloneNote = clones > 0 ? ` +${clones} clone(s)` : ''
      const dropNote = dropped > 0 ? ` −${dropped} dropped` : ''
      report.push(
        `  ${mark} ${m.devLabel} merge: prod(${m.prodLabels.join('+')})=${prodTotal}, dev=${devTotal}${cloneNote}${dropNote}`
      )
    }

    // PromiseWeave: a prod CarePoint migrates 1:1 to a `:PromiseWeave:CarePoint`
    // connector (Phase 3c2 / 5d), minus any dropped as unattributable. dev
    // PromiseWeave count must equal prod CarePoint count − dropped.
    {
      const prodCpRes = await prodSession.run(
        `MATCH (n:CarePoint) RETURN count(n) AS c`
      )
      const prodCp = toInt(prodCpRes.records[0].get('c'))
      const devPwRes = await devSession.run(
        `MATCH (n:PromiseWeave) RETURN count(n) AS c`
      )
      const devPw = toInt(devPwRes.records[0].get('c'))
      const dropped = droppedByLabel['PromiseWeave'] ?? 0
      const ok = devPw === prodCp - dropped
      if (!ok) pass = false
      const dropNote = dropped > 0 ? ` −${dropped} dropped` : ''
      report.push(
        `  ${ok ? '✓' : '✗'} PromiseWeave: prod(CarePoint)=${prodCp}, dev=${devPw}${dropNote}`
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
      // DETACH DELETE in Phase 5h removes edges incident to dropped pulses, so
      // dev legitimately loses `dropped` edges of this type.
      const dropped = droppedByRelType[relType] ?? 0
      const ok = devCount >= prodCount - dropped
      if (!ok) pass = false
      const mark = ok ? '✓' : '✗'
      const dropNote = dropped > 0 ? ` (−${dropped} dropped)` : ''
      report.push(
        `  ${mark} :${relType}: prod=${prodCount}, dev=${devCount}${dropNote}`
      )
    }

    // Invariant: no orphaned (edgeless) FieldPulse. A correct migration either
    // anchors every pulse with a HAS_PULSE edge (Phase 5f/5g) or drops the
    // unanchored ones (Phase 5h), so any FieldPulse with zero relationships is
    // dev cruft (a stray test/spike fixture) that slipped past the wipe. It
    // pollutes pulse counts and is unreachable in the app — fail parity so it
    // can't masquerade as migrated content. Clean stray fixtures with
    // `npm run clean:orphan-pulses`.
    report.push('')
    const orphanRes = await devSession.run(
      `MATCH (p:FieldPulse) WHERE NOT (p)--() RETURN count(p) AS c`
    )
    const orphanPulses = toInt(orphanRes.records[0].get('c'))
    const orphanOk = orphanPulses === 0
    if (!orphanOk) pass = false
    report.push(
      `  ${orphanOk ? '✓' : '✗'} No orphaned (edgeless) FieldPulse: ${orphanPulses}`
    )

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
    const { cloneCountsByLabel, droppedByLabel, droppedByRelType } =
      await phase5_buildDevStructure()
    await phase5b_setDevLoginPassword()
    await phase5c_buildJdTestSpace()
    await phase5c2_buildArtisansCooperativeOrg()
    const weave = await phase5d_buildPromiseWeaves()
    // Fold the care-point-weave drops into the same maps Phase 6 subtracts, so
    // parity accounts for both the pulse drop (5h) and the weave drop (5d).
    const mergeCounts = (a: Record<string, number>, b: Record<string, number>) => {
      for (const [k, v] of Object.entries(b)) a[k] = (a[k] ?? 0) + v
    }
    mergeCounts(droppedByLabel, weave.droppedByLabel)
    mergeCounts(droppedByRelType, weave.droppedByRelType)
    const { pass } = await phase6_validate(
      totals,
      relCounts,
      cloneCountsByLabel,
      droppedByLabel,
      droppedByRelType
    )

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
