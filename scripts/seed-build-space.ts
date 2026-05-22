/**
 * Seed Script: GoalPost Build Space
 *
 * Creates a WeSpace named "GoalPost Build Space" with the four core team
 * members and fills it with plausible sample data — goal pulses, story
 * pulses, resource pulses, and resonance links — that reflect the work
 * the team has actually been doing.
 *
 * Intended to be run AFTER `npm run migrate:prod-to-dev`, which provides
 * the four Persons (JD, Jesse, Robert, Jennifer) the WeSpace references.
 * Idempotent: deletes any prior build-space content before re-seeding.
 *
 * Usage: npm run seed:build-space
 */

import fs from 'fs'
import path from 'path'
import neo4j, { Driver } from 'neo4j-driver'

function readEnvFile(filename: string): Record<string, string> {
  const filePath = path.join(process.cwd(), filename)
  if (!fs.existsSync(filePath)) return {}
  const out: Record<string, string> = {}
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq < 0) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    out[key] = value
  }
  return out
}

const devEnv = readEnvFile('.env.local')
const DEV_URI = devEnv.NEO4J_URI
const DEV_USERNAME = devEnv.NEO4J_USERNAME
const DEV_PASSWORD = devEnv.NEO4J_PASSWORD

// All ids in this script start with this prefix so the seed can be cleanly
// removed without touching anything else in dev.
const SEED_PREFIX = 'buildspace'
const SPACE_ID = `space_${SEED_PREFIX}`
const CONTEXT_ID = `context_${SEED_PREFIX}`

const MEMBER_EMAILS = {
  jd: 'jaedagy@gmail.com',
  jesse: 'jesse@thecodefoundry.dev',
  robert: 'robert.damashek@gmail.com',
  jennifer: 'jenniferdamashek@protonmail.com',
} as const

type MemberKey = keyof typeof MEMBER_EMAILS

// Sample content. Each pulse references the author by member key; the script
// resolves that to the actual Person.id at seed time.
type PulseSeed = {
  slug: string
  pulseType: 'GoalPulse' | 'StoryPulse' | 'ResourcePulse'
  author: MemberKey
  title: string
  content: string
  extra?: Record<string, unknown>
}

