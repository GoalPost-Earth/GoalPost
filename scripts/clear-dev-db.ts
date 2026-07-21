/**
 * Clear Dev Database Script
 *
 * WARNING: This will DELETE ALL DATA from the dev Neo4j database!
 * Use this before re-running the migration to ensure a clean slate.
 *
 * Usage: npx tsx scripts/clear-dev-db.ts
 */

import neo4j from 'neo4j-driver'

async function clearDevDatabase() {
  const devUri = 'neo4j+s://ee93871d.databases.neo4j.io'
  const devAuth = {
    username: 'neo4j',
    password: 'XSKVpR_9FFYsbaeMswPY8QD0txhSIvEWm0Q7dUfOnkI',
  }

  const driver = neo4j.driver(
    devUri,
    neo4j.auth.basic(devAuth.username, devAuth.password)
  )

  const session = driver.session()

  try {
    console.log('⚠️  WARNING: About to delete ALL data from dev database!')
    console.log('Dev URI:', devUri)
    console.log('\nStarting in 3 seconds...\n')

    // Wait 3 seconds to give user time to cancel
    await new Promise((resolve) => setTimeout(resolve, 3000))

    console.log('🗑️  Deleting all nodes and relationships...')

    // Delete in batches to avoid memory issues
    let deletedCount = 0
    const batchSize = 1000

    while (true) {
      const result = await session.run(`
        MATCH (n)
        WITH n LIMIT ${batchSize}
        DETACH DELETE n
        RETURN count(n) as deleted
      `)

      const batchDeleted = result.records[0]?.get('deleted').toNumber() || 0
      deletedCount += batchDeleted

      console.log(`  Deleted ${deletedCount} nodes...`)

      if (batchDeleted < batchSize) {
        break // No more nodes to delete
      }
    }

    console.log(
      `\n✅ Successfully deleted ${deletedCount} nodes from dev database`
    )
    console.log('\nDatabase is now empty and ready for migration.\n')
  } catch (error) {
    console.error('❌ Error clearing database:', error)
    throw error
  } finally {
    await session.close()
    await driver.close()
  }
}

clearDevDatabase().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
