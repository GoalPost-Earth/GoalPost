/**
 * Pre-Migration Validation Script
 *
 * Validates that both databases are accessible and contain expected data
 * before running the full migration.
 *
 * Usage: npx tsx scripts/validate-migration-setup.ts
 */

import neo4j, { Driver } from 'neo4j-driver'

interface ValidationResult {
  prodConnected: boolean
  devConnected: boolean
  prodDataCount: {
    people: number
    communities: number
    goals: number
    resources: number
    carePoints: number
    coreValues: number
  }
  devDataCount: {
    people: number
    spaces: number
    pulses: number
  }
  devSchemaValid: boolean
  errors: string[]
}

class MigrationValidator {
  prodDriver: Driver
  devDriver: Driver
  result: ValidationResult = {
    prodConnected: false,
    devConnected: false,
    prodDataCount: {
      people: 0,
      communities: 0,
      goals: 0,
      resources: 0,
      carePoints: 0,
      coreValues: 0,
    },
    devDataCount: {
      people: 0,
      spaces: 0,
      pulses: 0,
    },
    devSchemaValid: false,
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

  async validate(): Promise<boolean> {
    try {
      console.log('🔍 Starting pre-migration validation...\n')

      // Test connectivity
      await this.testConnectivity()

      if (!this.result.prodConnected || !this.result.devConnected) {
        console.error('❌ Cannot continue: Database connectivity failed')
        return false
      }

      // Count production data
      await this.countProdData()

      // Verify dev database is ready
      await this.validateDevSchema()

      // Count existing dev data (should be minimal)
      await this.countDevData()

      this.printReport()
      return this.result.errors.length === 0
    } catch (error) {
      console.error('❌ Validation failed:', error)
      return false
    } finally {
      await this.prodDriver.close()
      await this.devDriver.close()
    }
  }

  private async testConnectivity(): Promise<void> {
    console.log('🔗 Testing database connectivity...')

    // Test production
    try {
      const prodSession = this.prodDriver.session()
      await prodSession.run('RETURN 1')
      await prodSession.close()
      this.result.prodConnected = true
      console.log(
        '  ✓ Production database connected (neo4j://54.225.112.191:7687)'
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      this.result.prodConnected = false
      const errorMsg = error?.message || String(error)
      this.result.errors.push(`Production DB connection failed: ${errorMsg}`)
      console.error('  ✗ Production database connection failed')
      console.error(`    Error: ${errorMsg}`)
      console.error(`    URI: neo4j://54.225.112.191:7687`)
      console.error(
        `    Check if the database is accessible and credentials are correct`
      )
    }

    // Test dev
    try {
      const devSession = this.devDriver.session()
      await devSession.run('RETURN 1')
      await devSession.close()
      this.result.devConnected = true
      console.log(
        '  ✓ Dev database connected (neo4j+s://cfc3e862.databases.neo4j.io)'
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      this.result.devConnected = false
      const errorMsg = error?.message || String(error)
      this.result.errors.push(`Dev DB connection failed: ${errorMsg}`)
      console.error('  ✗ Dev database connection failed')
      console.error(`    Error: ${errorMsg}`)
      console.error(`    URI: neo4j+s://cfc3e862.databases.neo4j.io`)
      console.error(
        `    Check if the database is accessible and credentials are correct`
      )
    }

    console.log()
  }

  private async countProdData(): Promise<void> {
    console.log('📊 Counting production data...')
    const session = this.prodDriver.session()

    try {
      const people = await session.run(
        'MATCH (p:Person) RETURN count(p) as count'
      )
      this.result.prodDataCount.people =
        people.records[0]?.get('count')?.toNumber() || 0

      const communities = await session.run(
        'MATCH (c:Community) RETURN count(c) as count'
      )
      this.result.prodDataCount.communities =
        communities.records[0]?.get('count')?.toNumber() || 0

      const goals = await session.run('MATCH (g:Goal) RETURN count(g) as count')
      this.result.prodDataCount.goals =
        goals.records[0]?.get('count')?.toNumber() || 0

      const resources = await session.run(
        'MATCH (r:Resource) RETURN count(r) as count'
      )
      this.result.prodDataCount.resources =
        resources.records[0]?.get('count')?.toNumber() || 0

      const carePoints = await session.run(
        'MATCH (cp:CarePoint) RETURN count(cp) as count'
      )
      this.result.prodDataCount.carePoints =
        carePoints.records[0]?.get('count')?.toNumber() || 0

      const coreValues = await session.run(
        'MATCH (cv:CoreValue) RETURN count(cv) as count'
      )
      this.result.prodDataCount.coreValues =
        coreValues.records[0]?.get('count')?.toNumber() || 0

      console.log(`  📌 People:       ${this.result.prodDataCount.people}`)
      console.log(`  📌 Communities:  ${this.result.prodDataCount.communities}`)
      console.log(`  📌 Goals:        ${this.result.prodDataCount.goals}`)
      console.log(`  📌 Resources:    ${this.result.prodDataCount.resources}`)
      console.log(`  📌 CarePoints:   ${this.result.prodDataCount.carePoints}`)
      console.log(`  📌 CoreValues:   ${this.result.prodDataCount.coreValues}`)
    } catch (error) {
      this.result.errors.push(`Failed to count production data: ${error}`)
      console.error('  ✗ Failed to count production data')
    } finally {
      await session.close()
      console.log()
    }
  }

  private async validateDevSchema(): Promise<void> {
    console.log('✅ Validating dev database schema...')
    const session = this.devDriver.session()

    try {
      const checks = [
        { name: 'Person', query: 'MATCH (p:Person) RETURN 1 LIMIT 1' },
        { name: 'MeSpace', query: 'MATCH (m:MeSpace) RETURN 1 LIMIT 1' },
        { name: 'WeSpace', query: 'MATCH (w:WeSpace) RETURN 1 LIMIT 1' },
        { name: 'Space interface', query: 'MATCH (s:Space) RETURN 1 LIMIT 1' },
        {
          name: 'FieldContext',
          query: 'MATCH (f:FieldContext) RETURN 1 LIMIT 1',
        },
        { name: 'GoalPulse', query: 'MATCH (g:GoalPulse) RETURN 1 LIMIT 1' },
        {
          name: 'ResourcePulse',
          query: 'MATCH (r:ResourcePulse) RETURN 1 LIMIT 1',
        },
        { name: 'StoryPulse', query: 'MATCH (s:StoryPulse) RETURN 1 LIMIT 1' },
        {
          name: 'ResonanceLink',
          query: 'MATCH (r:ResonanceLink) RETURN 1 LIMIT 1',
        },
      ]

      let allValid = true
      for (const check of checks) {
        try {
          await session.run(check.query)
          console.log(`  ✓ ${check.name}`)
        } catch (error) {
          console.log(
            `  ✗ ${check.name} (not yet created) - ${error instanceof Error ? error.message : String(error)}`
          )
          allValid = false
        }
      }

      this.result.devSchemaValid = allValid
      console.log()
    } finally {
      await session.close()
    }
  }

  private async countDevData(): Promise<void> {
    console.log('📊 Counting existing dev data...')
    const session = this.devDriver.session()

    try {
      const people = await session.run(
        'MATCH (p:Person) RETURN count(p) as count'
      )
      this.result.devDataCount.people =
        people.records[0]?.get('count')?.toNumber() || 0

      const spaces = await session.run(
        'MATCH (s:Space) RETURN count(s) as count'
      )
      this.result.devDataCount.spaces =
        spaces.records[0]?.get('count')?.toNumber() || 0

      const pulses = await session.run(
        'MATCH (p:FieldPulse) RETURN count(p) as count'
      )
      this.result.devDataCount.pulses =
        pulses.records[0]?.get('count')?.toNumber() || 0

      console.log(`  📌 People:       ${this.result.devDataCount.people}`)
      console.log(`  📌 Spaces:       ${this.result.devDataCount.spaces}`)
      console.log(`  📌 Pulses:       ${this.result.devDataCount.pulses}`)

      if (
        this.result.devDataCount.people > 0 ||
        this.result.devDataCount.spaces > 0
      ) {
        this.result.errors.push(
          '⚠️  Dev database already contains data. Run migration again?'
        )
        console.log('  ⚠️  Warning: Dev database already contains data')
      }
    } catch (error) {
      this.result.errors.push(`Failed to count dev data: ${error}`)
      console.error('  ✗ Failed to count dev data')
    } finally {
      await session.close()
      console.log()
    }
  }

  private printReport(): void {
    console.log('\n' + '='.repeat(70))
    console.log('🔍 PRE-MIGRATION VALIDATION REPORT')
    console.log('='.repeat(70))

    console.log('\n📡 CONNECTIVITY STATUS:')
    console.log(
      `  Production DB: ${this.result.prodConnected ? '✅ Connected' : '❌ Failed'}`
    )
    console.log(
      `  Dev DB:        ${this.result.devConnected ? '✅ Connected' : '❌ Failed'}`
    )

    console.log('\n📊 PRODUCTION DATA TO MIGRATE:')
    const total =
      this.result.prodDataCount.people +
      this.result.prodDataCount.communities +
      this.result.prodDataCount.goals +
      this.result.prodDataCount.resources +
      this.result.prodDataCount.carePoints +
      this.result.prodDataCount.coreValues

    console.log(`  Total entities: ${total}`)
    if (total === 0) {
      console.log('  ⚠️  No data found in production database!')
    }

    console.log('\n✅ DEV SCHEMA STATUS:')
    console.log(
      `  Schema valid: ${this.result.devSchemaValid ? '✅ Yes' : '⚠️  Partial'}`
    )

    console.log('\n⚠️  WARNINGS & ISSUES:')
    if (this.result.errors.length === 0) {
      console.log('  ✅ No issues detected')
    } else {
      for (const error of this.result.errors) {
        console.log(`  - ${error}`)
      }
    }

    console.log('\n' + '='.repeat(70))
    const isSafe =
      this.result.prodConnected &&
      this.result.devConnected &&
      this.result.devSchemaValid &&
      total > 0 &&
      this.result.devDataCount.people === 0 &&
      this.result.devDataCount.spaces === 0

    if (isSafe) {
      console.log('✅ VALIDATION PASSED: Safe to run migration')
    } else {
      console.log(
        '❌ VALIDATION FAILED: Address issues before running migration'
      )
    }
    console.log('='.repeat(70) + '\n')
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

  const validator = new MigrationValidator(prodUri, prodAuth, devUri, devAuth)
  const isValid = await validator.validate()

  process.exit(isValid ? 0 : 1)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
