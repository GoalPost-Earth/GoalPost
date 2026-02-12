/**
 * Migration Script: Production DB to Development DB
 *
 * This script migrates user data and content from the production Neo4j database
 * to the development database, transforming the old data model to the new one.
 *
 * Phases:
 * 1. Cleanup dev DB (remove old demo data, preserve JD & Jesse)
 * 2. Create "Seed Community of Care" WeSpace
 * 3. Migrate users from production (with password hashes)
 * 4. Create MeSpaces for migrated users
 * 5. Transform and migrate data (CarePoint, Resource, Goal, CoreValue → Pulses)
 * 6. Migrate Log nodes (audit trail)
 * 7. Migrate relationships
 * 8. Validate migration
 */

import dotenv from 'dotenv'
import path from 'path'
import neo4j, { Driver, Session } from 'neo4j-driver'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

// Database connection configs
const PROD_URI = process.env.NEO4J_PROD_URI || process.env.NEO4J_URI
const PROD_USERNAME =
  process.env.NEO4J_PROD_USERNAME || process.env.NEO4J_USERNAME
const PROD_PASSWORD =
  process.env.NEO4J_PROD_PASSWORD || process.env.NEO4J_PASSWORD

const DEV_URI = process.env.NEO4J_URI
const DEV_USERNAME = process.env.NEO4J_USERNAME
const DEV_PASSWORD = process.env.NEO4J_PASSWORD

// Users to preserve in dev DB
const PRESERVE_USER_IDS = ['person_jd', 'person_jesse']
const PRESERVE_EMAILS = ['jd@thecodefoundry.dev', 'jesse@thecodefoundry.dev']

// Users to migrate from production
const MIGRATE_USER_EMAILS = [
  'robert.damashek@gmail.com',
  'jenniferdamashek@protonmail.com',
  'antonela.ambiente@gmail.com',
  'mastress@wrc.life',
]

// Seed COC WeSpace ID
const SEED_COC_SPACE_ID = 'space_seed_coc'

interface MigrationStats {
  usersDeleted: number
  usersMigrated: number
  meSpacesCreated: number
  pulsesCreated: number
  logsPreserved: number
  relationshipsMigrated: number
  errors: string[]
}

let prodDriver: Driver
let devDriver: Driver

async function connectDatabases() {
  console.log('🔌 Connecting to databases...\n')

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

  // Test connections
  await prodDriver.verifyConnectivity()
  await devDriver.verifyConnectivity()

  console.log('✅ Connected to both databases\n')
}

async function closeDatabases() {
  console.log('\n🔌 Closing database connections...')
  if (prodDriver) await prodDriver.close()
  if (devDriver) await devDriver.close()
  console.log('✅ Connections closed\n')
}

/**
 * Phase 1: Cleanup Dev DB
 * Delete all data for old demo users, preserve JD & Jesse
 */
async function phase1_cleanupDevDB(stats: MigrationStats): Promise<void> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Phase 1: Cleanup Dev DB')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const session = devDriver.session()

  try {
    // Get list of users to delete (not JD or Jesse)
    const usersToDelete = await session.run(
      `MATCH (p:Person)
       WHERE NOT p.id IN $preserveIds AND NOT p.email IN $preserveEmails
       RETURN p.id as id, p.email as email, p.name as name`,
      { preserveIds: PRESERVE_USER_IDS, preserveEmails: PRESERVE_EMAILS }
    )

    console.log(`Found ${usersToDelete.records.length} users to delete:`)
    usersToDelete.records.forEach((record) => {
      const email = record.get('email') || 'no-email'
      const name = record.get('name') || 'no-name'
      console.log(`  - ${email} (${name})`)
    })
    console.log()

    if (usersToDelete.records.length === 0) {
      console.log('✅ No users to delete\n')
      return
    }

    // Delete users and all their related data (except preserved users)
    const result = await session.run(
      `MATCH (p:Person)
       WHERE NOT p.id IN $preserveIds AND NOT p.email IN $preserveEmails
       OPTIONAL MATCH (p)-[r1]->(related)
       OPTIONAL MATCH (related)-[r2]->(deeper)
       DETACH DELETE p, related, deeper
       RETURN count(DISTINCT p) as deletedCount`,
      { preserveIds: PRESERVE_USER_IDS, preserveEmails: PRESERVE_EMAILS }
    )

    const deletedCount = result.records[0].get('deletedCount').toNumber()
    stats.usersDeleted = deletedCount

    console.log(`✅ Deleted ${deletedCount} users and their data\n`)
  } catch (error) {
    const errorMsg = `Phase 1 error: ${error}`
    console.error(`❌ ${errorMsg}\n`)
    stats.errors.push(errorMsg)
    throw error
  } finally {
    await session.close()
  }
}

