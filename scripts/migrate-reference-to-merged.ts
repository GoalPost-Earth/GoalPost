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
          updatedAt: p.updatedAt,
          password: p.password,
          refreshToken: p.refreshToken,
          refreshTokenExp: p.refreshTokenExp,
          refreshTokenRevoked: p.refreshTokenRevoked,
          authId: p.authId,
          embedding: p.embedding,
          gender: p.gender,
          signupDate: p.signupDate
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
              updatedAt: $updatedAt,
              password: $password,
              refreshToken: $refreshToken,
              refreshTokenExp: $refreshTokenExp,
              refreshTokenRevoked: $refreshTokenRevoked,
              authId: $authId,
              embedding: $embedding,
              gender: $gender,
              signupDate: $signupDate
            })
            RETURN p
            `,
            person
          )

          // Create auto-generated MeSpace
          const meSpaceName = `${person.firstName}'s MeSpace`
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
          const contextName = `${person.firstName}'s Field Context`

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
          type: g.type,
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
          // Find who created this goal and who is motivated by it
          const ownershipResult = await prodSession.run(
            `MATCH (g:Goal { id: $id })
             OPTIONAL MATCH (g)-[:CREATED_BY]->(creator:Person|Community) 
             OPTIONAL MATCH (p:Person|Community)-[:MOTIVATED_BY]->(g)
             RETURN creator.id as creatorId, labels(creator)[0] as creatorType,
                    collect(DISTINCT {id: p.id, type: labels(p)[0]}) as motivatedEntities`,
            { id: goal.id }
          )

          const creatorId =
            ownershipResult.records.length > 0
              ? ownershipResult.records[0].get('creatorId')
              : null
          const creatorType =
            ownershipResult.records.length > 0
              ? ownershipResult.records[0].get('creatorType')
              : null
          const motivatedEntities =
            ownershipResult.records.length > 0
              ? ownershipResult.records[0].get('motivatedEntities')
              : []

          // Determine primary context (based on creator)
          let primaryContextId: string | null = null
          let secondaryContextIds: string[] = []

          if (creatorId) {
            // Creator determines primary context
            if (creatorType === 'Person') {
              primaryContextId = `context_${creatorId}_goals`
            } else if (creatorType === 'Community') {
              primaryContextId = `context_${creatorId}_field`
            }

            // Add secondary contexts for other entities motivated by this
            for (const entity of motivatedEntities) {
              if (entity.id === creatorId) continue // Skip the creator

              if (entity.type === 'Person') {
                const contextId = `context_${entity.id}_goals`
                if (!secondaryContextIds.includes(contextId)) {
                  secondaryContextIds.push(contextId)
                }
              } else if (entity.type === 'Community') {
                const contextId = `context_${entity.id}_field`
                if (!secondaryContextIds.includes(contextId)) {
                  secondaryContextIds.push(contextId)
                }
              }
            }
          } else if (motivatedEntities.length > 0) {
            // No creator, use first motivated entity as primary
            const firstEntity = motivatedEntities[0]
            if (firstEntity.type === 'Person') {
              primaryContextId = `context_${firstEntity.id}_goals`
            } else if (firstEntity.type === 'Community') {
              primaryContextId = `context_${firstEntity.id}_field`
            }

            // Remaining motivated entities as secondary
            for (let i = 1; i < motivatedEntities.length; i++) {
              const entity = motivatedEntities[i]
              if (entity.type === 'Person') {
                const contextId = `context_${entity.id}_goals`
                if (!secondaryContextIds.includes(contextId)) {
                  secondaryContextIds.push(contextId)
                }
              } else if (entity.type === 'Community') {
                const contextId = `context_${entity.id}_field`
                if (!secondaryContextIds.includes(contextId)) {
                  secondaryContextIds.push(contextId)
                }
              }
            }
          }

          if (!primaryContextId) {
            this.stats.errors.push(
              `Goal ${goal.id} (${goal.name}) has no creator or motivated entity - skipping`
            )
            continue
          }

          // Create GoalPulse in dev
          const pulseId = `pulse_${goal.id}`
          const statusMap: Record<string, string> = {
            Active: 'ACTIVE',
            Inactive: 'PAUSED',
            Completed: 'COMPLETED',
          }
          const mappedStatus = statusMap[goal.status] || 'ACTIVE'

          await devSession.run(
            `
            MATCH (context:FieldContext { id: $contextId })
            ${creatorId ? 'OPTIONAL MATCH (creator:Person { id: $creatorId })' : ''}
            CREATE (pulse:FieldPulse:GoalPulse {
              id: $pulseId,
              title: $title,
              content: $content,
              successMeasures: $successMeasures,
              photo: $photo,
              activities: $activities,
              status: $status,
              type: $type,
              why: $why,
              location: $location,
              time: $time,
              createdAt: datetime()
            })
            CREATE (context)-[:HAS_PULSE]->(pulse)
            ${creatorId ? 'CREATE (pulse)-[:CREATED_BY]->(creator)' : ''}
            RETURN pulse
            `,
            {
              contextId: primaryContextId,
              pulseId,
              title: goal.name,
              content: goal.description || '',
              successMeasures: goal.successMeasures,
              photo: goal.photo,
              activities: goal.activities,
              status: mappedStatus,
              type: goal.type,
              why: goal.why,
              location: goal.location,
              time: goal.time,
              creatorId,
            }
          )

          // Add to secondary contexts
          for (const secondaryContextId of secondaryContextIds) {
            await devSession.run(
              `
              MATCH (context:FieldContext { id: $contextId })
              MATCH (pulse:FieldPulse { id: $pulseId })
              CREATE (context)-[:HAS_PULSE]->(pulse)
              `,
              {
                contextId: secondaryContextId,
                pulseId,
              }
            )
          }

          console.log(
            `  ✓ ${goal.name}${secondaryContextIds.length > 0 ? ` (shared with ${secondaryContextIds.length} context(s))` : ''}`
          )

          this.stats.goalPulsesCreated++
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

  private normalizeStatus(status: string | null): string | undefined {
    if (!status) return undefined
    // Map common status values to GraphQL enum values
    const statusMap: Record<string, string> = {
      Active: 'ACTIVE',
      ACTIVE: 'ACTIVE',
      Inactive: 'PAUSED',
      PAUSED: 'PAUSED',
      Completed: 'COMPLETED',
      COMPLETED: 'COMPLETED',
    }
    return statusMap[status] || status
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
          // Find creator and providers for this resource
          const ownershipResult = await prodSession.run(
            `MATCH (r:Resource { id: $id })
             OPTIONAL MATCH (r)-[:CREATED_BY]->(creator:Person|Community)
             OPTIONAL MATCH (p:Person|Community)-[:PROVIDES]->(r)
             RETURN creator.id as creatorId, labels(creator)[0] as creatorType,
                    collect(DISTINCT {id: p.id, type: labels(p)[0]}) as providers`,
            { id: resource.id }
          )

          const creatorId =
            ownershipResult.records.length > 0
              ? ownershipResult.records[0].get('creatorId')
              : null
          const creatorType =
            ownershipResult.records.length > 0
              ? ownershipResult.records[0].get('creatorType')
              : null
          const providers =
            ownershipResult.records.length > 0
              ? ownershipResult.records[0].get('providers')
              : []

          // Determine primary context (based on creator)
          let primaryContextId: string | null = null
          let secondaryContextIds: string[] = []

          if (creatorId) {
            // Creator determines primary context
            if (creatorType === 'Person') {
              primaryContextId = `context_${creatorId}_goals`
            } else if (creatorType === 'Community') {
              primaryContextId = `context_${creatorId}_field`
            }

            // Add secondary contexts for providers
            for (const provider of providers) {
              if (provider.id === creatorId) continue // Skip the creator

              if (provider.type === 'Person') {
                const contextId = `context_${provider.id}_goals`
                if (!secondaryContextIds.includes(contextId)) {
                  secondaryContextIds.push(contextId)
                }
              } else if (provider.type === 'Community') {
                const contextId = `context_${provider.id}_field`
                if (!secondaryContextIds.includes(contextId)) {
                  secondaryContextIds.push(contextId)
                }
              }
            }
          } else if (providers.length > 0) {
            // No creator, use first provider as primary
            const firstProvider = providers[0]
            if (firstProvider.type === 'Person') {
              primaryContextId = `context_${firstProvider.id}_goals`
            } else if (firstProvider.type === 'Community') {
              primaryContextId = `context_${firstProvider.id}_field`
            }

            // Remaining providers as secondary
            for (let i = 1; i < providers.length; i++) {
              const provider = providers[i]
              if (provider.type === 'Person') {
                const contextId = `context_${provider.id}_goals`
                if (!secondaryContextIds.includes(contextId)) {
                  secondaryContextIds.push(contextId)
                }
              } else if (provider.type === 'Community') {
                const contextId = `context_${provider.id}_field`
                if (!secondaryContextIds.includes(contextId)) {
                  secondaryContextIds.push(contextId)
                }
              }
            }
          }

          if (!primaryContextId) {
            this.stats.errors.push(
              `Resource ${resource.id} (${resource.name}) has no creator or provider - skipping`
            )
            continue
          }

          // Create ResourcePulse in dev
          const pulseId = `pulse_${resource.id}`
          await devSession.run(
            `
            MATCH (context:FieldContext { id: $contextId })
            ${creatorId ? 'OPTIONAL MATCH (creator:Person { id: $creatorId })' : ''}
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
            ${creatorId ? 'CREATE (pulse)-[:CREATED_BY]->(creator)' : ''}
            RETURN pulse
            `,
            {
              contextId: primaryContextId,
              pulseId,
              title: resource.name,
              content: resource.description || '',
              status: this.normalizeStatus(resource.status),
              why: resource.why,
              location: resource.location,
              time: resource.time,
              creatorId,
            }
          )

          // Add to secondary contexts
          for (const secondaryContextId of secondaryContextIds) {
            await devSession.run(
              `
              MATCH (context:FieldContext { id: $contextId })
              MATCH (pulse:FieldPulse { id: $pulseId })
              CREATE (context)-[:HAS_PULSE]->(pulse)
              `,
              {
                contextId: secondaryContextId,
                pulseId,
              }
            )
          }

          console.log(
            `  ✓ ${resource.name}${secondaryContextIds.length > 0 ? ` (shared with ${secondaryContextIds.length} context(s))` : ''}`
          )

          this.stats.resourcePulsesCreated++
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
          // Find creator and caring entities for this care point
          const ownershipResult = await prodSession.run(
            `MATCH (cp:CarePoint { id: $id })
             OPTIONAL MATCH (cp)-[:CREATED_BY]->(creator:Person|Community)
             OPTIONAL MATCH (p:Person|Community)-[:CARES_FOR]->(cp)
             RETURN creator.id as creatorId, labels(creator)[0] as creatorType,
                    collect(DISTINCT {id: p.id, type: labels(p)[0]}) as caringEntities`,
            { id: cp.id }
          )

          const creatorId =
            ownershipResult.records.length > 0
              ? ownershipResult.records[0].get('creatorId')
              : null
          const creatorType =
            ownershipResult.records.length > 0
              ? ownershipResult.records[0].get('creatorType')
              : null
          const caringEntities =
            ownershipResult.records.length > 0
              ? ownershipResult.records[0].get('caringEntities')
              : []

          // Determine primary context (based on creator)
          let primaryContextId: string | null = null
          let secondaryContextIds: string[] = []

          if (creatorId) {
            // Creator determines primary context
            if (creatorType === 'Person') {
              primaryContextId = `context_${creatorId}_goals`
            } else if (creatorType === 'Community') {
              primaryContextId = `context_${creatorId}_field`
            }

            // Add secondary contexts for caring entities
            for (const entity of caringEntities) {
              if (entity.id === creatorId) continue // Skip the creator

              if (entity.type === 'Person') {
                const contextId = `context_${entity.id}_goals`
                if (!secondaryContextIds.includes(contextId)) {
                  secondaryContextIds.push(contextId)
                }
              } else if (entity.type === 'Community') {
                const contextId = `context_${entity.id}_field`
                if (!secondaryContextIds.includes(contextId)) {
                  secondaryContextIds.push(contextId)
                }
              }
            }
          } else if (caringEntities.length > 0) {
            // No creator, use first caring entity as primary
            const firstEntity = caringEntities[0]
            if (firstEntity.type === 'Person') {
              primaryContextId = `context_${firstEntity.id}_goals`
            } else if (firstEntity.type === 'Community') {
              primaryContextId = `context_${firstEntity.id}_field`
            }

            // Remaining caring entities as secondary
            for (let i = 1; i < caringEntities.length; i++) {
              const entity = caringEntities[i]
              if (entity.type === 'Person') {
                const contextId = `context_${entity.id}_goals`
                if (!secondaryContextIds.includes(contextId)) {
                  secondaryContextIds.push(contextId)
                }
              } else if (entity.type === 'Community') {
                const contextId = `context_${entity.id}_field`
                if (!secondaryContextIds.includes(contextId)) {
                  secondaryContextIds.push(contextId)
                }
              }
            }
          }

          if (!primaryContextId) {
            this.stats.errors.push(
              `CarePoint ${cp.id} (${cp.name}) has no creator or caring entity - skipping`
            )
            continue
          }

          const pulseId = `pulse_${cp.id}`
          await devSession.run(
            `
            MATCH (context:FieldContext { id: $contextId })
            ${creatorId ? 'OPTIONAL MATCH (creator:Person { id: $creatorId })' : ''}
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
            ${creatorId ? 'CREATE (pulse)-[:CREATED_BY]->(creator)' : ''}
            RETURN pulse
            `,
            {
              contextId: primaryContextId,
              pulseId,
              title: cp.name,
              content: cp.description || '',
              status: this.normalizeStatus(cp.status),
              why: cp.why,
              location: cp.location,
              time: cp.time,
              levelFulfilled: cp.levelFulfilled,
              fulfillmentDate: cp.fulfillmentDate,
              successMeasures: cp.successMeasures,
              issuesIdentified: cp.issuesIdentified,
              issuesResolved: cp.issuesResolved,
              creatorId,
            }
          )

          // Add to secondary contexts
          for (const secondaryContextId of secondaryContextIds) {
            await devSession.run(
              `
              MATCH (context:FieldContext { id: $contextId })
              MATCH (pulse:FieldPulse { id: $pulseId })
              CREATE (context)-[:HAS_PULSE]->(pulse)
              `,
              {
                contextId: secondaryContextId,
                pulseId,
              }
            )
          }

          console.log(
            `  ✓ ${cp.name}${secondaryContextIds.length > 0 ? ` (shared with ${secondaryContextIds.length} context(s))` : ''}`
          )

          this.stats.storyPulsesCreated++
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
          whoSupports: cv.whoSupports,
          why: cv.why,
          createdAt: cv.createdAt,
          updatedAt: cv.updatedAt
        } as coreValue
      `)

      for (const record of coreValues.records) {
        const cv = record.get('coreValue')

        try {
          // Find creator and embracing entities for this core value
          const ownershipResult = await prodSession.run(
            `MATCH (cv:CoreValue { id: $id })
             OPTIONAL MATCH (cv)-[:CREATED_BY]->(creator:Person|Community)
             OPTIONAL MATCH (p:Person|Community)-[:EMBRACES]->(cv)
             RETURN creator.id as creatorId, labels(creator)[0] as creatorType,
                    collect(DISTINCT {id: p.id, type: labels(p)[0]}) as embracers`,
            { id: cv.id }
          )

          const creatorId =
            ownershipResult.records.length > 0
              ? ownershipResult.records[0].get('creatorId')
              : null
          const creatorType =
            ownershipResult.records.length > 0
              ? ownershipResult.records[0].get('creatorType')
              : null
          const embracers =
            ownershipResult.records.length > 0
              ? ownershipResult.records[0].get('embracers')
              : []

          // Determine primary context (based on creator)
          let primaryContextId: string | null = null
          let secondaryContextIds: string[] = []

          if (creatorId) {
            // Creator determines primary context
            if (creatorType === 'Person') {
              primaryContextId = `context_${creatorId}_goals`
            } else if (creatorType === 'Community') {
              primaryContextId = `context_${creatorId}_field`
            }

            // Add secondary contexts for embracers
            for (const entity of embracers) {
              if (entity.id === creatorId) continue // Skip the creator

              if (entity.type === 'Person') {
                const contextId = `context_${entity.id}_goals`
                if (!secondaryContextIds.includes(contextId)) {
                  secondaryContextIds.push(contextId)
                }
              } else if (entity.type === 'Community') {
                const contextId = `context_${entity.id}_field`
                if (!secondaryContextIds.includes(contextId)) {
                  secondaryContextIds.push(contextId)
                }
              }
            }
          } else if (embracers.length > 0) {
            // No creator, use first embracer as primary
            const firstEntity = embracers[0]
            if (firstEntity.type === 'Person') {
              primaryContextId = `context_${firstEntity.id}_goals`
            } else if (firstEntity.type === 'Community') {
              primaryContextId = `context_${firstEntity.id}_field`
            }

            // Remaining embracers as secondary
            for (let i = 1; i < embracers.length; i++) {
              const entity = embracers[i]
              if (entity.type === 'Person') {
                const contextId = `context_${entity.id}_goals`
                if (!secondaryContextIds.includes(contextId)) {
                  secondaryContextIds.push(contextId)
                }
              } else if (entity.type === 'Community') {
                const contextId = `context_${entity.id}_field`
                if (!secondaryContextIds.includes(contextId)) {
                  secondaryContextIds.push(contextId)
                }
              }
            }
          }

          if (!primaryContextId) {
            this.stats.errors.push(
              `CoreValue ${cv.id} (${cv.name}) has no creator or embracing entity - skipping`
            )
            continue
          }

          const pulseId = `pulse_${cv.id}`
          await devSession.run(
            `
            MATCH (context:FieldContext { id: $contextId })
            ${creatorId ? 'OPTIONAL MATCH (creator:Person { id: $creatorId })' : ''}
            CREATE (pulse:FieldPulse:StoryPulse {
              id: $pulseId,
              title: $title,
              content: $content,
              alignmentChallenges: $alignmentChallenges,
              alignmentExamples: $alignmentExamples,
              whoSupports: $whoSupports,
              why: $why,
              createdAt: datetime()
            })
            CREATE (context)-[:HAS_PULSE]->(pulse)
            ${creatorId ? 'CREATE (pulse)-[:CREATED_BY]->(creator)' : ''}
            RETURN pulse
            `,
            {
              contextId: primaryContextId,
              pulseId,
              title: cv.name,
              content: cv.description || '',
              alignmentChallenges: cv.alignmentChallenges,
              alignmentExamples: cv.alignmentExamples,
              whoSupports: cv.whoSupports,
              why: cv.why,
              creatorId,
            }
          )

          // Add to secondary contexts
          for (const secondaryContextId of secondaryContextIds) {
            await devSession.run(
              `
              MATCH (context:FieldContext { id: $contextId })
              MATCH (pulse:FieldPulse { id: $pulseId })
              CREATE (context)-[:HAS_PULSE]->(pulse)
              `,
              {
                contextId: secondaryContextId,
                pulseId,
              }
            )
          }

          console.log(
            `  ✓ ${cv.name}${secondaryContextIds.length > 0 ? ` (shared with ${secondaryContextIds.length} context(s))` : ''}`
          )

          this.stats.storyPulsesCreated++
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
      // Get all SEMANTIC relationships between entities that will be pulses
      // These include: Goal-CarePoint, Goal-Resource, Goal-CoreValue, Resource-Resource, etc.
      const relationships = await prodSession.run(`
        MATCH (source)-[rel:ALIGNED_TO|APPLIED_IN|APPLIED_TO|CARES_FOR|DEPENDS_ON|ENABLED_BY|ENABLES|GUIDED_BY]->(target)
        WHERE 
          (source:Goal OR source:Resource OR source:CarePoint OR source:CoreValue) AND
          (target:Goal OR target:Resource OR target:CarePoint OR target:CoreValue)
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
      `)

      console.log(
        `  Found ${relationships.records.length} semantic relationships to migrate`
      )

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
            
            // Find all contexts for each pulse
            OPTIONAL MATCH (source)<-[:HAS_PULSE]-(sourceContext:FieldContext)
            OPTIONAL MATCH (target)<-[:HAS_PULSE]-(targetContext:FieldContext)
            
            // Collect unique contexts from both source and target
            WITH source, target, 
                 collect(DISTINCT sourceContext) + collect(DISTINCT targetContext) as allContexts
            WHERE size(allContexts) > 0
            
            // Create or update the ResonanceLink
            MERGE (link:ResonanceLink { id: $linkId })
            ON CREATE SET
              link.label = $label,
              link.description = $label + " relationship",
              link.confidence = null,
              link.evidence = $label,
              link.createdAt = datetime()
            ON MATCH SET
              link.label = $label,
              link.description = $label + " relationship",
              link.evidence = $label
            
            // Create source and target relationships
            MERGE (link)-[:SOURCE]->(source)
            MERGE (link)-[:TARGET]->(target)
            
            // Connect to ALL contexts (both source and target)
            WITH link, allContexts
            UNWIND allContexts as context
            WITH link, context
            WHERE context IS NOT NULL
            MERGE (context)-[:HAS_RESONANCE]->(link)
            
            RETURN count(context) as contextsConnected
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
          // Log specific errors instead of silently skipping
          console.log(
            `  ⚠️  Failed to create link: ${sourcePulseId} -> ${targetPulseId} (${relType}): ${error}`
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
            CREATE (membership)-[:IS_MEMBER]->(p)
            CREATE (space)-[:HAS_MEMBER]->(membership)
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

  const devUri = 'neo4j+s://ee93871d.databases.neo4j.io'
  const devAuth = {
    username: 'neo4j',
    password: 'XSKVpR_9FFYsbaeMswPY8QD0txhSIvEWm0Q7dUfOnkI',
  }

  const engine = new MigrationEngine(prodUri, prodAuth, devUri, devAuth)
  await engine.migrate()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
