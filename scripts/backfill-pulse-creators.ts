/**
 * Backfill CREATED_BY relationships for existing pulses
 *
 * This script queries the production database for CREATED_BY relationships
 * and creates them in the dev database for existing pulses.
 *
 * Usage: npx tsx scripts/backfill-pulse-creators.ts
 */

import neo4j, { Driver } from 'neo4j-driver'

interface BackfillStats {
  goalPulsesLinked: number
  resourcePulsesLinked: number
  storyPulsesLinked: number
  errors: string[]
}

class CreatorBackfiller {
  prodDriver: Driver
  devDriver: Driver
  stats: BackfillStats = {
    goalPulsesLinked: 0,
    resourcePulsesLinked: 0,
    storyPulsesLinked: 0,
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

  async backfill(): Promise<void> {
    try {
      console.log('🔗 Starting CREATED_BY relationship backfill...\n')

      await this.backfillGoalCreators()
      await this.backfillResourceCreators()
      await this.backfillCarePointCreators()
      await this.backfillCoreValueCreators()

      this.printStats()
    } catch (error) {
      console.error('❌ Backfill failed:', error)
      throw error
    } finally {
      await this.prodDriver.close()
      await this.devDriver.close()
    }
  }

  private async backfillGoalCreators(): Promise<void> {
    console.log('🎯 Backfilling Goal creators...')
    const prodSession = this.prodDriver.session()
    const devSession = this.devDriver.session()

    try {
      // Get all Goal -> Creator relationships from production
      const result = await prodSession.run(`
        MATCH (g:Goal)-[:CREATED_BY]->(creator:Person)
        RETURN g.id as goalId, creator.id as creatorId
      `)

      for (const record of result.records) {
        const goalId = record.get('goalId')
        const creatorId = record.get('creatorId')
        const pulseId = `pulse_${goalId}`

        try {
          await devSession.run(
            `
            MATCH (pulse:GoalPulse { id: $pulseId })
            MATCH (creator:Person { id: $creatorId })
            MERGE (pulse)-[:CREATED_BY]->(creator)
            `,
            { pulseId, creatorId }
          )

          this.stats.goalPulsesLinked++
        } catch (error) {
          this.stats.errors.push(
            `Failed to link Goal ${goalId} to creator ${creatorId}: ${error}`
          )
        }
      }

      console.log(`  ✓ Linked ${this.stats.goalPulsesLinked} goal creators\n`)
    } finally {
      await prodSession.close()
      await devSession.close()
    }
  }

  private async backfillResourceCreators(): Promise<void> {
    console.log('📦 Backfilling Resource creators...')
    const prodSession = this.prodDriver.session()
    const devSession = this.devDriver.session()

    try {
      // Get all Resource -> Creator relationships from production
      const result = await prodSession.run(`
        MATCH (r:Resource)-[:CREATED_BY]->(creator:Person)
        RETURN r.id as resourceId, creator.id as creatorId
      `)

      for (const record of result.records) {
        const resourceId = record.get('resourceId')
        const creatorId = record.get('creatorId')
        const pulseId = `pulse_${resourceId}`

        try {
          await devSession.run(
            `
            MATCH (pulse:ResourcePulse { id: $pulseId })
            MATCH (creator:Person { id: $creatorId })
            MERGE (pulse)-[:CREATED_BY]->(creator)
            `,
            { pulseId, creatorId }
          )

          this.stats.resourcePulsesLinked++
        } catch (error) {
          this.stats.errors.push(
            `Failed to link Resource ${resourceId} to creator ${creatorId}: ${error}`
          )
        }
      }

      console.log(
        `  ✓ Linked ${this.stats.resourcePulsesLinked} resource creators\n`
      )
    } finally {
      await prodSession.close()
      await devSession.close()
    }
  }

  private async backfillCarePointCreators(): Promise<void> {
    console.log('💝 Backfilling CarePoint creators...')
    const prodSession = this.prodDriver.session()
    const devSession = this.devDriver.session()

    try {
      // Get all CarePoint -> Creator relationships from production
      const result = await prodSession.run(`
        MATCH (cp:CarePoint)-[:CREATED_BY]->(creator:Person)
        RETURN cp.id as carePointId, creator.id as creatorId
      `)

      for (const record of result.records) {
        const carePointId = record.get('carePointId')
        const creatorId = record.get('creatorId')
        const pulseId = `pulse_${carePointId}`

        try {
          await devSession.run(
            `
            MATCH (pulse:StoryPulse { id: $pulseId })
            MATCH (creator:Person { id: $creatorId })
            MERGE (pulse)-[:CREATED_BY]->(creator)
            `,
            { pulseId, creatorId }
          )

          this.stats.storyPulsesLinked++
        } catch (error) {
          this.stats.errors.push(
            `Failed to link CarePoint ${carePointId} to creator ${creatorId}: ${error}`
          )
        }
      }

      console.log(
        `  ✓ Linked ${this.stats.storyPulsesLinked} carepoint creators (so far)\n`
      )
    } finally {
      await prodSession.close()
      await devSession.close()
    }
  }

  private async backfillCoreValueCreators(): Promise<void> {
    console.log('💎 Backfilling CoreValue creators...')
    const prodSession = this.prodDriver.session()
    const devSession = this.devDriver.session()

    try {
      const startingCount = this.stats.storyPulsesLinked

      // Get all CoreValue -> Creator relationships from production
      const result = await prodSession.run(`
        MATCH (cv:CoreValue)-[:CREATED_BY]->(creator:Person)
        RETURN cv.id as coreValueId, creator.id as creatorId
      `)

      for (const record of result.records) {
        const coreValueId = record.get('coreValueId')
        const creatorId = record.get('creatorId')
        const pulseId = `pulse_${coreValueId}`

        try {
          await devSession.run(
            `
            MATCH (pulse:StoryPulse { id: $pulseId })
            MATCH (creator:Person { id: $creatorId })
            MERGE (pulse)-[:CREATED_BY]->(creator)
            `,
            { pulseId, creatorId }
          )

          this.stats.storyPulsesLinked++
        } catch (error) {
          this.stats.errors.push(
            `Failed to link CoreValue ${coreValueId} to creator ${creatorId}: ${error}`
          )
        }
      }

      const coreValueCount = this.stats.storyPulsesLinked - startingCount
      console.log(`  ✓ Linked ${coreValueCount} corevalue creators\n`)
    } finally {
      await prodSession.close()
      await devSession.close()
    }
  }

  private printStats(): void {
    console.log('\n' + '='.repeat(60))
    console.log('📊 BACKFILL SUMMARY')
    console.log('='.repeat(60))
    console.log(`
✅ GoalPulse Creators:       ${this.stats.goalPulsesLinked}
✅ ResourcePulse Creators:   ${this.stats.resourcePulsesLinked}
✅ StoryPulse Creators:      ${this.stats.storyPulsesLinked}

❌ Errors: ${this.stats.errors.length}
    `)

    if (this.stats.errors.length > 0) {
      console.log('Errors encountered:')
      this.stats.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`)
      })
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

  const backfiller = new CreatorBackfiller(prodUri, prodAuth, devUri, devAuth)
  await backfiller.backfill()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
