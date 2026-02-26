/**
 * Migration Verification Script
 *
 * Compares production (reference schema) data with dev (merged schema) data
 * to identify missing or extra entities after migration.
 *
 * Usage: npx tsx scripts/verify-migration.ts
 */

import neo4j, { Driver } from 'neo4j-driver'

interface VerificationReport {
  production: {
    people: number
    goals: number
    resources: number
    carePoints: number
    coreValues: number
    communities: number
    motivatedByRels: number
    appliedToRels: number
    belongsToRels: number
    connectedToRels: number
  }
  dev: {
    people: number
    users: number
    goalPulses: number
    resourcePulses: number
    storyPulses: number
    meSpaces: number
    weSpaces: number
    fieldContexts: number
    resonanceLinks: number
    spaceMemberships: number
    connectedToRels: number
  }
  discrepancies: {
    missingGoals: number
    missingResources: number
    missingStoryPulses: number
    extraPeople: number
    extraMeSpaces: number
    extraWeSpaces: number
    missingResonanceLinks: number
  }
}

class VerificationEngine {
  prodDriver: Driver
  devDriver: Driver

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

  async verify(): Promise<VerificationReport> {
    console.log('🔍 Starting migration verification...\n')

    const report: VerificationReport = {
      production: {
        people: 0,
        goals: 0,
        resources: 0,
        carePoints: 0,
        coreValues: 0,
        communities: 0,
        motivatedByRels: 0,
        appliedToRels: 0,
        belongsToRels: 0,
        connectedToRels: 0,
      },
      dev: {
        people: 0,
        users: 0,
        goalPulses: 0,
        resourcePulses: 0,
        storyPulses: 0,
        meSpaces: 0,
        weSpaces: 0,
        fieldContexts: 0,
        resonanceLinks: 0,
        spaceMemberships: 0,
        connectedToRels: 0,
      },
      discrepancies: {
        missingGoals: 0,
        missingResources: 0,
        missingStoryPulses: 0,
        extraPeople: 0,
        extraMeSpaces: 0,
        extraWeSpaces: 0,
        missingResonanceLinks: 0,
      },
    }

    try {
      // Count production entities
      await this.countProductionEntities(report)

      // Count dev entities
      await this.countDevEntities(report)

      // Calculate discrepancies
      this.calculateDiscrepancies(report)

      // Check for orphaned entities
      await this.checkOrphanedEntities()

      // Check for missing specific entities
      await this.findMissingEntities()

      this.printReport(report)

      return report
    } finally {
      await this.prodDriver.close()
      await this.devDriver.close()
    }
  }

  private async countProductionEntities(
    report: VerificationReport
  ): Promise<void> {
    console.log('📊 Counting production entities...')
    const session = this.prodDriver.session()

    try {
      // Count nodes
      const nodeResult = await session.run(`
        MATCH (n)
        WITH labels(n)[0] as label, count(n) as count
        WHERE label IN ['Person', 'Goal', 'Resource', 'CarePoint', 'CoreValue', 'Community']
        RETURN label, count
      `)

      for (const record of nodeResult.records) {
        const label = record.get('label')
        const count = record.get('count').toNumber()

        switch (label) {
          case 'Person':
            report.production.people = count
            break
          case 'Goal':
            report.production.goals = count
            break
          case 'Resource':
            report.production.resources = count
            break
          case 'CarePoint':
            report.production.carePoints = count
            break
          case 'CoreValue':
            report.production.coreValues = count
            break
          case 'Community':
            report.production.communities = count
            break
        }
      }

      // Count relationships
      const relResult = await session.run(`
        MATCH ()-[r]->()
        WITH type(r) as relType, count(r) as count
        WHERE relType IN ['MOTIVATED_BY', 'APPLIED_TO', 'BELONGS_TO', 'CONNECTED_TO']
        RETURN relType, count
      `)

      for (const record of relResult.records) {
        const relType = record.get('relType')
        const count = record.get('count').toNumber()

        switch (relType) {
          case 'MOTIVATED_BY':
            report.production.motivatedByRels = count
            break
          case 'APPLIED_TO':
            report.production.appliedToRels = count
            break
          case 'BELONGS_TO':
            report.production.belongsToRels = count
            break
          case 'CONNECTED_TO':
            report.production.connectedToRels = count
            break
        }
      }

      console.log('  ✓ Production entities counted\n')
    } finally {
      await session.close()
    }
  }