/**
 * Phase 2: Create Seed COC WeSpace
 */
async function phase2_createSeedCOCSpace(stats: MigrationStats): Promise<void> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Phase 2: Create Seed COC WeSpace')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const session = devDriver.session()

  try {
    // Check if space already exists
    const existing = await session.run(
      `MATCH (ws:WeSpace {id: $spaceId}) RETURN ws`,
      { spaceId: SEED_COC_SPACE_ID }
    )

    if (existing.records.length > 0) {
      console.log('✅ Seed COC WeSpace already exists\n')
      return
    }

    // Create the WeSpace
    await session.run(
      `CREATE (ws:Space:WeSpace {
         id: $spaceId,
         name: $name,
         description: $description,
         visibility: 'PRIVATE',
         createdAt: datetime(),
         modifiedAt: datetime()
       })
       RETURN ws`,
      {
        spaceId: SEED_COC_SPACE_ID,
        name: 'Seed Community of Care',
        description:
          'Shared space for Seed Community of Care members - migrated from production',
      }
    )

    console.log('✅ Created Seed COC WeSpace\n')
  } catch (error) {
    const errorMsg = `Phase 2 error: ${error}`
    console.error(`❌ ${errorMsg}\n`)
    stats.errors.push(errorMsg)
    throw error
  } finally {
    await session.close()
  }
}

/**
 * Phase 3: Migrate Users from Production
 */
async function phase3_migrateUsers(stats: MigrationStats): Promise<void> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Phase 3: Migrate Users from Production')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const prodSession = prodDriver.session()
  const devSession = devDriver.session()

  try {
    // Get users from production
    const prodUsers = await prodSession.run(
      `MATCH (p:Person)
       WHERE p.email IN $emails AND p.password IS NOT NULL
       RETURN p.id as id, p.email as email, p.password as password, 
              p.firstName as firstName, p.lastName as lastName, p.name as name,
              labels(p) as labels`,
      { emails: MIGRATE_USER_EMAILS }
    )

    console.log(
      `Found ${prodUsers.records.length} users in production to migrate:\n`
    )

    for (const record of prodUsers.records) {
      const userId = record.get('id')
      const email = record.get('email')
      const password = record.get('password')
      const firstName = record.get('firstName')
      const lastName = record.get('lastName')
      const name = record.get('name')

      console.log(`  Migrating: ${email} (${userId})`)

      // Create person in dev DB with preserved UUID and password hash
      await devSession.run(
        `CREATE (p:Person:User:Member:LifeSensor:RelationalEntity {
           id: $id,
           email: $email,
           password: $password,
           firstName: $firstName,
           lastName: $lastName,
           name: $name,
           createdAt: datetime(),
           modifiedAt: datetime()
         })
         RETURN p`,
        {
          id: userId,
          email,
          password,
          firstName: firstName || null,
          lastName: lastName || null,
          name: name || null,
        }
      )

      stats.usersMigrated++
      console.log(`    ✓ User created`)
    }

    console.log(`\n✅ Migrated ${stats.usersMigrated} users\n`)
  } catch (error) {
    const errorMsg = `Phase 3 error: ${error}`
    console.error(`❌ ${errorMsg}\n`)
    stats.errors.push(errorMsg)
    throw error
  } finally {
    await prodSession.close()
    await devSession.close()
  }
}

/**
 * Phase 4: Create MeSpaces and SpaceMemberships
 */