const PULSES: PulseSeed[] = [
  // Goals
  {
    slug: 'goal-four-mode-v1',
    pulseType: 'GoalPulse',
    author: 'jd',
    title: 'Ship four-mode Studio v1 by end of May',
    content:
      'Get the four Studio modes (Graph, Map, Timeline, List) into a shippable state with consistent navigation, persisted view state, and golden-path tests passing.',
    extra: { status: 'ACTIVE', horizon: 'SHORT', why: 'It unblocks every downstream feature pitch we want to make this quarter.' },
  },
  {
    slug: 'goal-mobile-dashboard',
    pulseType: 'GoalPulse',
    author: 'jesse',
    title: 'Full mobile responsiveness for the dashboard',
    content:
      'Every dashboard surface — entity drawer, person bubbles, spatial view, mode switcher — needs to feel native on mobile, not a desktop layout shoved into a smaller viewport.',
    extra: { status: 'ACTIVE', horizon: 'SHORT', why: 'Half of pilot users open the app on their phone first.' },
  },
  {
    slug: 'goal-onboard-families',
    pulseType: 'GoalPulse',
    author: 'robert',
    title: 'Onboard 10 families to active daily use',
    content:
      'Move past the demo-account phase. Get 10 real households logging pulses, finding resonances, and asking the assistant questions on a daily cadence.',
    extra: { status: 'ACTIVE', horizon: 'MID', why: 'Without sustained real use, we can\'t honestly say resonance discovery works.' },
  },
  {
    slug: 'goal-onboarding-flow',
    pulseType: 'GoalPulse',
    author: 'jennifer',
    title: 'Launch invite-based onboarding with privacy-first defaults',
    content:
      'No public sign-up. Every new account arrives via an invite from an existing user, lands in a Person:User node with private MeSpace defaults, and is walked through care-manual capture before they ever see a pulse.',
    extra: { status: 'ACTIVE', horizon: 'SHORT', why: 'Privacy and trust are the load-bearing promises of the product.' },
  },
  {
    slug: 'goal-llm-latency',
    pulseType: 'GoalPulse',
    author: 'jd',
    title: 'Reduce assistant response latency below 2s p95',
    content:
      'Profile every call in the chat route, identify which steps dominate (tool dispatch, embedding lookup, model call), and cut the p95 from ~4.5s to under 2s without sacrificing answer quality.',
    extra: { status: 'PAUSED', horizon: 'MID', why: 'Latency above 3s breaks the conversational feel that makes the assistant useful.' },
  },
  {
    slug: 'goal-resonance-v2',
    pulseType: 'GoalPulse',
    author: 'robert',
    title: 'Define the resonance discovery v2 spec',
    content:
      'Capture what v1 got right (vector similarity surfacing latent connections) and where it fails (low precision on short pulses, missing the relational layer between authors).',
    extra: { status: 'ACTIVE', horizon: 'MID', why: 'V1 is good enough to validate the thesis but not good enough to defend as the product.' },
  },

  // Stories
  {
    slug: 'story-graph-vs-tables',
    pulseType: 'StoryPulse',
    author: 'robert',
    title: 'Why graph databases beat tables for resonance',
    content:
      'In a tabular world, "Robert\'s goals" and "Robert\'s resources" sit in separate tables joined by a foreign key. In a graph, they are nodes that share a creator and live next to each other through traversal. Resonance is fundamentally about traversal — about asking "what else is near this?" — which is why we picked Neo4j on day one.',
    extra: { intensity: 0.8, why: 'Refresher for the team and a thing to point new collaborators at.' },
  },
  {
    slug: 'story-trust-defaults',
    pulseType: 'StoryPulse',
    author: 'jennifer',
    title: 'Building trust through privacy-first defaults',
    content:
      'We don\'t ask users to opt into privacy; we make it the floor. MeSpaces are private by default. Pulses don\'t leak past their FieldContext. Sharing requires an explicit move. Every default we choose either deepens or erodes that compact.',
    extra: { intensity: 0.9, why: 'A grounding doc when a feature pitch tempts us to share more by default.' },
  },
  {
    slug: 'story-glass-morphism',
    pulseType: 'StoryPulse',
    author: 'jesse',
    title: 'Glass morphism in service of focus',
    content:
      'The glass treatment isn\'t decoration. It lets the surface behind a panel stay legible while the panel itself is the thing you\'re acting on. It implies layered context — exactly the mental model we want users to have when a pulse drawer opens over their spatial view.',
    extra: { intensity: 0.6, why: 'Capture the design rationale before someone PRs it away.' },
  },
  {
    slug: 'story-wrc-pilot',
    pulseType: 'StoryPulse',
    author: 'robert',
    title: 'What the WRC pilot taught us about pulse cardinality',
    content:
      'Users don\'t want to log "a goal" once per goal. They want to log small, frequent observations that accrete into a goal over time. The cardinality the product encourages should match the cardinality of how people actually think about their lives.',
    extra: { intensity: 0.85, why: 'Pilot insight that should be louder in every PRD we write.' },
  },
  {
    slug: 'story-migration-lessons',
    pulseType: 'StoryPulse',
    author: 'jd',
    title: 'Three rounds of prod-to-dev: lessons in label preservation',
    content:
      'First run: missed half the users (silently filtered on password presence). Second run: lost label provenance during ontology rewrite. Third run: preserved every label, every property, every relationship. The lesson: a migration is data archaeology, not data transformation. Keep what you can — you don\'t know which detail future-you will need.',
    extra: { intensity: 0.7, why: 'So nobody on the team has to rediscover this the hard way.' },
  },
  {
    slug: 'story-care-manuals',
    pulseType: 'StoryPulse',
    author: 'jennifer',
    title: 'Care manuals are the underrated UX of relationship modeling',
    content:
      'A "care manual" sounds soft. In practice it\'s a structured, queryable expression of how a person wants to be cared for — what makes them feel seen, what doesn\'t, what they need more or less of right now. It\'s exactly the kind of relational metadata the graph is built to hold.',
    extra: { intensity: 0.75, why: 'A frame to bring up when someone asks "what\'s the killer feature?"' },
  },
  {
    slug: 'story-radix-tailwind',
    pulseType: 'StoryPulse',
    author: 'jesse',
    title: 'Why we chose Radix + Tailwind over a single design system',
    content:
      'A single design system locks you into someone else\'s taste. Radix gives us accessible primitives that don\'t presume aesthetics; Tailwind gives us the velocity to express our own. The cost is more discipline; the win is identity.',
    extra: { intensity: 0.55, why: 'In case we ever have a "should we adopt Material" conversation again.' },
  },

  // Resources
  {
    slug: 'resource-embeddings-best-practices',
    pulseType: 'ResourcePulse',
    author: 'jd',
    title: 'Vector embedding best practices for resonance discovery',
    content:
      'Use text-embedding-3-small (1536-dim) by default. Chunk long pulses before embedding; vectors of paragraph-level chunks beat document-level vectors for finding latent connections. Keep the chunks linked back to the parent pulse.',
    extra: { resourceType: 'doc' },
  },
  {
    slug: 'resource-shadcn-patterns',
    pulseType: 'ResourcePulse',
    author: 'jesse',
    title: 'shadcn component patterns library',
    content:
      'Living doc of the shadcn primitives we use and how we customize them for the GoalPost surface — entity drawers, person bubbles, mode toolbars, drawer triggers, and the focal-entity locator strip.',
    extra: { resourceType: 'doc' },
  },
  {
    slug: 'resource-onboarding-script',
    pulseType: 'ResourcePulse',
    author: 'jennifer',
    title: 'Onboarding video script v3',
    content:
      'Three-minute walkthrough: invite arrives, account creation, care manual capture, first pulse, first resonance suggestion. Emphasizes "this is for you" over "this is what we built."',
    extra: { resourceType: 'script' },
  },
  {
    slug: 'resource-cypher-cookbook',
    pulseType: 'ResourcePulse',
    author: 'jd',
    title: 'Cypher cookbook for FieldContext-aware queries',
    content:
      'Common query patterns: pulses-in-context with auth filtering, resonance-link traversal from a focal pulse, person-to-person resonance via shared FieldContexts, and the canonical MeSpace ownership check.',
    extra: { resourceType: 'doc' },
  },
  {
    slug: 'resource-brand-palette',
    pulseType: 'ResourcePulse',
    author: 'jesse',
    title: 'Brand identity and color palette',
    content:
      'Light and dark mode tokens, semantic color slots (focal, supporting, background, glass), and the rationale for our muted-with-one-accent approach. Includes Figma link and Tailwind config snippets.',
    extra: { resourceType: 'design' },
  },
  {
    slug: 'resource-wrc-interviews',
    pulseType: 'ResourcePulse',
    author: 'robert',
    title: 'WRC pilot interview notes',
    content:
      'Twelve interviews, anonymized. Common themes: people use the app most heavily on Sunday evenings; the "why" field is the part they think about longest; sharing happens primarily between two specific people, rarely group-wide.',
    extra: { resourceType: 'research' },
  },
]

