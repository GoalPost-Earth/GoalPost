import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import neo4j from 'neo4j-driver'
import dotenv from 'dotenv'

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') })

// Get database connection details from environment variables
const uri = process.env.NEO4J_URI || 'neo4j://localhost:7687'
const user = process.env.NEO4J_USER || 'neo4j'
const password = process.env.NEO4J_PASSWORD || 'password'

async function initializeDatabase() {
  console.log('Connecting to Neo4j database...')

  // Create a Neo4j driver instance
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
  const session = driver.session()

  try {
    // Read the seed-dev.cypher file
    const cypherFilePath = path.join(
      __dirname,
      '../docs/cypher/seed-dev.cypher'
    )
    let cypherQuery = fs.readFileSync(cypherFilePath, 'utf8')

    console.log('Executing database initialization queries...')

    // Split the cypher file into individual statements and execute them
    const statements = cypherQuery
      .split(';')
      .filter((stmt) => stmt.trim().length > 0)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim()
      if (statement) {
        console.log(`Executing statement ${i + 1} of ${statements.length}...`)
        await session.run(statement)
      }
    }
    // Create constraints for unique IDs
    console.log('Creating database constraints...')
    const constraints = [
      `CREATE CONSTRAINT conversation_chunk_id IF NOT EXISTS
       FOR (n:ConversationChunk) REQUIRE n.id IS UNIQUE`,
      `CREATE CONSTRAINT person_id IF NOT EXISTS
       FOR (n:Person) REQUIRE n.id IS UNIQUE`,
      `CREATE CONSTRAINT community_id IF NOT EXISTS
       FOR (n:Community) REQUIRE n.id IS UNIQUE`,
      `CREATE CONSTRAINT space_id IF NOT EXISTS
       FOR (n:Space) REQUIRE n.id IS UNIQUE`,
      `CREATE CONSTRAINT context_id IF NOT EXISTS
       FOR (n:FieldContext) REQUIRE n.id IS UNIQUE`,
      `CREATE CONSTRAINT pulse_id IF NOT EXISTS
       FOR (n:FieldPulse) REQUIRE n.id IS UNIQUE`,
      `CREATE CONSTRAINT resonance_id IF NOT EXISTS
       FOR (n:FieldResonance) REQUIRE n.id IS UNIQUE`,
      `CREATE CONSTRAINT resonance_link_id IF NOT EXISTS
       FOR (n:ResonanceLink) REQUIRE n.id IS UNIQUE`,
    ]

    for (const constraint of constraints) {
      try {
        await session.run(constraint)
        console.log(`✓ Constraint created`)
      } catch (error) {
        if (
          error.code ===
          'Neo.ClientError.Schema.EquivalentSchemaRuleAlreadyExists'
        ) {
          console.log(`✓ Constraint already exists`)
        } else {
          throw error
        }
      }
    }

    // Create vector indexes
    console.log('\nCreating vector indexes...')
    const vectorIndexes = [
      {
        name: 'personBioVectorIndex',
        label: 'Person',
        property: 'embedding',
        description: 'Person bio embeddings for semantic search',
      },
      {
        name: 'pulseContentVectorIndex',
        label: 'FieldPulse',
        property: 'embedding',
        description: 'Pulse content embeddings (aggregated from chunks)',
      },
      {
        name: 'conversationChunkVectorIndex',
        label: 'ConversationChunk',
        property: 'embedding',
        description: 'Individual conversation chunk embeddings',
      },
    ]

    for (const index of vectorIndexes) {
      try {
        await session.run(
          `
          CALL db.index.vector.createNodeIndex(
            $name,
            $label,
            $property,
            1536,
            'cosine'
          )
        `,
          { name: index.name, label: index.label, property: index.property }
        )
        console.log(`✓ Created ${index.description}: ${index.name}`)
      } catch (error) {
        if (
          error.code ===
          'Neo.ClientError.Schema.EquivalentSchemaRuleAlreadyExists'
        ) {
          console.log(`✓ Vector index already exists: ${index.name}`)
        } else {
          throw error
        }
      }
    }

    // Create indexes for performance
    console.log('\nCreating property indexes...')
    const propertyIndexes = [
      `CREATE INDEX resonance_label IF NOT EXISTS
       FOR (r:FieldResonance) ON (r.label)`,
      `CREATE INDEX pulse_createdAt IF NOT EXISTS
       FOR (p:FieldPulse) ON (p.createdAt)`,
      `CREATE INDEX pulse_modifiedAt IF NOT EXISTS
       FOR (p:FieldPulse) ON (p.modifiedAt)`,
      `CREATE INDEX chunk_order IF NOT EXISTS
       FOR (c:ConversationChunk) ON (c.order)`,
    ]

    for (const index of propertyIndexes) {
      try {
        await session.run(index)
        console.log(`✓ Property index created`)
      } catch (error) {
        if (
          error.code ===
          'Neo.ClientError.Schema.EquivalentSchemaRuleAlreadyExists'
        ) {
          console.log(`✓ Property index already exists`)
        } else {
          throw error
        }
      }
    }

    console.log('\n✅ Database initialization completed successfully!')
  } catch (error) {
    console.error('Error initializing database:', error)
    process.exit(1)
  } finally {
    await session.close()
    await driver.close()
  }
}

initializeDatabase()