async function phase4_createMeSpaces(stats: MigrationStats): Promise<void> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Phase 4: Create MeSpaces & Space Memberships')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const session = devDriver.session()

  try {
    // Get all migrated users
    const users = await session.run(
      `MATCH (p:Person)
       WHERE p.email IN $emails
       RETURN p.id as id, p.email as email, p.name as name`,
      { emails: MIGRATE_USER_EMAILS }
    )

    for (const record of users.records) {
      const userId = record.get('id')
      const email = record.get('email')
      const name = record.get('name') || email

      console.log(`  Creating MeSpace for: ${email}`)

      // Check if user already has a MeSpace
      const existingMeSpace = await session.run(
        `MATCH (p:Person {id: $userId})-[:OWNS]->(ms:MeSpace)
         RETURN ms`,
        { userId }
      )

      if (existingMeSpace.records.length > 0) {
        console.log(`    ⚠️  MeSpace already exists`)
        continue
      }

      // Create MeSpace
      const meSpaceId = `me_${userId}`
      await session.run(
        `MATCH (p:Person {id: $userId})
         CREATE (ms:Space:MeSpace {
           id: $meSpaceId,
           name: $name,
           visibility: 'PRIVATE',
           createdAt: datetime(),
           modifiedAt: datetime()
         })
         CREATE (p)-[:OWNS]->(ms)
         RETURN ms`,
        {
          userId,
          meSpaceId,
          name: `${name}'s Space`,
        }
      )

      stats.meSpacesCreated++
      console.log(`    ✓ MeSpace created (${meSpaceId})`)

      // Add SpaceMembership to Seed COC WeSpace
      await session.run(
        `MATCH (p:Person {id: $userId})
         MATCH (ws:WeSpace {id: $spaceId})
         CREATE (sm:SpaceMembership {
           id: 'membership_' + randomUUID(),
           role: 'ADMIN',
           joinedAt: datetime()
         })
         CREATE (p)-[:HAS_MEMBERSHIP]->(sm)
         CREATE (sm)-[:IN_SPACE]->(ws)
         RETURN sm`,
        {
          userId,
          spaceId: SEED_COC_SPACE_ID,
        }
      )

      console.log(`    ✓ Added to Seed COC WeSpace`)
    }

    console.log(`\n✅ Created ${stats.meSpacesCreated} MeSpaces\n`)
  } catch (error) {
    const errorMsg = `Phase 4 error: ${error}`
    console.error(`❌ ${errorMsg}\n`)
    stats.errors.push(errorMsg)
    throw error
  } finally {
    await session.close()
  }
}

/**
 * Phase 5: Transform and Migrate Data
 * CarePoint → CarePulse, Resource → ResourcePulse, Goal → GoalPulse, CoreValue → CoreValuePulse
 */
async function phase5_transformData(stats: MigrationStats): Promise<void> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Phase 5: Transform & Migrate Data')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const prodSession = prodDriver.session()
  const devSession = devDriver.session()

  try {
    // Transform CarePoints → CarePulse
    console.log('📦 Migrating CarePoints...')
    await transformNodeType(
      prodSession,
      devSession,
      'CarePoint',
      'CarePulse',
      stats
    )

    // Transform Resources → ResourcePulse
    console.log('📦 Migrating Resources...')
    await transformNodeType(
      prodSession,
      devSession,
      'Resource',
      'ResourcePulse',
      stats
    )

    // Transform Goals → GoalPulse
    console.log('📦 Migrating Goals...')
    await transformNodeType(prodSession, devSession, 'Goal', 'GoalPulse', stats)

    // Transform CoreValues → CoreValuePulse
    console.log('📦 Migrating CoreValues...')
    await transformNodeType(
      prodSession,
      devSession,
      'CoreValue',
      'CoreValuePulse',
      stats
    )

    console.log(`\n✅ Created ${stats.pulsesCreated} pulses\n`)
  } catch (error) {
    const errorMsg = `Phase 5 error: ${error}`
    console.error(`❌ ${errorMsg}\n`)
    stats.errors.push(errorMsg)
    throw error
  } finally {
    await prodSession.close()
    await devSession.close()
  }
}

/**
 * Helper function to transform a node type from production to FieldPulse in dev
 */
async function transformNodeType(
  prodSession: Session,
  devSession: Session,
  sourceLabel: string,
  targetPulseLabel: string,
  stats: MigrationStats
): Promise<void> {
  // Get nodes from production with creator relationship
  const prodNodes = await prodSession.run(
    `MATCH (n:${sourceLabel})
     OPTIONAL MATCH (n)-[:CREATED_BY]->(creator:Person)
     RETURN n.id as id, n.title as title, n.description as description, 
            n.createdAt as createdAt, n.modifiedAt as modifiedAt,
            creator.email as creatorEmail`,
    {}
  )

  let count = 0
  for (const record of prodNodes.records) {
    const nodeId = record.get('id')
    const title = record.get('title')
    const description = record.get('description')
    const createdAt = record.get('createdAt')
    const modifiedAt = record.get('modifiedAt')
    const creatorEmail = record.get('creatorEmail')

    // Skip if no creator or creator not in migration list
    if (!creatorEmail || !MIGRATE_USER_EMAILS.includes(creatorEmail)) {
      continue
    }

    // Generate content (prioritize description, fallback to title)
    const content = description || title || `Migrated ${sourceLabel}`

    // Create FieldPulse in dev DB
    await devSession.run(
      `MATCH (creator:Person {email: $creatorEmail})
       MATCH (ws:WeSpace {id: $spaceId})
       CREATE (pulse:FieldPulse:${targetPulseLabel} {
         id: $id,
         title: $title,
         content: $content,
         createdAt: CASE WHEN $createdAt IS NOT NULL THEN $createdAt ELSE datetime() END,
         modifiedAt: CASE WHEN $modifiedAt IS NOT NULL THEN $modifiedAt ELSE datetime() END,
         intensity: 5,
         sourceType: $sourceType
       })
       CREATE (creator)-[:CREATED]->(pulse)
       CREATE (pulse)-[:IN_SPACE]->(ws)
       RETURN pulse`,
      {
        id: nodeId,
        title: title || `Migrated ${sourceLabel}`,
        content,
        createdAt,
        modifiedAt,
        creatorEmail,
        spaceId: SEED_COC_SPACE_ID,
        sourceType: sourceLabel,
      }
    )

    count++
    stats.pulsesCreated++
  }

  console.log(`  ✓ Migrated ${count} ${sourceLabel} → ${targetPulseLabel}`)
}

