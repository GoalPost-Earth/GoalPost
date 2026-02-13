/**
 * Generate AI-powered titles for all pulses based on their content
 * Uses OpenAI API to create meaningful, concise titles
 */

import dotenv from 'dotenv'
import path from 'path'
import neo4j, { Driver } from 'neo4j-driver'
import OpenAI from 'openai'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const DEV_URI = process.env.NEO4J_URI || ''
const DEV_USERNAME = process.env.NEO4J_USERNAME || ''
const DEV_PASSWORD = process.env.NEO4J_PASSWORD || ''
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!DEV_URI || !DEV_USERNAME || !DEV_PASSWORD) {
  throw new Error('Neo4j credentials not found')
}

if (!OPENAI_API_KEY) {
  throw new Error('OpenAI API key not found')
}

let driver: Driver

async function connectDatabase() {
  console.log('🔌 Connecting to database...\n')
  driver = neo4j.driver(DEV_URI, neo4j.auth.basic(DEV_USERNAME, DEV_PASSWORD))
  await driver.verifyConnectivity()
  console.log('✅ Connected to database\n')
}

async function closeDatabase() {
  if (driver) await driver.close()
}

interface Pulse {
  id: string
  title: string
  content: string
  type: string
}

async function getPulses(): Promise<Pulse[]> {
  const session = driver.session()
  try {
    const result = await session.run(`
      MATCH (pulse:FieldPulse)
      RETURN 
        pulse.id as id,
        pulse.title as title,
        pulse.content as content,
        CASE 
          WHEN pulse:GoalPulse THEN 'Goal'
          WHEN pulse:ResourcePulse THEN 'Resource'
          WHEN pulse:StoryPulse THEN 'Story'
          ELSE 'Pulse'
        END as type
      ORDER BY pulse.createdAt DESC
    `)
    return result.records.map((record) => ({
      id: record.get('id'),
      title: record.get('title'),
      content: record.get('content'),
      type: record.get('type'),
    }))
  } finally {
    await session.close()
  }
}

async function generateTitle(
  content: string,
  pulseType: string
): Promise<string> {
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant that creates concise, meaningful titles for user pulses. 
Titles should be 5-10 words maximum, capture the essence of the content, and be actionable or evocative.
${pulseType === 'Goal' ? 'For goals, the title should be action-oriented and inspiring.' : ''}
${pulseType === 'Resource' ? 'For resources, the title should describe what the resource is or provides.' : ''}
${pulseType === 'Story' ? 'For stories, the title should be engaging and highlight the main narrative.' : ''}
Return ONLY the title, nothing else.`,
      },
      {
        role: 'user',
        content: `Generate a title for this ${pulseType.toLowerCase()} pulse:\n\n${content}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 20,
  })

  const title = response.choices[0].message.content?.trim()
  if (!title) {
    throw new Error('Failed to generate title')
  }
  return title
}

async function updatePulseTitle(pulseId: string, newTitle: string) {
  const session = driver.session()
  try {
    await session.run(
      `MATCH (pulse:FieldPulse {id: $id})
       SET pulse.title = $title
       RETURN pulse`,
      { id: pulseId, title: newTitle }
    )
  } finally {
    await session.close()
  }
}

async function main() {
  try {
    await connectDatabase()

    console.log('📝 Fetching all pulses...\n')
    const pulses = await getPulses()
    console.log(`Found ${pulses.length} pulses\n`)

    console.log('🤖 Generating AI titles...\n')
    let updated = 0
    for (let i = 0; i < pulses.length; i++) {
      const pulse = pulses[i]
      try {
        console.log(
          `[${i + 1}/${pulses.length}] Generating title for ${pulse.type} pulse...`
        )

        const newTitle = await generateTitle(pulse.content, pulse.type)
        console.log(`  Current: "${pulse.title}"`)
        console.log(`  New: "${newTitle}"`)

        await updatePulseTitle(pulse.id, newTitle)
        updated++
        console.log('  ✅ Updated\n')

        // Add a small delay to avoid rate limiting
        if (i < pulses.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 300))
        }
      } catch (error) {
        console.error(
          `  ❌ Error: ${error instanceof Error ? error.message : String(error)}\n`
        )
      }
    }

    console.log(`\n✅ Completed! Updated ${updated}/${pulses.length} pulses\n`)
  } finally {
    await closeDatabase()
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
