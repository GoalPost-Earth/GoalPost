/**
 * Background job workers for pulse processing and resonance discovery
 * Run this file separately: node src/lib/jobs/workers.ts
 */

import { Worker, Job, type ConnectionOptions } from 'bullmq'
import {
  QUEUE_NAMES,
  PulseProcessingJobData,
  ResonanceDiscoveryJobData,
  PersonEnrichmentJobData,
} from './queue-config'
import { generatePulseEmbeddings } from '../resonance/embeddings/pulse-embedder'
import { enrichPersonFromPulses } from '../resonance/embeddings/person-enricher'
import { discoverGlobalResonances } from '../resonance/discovery/pattern-detector'

// Redis connection options (BullMQ manages the client internally)
const redisConnection: ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
}

// Track last run timestamp for resonance discovery
let lastResonanceDiscoveryRun: string | undefined

/**
 * Worker for pulse processing
 * Generates embeddings for pulse and chunks
 */
const pulseProcessingWorker = new Worker<PulseProcessingJobData>(
  QUEUE_NAMES.PULSE_PROCESSING,
  async (job: Job<PulseProcessingJobData>) => {
    const { pulseId, personId, triggerPersonEnrichment } = job.data

    console.log(`[Pulse Processing] Processing pulse ${pulseId}...`)

    // Generate embeddings for pulse and chunks
    const result = await generatePulseEmbeddings(pulseId)

    console.log(`[Pulse Processing] Generated embeddings:`, {
      pulseId: result.pulseId,
      chunkCount: result.chunkEmbeddings.length,
    })

    // Optionally trigger person enrichment
    if (triggerPersonEnrichment && personId) {
      console.log(
        `[Pulse Processing] Triggering person enrichment for ${personId}`
      )
      await enrichPersonFromPulses(personId)
    }

    return {
      success: true,
      pulseId,
      embeddingsGenerated: result.chunkEmbeddings.length + 1,
    }
  },
  {
    connection: redisConnection,
    concurrency: 2, // Process 2 pulses at a time
  }
)

/**
 * Worker for resonance discovery
 * Discovers semantic patterns across pulses
 */
const resonanceDiscoveryWorker = new Worker<ResonanceDiscoveryJobData>(
  QUEUE_NAMES.RESONANCE_DISCOVERY,
  async (job: Job<ResonanceDiscoveryJobData>) => {
    const { lastRunTimestamp, scopeType, scopeId } = job.data

    console.log(`[Resonance Discovery] Starting discovery...`, {
      lastRunTimestamp:
        lastRunTimestamp || lastResonanceDiscoveryRun || 'all pulses',
      scopeType: scopeType || 'global',
      scopeId,
    })

    const timestamp = lastRunTimestamp || lastResonanceDiscoveryRun

    // Discover resonances based on scope
    const resonances = await discoverGlobalResonances(timestamp)

    // Update last run timestamp
    lastResonanceDiscoveryRun = new Date().toISOString()

    console.log(
      `[Resonance Discovery] Discovered ${resonances.length} resonance patterns`
    )

    return {
      success: true,
      resonancesDiscovered: resonances.length,
      resonances: resonances.map((r) => ({
        linkId: r.linkId,
        contextId: r.contextId,
        label: r.label,
        confidence: r.confidence,
      })),
      nextRunTimestamp: lastResonanceDiscoveryRun,
    }
  },
  {
    connection: redisConnection,
    concurrency: 1, // Only one discovery job at a time
  }
)

/**
 * Worker for person enrichment
 * Updates person profile based on their pulses
 */
const personEnrichmentWorker = new Worker<PersonEnrichmentJobData>(
  QUEUE_NAMES.PERSON_ENRICHMENT,
  async (job: Job<PersonEnrichmentJobData>) => {
    const { personId } = job.data

    console.log(`[Person Enrichment] Enriching person ${personId}...`)

    const result = await enrichPersonFromPulses(personId)

    console.log(`[Person Enrichment] Completed enrichment:`, {
      personId: result.personId,
      themes: result.insights.themes.length,
      passions: result.updatedProperties.passions?.length || 0,
      fieldsOfCare: result.updatedProperties.fieldsOfCare?.length || 0,
      traits: result.updatedProperties.traits?.length || 0,
    })

    return {
      success: true,
      personId: result.personId,
      insights: result.insights,
    }
  },
  {
    connection: redisConnection,
    concurrency: 3, // Process 3 people at a time
  }
)

// Worker event handlers
pulseProcessingWorker.on('completed', (job) => {
  console.log(`✓ [Pulse Processing] Job ${job.id} completed`)
})

pulseProcessingWorker.on('failed', (job, err) => {
  console.error(`✗ [Pulse Processing] Job ${job?.id} failed:`, err.message)
})

resonanceDiscoveryWorker.on('completed', (job) => {
  console.log(`✓ [Resonance Discovery] Job ${job.id} completed`)
})

resonanceDiscoveryWorker.on('failed', (job, err) => {
  console.error(`✗ [Resonance Discovery] Job ${job?.id} failed:`, err.message)
})

personEnrichmentWorker.on('completed', (job) => {
  console.log(`✓ [Person Enrichment] Job ${job.id} completed`)
})

personEnrichmentWorker.on('failed', (job, err) => {
  console.error(`✗ [Person Enrichment] Job ${job?.id} failed:`, err.message)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down workers...')
  await pulseProcessingWorker.close()
  await resonanceDiscoveryWorker.close()
  await personEnrichmentWorker.close()
  process.exit(0)
})

console.log('✓ Workers started successfully')
console.log(`  - Pulse Processing Worker (concurrency: 2)`)
console.log(`  - Resonance Discovery Worker (concurrency: 1)`)
console.log(`  - Person Enrichment Worker (concurrency: 3)`)
console.log('\nWaiting for jobs...')