/**
 * Phase 6: Migrate Log Nodes (Audit Trail)
 */
async function phase6_migrateLogs(stats: MigrationStats): Promise<void> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Phase 6: Migrate Log Nodes')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const prodSession = prodDriver.session()
  const devSession = devDriver.session()

  try {
    // Get logs from production that belong to migrated users
    const prodLogs = await prodSession.run(
      `MATCH (log:Log)<-[:LOGGED_FOR]-(person:Person)
       WHERE person.email IN $emails
       RETURN log.id as id, log as properties, person.email as personEmail`,
      { emails: MIGRATE_USER_EMAILS }
    )

    console.log(`Found ${prodLogs.records.length} logs to migrate`)

    for (const record of prodLogs.records) {
      const personEmail = record.get('personEmail')
      const properties = record.get('properties').properties

      // Create log in dev DB
      await devSession.run(
        `MATCH (p:Person {email: $personEmail})
         CREATE (log:Log)
         SET log = $properties
         CREATE (log)<-[:LOGGED_FOR]-(p)
         RETURN log`,
        {
          personEmail,
          properties,
        }
      )

      stats.logsPreserved++
    }

    console.log(`\n✅ Migrated ${stats.logsPreserved} log entries\n`)
  } catch (error) {
    const errorMsg = `Phase 6 error: ${error}`
    console.error(`❌ ${errorMsg}\n`)
    stats.errors.push(errorMsg)
    throw error
  } finally {
    await prodSession.close()
    await devSession.close()
  }
}

/**
 * Phase 7: Migrate Relationships between Pulses
 */
async function phase7_migrateRelationships(
  stats: MigrationStats
): Promise<void> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Phase 7: Migrate Relationships')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const prodSession = prodDriver.session()
  const devSession = devDriver.session()

  try {
    // Define relationship types to migrate between content nodes
    const relationshipTypes = [
      'MOTIVATED_BY',
      'DEPENDS_ON',
      'ENABLES',
      'PROVIDES',
      'CONNECTED_TO',
      'GUIDED_BY',
    ]

    for (const relType of relationshipTypes) {
      console.log(`  Migrating ${relType} relationships...`)

      // Get relationships from production
      const prodRels = await prodSession.run(
        `MATCH (source)-[r:${relType}]->(target)
         WHERE (source:CarePoint OR source:Resource OR source:Goal OR source:CoreValue)
           AND (target:CarePoint OR target:Resource OR target:Goal OR target:CoreValue)
         RETURN source.id as sourceId, target.id as targetId, properties(r) as props`,
        {}
      )

      let count = 0
      for (const record of prodRels.records) {
        const sourceId = record.get('sourceId')
        const targetId = record.get('targetId')
        const props = record.get('props')

        try {
          // Create relationship in dev DB if both nodes exist
          const result = await devSession.run(
            `MATCH (source:FieldPulse {id: $sourceId})
             MATCH (target:FieldPulse {id: $targetId})
             CREATE (source)-[r:${relType}]->(target)
             SET r = $props
             RETURN r`,
            { sourceId, targetId, props }
          )

          if (result.records.length > 0) {
            count++
            stats.relationshipsMigrated++
          }
        } catch {
          // Skip if nodes don't exist (might not be migrated)
          continue
        }
      }

      console.log(`    ✓ Migrated ${count} ${relType} relationships`)
    }

    console.log(`\n✅ Migrated ${stats.relationshipsMigrated} relationships\n`)
  } catch (error) {
    const errorMsg = `Phase 7 error: ${error}`
    console.error(`❌ ${errorMsg}\n`)
    stats.errors.push(errorMsg)
    throw error
  } finally {
    await prodSession.close()
    await devSession.close()
  }
}

