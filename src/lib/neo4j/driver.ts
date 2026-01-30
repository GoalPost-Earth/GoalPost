import neo4j from 'neo4j-driver'

/**
 * Neo4j Driver Singleton
 * Provides a reusable connection pool to the Neo4j database.
 * Sessions are created on-demand and closed after use.
 */

const driver = neo4j.driver(
  process.env.NEO4J_URI as string,
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME as string,
    process.env.NEO4J_PASSWORD as string
  ),
  {
    database: process.env.NEO4J_DATABASE || 'neo4j',
  }
)

export { driver }

/**
 * Safely close the driver connection (useful for graceful shutdown).
 */
export async function closeDriver(): Promise<void> {
  await driver.close()
}
