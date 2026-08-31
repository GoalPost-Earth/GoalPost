#!/usr/bin/env node

/**
 * Seed a single login-able user directly into the configured Neo4j database.
 *
 * This mirrors `POST /api/auth/signup` (src/app/api/auth/signup/route.ts) so a
 * seeded account is indistinguishable from a real one:
 *   - email normalized via the same trim+lowercase rule as normalize-email.ts
 *   - password hashed with bcrypt cost 12 over `password + PEPPER`, matching
 *     hashPassword/comparePassword in src/app/api/auth/utils.ts
 *   - Person MERGEd on email, then given the :User label plus the onboarding
 *     fields the app reads, adopting any pre-existing placeholder Person
 *   - MeSpace created with the `me_` id prefix and denormalized `ownerId`
 *     (the mespace_owner_unique constraint), same as getOrCreateMeSpace
 *
 * Usage:
 *   node scripts/seed-dev-user.mjs <email> "<First Last>" [password]
 *
 * Defaults to the SEED_USER_* env vars when args are omitted.
 */

import neo4j from 'neo4j-driver'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const uri = process.env.NEO4J_URI
const username = process.env.NEO4J_USERNAME || process.env.NEO4J_USER || 'neo4j'
const password = process.env.NEO4J_PASSWORD
const PEPPER = process.env.PEPPER || ''

if (!uri || !password) {
  console.error('❌ NEO4J_URI / NEO4J_PASSWORD missing from .env.local')
  process.exit(1)
}

const [, , argEmail, argName, argPassword] = process.argv

const rawEmail = argEmail || process.env.SEED_USER_EMAIL
const fullName = argName || process.env.SEED_USER_NAME || ''
const plainPassword =
  argPassword || process.env.SEED_USER_PASSWORD || 'password123'

if (!rawEmail) {
  console.error('❌ Usage: node scripts/seed-dev-user.mjs <email> "<Name>" [password]')
  process.exit(1)
}

// Same rule as src/lib/auth/normalize-email.ts
const email = rawEmail.trim().toLowerCase()
const firstName = fullName.split(' ')[0] || ''
const lastName = fullName.split(' ').slice(1).join(' ') || ''

async function main() {
  const driver = neo4j.driver(uri, neo4j.auth.basic(username, password))
  const session = driver.session()

  try {
    console.log(`Connecting to ${uri} …`)

    const existing = await session.run(
      `MATCH (p:Person {email: $email})
       OPTIONAL MATCH (p)-[:OWNS]->(ms:MeSpace)
       RETURN p.id AS id, p:User AS isUser, collect(ms.id) AS meSpaces`,
      { email }
    )

    if (existing.records.length > 0) {
      const r = existing.records[0]
      console.log(
        `\nℹ️  Person already exists: id=${r.get('id')} :User=${r.get('isUser')} meSpaces=${JSON.stringify(r.get('meSpaces'))}`
      )
      console.log('   Updating it in place (password reset + :User label).')
    }

    // bcrypt cost 12 over password+PEPPER — identical to hashPassword()
    const hashed = await bcrypt.hash(plainPassword + PEPPER, 12)

    const result = await session.run(
      `MERGE (person:Person {email: $email})
       SET person:User
       SET person.password = $password,
           person.id = coalesce(person.id, randomUUID()),
           person.firstName = $firstName,
           person.lastName = $lastName,
           person.createdAt = coalesce(person.createdAt, datetime()),
           person.updatedAt = datetime(),
           person.onboardingCurrentStepIndex = 0,
           person.onboardingCompletedSteps = [],
           person.onboardingIsCompleted = false,
           person.onboardingSkipped = false,
           person.inviteTokenHash = NULL,
           person.inviteTokenExpires = NULL
       WITH person
       // Adopting a placeholder contact makes this person self-sovereign —
       // shed the importer's CREATED_BY edge (mirrors the signup route).
       OPTIONAL MATCH (person)-[createdByEdge:CREATED_BY]->(:Person)
       DELETE createdByEdge
       WITH DISTINCT person
       RETURN person.id AS personId`,
      { email, password: hashed, firstName, lastName }
    )

    const personId = result.records[0].get('personId')

    // getOrCreateMeSpace equivalent — one MeSpace per Person.
    const meSpaceName = firstName ? `${firstName}'s MeSpace` : `${email}'s MeSpace`
    const meSpace = await session.run(
      `MATCH (person:Person {id: $personId})
       OPTIONAL MATCH (person)-[:OWNS]->(existingMeSpace:MeSpace)
       WITH person, existingMeSpace
       FOREACH (_ IN CASE WHEN existingMeSpace IS NULL THEN [1] ELSE [] END |
         CREATE (person)-[:OWNS]->(:Space:MeSpace {
           id: 'me_' + randomUUID(),
           name: $name,
           visibility: 'PRIVATE',
           ownerId: $personId,
           createdAt: datetime(),
           modifiedAt: datetime()
         })
       )
       WITH person, existingMeSpace IS NOT NULL AS reused
       MATCH (person)-[:OWNS]->(meSpace:MeSpace)
       RETURN meSpace.id AS meSpaceId, meSpace.name AS meSpaceName, reused`,
      { personId, name: meSpaceName }
    )

    const ms = meSpace.records[0]

    console.log('\n✅ User seeded')
    console.log('─────────────────────────────────────')
    console.log(`Email:     ${email}`)
    console.log(`Password:  ${plainPassword}`)
    console.log(`Name:      ${firstName} ${lastName}`.trim())
    console.log(`Person ID: ${personId}`)
    console.log(
      `MeSpace:   ${ms.get('meSpaceName')} (${ms.get('meSpaceId')})${ms.get('reused') ? ' [reused existing]' : ' [created]'}`
    )
  } finally {
    await session.close()
    await driver.close()
  }
}

main().catch((err) => {
  console.error('\n❌ Seed failed:', err)
  process.exit(1)
})
