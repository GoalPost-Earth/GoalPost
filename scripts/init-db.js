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
      '../src/pages/api/cypher/seed-dev.cypher'
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
    // Create the vector index for person bio embeddings
    console.log('Creating vector index for Person embeddings...')
    await session.run(`
      CALL db.index.vector.createNodeIndex(
      'personBioVectorIndex',
      'Person',
      'embedding',
      1536,  // Dimension size for OpenAI embeddings - adjust based on your model
      'cosine'  // Similarity metric
      )
    `)
    console.log('Vector index created successfully!')
    console.log('Database initialization completed successfully!')
  } catch (error) {
    console.error('Error initializing database:', error)
    process.exit(1)
  } finally {
    await session.close()
    await driver.close()
  }
}

initializeDatabase()