// FieldResonance + ResonanceLink seed.
type ResonanceSeed = {
  fieldResonanceSlug: string
  label: string
  description: string
  links: { source: string; target: string; evidence: string; confidence: number }[]
}

const RESONANCES: ResonanceSeed[] = [
  {
    fieldResonanceSlug: 'res-graph-first',
    label: 'Graph-first thinking',
    description: 'Pulses that argue for or rely on graph-shaped data as the substrate of GoalPost.',
    links: [
      {
        source: 'story-graph-vs-tables',
        target: 'resource-cypher-cookbook',
        evidence: 'Both make the case that traversal is the unit of value; the cookbook is the operational form of the story.',
        confidence: 0.9,
      },
      {
        source: 'resource-embeddings-best-practices',
        target: 'goal-resonance-v2',
        evidence: 'V2 of resonance discovery hinges on the embedding choices captured in the doc.',
        confidence: 0.85,
      },
    ],
  },
  {
    fieldResonanceSlug: 'res-mobile-first',
    label: 'Mobile-first design',
    description: 'Recognizing that pilot usage is phone-first and surfaces must be designed that way.',
    links: [
      {
        source: 'goal-mobile-dashboard',
        target: 'story-glass-morphism',
        evidence: 'The glass treatment was designed to layer well on small screens; the goal is to ship that everywhere.',
        confidence: 0.75,
      },
    ],
  },
  {
    fieldResonanceSlug: 'res-privacy-trust',
    label: 'Privacy and trust',
    description: 'The compact between the product and its users; the floor we never violate.',
    links: [
      {
        source: 'goal-onboarding-flow',
        target: 'story-trust-defaults',
        evidence: 'Invite-only onboarding is the operational form of the trust-defaults story.',
        confidence: 0.95,
      },
      {
        source: 'goal-onboard-families',
        target: 'story-trust-defaults',
        evidence: 'Scaling families requires defending the privacy story at every step.',
        confidence: 0.7,
      },
    ],
  },
  {
    fieldResonanceSlug: 'res-design-system',
    label: 'Design system maturity',
    description: 'The slow accretion of a coherent visual language.',
    links: [
      {
        source: 'resource-brand-palette',
        target: 'story-glass-morphism',
        evidence: 'Glass requires deliberate color contrast — the palette is the upstream constraint.',
        confidence: 0.8,
      },
      {
        source: 'resource-shadcn-patterns',
        target: 'story-radix-tailwind',
        evidence: 'The patterns library is the practical output of the Radix+Tailwind decision.',
        confidence: 0.85,
      },
    ],
  },
  {
    fieldResonanceSlug: 'res-pilot-learnings',
    label: 'Real-world pilot learnings',
    description: 'Insights from actual usage that should reshape the roadmap.',
    links: [
      {
        source: 'story-wrc-pilot',
        target: 'resource-wrc-interviews',
        evidence: 'The story is the synthesis; the interviews are the raw evidence.',
        confidence: 0.95,
      },
      {
        source: 'story-migration-lessons',
        target: 'story-wrc-pilot',
        evidence: 'Both pulses are reflections on hard-won operational knowledge.',
        confidence: 0.5,
      },
    ],
  },
]

