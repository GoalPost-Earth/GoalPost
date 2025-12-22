#!/usr/bin/env node

/**
 * Seed initial user for GoalPost
 * Creates a person with email/name and a default MeSpace with a Health context
 */

import neo4j from 'neo4j-driver'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const uri = process.env.NEO4J_URI || 'neo4j://localhost:7687'
const user = process.env.NEO4J_USER || 'neo4j'
const password = process.env.NEO4J_PASSWORD || 'password'

async function seedInitialUser() {
  console.log('Connecting to Neo4j database...')

  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
  const session = driver.session()

  try {
    // Check if any users already exist
    const existingUsers = await session.run(
      'MATCH (p:Person) RETURN count(p) as count'
    )
    const userCount = existingUsers.records[0].get('count').toNumber()

    if (userCount > 0) {
      console.log(`\n⚠️  ${userCount} user(s) already exist in the database.`)
      console.log('Skipping seed to avoid duplicates.')
      console.log(
        'To re-seed, first clear the database with: MATCH (n) DETACH DELETE n'
      )
      return
    }

    console.log('\n📝 Creating initial user...')

    // Default user credentials
    const defaultEmail = process.env.SEED_USER_EMAIL || 'demo@goalpost.app'
    const defaultName = process.env.SEED_USER_NAME || 'Demo User'
    const defaultFirstName =
      process.env.SEED_USER_FIRST_NAME || defaultName.split(' ')[0]
    const defaultLastName =
      process.env.SEED_USER_LAST_NAME ||
      defaultName.split(' ').slice(1).join(' ') ||
      'User'
    const defaultPassword = process.env.SEED_USER_PASSWORD || 'password123'

    // Hash password
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)

    // Create Person node with IDs
    const personId = 'person_demo_001'
    const meSpaceId = 'space_demo_me_001'
    const healthContextId = 'context_demo_health_001'
    const wellnessContextId = 'context_demo_wellness_001'

    await session.run(
      `
      CREATE (person:Person:LifeSensor:RelationalEntity {
        id: $personId,
        firstName: $firstName,
        lastName: $lastName,
        email: $email,
        password: $password,
        createdAt: datetime(),
        passions: [],
        fieldsOfCare: [],
        traits: []
      })
      
      CREATE (meSpace:Space:MeSpace {
        id: $meSpaceId,
        name: $firstName + ' ' + $lastName + "'s Personal Space",
        visibility: "PRIVATE",
        createdAt: datetime()
      })
      
      CREATE (person)-[:OWNS]->(meSpace)
      
      CREATE (healthContext:FieldContext {
        id: $healthContextId,
        title: "Health & Wellness",
        emergentName: "The Body's Agreement",
        createdAt: datetime()
      })
      
      CREATE (wellnessContext:FieldContext {
        id: $wellnessContextId,
        title: "Personal Growth",
        emergentName: "The Unfolding Path",
        createdAt: datetime()
      })
      
      CREATE (meSpace)-[:HAS_CONTEXT]->(healthContext)
      CREATE (meSpace)-[:HAS_CONTEXT]->(wellnessContext)
    `,
      {
        personId,
        firstName: defaultFirstName,
        lastName: defaultLastName,
        email: defaultEmail,
        password: hashedPassword,
        meSpaceId,
        healthContextId,
        wellnessContextId,
      }
    )

    console.log('\n✅ Initial user created successfully!')
    console.log('\nUser Details:')
    console.log('─────────────────────────────────────')
    console.log(`Email:     ${defaultEmail}`)
    console.log(`Name:      ${defaultFirstName} ${defaultLastName}`)
    console.log(`Password:  ${defaultPassword}`)
    console.log(`Person ID: ${personId}`)
    console.log('\nSpaces Created:')
    console.log(
      `  • MeSpace: "${defaultFirstName} ${defaultLastName}'s Personal Space" (${meSpaceId})`
    )
    console.log('\nContexts Created:')
    console.log(`  • "Health & Wellness" (${healthContextId})`)
    console.log(`  • "Personal Growth" (${wellnessContextId})`)
    console.log('\n🎯 You can now login with these credentials!')
  } catch (error) {
    console.error('\n❌ Error seeding initial user:', error)
    process.exit(1)
  } finally {
    await session.close()
    await driver.close()
  }
}

seedInitialUser()
