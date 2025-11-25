/**
 * Load Sample Ontology Data into Neo4j
 * Reads the Cypher script and executes it via Neo4j driver
 */

require('dotenv').config({ path: '.env.local' })
const neo4j = require('neo4j-driver')
const fs = require('fs')
const path = require('path')

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME || 'neo4j',
    process.env.NEO4J_PASSWORD || 'password'
  )
)

async function loadSampleData() {
  const session = driver.session()

  try {
    console.log('📖 Reading sample data script...')
    const cypherScript = fs.readFileSync(
      path.join(__dirname, '../docs/cypher/sample-ontology-data.cypher'),
      'utf8'
    )

    // Split script into individual statements
    const statements = cypherScript
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('//'))

    console.log(`Found ${statements.length} Cypher statements to execute\n`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]

      // Skip comments
      if (statement.startsWith('//')) continue

      try {
        console.log(`[${i + 1}/${statements.length}] Executing statement...`)
        const result = await session.run(statement)

        // Log summary
        if (result.summary.counters) {
          const counters = result.summary.counters._stats
          const updates = []
          if (counters.nodesCreated > 0)
            updates.push(`${counters.nodesCreated} nodes created`)
          if (counters.relationshipsCreated > 0)
            updates.push(
              `${counters.relationshipsCreated} relationships created`
            )
          if (counters.propertiesSet > 0)
            updates.push(`${counters.propertiesSet} properties set`)
          if (updates.length > 0) {
            console.log(`  ✓ ${updates.join(', ')}`)
          }
        }
      } catch (error) {
        console.error(`  ✗ Error executing statement:`, error.message)
        if (statement.length < 200) {
          console.error(`    Statement: ${statement}`)
        }
      }
    }

    console.log('\n✅ Sample data loading complete!')
    console.log('\n📊 Verifying loaded data...')

    // Verification queries
    const verifyQuery = `
      MATCH (n)
      RETURN labels(n)[0] as NodeType, count(n) as Count
      ORDER BY Count DESC
    `

    const verifyResult = await session.run(verifyQuery)
    console.log('\nNode counts by type:')
    verifyResult.records.forEach((record) => {
      console.log(`  ${record.get('NodeType')}: ${record.get('Count')}`)
    })
  } catch (error) {
    console.error('❌ Error loading sample data:', error)
    throw error
  } finally {
    await session.close()
    await driver.close()
  }
}

// Run the script
loadSampleData()
  .then(() => {
    console.log('\n🎉 All done! Open Neo4j Browser to explore the data.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Failed to load sample data:', error)
    process.exit(1)
  })