/**
 * Phase 8: Validate Migration
 */
async function phase8_validate(stats: MigrationStats): Promise<void> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Phase 8: Validate Migration')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const session = devDriver.session()

  try {
    // Check user count
    const userCount = await session.run(
      `MATCH (p:Person)
       WHERE p.email IN $emails
       RETURN count(p) as count`,
      { emails: MIGRATE_USER_EMAILS }
    )
    console.log(
      `✓ Users migrated: ${userCount.records[0].get('count').toNumber()}`
    )

    // Check MeSpace constraint (each person should have max 1 MeSpace)
    const meSpaceCheck = await session.run(
      `MATCH (p:Person)-[:OWNS]->(ms:MeSpace)
       WITH p, count(ms) as meSpaceCount
       WHERE meSpaceCount > 1
       RETURN p.email as email, meSpaceCount`
    )

    if (meSpaceCheck.records.length > 0) {
      console.log('\n⚠️  WARNING: Found users with multiple MeSpaces:')
      meSpaceCheck.records.forEach((record) => {
        console.log(
          `  - ${record.get('email')}: ${record.get('meSpaceCount')} MeSpaces`
        )
      })
    } else {
      console.log('✓ All users have exactly 1 MeSpace')
    }

    // Check WeSpace membership
    const membershipCount = await session.run(
      `MATCH (p:Person)-[:HAS_MEMBERSHIP]->(:SpaceMembership)-[:IN_SPACE]->(ws:WeSpace {id: $spaceId})
       WHERE p.email IN $emails
       RETURN count(p) as count`,
      { spaceId: SEED_COC_SPACE_ID, emails: MIGRATE_USER_EMAILS }
    )
    console.log(
      `✓ Users in Seed COC: ${membershipCount.records[0].get('count').toNumber()}`
    )

    // Check pulse count
    const pulseCount = await session.run(
      `MATCH (pulse:FieldPulse)-[:IN_SPACE]->(ws:WeSpace {id: $spaceId})
       RETURN count(pulse) as count`,
      { spaceId: SEED_COC_SPACE_ID }
    )
    console.log(
      `✓ Pulses in Seed COC: ${pulseCount.records[0].get('count').toNumber()}`
    )

    // Check JD and Jesse's data is intact
    const preservedData = await session.run(
      `MATCH (p:Person)
       WHERE p.id IN $preserveIds
       OPTIONAL MATCH (p)-[:CREATED]->(pulse:FieldPulse)
       RETURN p.email as email, count(pulse) as pulseCount`,
      { preserveIds: PRESERVE_USER_IDS }
    )

    console.log('\n✓ Preserved users:')
    preservedData.records.forEach((record) => {
      console.log(
        `  - ${record.get('email')}: ${record.get('pulseCount').toNumber()} pulses`
      )
    })

    console.log('\n✅ Validation complete\n')
  } catch (error) {
    const errorMsg = `Phase 8 error: ${error}`
    console.error(`❌ ${errorMsg}\n`)
    stats.errors.push(errorMsg)
  } finally {
    await session.close()
  }
}

/**
 * Main migration function
 */
async function main() {
  const stats: MigrationStats = {
    usersDeleted: 0,
    usersMigrated: 0,
    meSpacesCreated: 0,
    pulsesCreated: 0,
    logsPreserved: 0,
    relationshipsMigrated: 0,
    errors: [],
  }

  console.log('\n')
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║   PRODUCTION TO DEVELOPMENT DATABASE MIGRATION            ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  console.log('\n')

  try {
    await connectDatabases()

    await phase1_cleanupDevDB(stats)
    await phase2_createSeedCOCSpace(stats)
    await phase3_migrateUsers(stats)
    await phase4_createMeSpaces(stats)
    await phase5_transformData(stats)
    await phase6_migrateLogs(stats)
    await phase7_migrateRelationships(stats)
    await phase8_validate(stats)

    // Print summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('MIGRATION SUMMARY')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log(`Users deleted:        ${stats.usersDeleted}`)
    console.log(`Users migrated:       ${stats.usersMigrated}`)
    console.log(`MeSpaces created:     ${stats.meSpacesCreated}`)
    console.log(`Pulses created:       ${stats.pulsesCreated}`)
    console.log(`Logs preserved:       ${stats.logsPreserved}`)
    console.log(`Relationships:        ${stats.relationshipsMigrated}`)

    if (stats.errors.length > 0) {
      console.log(`\n⚠️  Errors: ${stats.errors.length}`)
      stats.errors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`)
      })
    }

    console.log('\n🎉 Migration complete!\n')
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await closeDatabases()
  }
}

// Run migration
main()
