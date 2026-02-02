/**
 * Migration script: Convert global resonances to context-scoped resonances
 *
 * This script:
 * 1. Removes all FieldResonance nodes
 * 2. Removes all RESONATES_AS relationships
 * 3. Updates existing ResonanceLink nodes to be context-scoped
 * 4. Removes orphaned ResonanceLink nodes where source/target are in different contexts
 *
 * Run with: npx tsx scripts/migrate-resonance-to-context-scope.ts
 */

import 'dotenv/config.js'
import { initGraph } from '../src/modules/graph.js'

async function migrateResonances() {
  console.log('Starting resonance migration to context-scoped model...\n')

  const graph = await initGraph()

  try {
    // Step 1: Count existing nodes
    console.log('Step 1: Counting existing nodes...')
    const counts = await graph.query<{
      resonanceCount: number
      linkCount: number
      resonatesAsCount: number
    }>(
      `
      MATCH (r:FieldResonance)
      WITH count(r) as resonanceCount
      MATCH (l:ResonanceLink)
      WITH resonanceCount, count(l) as linkCount
      MATCH ()-[rel:RESONATES_AS]->()
      RETURN 
        resonanceCount,
        linkCount,
        count(rel) as resonatesAsCount
    `,
      {}
    )

    if (counts.length > 0) {
      console.log(`  - FieldResonance nodes: ${counts[0].resonanceCount}`)
      console.log(`  - ResonanceLink nodes: ${counts[0].linkCount}`)
      console.log(
        `  - RESONATES_AS relationships: ${counts[0].resonatesAsCount}\n`
      )
    }

    // Step 2: Delete all RESONATES_AS relationships
    console.log('Step 2: Deleting RESONATES_AS relationships...')
    const deleteRel = await graph.query<{ deletedCount: number }>(
      `
      MATCH ()-[r:RESONATES_AS]->()
      DELETE r
      RETURN count(*) as deletedCount
    `,
      {}
    )
    console.log(
      `  ✓ Deleted ${deleteRel[0]?.deletedCount || 0} relationships\n`
    )

    // Step 3: Delete all FieldResonance nodes
    console.log('Step 3: Deleting FieldResonance nodes...')
    const deleteNodes = await graph.query<{ deletedCount: number }>(
      `
      MATCH (r:FieldResonance)
      DELETE r
      RETURN count(*) as deletedCount
    `,
      {}
    )
    console.log(`  ✓ Deleted ${deleteNodes[0]?.deletedCount || 0} nodes\n`)

    // Step 4: Find ResonanceLinks where source/target are in different contexts
    console.log('Step 4: Finding orphaned ResonanceLinks (cross-context)...')
    const orphaned = await graph.query<{
      linkId: string
      sourceContext: string
      targetContext: string
    }>(
      `
      MATCH (link:ResonanceLink)-[:SOURCE]->(source:FieldPulse)
      MATCH (link)-[:TARGET]->(target:FieldPulse)
      MATCH (contextS:FieldContext)-[:HAS_PULSE]->(source)
      MATCH (contextT:FieldContext)-[:HAS_PULSE]->(target)
      WHERE contextS.id <> contextT.id
      RETURN link.id as linkId, contextS.id as sourceContext, contextT.id as targetContext
    `,
      {}
    )

    if (orphaned.length > 0) {
      console.log(`  Found ${orphaned.length} orphaned links (cross-context):`)
      orphaned.forEach((link) => {
        console.log(
          `    - Link ${link.linkId}: source in ${link.sourceContext}, target in ${link.targetContext}`
        )
      })

      // Delete orphaned links
      const deleteOrphaned = await graph.query<{ deletedCount: number }>(
        `
        MATCH (link:ResonanceLink)-[:SOURCE]->(source:FieldPulse)
        MATCH (link)-[:TARGET]->(target:FieldPulse)
        MATCH (contextS:FieldContext)-[:HAS_PULSE]->(source)
        MATCH (contextT:FieldContext)-[:HAS_PULSE]->(target)
        WHERE contextS.id <> contextT.id
        DETACH DELETE link
        RETURN count(*) as deletedCount
      `,
        {}
      )
      console.log(
        `  ✓ Deleted ${deleteOrphaned[0]?.deletedCount || 0} orphaned links\n`
      )
    } else {
      console.log('  No orphaned links found\n')
    }

    // Step 5: Add HAS_RESONANCE relationships from contexts to links
    console.log('Step 5: Adding HAS_RESONANCE relationships...')
    const addContextRels = await graph.query<{ createdCount: number }>(
      `
      MATCH (link:ResonanceLink)-[:SOURCE]->(source:FieldPulse)
      MATCH (context:FieldContext)-[:HAS_PULSE]->(source)
      MERGE (context)-[:HAS_RESONANCE]->(link)
      RETURN count(*) as createdCount
    `,
      {}
    )
    console.log(
      `  ✓ Created ${addContextRels[0]?.createdCount || 0} HAS_RESONANCE relationships\n`
    )

    // Step 6: Add label and description to existing ResonanceLinks if missing
    console.log('Step 6: Updating ResonanceLink properties...')
    const updateLinks = await graph.query<{ updatedCount: number }>(
      `
      MATCH (link:ResonanceLink)
      WHERE link.label IS NULL
      SET link.label = 'migrated',
          link.description = 'Migrated from old resonance system'
      RETURN count(*) as updatedCount
    `,
      {}
    )
    console.log(`  ✓ Updated ${updateLinks[0]?.updatedCount || 0} links\n`)

    // Step 7: Final verification
    console.log('Step 7: Final verification...')
    const finalCounts = await graph.query<{
      resonanceCount: number
      linkCount: number
      hasResonanceCount: number
    }>(
      `
      MATCH (r:FieldResonance)
      WITH count(r) as resonanceCount
      MATCH (l:ResonanceLink)
      WITH resonanceCount, count(l) as linkCount
      MATCH ()-[rel:HAS_RESONANCE]->()
      RETURN 
        resonanceCount,
        linkCount,
        count(rel) as hasResonanceCount
    `,
      {}
    )

    if (finalCounts.length > 0) {
      console.log(
        `  - FieldResonance nodes: ${finalCounts[0].resonanceCount} (should be 0)`
      )
      console.log(`  - ResonanceLink nodes: ${finalCounts[0].linkCount}`)
      console.log(
        `  - HAS_RESONANCE relationships: ${finalCounts[0].hasResonanceCount}\n`
      )
    }

    console.log('✅ Migration complete!')
    console.log('\nNext steps:')
    console.log('1. Regenerate GraphQL types: npm run codegen')
    console.log(
      '2. Run resonance discovery: curl -X POST http://localhost:3000/api/resonance/discover'
    )
    console.log('3. Verify new resonances are context-scoped')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// Run migration
migrateResonances()
  .then(() => {
    console.log('\n✨ Migration successful!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error)
    process.exit(1)
  })