  private async countDevEntities(report: VerificationReport): Promise<void> {
    console.log('📊 Counting dev entities...')
    const session = this.devDriver.session()

    try {
      // Count nodes with specific labels
      const nodeResult = await session.run(`
        MATCH (n)
        WHERE n:GoalPulse OR n:ResourcePulse OR n:StoryPulse OR n:MeSpace OR n:WeSpace OR n:SpaceMembership OR n:ResonanceLink OR n:FieldContext OR n:Person OR n:User
        RETURN 
          labels(n) as allLabels,
          CASE
            WHEN 'GoalPulse' IN labels(n) THEN 'GoalPulse'
            WHEN 'ResourcePulse' IN labels(n) THEN 'ResourcePulse'
            WHEN 'StoryPulse' IN labels(n) THEN 'StoryPulse'
            WHEN 'MeSpace' IN labels(n) THEN 'MeSpace'
            WHEN 'WeSpace' IN labels(n) THEN 'WeSpace'
            WHEN 'SpaceMembership' IN labels(n) THEN 'SpaceMembership'
            WHEN 'ResonanceLink' IN labels(n) THEN 'ResonanceLink'
            WHEN 'FieldContext' IN labels(n) THEN 'FieldContext'
            WHEN 'Person' IN labels(n) AND NOT 'User' IN labels(n) THEN 'Person'
            WHEN 'User' IN labels(n) THEN 'User'
            ELSE 'Other'
          END as primaryLabel
      `)

      const counts: Record<string, number> = {}

      for (const record of nodeResult.records) {
        const primaryLabel = record.get('primaryLabel')
        counts[primaryLabel] = (counts[primaryLabel] || 0) + 1
      }

      report.dev.people = counts['Person'] || 0
      report.dev.users = counts['User'] || 0
      report.dev.goalPulses = counts['GoalPulse'] || 0
      report.dev.resourcePulses = counts['ResourcePulse'] || 0
      report.dev.storyPulses = counts['StoryPulse'] || 0
      report.dev.meSpaces = counts['MeSpace'] || 0
      report.dev.weSpaces = counts['WeSpace'] || 0
      report.dev.fieldContexts = counts['FieldContext'] || 0
      report.dev.resonanceLinks = counts['ResonanceLink'] || 0
      report.dev.spaceMemberships = counts['SpaceMembership'] || 0

      // Count CONNECTED_TO relationships
      const connectedResult = await session.run(`
        MATCH ()-[r:CONNECTED_TO]->()
        RETURN count(r) as count
      `)
      report.dev.connectedToRels =
        connectedResult.records[0]?.get('count').toNumber() || 0

      console.log('  ✓ Dev entities counted\n')
    } finally {
      await session.close()
    }
  }

  private calculateDiscrepancies(report: VerificationReport): void {
    console.log('🔍 Calculating discrepancies...')

    report.discrepancies.missingGoals =
      report.production.goals - report.dev.goalPulses
    report.discrepancies.missingResources =
      report.production.resources - report.dev.resourcePulses
    report.discrepancies.missingStoryPulses =
      report.production.carePoints +
      report.production.coreValues -
      report.dev.storyPulses
    report.discrepancies.extraPeople =
      report.dev.people - report.production.people
    report.discrepancies.extraMeSpaces =
      report.dev.meSpaces - report.production.people
    report.discrepancies.extraWeSpaces =
      report.dev.weSpaces - report.production.communities
    report.discrepancies.missingResonanceLinks =
      report.production.motivatedByRels +
      report.production.appliedToRels -
      report.dev.resonanceLinks

    console.log('  ✓ Discrepancies calculated\n')
  }

