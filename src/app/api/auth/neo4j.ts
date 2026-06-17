import type { Session } from 'neo4j-driver'
import { driver } from '@/lib/neo4j/driver'

/**
 * Back-compat shim over the single shared Neo4j driver.
 *
 * Historically this module owned its OWN driver and re-created it on every
 * `initializeDB()` call — a fresh per-request connection pool that paid the
 * full TLS + routing-table handshake to remote Aura (~2.7s) on each call and
 * orphaned the previous pool. It now delegates to the one app-wide driver
 * singleton in `@/lib/neo4j/driver`, so this path shares the same warm pool as
 * the GraphQL layer, ingest, and simulation. Warm sessions resolve indexed
 * reads in ~20ms instead of seconds.
 *
 * The `initializeDB()` / `getSession()` API is preserved so the ~15 existing
 * route callers need no changes: `initializeDB()` is now a cheap no-op that
 * returns the shared driver, and `getSession()` opens a session on it.
 */

export function initializeDB() {
  return { driver }
}

export function getSession(): Session {
  return driver.session()
}
