import neo4j from 'neo4j-driver'

/**
 * Neo4j Driver Singleton — the ONE driver / connection pool for the whole app.
 *
 * The neo4j-driver Driver owns a connection pool and is designed to live for
 * the lifetime of the process; sessions are created on-demand and closed after
 * use. Every server surface (GraphQL resolvers, REST routes via
 * `@/app/api/auth/neo4j`, ingest, simulation, cypher-generator) shares this
 * single pool so the TLS + routing-table handshake to remote Aura is paid once
 * per process rather than per request.
 *
 * Env resolution is the superset of every prior call site: `NEO4J_USER` is
 * accepted as an alias for `NEO4J_USERNAME`, and local-dev fallbacks keep the
 * driver usable without a fully-populated env.
 */

// Fail closed in production: the localhost/'password' fallbacks below are a
// local-dev convenience, but in prod a missing URI or password almost always
// means a misconfigured deploy. Without this guard the driver would silently
// fall back to a default-credentialled localhost connection and surface only
// an opaque connection error later. Throw loudly at boot instead.
if (process.env.NODE_ENV === 'production') {
  if (!process.env.NEO4J_URI || !process.env.NEO4J_PASSWORD) {
    throw new Error(
      'Neo4j is misconfigured: NEO4J_URI and NEO4J_PASSWORD must be set in production.'
    )
  }
}

const uri = process.env.NEO4J_URI || 'neo4j://localhost:7687'
const username =
  process.env.NEO4J_USERNAME || process.env.NEO4J_USER || 'neo4j'
const password = process.env.NEO4J_PASSWORD || 'password'

const driver = neo4j.driver(uri, neo4j.auth.basic(username, password))

export { driver }

/**
 * Safely close the driver connection (useful for graceful shutdown).
 */
export async function closeDriver(): Promise<void> {
  await driver.close()
}