  private async checkOrphanedEntities(): Promise<void> {
    console.log(
      '🔍 Checking for orphaned entities (entities with no relationships)...'
    )
    const session = this.devDriver.session()

    try {
      // Check for pulses without context
      const orphanedPulses = await session.run(`
        MATCH (pulse:FieldPulse)
        WHERE NOT (pulse)<-[:HAS_PULSE]-(:FieldContext)
        RETURN labels(pulse) as pulseType, pulse.id as id, pulse.title as title
        LIMIT 10
      `)

      if (orphanedPulses.records.length > 0) {
        console.log('  ⚠️  Found orphaned pulses (no context):')
        for (const record of orphanedPulses.records) {
          const id = record.get('id')
          const title = record.get('title')
          const pulseType = record.get('pulseType')
          console.log(`    - ${pulseType.join(', ')}: ${id} (${title})`)
        }
      }

      // Check for contexts without space
      const orphanedContexts = await session.run(`
        MATCH (context:FieldContext)
        WHERE NOT (context)<-[:HAS_CONTEXT]-(:Space)
        RETURN context.id as id, context.title as title
        LIMIT 10
      `)

      if (orphanedContexts.records.length > 0) {
        console.log('  ⚠️  Found orphaned contexts (no space):')
        for (const record of orphanedContexts.records) {
          const id = record.get('id')
          const title = record.get('title')
          console.log(`    - ${id}: ${title}`)
        }
      }

      // Check for spaces without owner
      const orphanedSpaces = await session.run(`
        MATCH (space:Space)
        WHERE NOT (space)<-[:OWNS]-(:Person)
        RETURN labels(space) as spaceType, space.id as id, space.name as name
        LIMIT 10
      `)

      if (orphanedSpaces.records.length > 0) {
        console.log('  ⚠️  Found orphaned spaces (no owner):')
        for (const record of orphanedSpaces.records) {
          const id = record.get('id')
          const name = record.get('name')
          const spaceType = record.get('spaceType')
          console.log(`    - ${spaceType.join(', ')}: ${id} (${name})`)
        }
      }

      console.log('  ✓ Orphan check complete\n')
    } finally {
      await session.close()
    }
  }

  private async findMissingEntities(): Promise<void> {
    console.log('🔍 Finding specific missing entities...')
    const prodSession = this.prodDriver.session()
    const devSession = this.devDriver.session()

    try {
      // Find goals in prod that don't have corresponding pulses in dev
      const prodGoals = await prodSession.run(`
        MATCH (g:Goal)
        RETURN g.id as id, g.name as name
      `)

      const missingGoals: string[] = []

      for (const record of prodGoals.records) {
        const goalId = record.get('id')
        const goalName = record.get('name')
        const pulseId = `pulse_${goalId}`

        const pulseResult = await devSession.run(
          `
          MATCH (pulse:GoalPulse { id: $pulseId })
          RETURN count(pulse) as count
          `,
          { pulseId }
        )

        const count = pulseResult.records[0]?.get('count').toNumber() || 0
        if (count === 0) {
          missingGoals.push(`${goalId} (${goalName})`)
        }
      }

      if (missingGoals.length > 0) {
        console.log(`  ⚠️  Found ${missingGoals.length} missing goals:`)
        for (const goal of missingGoals.slice(0, 5)) {
          console.log(`    - ${goal}`)
        }
        if (missingGoals.length > 5) {
          console.log(`    ... and ${missingGoals.length - 5} more`)
        }
      }

      console.log('  ✓ Missing entity check complete\n')
    } finally {
      await prodSession.close()
      await devSession.close()
    }
  }

