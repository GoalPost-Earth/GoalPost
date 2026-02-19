/**
 * Migration Script: Reference Schema → Merged Schema
 *
 * Transforms data from production Neo4j (reference schema) to dev Neo4j (merged schema).
 * Follows the Pulse Migration Pattern:
 * - Person → Person + auto-created MeSpace + FieldContexts
 * - Goal → GoalPulse (in FieldContext)
 * - Resource → ResourcePulse (in FieldContext)
 * - CarePoint → StoryPulse (in FieldContext)
 * - CoreValue → StoryPulse (in FieldContext)
 * - Community → WeSpace + FieldContext
 * - Legacy relationships → ResonanceLinks with legacy relationship names as labels
 *
 * Usage: npx tsx scripts/migrate-reference-to-merged.ts
 */

import neo4j, { Driver } from 'neo4j-driver'

interface MigrationStats {
  peopleCreated: number
  meSpacesCreated: number
  fieldContextsCreated: number
  goalPulsesCreated: number
  resourcePulsesCreated: number
  storyPulsesCreated: number
  communitiesTransformed: number
  weSpacesCreated: number
  resonanceLinksCreated: number
  membershipsMigrated: number
  personConnectionsMigrated: number
  errors: string[]
}

class MigrationEngine {
  prodDriver: Driver
  devDriver: Driver
  stats: MigrationStats = {
    peopleCreated: 0,
    meSpacesCreated: 0,
    fieldContextsCreated: 0,
    goalPulsesCreated: 0,
    resourcePulsesCreated: 0,
    storyPulsesCreated: 0,
    communitiesTransformed: 0,
    weSpacesCreated: 0,
    resonanceLinksCreated: 0,
    membershipsMigrated: 0,
    personConnectionsMigrated: 0,
    errors: [],
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(prodUri: string, prodAuth: any, devUri: string, devAuth: any) {
    this.prodDriver = neo4j.driver(
      prodUri,
      neo4j.auth.basic(prodAuth.username, prodAuth.password)
    )
    this.devDriver = neo4j.driver(
      devUri,
      neo4j.auth.basic(devAuth.username, devAuth.password)
    )
  }

  async migrate(): Promise<void> {
    try {
      console.log(
        '🚀 Starting migration from reference schema to merged schema...\n'
      )

      // Step 1: Migrate People
      await this.migratePeople()

      // Step 2: Migrate Communities to WeSpaces
      await this.migrateCommunities()

      // Step 3: Migrate Goals to GoalPulses
      await this.migrateGoals()

      // Step 4: Migrate Resources to ResourcePulses
      await this.migrateResources()

      // Step 5: Migrate CarePoints to StoryPulses
      await this.migrateCarePoints()

      // Step 6: Migrate CoreValues to StoryPulses
      await this.migrateCoreValues()

      // Step 7: Migrate Relationships to ResonanceLinks
      await this.migrateRelationships()

      // Step 8: Migrate Community Memberships to SpaceMemberships
      await this.migrateMemberships()

      // Step 9: Migrate Person-to-Person Connections
      await this.migratePersonConnections()

      this.printStats()
    } catch (error) {
      console.error('❌ Migration failed:', error)
      throw error
    } finally {
      await this.prodDriver.close()
      await this.devDriver.close()
    }
  }

  private async migratePeople(): Promise<void> {
    console.log('📝 Migrating People...')
    const prodSession = this.prodDriver.session()
    const devSession = this.devDriver.session()

    try {
      // Read all people from prod
      const people = await prodSession.run(`
        MATCH (p:Person)
        RETURN {
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email,
          photo: p.photo,
          phone: p.phone,
          pronouns: p.pronouns,
          location: p.location,
          avatar: p.avatar,
          status: p.status,
          inviteSent: p.inviteSent,
          careManual: p.careManual,
          favorites: p.favorites,
          passions: p.passions,
          traits: p.traits,
          fieldsOfCare: p.fieldsOfCare,
          interests: p.interests,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt
        } as person
      `)

      for (const record of people.records) {
        const person = record.get('person')

        try {
          // Create person in dev
          await devSession.run(
            `
            CREATE (p:Person {
              id: $id,
              firstName: $firstName,
              lastName: $lastName,
              email: $email,
              photo: $photo,
              phone: $phone,
              pronouns: $pronouns,
              location: $location,
              avatar: $avatar,
              status: $status,
              inviteSent: $inviteSent,
              careManual: $careManual,
              favorites: $favorites,
              passions: $passions,
              traits: $traits,
              fieldsOfCare: $fieldsOfCare,
              interests: $interests,
              createdAt: $createdAt,
              updatedAt: $updatedAt
            })
            RETURN p
            `,
            person
          )

          // Create auto-generated MeSpace
          const meSpaceName = `${person.firstName} ${person.lastName} MeSpace`
          const meSpaceId = `mespace_${person.id}`

          await devSession.run(
            `
            CREATE (space:Space:MeSpace {
              id: $meSpaceId,
              name: $name,
              visibility: "PRIVATE",
              createdAt: datetime()
            })
            WITH space
            MATCH (p:Person { id: $personId })
            CREATE (p)-[:OWNS]->(space)
            RETURN space
            `,
            { meSpaceId, name: meSpaceName, personId: person.id }
          )

          // Create default FieldContext for user's pulses
          const contextId = `context_${person.id}_goals`
          const contextName = `${person.firstName}'s Goals`

          await devSession.run(
            `
            MATCH (space:MeSpace { id: $meSpaceId })
            CREATE (context:FieldContext {
              id: $contextId,
              title: $title,
              createdAt: datetime()
            })
            CREATE (space)-[:HAS_CONTEXT]->(context)
            WITH context
            MATCH (p:Person { id: $personId })
            CREATE (p)-[:CREATED_BY]->(context)
            RETURN context
            `,
            { meSpaceId, contextId, title: contextName, personId: person.id }
          )

          this.stats.peopleCreated++
          this.stats.meSpacesCreated++
          this.stats.fieldContextsCreated++
          console.log(`  ✓ ${person.firstName} ${person.lastName}`)
        } catch (error) {
          this.stats.errors.push(
            `Failed to migrate person ${person.id}: ${error}`
          )
          console.error(`  ✗ Failed to migrate person ${person.id}`)
        }
      }

      console.log(`✅ Migrated ${this.stats.peopleCreated} people\n`)
    } finally {
      await prodSession.close()
      await devSession.close()
    }
  }

  private async migrateCommunities(): Promise<void> {
    console.log('🏢 Migrating Communities to WeSpaces...')
    const prodSession = this.prodDriver.session()
    const devSession = this.devDriver.session()

    try {
      const communities = await prodSession.run(`
        MATCH (c:Community)
        RETURN {
          id: c.id,
          name: c.name,
          description: c.description,
          why: c.why,
          location: c.location,
          time: c.time,
          activities: c.activities,
          resultsAchieved: c.resultsAchieved,
          status: c.status,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt
        } as community
      `)

      for (const record of communities.records) {
        const community = record.get('community')

        try {
          // Get community creator (find who created it)
          const creatorResult = await prodSession.run(
            `MATCH (c:Community { id: $id })-[:CREATED_BY]->(creator:Person) RETURN creator.id as creatorId`,
            { id: community.id }
          )

          const creatorId =
            creatorResult.records.length > 0
              ? creatorResult.records[0].get('creatorId')
              : null

          // Create WeSpace in dev
          const weSpaceId = `wespace_${community.id}`
          await devSession.run(
            `
            CREATE (space:Space:WeSpace {
              id: $weSpaceId,
              name: $name,
              description: $description,
              why: $why,
              location: $location,
              time: $time,
              activities: $activities,
              resultsAchieved: $resultsAchieved,
              status: $status,
              visibility: "SHARED",
              createdAt: datetime()
            })
            RETURN space
            `,
            {
              weSpaceId,
              name: community.name,
              description: community.description,
              why: community.why,
              location: community.location,
              time: community.time,
              activities: community.activities,
              resultsAchieved: community.resultsAchieved,
              status: community.status,
            }
          )

          // Link creator as owner if exists
          if (creatorId) {
            await devSession.run(
              `
              MATCH (p:Person { id: $creatorId })
              MATCH (space:WeSpace { id: $weSpaceId })
              CREATE (p)-[:OWNS]->(space)
              `,
              { creatorId, weSpaceId }
            )
          }

          // Create FieldContext for community
          const contextId = `context_${community.id}_field`
          const contextName = `${community.name} Field`

          await devSession.run(
            `
            MATCH (space:WeSpace { id: $weSpaceId })
            CREATE (context:FieldContext {
              id: $contextId,
              title: $title,
              createdAt: datetime()
            })
            CREATE (space)-[:HAS_CONTEXT]->(context)
            RETURN context
            `,
            { weSpaceId, contextId, title: contextName }
          )

          this.stats.communitiesTransformed++
          this.stats.weSpacesCreated++
          this.stats.fieldContextsCreated++
          console.log(`  ✓ ${community.name}`)
        } catch (error) {
          this.stats.errors.push(
            `Failed to migrate community ${community.id}: ${error}`
          )
          console.error(`  ✗ Failed to migrate community ${community.id}`)
        }
      }

      console.log(
        `✅ Migrated ${this.stats.communitiesTransformed} communities\n`
      )
    } finally {
      await prodSession.close()
      await devSession.close()
    }
  }

  private async migrateGoals(): Promise<void> {
    console.log('🎯 Migrating Goals to GoalPulses...')
    const prodSession = this.prodDriver.session()
    const devSession = this.devDriver.session()

    try {
      const goals = await prodSession.run(`
        MATCH (g:Goal)
        RETURN {
          id: g.id,
          name: g.name,
          description: g.description,
          successMeasures: g.successMeasures,
          photo: g.photo,
          activities: g.activities,
          status: g.status,
          why: g.why,
          location: g.location,
          time: g.time,
          createdAt: g.createdAt,
          updatedAt: g.updatedAt
        } as goal
      `)

      for (const record of goals.records) {
        const goal = record.get('goal')

        try {
          // Find who motivated by this goal
          const motivatedByResult = await prodSession.run(
            `MATCH (p:Person)-[:MOTIVATED_BY]->(g:Goal { id: $id }) RETURN p.id as personId`,
            { id: goal.id }
          )

          let contextId = null
          if (motivatedByResult.records.length > 0) {
            const personId = motivatedByResult.records[0].get('personId')
            contextId = `context_${personId}_goals`
          } else {
            // Check if community motivated by this goal
            const communityMotivatedResult = await prodSession.run(
              `MATCH (c:Community)-[:MOTIVATED_BY]->(g:Goal { id: $id }) RETURN c.id as communityId`,
              { id: goal.id }
            )
            if (communityMotivatedResult.records.length > 0) {
              const communityId =
                communityMotivatedResult.records[0].get('communityId')
              contextId = `context_${communityId}_field`
            }
          }

          if (!contextId) {
            this.stats.errors.push(`Goal ${goal.id} has no owning context`)
            continue
          }

          // Create GoalPulse in dev
          const pulseId = `pulse_${goal.id}`
          await devSession.run(
            `
            MATCH (context:FieldContext { id: $contextId })
            CREATE (pulse:FieldPulse:GoalPulse {
              id: $pulseId,
              title: $title,
              content: $content,
              successMeasures: $successMeasures,
              photo: $photo,
              activities: $activities,
              status: $status,
              why: $why,
              location: $location,
              time: $time,
              createdAt: datetime()
            })
            CREATE (context)-[:HAS_PULSE]->(pulse)
            RETURN pulse
            `,
            {
              contextId,
              pulseId,
              title: goal.name,
              content: goal.description,
              successMeasures: goal.successMeasures,
              photo: goal.photo,
              activities: goal.activities,
              status: goal.status,
              why: goal.why,
              location: goal.location,
              time: goal.time,
            }
          )

          this.stats.goalPulsesCreated++
          console.log(`  ✓ ${goal.name}`)
        } catch (error) {
          this.stats.errors.push(`Failed to migrate goal ${goal.id}: ${error}`)
          console.error(`  ✗ Failed to migrate goal ${goal.id}`)
        }
      }

      console.log(`✅ Migrated ${this.stats.goalPulsesCreated} goals\n`)
    } finally {
      await prodSession.close()
      await devSession.close()
    }
  }

  private async migrateResources(): Promise<void> {
    console.log('📦 Migrating Resources to ResourcePulses...')
    const prodSession = this.prodDriver.session()
    const devSession = this.devDriver.session()

    try {
      const resources = await prodSession.run(`
        MATCH (r:Resource)
        RETURN {
          id: r.id,
          name: r.name,
          description: r.description,
          status: r.status,
          why: r.why,
          location: r.location,
          time: r.time,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt
        } as resource
      `)

      for (const record of resources.records) {
        const resource = record.get('resource')

        try {
          // Find provider (Person or Community)
          const providerResult = await prodSession.run(
            `MATCH (p:Person)-[:PROVIDES]->(r:Resource { id: $id }) RETURN "person" as type, p.id as providerId
             UNION
             MATCH (c:Community)-[:PROVIDES]->(r:Resource { id: $id }) RETURN "community" as type, c.id as providerId`,
            { id: resource.id }
          )

          let contextId = null
          if (providerResult.records.length > 0) {
            const result = providerResult.records[0]
            const type = result.get('type')
            const providerId = result.get('providerId')
            contextId =
              type === 'person'
                ? `context_${providerId}_goals`
                : `context_${providerId}_field`
          }

          if (!contextId) {
            this.stats.errors.push(`Resource ${resource.id} has no provider`)
            continue
          }

          // Create ResourcePulse in dev
          const pulseId = `pulse_${resource.id}`
          await devSession.run(
            `
            MATCH (context:FieldContext { id: $contextId })
            CREATE (pulse:FieldPulse:ResourcePulse {
              id: $pulseId,
              title: $title,
              content: $content,
              status: $status,
              why: $why,
              location: $location,
              time: $time,
              resourceType: "OTHER",
              availability: 1.0,
              createdAt: datetime()
            })
            CREATE (context)-[:HAS_PULSE]->(pulse)
            RETURN pulse
            `,
            {
              contextId,
              pulseId,
              title: resource.name,
              content: resource.description,
              status: resource.status,
              why: resource.why,
              location: resource.location,
              time: resource.time,
            }
          )

          this.stats.resourcePulsesCreated++
          console.log(`  ✓ ${resource.name}`)
        } catch (error) {
          this.stats.errors.push(
            `Failed to migrate resource ${resource.id}: ${error}`
          )
          console.error(`  ✗ Failed to migrate resource ${resource.id}`)
        }
      }

      console.log(`✅ Migrated ${this.stats.resourcePulsesCreated} resources\n`)
    } finally {
      await prodSession.close()
      await devSession.close()
    }
  }

  private async migrateCarePoints(): Promise<void> {
    console.log('💝 Migrating CarePoints to StoryPulses...')
    const prodSession = this.prodDriver.session()
    const devSession = this.devDriver.session()

    try {
      // Track starting count for correct reporting
      const startingStoryPulseCount = this.stats.storyPulsesCreated

      const carePoints = await prodSession.run(`
        MATCH (cp:CarePoint)
        RETURN {
          id: cp.id,
          name: cp.name,
          description: cp.description,
          status: cp.status,
          why: cp.why,
          location: cp.location,
          time: cp.time,
          levelFulfilled: cp.levelFulfilled,
          fulfillmentDate: cp.fulfillmentDate,
          successMeasures: cp.successMeasures,
          issuesIdentified: cp.issuesIdentified,
          issuesResolved: cp.issuesResolved,
          createdAt: cp.createdAt,
          updatedAt: cp.updatedAt
        } as carePoint
      `)

      for (const record of carePoints.records) {
        const cp = record.get('carePoint')

        try {
          // Find context through enabledByGoals or dependencies
          const contextResult = await prodSession.run(
            `MATCH (cp:CarePoint { id: $id })-[:ENABLED_BY|CARES_FOR]->(g:Goal) 
             MATCH (p:Person)-[:MOTIVATED_BY]->(g) RETURN p.id as personId LIMIT 1`,
            { id: cp.id }
          )

          let contextId = null
          if (contextResult.records.length > 0) {
            const personId = contextResult.records[0].get('personId')
            contextId = `context_${personId}_goals`
          } else {
            // Try to find through community
            const communityContextResult = await prodSession.run(
              `MATCH (c:Community)-[:MOTIVATED_BY]->(g:Goal)-[:ENABLES|CARES_FOR]->(cp:CarePoint { id: $id })
               RETURN c.id as communityId LIMIT 1`,
              { id: cp.id }
            )
            if (communityContextResult.records.length > 0) {
              const communityId =
                communityContextResult.records[0].get('communityId')
              contextId = `context_${communityId}_field`
            }
          }

          if (!contextId) {
            this.stats.errors.push(`CarePoint ${cp.id} cannot find context`)
            continue
          }

          const pulseId = `pulse_${cp.id}`
          await devSession.run(
            `
            MATCH (context:FieldContext { id: $contextId })
            CREATE (pulse:FieldPulse:StoryPulse {
              id: $pulseId,
              title: $title,
              content: $content,
              status: $status,
              why: $why,
              location: $location,
              time: $time,
              levelFulfilled: $levelFulfilled,
              fulfillmentDate: $fulfillmentDate,
              successMeasures: $successMeasures,
              issuesIdentified: $issuesIdentified,
              issuesResolved: $issuesResolved,
              createdAt: datetime()
            })
            CREATE (context)-[:HAS_PULSE]->(pulse)
            RETURN pulse
            `,
            {
              contextId,
              pulseId,
              title: cp.name,
              content: cp.description,
              status: cp.status,
              why: cp.why,
              location: cp.location,
              time: cp.time,
              levelFulfilled: cp.levelFulfilled,
              fulfillmentDate: cp.fulfillmentDate,
              successMeasures: cp.successMeasures,
              issuesIdentified: cp.issuesIdentified,
              issuesResolved: cp.issuesResolved,
            }
          )

          this.stats.storyPulsesCreated++
          console.log(`  ✓ ${cp.name}`)
        } catch (error) {
          this.stats.errors.push(
            `Failed to migrate carepoint ${cp.id}: ${error}`
          )
          console.error(`  ✗ Failed to migrate carepoint ${cp.id}`)
        }
      }

      const carePointsCount =
        this.stats.storyPulsesCreated - startingStoryPulseCount
      console.log(`✅ Migrated ${carePointsCount} care points\n`)
    } finally {
      await prodSession.close()
      await devSession.close()
    }
  }

  private async migrateCoreValues(): Promise<void> {
    console.log('💎 Migrating CoreValues to StoryPulses...')
    const prodSession = this.prodDriver.session()
    const devSession = this.devDriver.session()

    try {
      // Track starting count for correct reporting
      const startingStoryPulseCount = this.stats.storyPulsesCreated

      const coreValues = await prodSession.run(`
        MATCH (cv:CoreValue)
        RETURN {
          id: cv.id,
          name: cv.name,
          description: cv.description,
          alignmentChallenges: cv.alignmentChallenges,
          alignmentExamples: cv.alignmentExamples,
          why: cv.why,
          createdAt: cv.createdAt,
          updatedAt: cv.updatedAt
        } as coreValue
      `)

      for (const record of coreValues.records) {
        const cv = record.get('coreValue')

        try {
          // Find context through embracers
          const contextResult = await prodSession.run(
            `MATCH (p:Person)-[:EMBRACES]->(cv:CoreValue { id: $id }) RETURN p.id as personId LIMIT 1`,
            { id: cv.id }
          )

          let contextId = null
          if (contextResult.records.length > 0) {
            const personId = contextResult.records[0].get('personId')
            contextId = `context_${personId}_goals`
          } else {
            // Try community
            const communityContextResult = await prodSession.run(
              `MATCH (c:Community)-[:EMBRACES]->(cv:CoreValue { id: $id }) RETURN c.id as communityId LIMIT 1`,
              { id: cv.id }
            )
            if (communityContextResult.records.length > 0) {
              const communityId =
                communityContextResult.records[0].get('communityId')
              contextId = `context_${communityId}_field`
            }
          }

          if (!contextId) {
            this.stats.errors.push(`CoreValue ${cv.id} cannot find context`)
            continue
          }

          const pulseId = `pulse_${cv.id}`
          await devSession.run(
            `
            MATCH (context:FieldContext { id: $contextId })
            CREATE (pulse:FieldPulse:StoryPulse {
              id: $pulseId,
              title: $title,
              content: $content,
              alignmentChallenges: $alignmentChallenges,
              alignmentExamples: $alignmentExamples,
              why: $why,
              createdAt: datetime()
            })
            CREATE (context)-[:HAS_PULSE]->(pulse)
            RETURN pulse
            `,
            {
              contextId,
              pulseId,
              title: cv.name,
              content: cv.description,
              alignmentChallenges: cv.alignmentChallenges,
              alignmentExamples: cv.alignmentExamples,
              why: cv.why,
            }
          )

          this.stats.storyPulsesCreated++
          console.log(`  ✓ ${cv.name}`)
        } catch (error) {
          this.stats.errors.push(
            `Failed to migrate corevalue ${cv.id}: ${error}`
          )
          console.error(`  ✗ Failed to migrate corevalue ${cv.id}`)
        }
      }

      const coreValuesCount =
        this.stats.storyPulsesCreated - startingStoryPulseCount
      console.log(`✅ Migrated ${coreValuesCount} core values\n`)
    } finally {
      await prodSession.close()
      await devSession.close()
    }
  }

  private async migrateRelationships(): Promise<void> {
    console.log('🔗 Migrating Relationships to ResonanceLinks...')
    const prodSession = this.prodDriver.session()
    const devSession = this.devDriver.session()

    try {
      // Get all relationships we need to transform
      const relationships = await prodSession.run(`
        MATCH (source)-[rel:MOTIVATED_BY|APPLIED_TO|ALIGNED_TO|ENABLES|CARES_FOR|DEPENDS_ON|EMBRACES|PROVIDES|HAS_ACCESS_TO]->(target)
        WITH source, target, rel,
          CASE 
            WHEN source:Goal THEN 'pulse_' + source.id
            WHEN source:Resource THEN 'pulse_' + source.id
            WHEN source:CarePoint THEN 'pulse_' + source.id
            WHEN source:CoreValue THEN 'pulse_' + source.id
            ELSE null
          END as sourcePulseId,
          CASE 
            WHEN target:Goal THEN 'pulse_' + target.id
            WHEN target:Resource THEN 'pulse_' + target.id
            WHEN target:CarePoint THEN 'pulse_' + target.id
            WHEN target:CoreValue THEN 'pulse_' + target.id
            ELSE null
          END as targetPulseId
        RETURN sourcePulseId, targetPulseId, type(rel) as relType
        LIMIT 1000
      `)

      for (const record of relationships.records) {
        const sourcePulseId = record.get('sourcePulseId')
        const targetPulseId = record.get('targetPulseId')
        const relType = record.get('relType')

        if (!sourcePulseId || !targetPulseId) continue

        try {
          // Create ResonanceLink with legacy relationship name as label
          const linkId = `resonance_${sourcePulseId}_${relType}_${targetPulseId}`

          await devSession.run(
            `
            MATCH (source:FieldPulse { id: $sourcePulseId })
            MATCH (target:FieldPulse { id: $targetPulseId })
            MATCH (source)<-[:HAS_PULSE]-(context:FieldContext)
            CREATE (link:ResonanceLink {
              id: $linkId,
              label: $label,
              description: $label + " relationship",
              confidence: 1.0,
              evidence: "Migrated from " + $label,
              createdAt: datetime()
            })
            CREATE (link)-[:SOURCE]->(source)
            CREATE (link)-[:TARGET]->(target)
            CREATE (context)-[:HAS_RESONANCE]->(link)
            RETURN link
            `,
            {
              sourcePulseId,
              targetPulseId,
              linkId,
              label: relType,
            }
          )

          this.stats.resonanceLinksCreated++
        } catch (error) {
          // Silently skip if pulses don't exist in target or context issues
          console.error(
            `  ✗ Failed to create resonance link for ${sourcePulseId} -> ${targetPulseId} (${relType}): ${error}`
          )
        }
      }

      console.log(
        `✅ Created ${this.stats.resonanceLinksCreated} resonance links\n`
      )
    } finally {
      await prodSession.close()
      await devSession.close()
    }
  }

  private async migrateMemberships(): Promise<void> {
    console.log('👥 Migrating Community Memberships to SpaceMemberships...')
    const prodSession = this.prodDriver.session()
    const devSession = this.devDriver.session()

    try {
      await prodSession.run(
        `
        MATCH (p:Person)-[rel:BELONGS_TO {totem: $totem, signupDate: $signupDate}]->(c:Community)
        RETURN {
          personId: p.id,
          communityId: c.id,
          totem: rel.totem,
          signupDate: rel.signupDate
        } as membership
      `,
        { totem: null, signupDate: null }
      )

      // Get actual memberships with or without properties
      const actualMemberships = await prodSession.run(`
        MATCH (p:Person)-[:BELONGS_TO]->(c:Community)
        RETURN {
          personId: p.id,
          communityId: c.id
        } as membership
      `)

      for (const record of actualMemberships.records) {
        const membership = record.get('membership')

        try {
          const weSpaceId = `wespace_${membership.communityId}`
          const membershipId = `membership_${membership.personId}_${membership.communityId}`

          await devSession.run(
            `
            MATCH (p:Person { id: $personId })
            MATCH (space:WeSpace { id: $weSpaceId })
            CREATE (membership:SpaceMembership {
              id: $membershipId,
              role: "MEMBER",
              addedAt: datetime()
            })
            CREATE (p)-[:IS_MEMBER]->(membership)
            CREATE (membership)-[:HAS_MEMBER]->(space)
            RETURN membership
            `,
            { personId: membership.personId, weSpaceId, membershipId }
          )

          this.stats.membershipsMigrated++
          console.log(`  ✓ ${membership.personId} → ${membership.communityId}`)
        } catch (error) {
          this.stats.errors.push(
            `Failed to migrate membership ${membership.personId}→${membership.communityId}: ${error}`
          )
        }
      }

      console.log(`✅ Migrated ${this.stats.membershipsMigrated} memberships\n`)
    } finally {
      await prodSession.close()
      await devSession.close()
    }
  }

  private async migratePersonConnections(): Promise<void> {
    console.log('🤝 Migrating Person-to-Person Connections...')
    const prodSession = this.prodDriver.session()
    const devSession = this.devDriver.session()

    try {
      // Get Person-to-Person CONNECTED_TO relationships from production
      const connections = await prodSession.run(`
        MATCH (p1:Person)-[r:CONNECTED_TO]->(p2:Person)
        RETURN {
          person1Id: p1.id,
          person2Id: p2.id,
          why: r.why,
          interests: r.interests
        } as connection
      `)

      for (const record of connections.records) {
        const connection = record.get('connection')

        try {
          // Create CONNECTED_TO relationship in dev DB if both people exist
          const result = await devSession.run(
            `
            MATCH (p1:Person {id: $person1Id})
            MATCH (p2:Person {id: $person2Id})
            MERGE (p1)-[r:CONNECTED_TO]->(p2)
            SET r.why = $why, r.interests = $interests
            RETURN r
            `,
            {
              person1Id: connection.person1Id,
              person2Id: connection.person2Id,
              why: connection.why,
              interests: connection.interests,
            }
          )

          if (result.records.length > 0) {
            this.stats.personConnectionsMigrated++
            console.log(
              `  ✓ Connection: ${connection.person1Id} ↔ ${connection.person2Id}`
            )
          }
        } catch (error) {
          this.stats.errors.push(
            `Failed to migrate connection ${connection.person1Id} -> ${connection.person2Id}: ${error}`
          )
          console.error(
            `  ✗ Failed to migrate connection ${connection.person1Id} -> ${connection.person2Id}`
          )
        }
      }

      console.log(
        `✅ Migrated ${this.stats.personConnectionsMigrated} person connections\n`
      )
    } finally {
      await prodSession.close()
      await devSession.close()
    }
  }

  private printStats(): void {
    console.log('\n' + '='.repeat(60))
    console.log('📊 MIGRATION SUMMARY')
    console.log('='.repeat(60))
    console.log(`
✅ People Created:           ${this.stats.peopleCreated}
✅ MeSpaces Created:          ${this.stats.meSpacesCreated}
✅ FieldContexts Created:     ${this.stats.fieldContextsCreated}
✅ GoalPulses Created:        ${this.stats.goalPulsesCreated}
✅ ResourcePulses Created:    ${this.stats.resourcePulsesCreated}
✅ StoryPulses Created:       ${this.stats.storyPulsesCreated}
✅ Communities Transformed:   ${this.stats.communitiesTransformed}
✅ WeSpaces Created:          ${this.stats.weSpacesCreated}
✅ ResonanceLinks Created:    ${this.stats.resonanceLinksCreated}
✅ Memberships Migrated:      ${this.stats.membershipsMigrated}
✅ Person Connections:        ${this.stats.personConnectionsMigrated}

❌ Errors: ${this.stats.errors.length}
    `)

    if (this.stats.errors.length > 0) {
      console.log('Error Details:')
      for (const error of this.stats.errors.slice(0, 10)) {
        console.log(`  - ${error}`)
      }
      if (this.stats.errors.length > 10) {
        console.log(`  ... and ${this.stats.errors.length - 10} more errors`)
      }
    }

    console.log('='.repeat(60) + '\n')
  }
}

// Main execution
async function main() {
  const prodUri = 'neo4j://54.225.112.191:7687'
  const prodAuth = {
    username: 'neo4j',
    password: 'micro-pierre-update-ambient-bank-8581',
  }

  const devUri = 'neo4j+s://cfc3e862.databases.neo4j.io'
  const devAuth = {
    username: 'cfc3e862',
    password: '4OJwS3lAtKsPGj5Z7ZFRSRAGHp2A36vx_ImR41MxEIU',
  }

  const engine = new MigrationEngine(prodUri, prodAuth, devUri, devAuth)
  await engine.migrate()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
