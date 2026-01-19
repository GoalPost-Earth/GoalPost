/**
 * BullMQ job queue configuration
 * Manages background jobs for resonance discovery and pulse processing
 */

import { Queue, QueueEvents, type ConnectionOptions } from 'bullmq'

// Redis connection configuration shared by all queues
const redisConnection: ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
}

// Job queue names
export const QUEUE_NAMES = {
  PULSE_PROCESSING: 'pulse-processing',
  RESONANCE_DISCOVERY: 'resonance-discovery',
  PERSON_ENRICHMENT: 'person-enrichment',
} as const

// Create queues
export const pulseProcessingQueue = new Queue(QUEUE_NAMES.PULSE_PROCESSING, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 100,
      age: 24 * 3600, // Keep completed jobs for 24 hours
    },
    removeOnFail: {
      count: 50,
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
})

export const resonanceDiscoveryQueue = new Queue(
  QUEUE_NAMES.RESONANCE_DISCOVERY,
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    },
  }
)

export const personEnrichmentQueue = new Queue(QUEUE_NAMES.PERSON_ENRICHMENT, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
})

// Job data types
export interface PulseProcessingJobData {
  pulseId: string
  personId: string
  triggerPersonEnrichment?: boolean
}

export interface ResonanceDiscoveryJobData {
  lastRunTimestamp?: string
  scopeType?: 'global' | 'space' | 'context'
  scopeId?: string
}

export interface PersonEnrichmentJobData {
  personId: string
}

// Queue events for monitoring
export const pulseProcessingEvents = new QueueEvents(
  QUEUE_NAMES.PULSE_PROCESSING,
  {
    connection: redisConnection,
  }
)

export const resonanceDiscoveryEvents = new QueueEvents(
  QUEUE_NAMES.RESONANCE_DISCOVERY,
  {
    connection: redisConnection,
  }
)

export const personEnrichmentEvents = new QueueEvents(
  QUEUE_NAMES.PERSON_ENRICHMENT,
  {
    connection: redisConnection,
  }
)

// Helper functions to add jobs
export async function queuePulseProcessing(data: PulseProcessingJobData) {
  return pulseProcessingQueue.add('process-pulse', data, {
    priority: 1,
  })
}

export async function queueResonanceDiscovery(
  data: ResonanceDiscoveryJobData = {}
) {
  return resonanceDiscoveryQueue.add('discover-resonances', data, {
    priority: 2,
  })
}

export async function queuePersonEnrichment(data: PersonEnrichmentJobData) {
  return personEnrichmentQueue.add('enrich-person', data, {
    priority: 1,
  })
}

// Scheduled job configuration
export async function setupScheduledJobs() {
  // Daily resonance discovery at 2 AM (configurable via env)
  const cronSchedule = process.env.RESONANCE_DISCOVERY_CRON || '0 2 * * *'

  await resonanceDiscoveryQueue.add(
    'scheduled-discovery',
    {},
    {
      repeat: {
        pattern: cronSchedule,
      },
    }
  )

  console.log(
    `✓ Scheduled resonance discovery job with pattern: ${cronSchedule}`
  )
}

// Cleanup function
export async function closeQueues() {
  await pulseProcessingQueue.close()
  await resonanceDiscoveryQueue.close()
  await personEnrichmentQueue.close()
}