let driver: Driver

async function connect() {
  if (!DEV_URI) throw new Error('Missing NEO4J_URI in .env.local')
  driver = neo4j.driver(
    DEV_URI,
    neo4j.auth.basic(DEV_USERNAME!, DEV_PASSWORD!)
  )
  await driver.verifyConnectivity()
  console.log(`✅ Connected to dev: ${DEV_URI}\n`)
}

async function close() {
  if (driver) await driver.close()
}

async function resolveMemberIds(): Promise<Record<MemberKey, string>> {
  const session = driver.session()
  try {
    const result = await session.run(
      `UNWIND $emails AS email
       MATCH (u:User {email: email})
       RETURN email, u.id AS id`,
      { emails: Object.values(MEMBER_EMAILS) }
    )
    const idsByEmail: Record<string, string> = {}
    for (const r of result.records) {
      idsByEmail[r.get('email') as string] = r.get('id') as string
    }
    const out: Partial<Record<MemberKey, string>> = {}
    for (const [key, email] of Object.entries(MEMBER_EMAILS)) {
      const id = idsByEmail[email]
      if (!id) {
        throw new Error(
          `Required User ${email} not found in dev. Run \`npm run migrate:prod-to-dev\` first.`
        )
      }
      out[key as MemberKey] = id
    }
    return out as Record<MemberKey, string>
  } finally {
    await session.close()
  }
}

