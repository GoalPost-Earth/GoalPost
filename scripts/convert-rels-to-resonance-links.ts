/**
 * Migration Script: Convert Direct Relationships to ResonanceLinks
 *
 * Converts DEPENDS_ON and ENABLES relationships between pulses into proper
 * ResonanceLink nodes with SOURCE and TARGET relationships, scoped to contexts.
 *
 * Run with: npx tsx scripts/convert-rels-to-resonance-links.ts
 */

import 'dotenv/config.js'
import { initGraph } from '../src/modules/graph.js'
import { v4 as uuid } from 'uuid'

async function convertRelationshipsToResonanceLinks() {
  console.log(
    '\n╔════════════════════════════════════════════════════════════╗'
  )
  console.log('║  Converting Direct Relationships to ResonanceLinks         ║')
  console.log(
    '╚════════════════════════════════════════════════════════════╝\n'
  )

  const graph = await initGraph()
  let totalConverted = 0
  let totalDeleted = 0

  try {
    // Step 1: Get all direct relationships between pulses
    console.log('Step 1: Finding direct relationships between pulses...')
    const relationships = await graph.query<{
      sourceId: string
      targetId: string
      relationshipType: string
      contextId: string
    }>(
      `
      MATCH (source:FieldPulse)-[r]->(target:FieldPulse)
      WHERE type(r) IN ['DEPENDS_ON', 'ENABLES']
      MATCH (context:FieldContext)-[:HAS_PULSE]->(source)
      WHERE (context)-[:HAS_PULSE]->(target)
      RETURN 
        source.id as sourceId,
        target.id as targetId,
        type(r) as relationshipType,
        context.id as contextId
    `,
      {}
    )

    console.log(`  Found ${relationships.length} direct relationships\n`)

    if (relationships.length === 0) {
      console.log('✅ No relationships to convert\n')
      return
    }

    // Step 2: Convert each relationship to ResonanceLink
    console.log('Step 2: Converting to ResonanceLink nodes...')
    for (const rel of relationships) {
      const linkId = `rl_${uuid()}`
      const label =
        rel.relationshipType === 'DEPENDS_ON' ? 'Depends On' : 'Enables'
      const description =
        rel.relationshipType === 'DEPENDS_ON'
          ? 'One pulse depends on another'
          : 'One pulse enables another'

      // Create ResonanceLink and connect it
      const createResult = await graph.query<{ success: boolean }>(
        `
        MATCH (source:FieldPulse {id: $sourceId})
        MATCH (target:FieldPulse {id: $targetId})
        MATCH (context:FieldContext {id: $contextId})
        
        CREATE (link:ResonanceLink {
          id: $linkId,
          label: $label,
          description: $description,
          confidence: 0.9,
          evidence: $evidence,
          createdAt: datetime()
        })
        
        CREATE (context)-[:HAS_RESONANCE]->(link)
        CREATE (link)-[:SOURCE]->(source)
        CREATE (link)-[:TARGET]->(target)
        
        RETURN true as success
      `,
        {
          linkId,
          sourceId: rel.sourceId,
          targetId: rel.targetId,
          contextId: rel.contextId,
          label,
          description,
          evidence: `Migrated from ${rel.relationshipType} relationship`,
        }
      )

      if (createResult.length > 0 && createResult[0].success) {
        totalConverted++

        // Delete the old direct relationship
        const deleteResult = await graph.query<{ deleted: number }>(
          `
          MATCH (source:FieldPulse {id: $sourceId})-[r:${rel.relationshipType}]->(target:FieldPulse {id: $targetId})
          DELETE r
          RETURN count(r) as deleted
        `,
          {
            sourceId: rel.sourceId,
            targetId: rel.targetId,
          }
        )

        if (deleteResult.length > 0) {
          totalDeleted += deleteResult[0].deleted
        }
      }
    }

    console.log(`  ✓ Converted ${totalConverted} relationships`)
    console.log(`  ✓ Deleted ${totalDeleted} old direct relationships\n`)

    // Step 3: Verify conversion
    console.log('Step 3: Verifying conversion...')
    const verification = await graph.query<{
      remainingDirectRels: number
      createdResonanceLinks: number
    }>(
      `
      MATCH (p1:FieldPulse)-[r]->(p2:FieldPulse)
      WHERE type(r) IN ['DEPENDS_ON', 'ENABLES']
      WITH count(r) as remainingDirectRels
      MATCH (rl:ResonanceLink)-[:SOURCE]->(:FieldPulse)
      RETURN remainingDirectRels, count(rl) as createdResonanceLinks
    `,
      {}
    )

    if (verification.length > 0) {
      const remaining = verification[0].remainingDirectRels
      const created = verification[0].createdResonanceLinks

      console.log(`  ✓ Remaining direct relationships: ${remaining}`)
      console.log(`  ✓ Total ResonanceLinks: ${created}\n`)

      if (remaining === 0) {
        console.log('✅ All relationships successfully converted!\n')
      } else {
        console.log(`⚠️  ${remaining} relationships remain unconverted\n`)
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('CONVERSION SUMMARY')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log(`ResonanceLinks created:  ${totalConverted}`)
    console.log(`Old relationships deleted: ${totalDeleted}`)
    console.log('\n✨ Conversion complete!\n')
  } catch (error) {
    console.error('❌ Conversion failed:', error)
    throw error
  }
}

// Run migration
convertRelationshipsToResonanceLinks()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error)
    process.exit(1)
  })