  private printReport(report: VerificationReport): void {
    console.log('\n' + '='.repeat(70))
    console.log('📋 MIGRATION VERIFICATION REPORT')
    console.log('='.repeat(70))

    console.log('\n📦 PRODUCTION (Reference Schema):')
    console.log(`  People:           ${report.production.people}`)
    console.log(`  Goals:            ${report.production.goals}`)
    console.log(`  Resources:        ${report.production.resources}`)
    console.log(`  CarePoints:       ${report.production.carePoints}`)
    console.log(`  CoreValues:       ${report.production.coreValues}`)
    console.log(`  Communities:      ${report.production.communities}`)
    console.log(`  MOTIVATED_BY:     ${report.production.motivatedByRels}`)
    console.log(`  APPLIED_TO:       ${report.production.appliedToRels}`)
    console.log(`  BELONGS_TO:       ${report.production.belongsToRels}`)
    console.log(`  CONNECTED_TO:     ${report.production.connectedToRels}`)

    console.log('\n📦 DEV (Merged Schema):')
    console.log(`  People:           ${report.dev.people}`)
    console.log(`  Users:            ${report.dev.users}`)
    console.log(`  GoalPulses:       ${report.dev.goalPulses}`)
    console.log(`  ResourcePulses:   ${report.dev.resourcePulses}`)
    console.log(`  StoryPulses:      ${report.dev.storyPulses}`)
    console.log(`  MeSpaces:         ${report.dev.meSpaces}`)
    console.log(`  WeSpaces:         ${report.dev.weSpaces}`)
    console.log(`  FieldContexts:    ${report.dev.fieldContexts}`)
    console.log(`  ResonanceLinks:   ${report.dev.resonanceLinks}`)
    console.log(`  SpaceMemberships: ${report.dev.spaceMemberships}`)
    console.log(`  CONNECTED_TO:     ${report.dev.connectedToRels}`)

    console.log('\n⚠️  DISCREPANCIES:')

    const hasDiscrepancies = Object.values(report.discrepancies).some(
      (v) => v !== 0
    )

    if (hasDiscrepancies) {
      if (report.discrepancies.missingGoals !== 0) {
        console.log(
          `  ${report.discrepancies.missingGoals > 0 ? '❌' : '⚠️ '} Missing Goals:        ${report.discrepancies.missingGoals}`
        )
      }
      if (report.discrepancies.missingResources !== 0) {
        console.log(
          `  ${report.discrepancies.missingResources > 0 ? '❌' : '⚠️ '} Missing Resources:   ${report.discrepancies.missingResources}`
        )
      }
      if (report.discrepancies.missingStoryPulses !== 0) {
        console.log(
          `  ${report.discrepancies.missingStoryPulses > 0 ? '❌' : '⚠️ '} Missing StoryPulses: ${report.discrepancies.missingStoryPulses}`
        )
      }
      if (report.discrepancies.extraPeople !== 0) {
        console.log(
          `  ${report.discrepancies.extraPeople > 0 ? '⚠️ ' : '❌'} Extra People:       ${report.discrepancies.extraPeople}`
        )
      }
      if (report.discrepancies.extraMeSpaces !== 0) {
        console.log(
          `  ${report.discrepancies.extraMeSpaces > 0 ? '⚠️ ' : '❌'} Extra MeSpaces:     ${report.discrepancies.extraMeSpaces}`
        )
      }
      if (report.discrepancies.extraWeSpaces !== 0) {
        console.log(
          `  ${report.discrepancies.extraWeSpaces > 0 ? '⚠️ ' : '❌'} Extra WeSpaces:     ${report.discrepancies.extraWeSpaces}`
        )
      }
      if (report.discrepancies.missingResonanceLinks !== 0) {
        console.log(
          `  ${report.discrepancies.missingResonanceLinks > 0 ? '❌' : '⚠️ '} Missing ResonanceLinks: ${report.discrepancies.missingResonanceLinks}`
        )
      }
    } else {
      console.log('  ✅ No discrepancies found!')
    }

    console.log('\n' + '='.repeat(70) + '\n')
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

  const engine = new VerificationEngine(prodUri, prodAuth, devUri, devAuth)
  await engine.verify()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