/**
 * Idempotency: wipe anything previously seeded under the SEED_PREFIX. Only
 * touches nodes/edges this script creates; everything else (migrated content,
 * other WeSpaces) is untouched.
 */
async function wipePriorSeed() {
  const session = driver.session()
  try {
    // ResonanceLinks + FieldResonances we created.
    await session.run(
      `MATCH (n) WHERE n.id STARTS WITH 'link_${SEED_PREFIX}_'
                  OR n.id STARTS WITH 'resonance_${SEED_PREFIX}_'
                  OR n.id STARTS WITH 'pulse_${SEED_PREFIX}_'
                  OR n.id = $contextId
                  OR n.id = $spaceId
       DETACH DELETE n`,
      { contextId: CONTEXT_ID, spaceId: SPACE_ID }
    )
    console.log('🧹 Wiped prior build-space seed (if any)\n')
  } finally {
    await session.close()
  }
}

async function createSpace(memberIds: Record<MemberKey, string>) {
  const session = driver.session()
  try {
    await session.run(
      `MATCH (owner:User {id: $ownerId})
       CREATE (ws:Space:WeSpace {
         id: $spaceId,
         name: 'GoalPost Build Space',
         description: 'Working space for the GoalPost core team — goals, stories, and resources for what we are building.',
         visibility: 'PRIVATE',
         createdAt: datetime()
       })
       CREATE (owner)-[:OWNS]->(ws)
       WITH ws
       UNWIND $memberIds AS memberId
       MATCH (m:Person {id: memberId})
       CREATE (ws)-[:HAS_MEMBER]->(m)
       RETURN count(*) AS memberships`,
      {
        spaceId: SPACE_ID,
        ownerId: memberIds.jd,
        memberIds: Object.values(memberIds),
      }
    )
    await session.run(
      `MATCH (ws:WeSpace {id: $spaceId})
       CREATE (ctx:FieldContext {
         id: $contextId,
         title: 'Build & Roadmap',
         emergentName: 'GoalPost Build',
         createdAt: datetime()
       })
       CREATE (ws)-[:HAS_CONTEXT]->(ctx)`,
      { spaceId: SPACE_ID, contextId: CONTEXT_ID }
    )
    console.log(
      `✅ Created WeSpace "${SPACE_ID}" + FieldContext "${CONTEXT_ID}" with 4 members (owner=JD)\n`
    )
  } finally {
    await session.close()
  }
}

async function createPulses(memberIds: Record<MemberKey, string>) {
  const session = driver.session()
  try {
    for (const p of PULSES) {
      const authorId = memberIds[p.author]
      const pulseId = `pulse_${SEED_PREFIX}_${p.slug}`
      const extra = (p.extra ?? {}) as Record<string, unknown>
      await session.run(
        `MATCH (ctx:FieldContext {id: $contextId})
         MATCH (author:Person {id: $authorId})
         CREATE (pulse:FieldPulse:\`${p.pulseType}\` {
           id: $pulseId,
           title: $title,
           content: $content,
           createdAt: datetime(),
           modifiedAt: datetime()
         })
         SET pulse += $extra
         CREATE (ctx)-[:HAS_PULSE]->(pulse)
         CREATE (pulse)-[:CREATED_BY]->(author)
         CREATE (pulse)-[:INITIATED_BY]->(author)`,
        {
          contextId: CONTEXT_ID,
          authorId,
          pulseId,
          title: p.title,
          content: p.content,
          extra,
        }
      )
    }
    console.log(`✅ Created ${PULSES.length} pulses (CREATED_BY + INITIATED_BY both set)\n`)
  } finally {
    await session.close()
  }
}

