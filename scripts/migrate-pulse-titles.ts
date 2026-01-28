/**
 * Migration script: Add titles to existing pulses
 * Generates AI titles for all pulses that don't have one
 */

import dotenv from 'dotenv'
import path from 'path'

// Load .env.local file
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

import { initGraph } from '../src/modules/graph'
import { generatePulseTitle } from '../src/lib/resonance/utils/title-generator'

interface Pulse {
  id: string
  content: string
  labels: string[]
}

async function migratePulseTitles() {
  console.log('🚀 Starting pulse title migration...\n')

  const graph = await initGraph()

  try {
    // Get all pulses without titles
    const pulses = await graph.query<Pulse>(
      `
      MATCH (p:FieldPulse)
      WHERE p.title IS NULL
      RETURN p.id as id, p.content as content, labels(p) as labels
      `,
      {}
    )

    if (!Array.isArray(pulses) || pulses.length === 0) {
      console.log('✅ No pulses need title migration')
      return
    }

    console.log(`📊 Found ${pulses.length} pulses without titles\n`)

    let successCount = 0
    let failCount = 0

    // Process each pulse
    for (let i = 0; i < pulses.length; i++) {
      const pulse = pulses[i]
      const progress = `[${i + 1}/${pulses.length}]`

      try {
        // Generate title from content
        console.log(`${progress} Generating title for ${pulse.id}...`)
        const title = await generatePulseTitle(pulse.content)

        // Update pulse with title
        await graph.query(
          `
          MATCH (p:FieldPulse {id: $pulseId})
          SET p.title = $title
          RETURN p.id as id
          `,
          { pulseId: pulse.id, title }
        )

        console.log(`  ✓ "${title}"`)
        successCount++

        // Small delay to avoid rate limiting
        if (i < pulses.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      } catch (error) {
        console.error(`  ✗ Error processing ${pulse.id}:`, error)
        failCount++
      }
    }

    console.log(`\n📈 Migration Summary:`)
    console.log(`   ✅ Success: ${successCount}`)
    console.log(`   ❌ Failed: ${failCount}`)
    console.log(`   📊 Total: ${pulses.length}`)

    // Verify migration
    const remaining = await graph.query<{ count: number }>(
      `
      MATCH (p:FieldPulse)
      WHERE p.title IS NULL
      RETURN count(p) as count
      `,
      {}
    )

    const remainingCount =
      Array.isArray(remaining) && remaining.length > 0 ? remaining[0].count : 0

    if (remainingCount === 0) {
      console.log('\n🎉 All pulses now have titles!')
    } else {
      console.log(
        `\n⚠️  ${remainingCount} pulses still need titles (may need retry)`
      )
    }
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// Run migration
migratePulseTitles()
  .then(() => {
    console.log('\n✅ Migration complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  })
