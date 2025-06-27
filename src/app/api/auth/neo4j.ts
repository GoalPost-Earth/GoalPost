import neo4j, { Driver } from 'neo4j-driver'

let driver: Driver | null = null

export function initializeDB() {
  const uri = process.env.NEO4J_URI || 'neo4j://localhost:7687'
  const user = process.env.NEO4J_USER || 'neo4j'
  const password = process.env.NEO4J_PASSWORD || 'password'

  driver = neo4j.driver(uri, neo4j.auth.basic(user, password))

  console.log('Connected to Neo4j database')

  return { driver }
}

export function getSession() {
  if (!driver) {
    throw new Error('Database not initialized')
  }

  return driver.session()
}