async function createResonances() {
  const session = driver.session()
  try {
    let linkCount = 0
    for (const r of RESONANCES) {
      const resonanceId = `resonance_${SEED_PREFIX}_${r.fieldResonanceSlug}`
      await session.run(
        `MATCH (ctx:FieldContext {id: $contextId})
         CREATE (fr:FieldResonance {
           id: $resonanceId,
           label: $label,
           description: $description,
           detectedBy: 'human',
           createdAt: datetime()
         })
         CREATE (ctx)-[:HAS_RESONANCE]->(fr)`,
        {
          contextId: CONTEXT_ID,
          resonanceId,
          label: r.label,
          description: r.description,
        }
      )
      for (let i = 0; i < r.links.length; i++) {
        const link = r.links[i]
        const linkId = `link_${SEED_PREFIX}_${r.fieldResonanceSlug}_${i}`
        const sourceId = `pulse_${SEED_PREFIX}_${link.source}`
        const targetId = `pulse_${SEED_PREFIX}_${link.target}`
        await session.run(
          `MATCH (source:FieldPulse {id: $sourceId})
           MATCH (target:FieldPulse {id: $targetId})
           MATCH (fr:FieldResonance {id: $resonanceId})
           CREATE (rl:ResonanceLink {
             id: $linkId,
             label: $label,
             evidence: $evidence,
             confidence: $confidence,
             createdAt: datetime()
           })
           CREATE (rl)-[:SOURCE]->(source)
           CREATE (rl)-[:TARGET]->(target)
           CREATE (rl)-[:RESONATES_AS]->(fr)`,
          {
            sourceId,
            targetId,
            resonanceId,
            linkId,
            label: r.label,
            evidence: link.evidence,
            confidence: link.confidence,
          }
        )
        linkCount++
      }
    }
    console.log(
      `✅ Created ${RESONANCES.length} FieldResonances and ${linkCount} ResonanceLinks\n`
    )
  } finally {
    await session.close()
  }
}

async function summary() {
  const session = driver.session()
  try {
    const result = await session.run(
      `MATCH (ws:WeSpace {id: $spaceId})
       OPTIONAL MATCH (ws)-[:HAS_MEMBER]->(m:Person)
       WITH ws, count(m) AS members
       OPTIONAL MATCH (ws)-[:HAS_CONTEXT]->(ctx:FieldContext)-[:HAS_PULSE]->(p:FieldPulse)
       WITH ws, members, count(p) AS pulses
       OPTIONAL MATCH (ws)-[:HAS_CONTEXT]->(:FieldContext)-[:HAS_RESONANCE]->(fr:FieldResonance)
       WITH ws, members, pulses, count(fr) AS resonances
       OPTIONAL MATCH (rl:ResonanceLink)-[:SOURCE]->(:FieldPulse)<-[:HAS_PULSE]-(:FieldContext)<-[:HAS_CONTEXT]-(ws)
       RETURN ws.name AS name, members, pulses, resonances, count(rl) AS links`,
      { spaceId: SPACE_ID }
    )
    const r = result.records[0]
    console.log('━━━ Build Space Summary ━━━')
    console.log(`  Space:     ${r.get('name')}`)
    console.log(`  Members:   ${r.get('members')}`)
    console.log(`  Pulses:    ${r.get('pulses')}`)
    console.log(`  Resonances:${r.get('resonances')}`)
    console.log(`  Links:     ${r.get('links')}`)
  } finally {
    await session.close()
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║  SEED · GoalPost Build Space                              ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')
  try {
    await connect()
    const memberIds = await resolveMemberIds()
    await wipePriorSeed()
    await createSpace(memberIds)
    await createPulses(memberIds)
    await createResonances()
    await summary()
    console.log('\n🎉 Done.\n')
  } catch (err) {
    console.error('\n❌ Seed failed:', err)
    process.exit(1)
  } finally {
    await close()
  }
}

main()
