#!/usr/bin/env tsx
/**
 * Copy all data from neo4j-dev database to neo4j database
 * WARNING: This clears the target database before copying
 */

import neo4j, { Driver, Session } from 'neo4j-driver'

// Source: neo4j-dev
const SOURCE_URI = 'neo4j+s://cfc3e862.databases.neo4j.io'
const SOURCE_USERNAME = 'cfc3e862'
const SOURCE_PASSWORD = '4OJwS3lAtKsPGj5Z7ZFRSRAGHp2A36vx_ImR41MxEIU'
const SOURCE_DATABASE = 'cfc3e862'

// Target: neo4j
const TARGET_URI = 'neo4j+s://ee93871d.databases.neo4j.io'
const TARGET_USERNAME = 'neo4j'
const TARGET_PASSWORD = 'XSKVpR_9FFYsbaeMswPY8QD0txhSIvEWm0Q7dUfOnkI'

interface NodeData {
  id: string
  labels: string[]
  properties: Record<string, any>
}

interface RelationshipData {
  type: string
  startNodeId: string
  endNodeId: string
  properties: Record<string, any>
}

async function getAllNodes(session: Session): Promise<NodeData[]> {
  const result = await session.run(`
    MATCH (n)
    RETURN elementId(n) as id, labels(n) as labels, properties(n) as properties
  `)

  return result.records.map((record) => ({
    id: record.get('id'),
    labels: record.get('labels'),
    properties: record.get('properties'),
  }))
}

async function getAllRelationships(
  session: Session
): Promise<RelationshipData[]> {
  const result = await session.run(`
    MATCH (start)-[r]->(end)
    RETURN type(r) as type, 
           elementId(start) as startNodeId, 
           elementId(end) as endNodeId,
           properties(r) as properties
  `)

  return result.records.map((record) => ({
    type: record.get('type'),
    startNodeId: record.get('startNodeId'),
    endNodeId: record.get('endNodeId'),
    properties: record.get('properties'),
  }))
}

async function clearDatabase(session: Session): Promise<void> {
  console.log('🗑️  Clearing target database...')
  const result = await session.run('MATCH (n) DETACH DELETE n')
  const summary = result.summary
  console.log(
    `   Deleted ${summary.counters.updates().nodesDeleted} nodes and ${summary.counters.updates().relationshipsDeleted} relationships`
  )
}

async function createNodes(
  session: Session,
  nodes: NodeData[],
  idMapping: Map<string, string>
): Promise<void> {
  console.log(`\n📦 Creating ${nodes.length} nodes...`)

  let created = 0
  let merged = 0
  for (const node of nodes) {
    const labels = node.labels.join(':')
    const props = Object.entries(node.properties)
      .map(([key, value]) => `${key}: $props.${key}`)
      .join(', ')

    // Use MERGE if node has an 'id' property, CREATE otherwise
    const hasId = 'id' in node.properties
    const query = hasId
      ? `MERGE (n:${labels} {id: $props.id}) ON CREATE SET n = $props ON MATCH SET n = $props RETURN elementId(n) as newId`
      : `CREATE (n:${labels} {${props}}) RETURN elementId(n) as newId`

    try {
      const result = await session.run(query, { props: node.properties })
      const newId = result.records[0].get('newId')
      idMapping.set(node.id, newId)

      if (hasId) {
        merged++
      } else {
        created++
      }

      if ((created + merged) % 50 === 0) {
        console.log(`   Processed ${created + merged}/${nodes.length} nodes...`)
      }
    } catch (error: any) {
      console.error(
        `   ❌ Error creating node with labels ${labels}:`,
        error.message
      )
    }
  }

  console.log(
    `   ✅ Created/merged ${created + merged} nodes (${created} created, ${merged} merged)`
  )
}

async function createRelationships(
  session: Session,
  relationships: RelationshipData[],
  idMapping: Map<string, string>
): Promise<void> {
  console.log(`\n🔗 Creating ${relationships.length} relationships...`)

  let created = 0
  for (const rel of relationships) {
    const startId = idMapping.get(rel.startNodeId)
    const endId = idMapping.get(rel.endNodeId)

    if (!startId || !endId) {
      console.error(`   ❌ Missing mapped IDs for relationship ${rel.type}`)
      continue
    }

    const props =
      Object.keys(rel.properties).length > 0
        ? `{${Object.entries(rel.properties)
            .map(([key, _]) => `${key}: $props.${key}`)
            .join(', ')}}`
        : ''

    const query = `
      MATCH (start), (end)
      WHERE elementId(start) = $startId AND elementId(end) = $endId
      CREATE (start)-[r:${rel.type} ${props}]->(end)
    `

    try {
      await session.run(query, {
        startId,
        endId,
        props: rel.properties,
      })
      created++

      if (created % 50 === 0) {
        console.log(
          `   Created ${created}/${relationships.length} relationships...`
        )
      }
    } catch (error: any) {
      console.error(
        `   ❌ Error creating relationship ${rel.type}:`,
        error.message
      )
    }
  }

  console.log(`   ✅ Created ${created} relationships`)
}

async function main() {
  let sourceDriver: Driver | null = null
  let targetDriver: Driver | null = null

  try {
    console.log('🚀 Starting database migration: neo4j-dev → neo4j\n')

    // Connect to source database
    console.log('📡 Connecting to source database (neo4j-dev)...')
    sourceDriver = neo4j.driver(
      SOURCE_URI,
      neo4j.auth.basic(SOURCE_USERNAME, SOURCE_PASSWORD)
    )
    await sourceDriver.verifyConnectivity()
    console.log('   ✅ Connected to source\n')

    // Connect to target database
    console.log('📡 Connecting to target database (neo4j)...')
    targetDriver = neo4j.driver(
      TARGET_URI,
      neo4j.auth.basic(TARGET_USERNAME, TARGET_PASSWORD)
    )
    await targetDriver.verifyConnectivity()
    console.log('   ✅ Connected to target\n')

    // Export from source
    console.log('📤 Exporting data from neo4j-dev...')
    const sourceSession = sourceDriver.session({ database: SOURCE_DATABASE })

    try {
      const nodes = await getAllNodes(sourceSession)
      console.log(`   Found ${nodes.length} nodes`)

      const relationships = await getAllRelationships(sourceSession)
      console.log(`   Found ${relationships.length} relationships\n`)

      // Import to target
      const targetSession = targetDriver.session()

      try {
        // Clear target database
        await clearDatabase(targetSession)

        // Create ID mapping for relationships
        const idMapping = new Map<string, string>()

        // Create nodes
        await createNodes(targetSession, nodes, idMapping)

        // Create relationships
        await createRelationships(targetSession, relationships, idMapping)

        console.log('\n✅ Migration completed successfully!')
      } finally {
        await targetSession.close()
      }
    } finally {
      await sourceSession.close()
    }
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  } finally {
    if (sourceDriver) await sourceDriver.close()
    if (targetDriver) await targetDriver.close()
  }
}

main()
