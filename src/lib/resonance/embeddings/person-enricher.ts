/**
 * Person enrichment pipeline
 * Analyzes person's pulses to extract themes and update their profile
 * Triggered on every pulse creation to keep Person embeddings current
 */

import { ChatOpenAI } from '@langchain/openai'
import { OpenAIEmbeddings } from '@langchain/openai'
import { getGraphInstance } from '@/modules/agent/tools/langchain-react-agent.tool'
import { z } from 'zod'

const PersonInsightsSchema = z.object({
  themes: z
    .array(z.string())
    .describe(
      'Key themes from recent pulses (e.g., "health consciousness", "career growth")'
    ),
  passions: z.array(z.string()).describe('Emerging passions or interests'),
  fieldsOfCare: z
    .array(z.string())
    .describe('What the person cares deeply about'),
  traits: z
    .array(z.string())
    .describe('Observable personality traits or patterns'),
  summary: z
    .string()
    .describe('A concise summary of what these pulses reveal about the person'),
})

export interface PersonEnrichmentResult {
  personId: string
  insights: z.infer<typeof PersonInsightsSchema>
  updatedProperties: {
    passions?: string[]
    fieldsOfCare?: string[]
    traits?: string[]
  }
  embedding: number[]
}

/**
 * Extract insights from a person's recent pulses using LLM analysis
 */
async function extractPersonInsights(
  personId: string,
  pulses: Array<{ content: string; createdAt: string; type: string }>
): Promise<z.infer<typeof PersonInsightsSchema>> {
  const llm = new ChatOpenAI({
    modelName: 'gpt-4-turbo-preview',
    temperature: 0.3,
    openAIApiKey: process.env.OPENAI_API_KEY,
  })

  const pulsesSummary = pulses
    .map(
      (p, i) =>
        `${i + 1}. [${p.type}] ${p.content} (${new Date(p.createdAt).toLocaleDateString()})`
    )
    .join('\n')

  const prompt = `Analyze the following pulses contributed by a person over the last 30 days.
Extract key insights about their interests, values, and patterns.

Recent Pulses:
${pulsesSummary}

Provide insights about this person based on their contributions. Focus on:
- Recurring themes and topics
- What they're passionate about
- What they care deeply about (fields of care)
- Observable traits or patterns in their behavior/thinking

Be specific and evidence-based. Use the actual pulse content to support your insights.`

  // Use structured output parsing
  const structuredLlm = llm.withStructuredOutput(PersonInsightsSchema)
  const insights = await structuredLlm.invoke([
    {
      role: 'system',
      content:
        'You are an empathetic analyst who helps people understand themselves through their contributions and reflections.',
    },
    { role: 'user', content: prompt },
  ])

  return insights as z.infer<typeof PersonInsightsSchema>
}

/**
 * Enrich a Person's profile based on their recent pulse activity
 * Updates Person properties and regenerates embedding
 *
 * @param personId - The Person node ID
 * @returns Enrichment results
 */
export async function enrichPersonFromPulses(
  personId: string
): Promise<PersonEnrichmentResult> {
  const graph = getGraphInstance()

  // Fetch person's current data and recent pulses (last 30 days)
  const result = await graph.query<{
    person: {
      id: string
      name: string
      email?: string
      passions?: string[]
      fieldsOfCare?: string[]
      traits?: string[]
    }
    pulses: Array<{
      content: string
      createdAt: string
      labels: string[]
    }>
  }>(
    `
    MATCH (p:Person {id: $personId})
    OPTIONAL MATCH (pulse:FieldPulse)-[:INITIATED_BY]->(p)
    WHERE pulse.createdAt > datetime() - duration('P30D')
    RETURN 
      {
        id: p.id,
        name: p.name,
        email: p.email,
        passions: p.passions,
        fieldsOfCare: p.fieldsOfCare,
        traits: p.traits
      } as person,
      collect({
        content: pulse.content,
        createdAt: toString(pulse.createdAt),
        labels: labels(pulse)
      }) as pulses
    ORDER BY pulse.createdAt DESC
  `,
    { personId }
  )

  if (!result.records.length) {
    throw new Error(`Person not found: ${personId}`)
  }

  const { person, pulses } = result.records[0].toObject()

  // Filter out null pulses from OPTIONAL MATCH
  const validPulses = pulses.filter((p) => p.content)

  if (validPulses.length === 0) {
    console.log(
      `No recent pulses found for person ${personId}, skipping enrichment`
    )
    // Still regenerate embedding from existing bio
    const bioText = `${person.name}${person.email ? ` (${person.email})` : ''}`
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-small',
    })
    const embedding = await embeddings.embedQuery(bioText)

    return {
      personId,
      insights: {
        themes: [],
        passions: person.passions || [],
        fieldsOfCare: person.fieldsOfCare || [],
        traits: person.traits || [],
        summary: 'No recent activity to analyze',
      },
      updatedProperties: {},
      embedding,
    }
  }

  // Extract pulse types from labels
  const pulsesWithTypes = validPulses.map((p) => ({
    content: p.content,
    createdAt: p.createdAt,
    type:
      p.labels.find((l) => l.includes('Pulse') && l !== 'FieldPulse') ||
      'FieldPulse',
  }))

  // Extract insights using LLM
  const insights = await extractPersonInsights(personId, pulsesWithTypes)

  // Merge insights with existing person data
  const updatedProperties = {
    passions: [...new Set([...(person.passions || []), ...insights.passions])],
    fieldsOfCare: [
      ...new Set([...(person.fieldsOfCare || []), ...insights.fieldsOfCare]),
    ],
    traits: [...new Set([...(person.traits || []), ...insights.traits])],
  }

  // Update person properties in database
  await graph.query(
    `
    MATCH (p:Person {id: $personId})
    SET p.passions = $passions,
        p.fieldsOfCare = $fieldsOfCare,
        p.traits = $traits,
        p.enrichedAt = datetime()
  `,
    {
      personId,
      passions: updatedProperties.passions,
      fieldsOfCare: updatedProperties.fieldsOfCare,
      traits: updatedProperties.traits,
    }
  )

  // Generate new embedding combining bio + insights
  const bioText = `${person.name}${person.email ? ` (${person.email})` : ''}
Passions: ${updatedProperties.passions.join(', ')}
Fields of Care: ${updatedProperties.fieldsOfCare.join(', ')}
Traits: ${updatedProperties.traits.join(', ')}
Summary: ${insights.summary}`

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: 'text-embedding-3-small',
  })
  const embedding = await embeddings.embedQuery(bioText)

  // Store updated embedding
  await graph.query(
    `
    MATCH (p:Person {id: $personId})
    CALL db.create.setNodeVectorProperty(p, 'embedding', $embedding)
  `,
    { personId, embedding }
  )

  return {
    personId,
    insights,
    updatedProperties,
    embedding,
  }
}

/**
 * Trigger enrichment webhook/event
 * This should be called after pulse creation
 */
export async function triggerPersonEnrichment(personId: string): Promise<void> {
  try {
    await enrichPersonFromPulses(personId)
    console.log(`✓ Person enrichment completed for ${personId}`)
  } catch (error) {
    console.error(`✗ Person enrichment failed for ${personId}:`, error)
    throw error
  }
}
