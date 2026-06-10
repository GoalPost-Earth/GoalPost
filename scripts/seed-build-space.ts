/**
 * Seed Script: Maple Street Mutual Aid (sample build space)
 *
 * Creates a WeSpace named "Maple Street Mutual Aid" — a wholly fictional
 * neighborhood mutual-aid network — and fills it with sample data: goal
 * pulses, story pulses, resource pulses, and resonance links. The content
 * is invented (no real people, orgs, or pilots); it exists only to give the
 * Studio something realistic to render and navigate against.
 *
 * Authorship is attached to the four migrated :User accounts (JD, Jesse,
 * Robert, Jennifer) by email so the space is reachable when they log in —
 * but the pulse content does not depict their real work.
 *
 * Intended to be run AFTER `npm run migrate:prod-to-dev`, which provides
 * those four Persons. Idempotent: deletes any prior build-space content
 * before re-seeding.
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
    slug: 'goal-tool-library',
    pulseType: 'GoalPulse',
    author: 'jd',
    title: 'Open a shared tool library by spring',
    content:
      'Stand up a lending shed where neighbors can borrow drills, ladders, a wheelbarrow, and yard tools instead of each buying their own. Needs a checkout log, a host for the shed, and a simple way to flag what is out and what is overdue.',
    extra: { status: 'ACTIVE', horizon: 'SHORT', why: 'Nobody needs to own a tool they use twice a year — sharing frees up money and space for everyone.' },
  },
  {
    slug: 'goal-meal-share',
    pulseType: 'GoalPulse',
    author: 'jesse',
    title: 'Launch a weekly meal-share rotation',
    content:
      'Five households cook one extra portion on their assigned night so a neighbor recovering from surgery, a new parent, or anyone having a hard week gets a hot meal without having to ask. Rotate the cooking, keep dietary notes on file.',
    extra: { status: 'ACTIVE', horizon: 'SHORT', why: 'A hot meal on a bad day is the most direct mutual aid we can offer.' },
  },
  {
    slug: 'goal-onboard-neighbors',
    pulseType: 'GoalPulse',
    author: 'robert',
    title: 'Get 15 households onto the care roster',
    content:
      'Move past the handful of founding neighbors. Get 15 households actually signed up, with a contact on file and at least one thing they can offer and one thing they could use, so the network has enough density to be useful.',
    extra: { status: 'ACTIVE', horizon: 'MID', why: 'Below a critical mass of households, requests go unanswered and people stop bothering to ask.' },
  },
  {
    slug: 'goal-welcome-process',
    pulseType: 'GoalPulse',
    author: 'jennifer',
    title: 'Invite-based welcome process for new neighbors',
    content:
      'No open posting. A new household joins because an existing neighbor walks over and invites them, then a welcome buddy helps them fill in what they can offer and what they need before they ever post a request.',
    extra: { status: 'ACTIVE', horizon: 'SHORT', why: 'Trust on the block is built door to door, not through a sign-up form.' },
  },
  {
    slug: 'goal-ride-share',
    pulseType: 'GoalPulse',
    author: 'jd',
    title: 'Stand up a reliable ride board for appointments',
    content:
      'A simple board where a neighbor without a car can request a ride to a clinic, the grocery store, or the pharmacy, and a driver can claim it. Needs enough drivers that requests do not sit unanswered.',
    extra: { status: 'PAUSED', horizon: 'MID', why: 'Missed medical appointments are one of the most common quiet hardships on the block.' },
  },
  {
    slug: 'goal-skills-directory',
    pulseType: 'GoalPulse',
    author: 'robert',
    title: 'Build a neighborhood skills directory',
    content:
      'Capture who can fix a bike, who speaks which languages, who can sit with kids in a pinch, who knows plumbing. A living list so when someone has a need we can point them at a neighbor instead of a paid service.',
    extra: { status: 'ACTIVE', horizon: 'MID', why: 'Most of what people need is already on the block — we just have no way to find it.' },
  },

  // Stories
  {
    slug: 'story-why-we-share',
    pulseType: 'StoryPulse',
    author: 'robert',
    title: 'Why a lending shed beats everyone owning a drill',
    content:
      'There are forty households on this block and probably thirty drills, each used about ten minutes a year. The point of the shed is not just saving money — it is that borrowing the drill means knocking on a door, and knocking on a door is how strangers slowly become neighbors. The tool is an excuse for the contact.',
    extra: { intensity: 0.8, why: 'A reminder that the sharing is the means, not the end — connection is the end.' },
  },
  {
    slug: 'story-trust-first',
    pulseType: 'StoryPulse',
    author: 'jennifer',
    title: 'Trust comes before tools',
    content:
      'We almost led with an app and a request board. Then a neighbor said she would never post that she needed help with groceries where the whole block could see it. So we flipped it: you only see requests from people you have actually met, and help is offered quietly, one household to another. Privacy is not a feature here — it is the floor that lets anyone ask at all.',
    extra: { intensity: 0.9, why: 'A grounding story for any time we are tempted to make needs more public than they should be.' },
  },
  {
    slug: 'story-repair-cafe',
    pulseType: 'StoryPulse',
    author: 'jesse',
    title: 'What our first repair café taught us',
    content:
      'We set up two tables in the community room one Saturday — bring a broken thing, a neighbor helps you fix it. A lamp, a wobbly chair, a kid\'s bike, a sweater with a hole. Half the value was the repairs. The other half was three hours of people who had nodded at each other for years finally talking over a soldering iron.',
    extra: { intensity: 0.6, why: 'Capture why the repair café is worth repeating, beyond the things that got fixed.' },
  },
  {
    slug: 'story-harvest-rotation',
    pulseType: 'StoryPulse',
    author: 'robert',
    title: 'What the harvest-share rotation taught us about cadence',
    content:
      'When the garden plots came in we tried a big monthly produce swap. It flopped — too much at once, half of it spoiled. What worked was small and frequent: whoever had extra tomatoes that day left them on the shared porch shelf, and word went out the same evening. People do not coordinate their lives in big monthly batches; the network has to match the rhythm of how surplus actually shows up.',
    extra: { intensity: 0.85, why: 'A cadence lesson that should shape every rotation we design, not just the garden.' },
  },
  {
    slug: 'story-phone-tree-lessons',
    pulseType: 'StoryPulse',
    author: 'jd',
    title: 'Three rounds of the phone tree: lessons in staying reachable',
    content:
      'First version: one long list, and the one person at the top got every call and burned out. Second version: branches, but nobody knew who their branch lead was. Third version: small pods of five households who actually know each other, each pod with two contacts so no single person is the bottleneck. The lesson — a contact list is not a network. People answer for people they know.',
    extra: { intensity: 0.7, why: 'So the next block that copies us does not relearn this the hard way.' },
  },
  {
    slug: 'story-care-rounds',
    pulseType: 'StoryPulse',
    author: 'jennifer',
    title: 'Care rounds are the underrated glue of the block',
    content:
      'Once a week two neighbors just walk the block and check in — especially on the older folks and anyone who has gone quiet. It sounds soft. In practice it is how we catch the burst pipe, the missed prescription, the person who has not left the house in days. Most needs never get posted anywhere; somebody has to go find them.',
    extra: { intensity: 0.75, why: 'A frame for when someone asks what actually holds the network together.' },
  },
  {
    slug: 'story-potluck-over-app',
    pulseType: 'StoryPulse',
    author: 'jesse',
    title: 'Why we kept the potluck and skipped the group chat',
    content:
      'We tried a block group chat. It went quiet in a week and loud with arguments in two. The monthly potluck, by contrast, has run for a year. A shared table does something a thread cannot: it puts faces to names, it is low-stakes, and you leave knowing one more person you can knock on. Not every coordination problem is solved by more messaging.',
    extra: { intensity: 0.55, why: 'In case we are ever tempted to replace the in-person rituals with another app.' },
  },

  // Resources
  {
    slug: 'resource-tool-inventory',
    pulseType: 'ResourcePulse',
    author: 'jd',
    title: 'Shared tool inventory and checkout log',
    content:
      'Running list of what is in the lending shed, who hosts it, and a simple borrow log — item, who has it, when it is due back. Includes the few rules we agreed on: clean it, return it on time, report anything broken so we can repair or replace.',
    extra: { resourceType: 'doc' },
  },
  {
    slug: 'resource-flyer-templates',
    pulseType: 'ResourcePulse',
    author: 'jesse',
    title: 'Flyer and door-hanger templates',
    content:
      'Print-ready templates for the things we put on doors — meal-share sign-up, repair café announcement, potluck reminder, welcome card for new households. Consistent look so neighbors recognize them as ours at a glance.',
    extra: { resourceType: 'design' },
  },
  {
    slug: 'resource-welcome-script',
    pulseType: 'ResourcePulse',
    author: 'jennifer',
    title: 'New-neighbor welcome script',
    content:
      'What a welcome buddy actually says at the door: who we are, that joining is voluntary and private, the one thing you might offer and the one thing you might need, and how to reach your pod contacts. Warm, short, and never a pitch.',
    extra: { resourceType: 'script' },
  },
  {
    slug: 'resource-contact-tree',
    pulseType: 'ResourcePulse',
    author: 'jd',
    title: 'Emergency contact tree and snow-day plan',
    content:
      'The pod structure written down — who calls whom, the two contacts per pod, and the cold-weather plan: who checks on the elders when the power goes out, who has a generator, who can shovel which walks. Reviewed every fall before the first storm.',
    extra: { resourceType: 'doc' },
  },
  {
    slug: 'resource-palette-signage',
    pulseType: 'ResourcePulse',
    author: 'jesse',
    title: 'Signage style and color palette',
    content:
      'The look of our shared spaces — the shed, the porch produce shelf, the community-room board. Color choices, a friendly hand-lettered feel, and large readable type so a sign reads clearly from the sidewalk in any weather.',
    extra: { resourceType: 'design' },
  },
  {
    slug: 'resource-harvest-interviews',
    pulseType: 'ResourcePulse',
    author: 'robert',
    title: 'Harvest-share neighbor interview notes',
    content:
      'A dozen short porch conversations about the produce rotation, names left out. Common threads: people share most on weekend mornings; they give more freely when it is left out anonymously than when they have to hand it over; surplus moves best between two households who already chat.',
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
    fieldResonanceSlug: 'res-sharing-over-owning',
    label: 'Sharing over owning',
    description: 'Pulses built on the idea that pooled resources beat private ownership for a block.',
    links: [
      {
        source: 'story-why-we-share',
        target: 'resource-tool-inventory',
        evidence: 'The story makes the case for sharing; the inventory is the operational form of it.',
        confidence: 0.9,
      },
      {
        source: 'resource-harvest-interviews',
        target: 'goal-skills-directory',
        evidence: 'The interviews show surplus moves best between neighbors who know each other — the same premise behind a skills directory.',
        confidence: 0.85,
      },
    ],
  },
  {
    fieldResonanceSlug: 'res-reachability',
    label: 'Staying reachable',
    description: 'Recognizing that the network only works if requests reliably reach a person who can answer.',
    links: [
      {
        source: 'goal-ride-share',
        target: 'story-phone-tree-lessons',
        evidence: 'A ride board only works on top of a phone tree where requests actually reach a willing driver.',
        confidence: 0.75,
      },
    ],
  },
  {
    fieldResonanceSlug: 'res-trust-welcome',
    label: 'Trust and welcome',
    description: 'The compact that lets a neighbor feel safe enough to ask for help at all.',
    links: [
      {
        source: 'goal-welcome-process',
        target: 'story-trust-first',
        evidence: 'Invite-based welcome is the operational form of the trust-first story.',
        confidence: 0.95,
      },
      {
        source: 'goal-onboard-neighbors',
        target: 'story-trust-first',
        evidence: 'Growing the roster requires defending that trust at every door.',
        confidence: 0.7,
      },
    ],
  },
  {
    fieldResonanceSlug: 'res-block-identity',
    label: "A block's shared identity",
    description: 'The slow accretion of shared rituals and a recognizable look that make the block feel like one place.',
    links: [
      {
        source: 'resource-palette-signage',
        target: 'story-repair-cafe',
        evidence: 'Consistent signage is what makes a one-off repair café read as part of something ongoing.',
        confidence: 0.8,
      },
      {
        source: 'resource-flyer-templates',
        target: 'story-potluck-over-app',
        evidence: 'The recurring potluck depends on the door flyers that keep drawing people back in person.',
        confidence: 0.85,
      },
    ],
  },
  {
    fieldResonanceSlug: 'res-cadence-learnings',
    label: 'What cadence teaches us',
    description: 'Insights from actual use about the rhythm at which mutual aid actually flows.',
    links: [
      {
        source: 'story-harvest-rotation',
        target: 'resource-harvest-interviews',
        evidence: 'The story is the synthesis; the porch interviews are the raw evidence.',
        confidence: 0.95,
      },
      {
        source: 'story-phone-tree-lessons',
        target: 'story-harvest-rotation',
        evidence: 'Both are reflections on matching the network to the rhythm of how people actually live.',
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
    // Everything this script writes uses prefixed ids; wipe by prefix so we
    // don't touch other dev data.
    await session.run(
      `MATCH (n) WHERE n.id STARTS WITH 'link_${SEED_PREFIX}_'
                  OR n.id STARTS WITH 'resonance_${SEED_PREFIX}_'
                  OR n.id STARTS WITH 'pulse_${SEED_PREFIX}_'
                  OR n.id STARTS WITH 'sm_${SEED_PREFIX}_'
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
    // The dev model wires membership via an intermediate SpaceMembership node:
    //   Space -[:HAS_MEMBER]-> SpaceMembership -[:IS_MEMBER]-> Person
    // JD is the owner (ADMIN role); the others are MEMBER.
    const memberships = Object.entries(memberIds).map(([key, id]) => ({
      personId: id,
      role: key === 'jd' ? 'ADMIN' : 'MEMBER',
      smId: `sm_${SEED_PREFIX}_${key}`,
    }))
    await session.run(
      `MATCH (owner:User {id: $ownerId})
       CREATE (ws:Space:WeSpace {
         id: $spaceId,
         name: 'Maple Street Mutual Aid',
         description: 'A neighborhood mutual-aid network — goals, stories, and shared resources for helping each other out on the block.',
         visibility: 'PRIVATE',
         createdAt: datetime()
       })
       CREATE (owner)-[:OWNS]->(ws)
       WITH ws
       UNWIND $memberships AS row
       MATCH (m:Person {id: row.personId})
       CREATE (sm:SpaceMembership {
         id: row.smId,
         role: row.role,
         addedAt: datetime()
       })
       CREATE (ws)-[:HAS_MEMBER]->(sm)
       CREATE (sm)-[:IS_MEMBER]->(m)
       RETURN count(sm) AS memberships`,
      {
        spaceId: SPACE_ID,
        ownerId: memberIds.jd,
        memberships,
      }
    )
    await session.run(
      `MATCH (ws:WeSpace {id: $spaceId})
       CREATE (ctx:FieldContext {
         id: $contextId,
         title: 'Neighborhood Board',
         emergentName: 'Maple Street',
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
           MATCH (ctx:FieldContext {id: $contextId})
           CREATE (rl:ResonanceLink {
             id: $linkId,
             label: $label,
             evidence: $evidence,
             confidence: $confidence,
             createdAt: datetime()
           })
           CREATE (rl)-[:SOURCE]->(source)
           CREATE (rl)-[:TARGET]->(target)
           CREATE (rl)-[:RESONATES_AS]->(fr)
           // Context-scope the link so it satisfies the ResonanceLink READ
           // @authorization filter (context_SOME owner/member). Without this
           // edge, resonancesInContext returns [] and no resonance edges ever
           // render in the graph views. The schema's HAS_RESONANCE relation
           // is typed [ResonanceLink!]!, so the parallel HAS_RESONANCE edges
           // to FieldResonance nodes are ignored by that field — only this
           // ResonanceLink edge is read.
           CREATE (ctx)-[:HAS_RESONANCE]->(rl)`,
          {
            sourceId,
            targetId,
            resonanceId,
            contextId: CONTEXT_ID,
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
       OPTIONAL MATCH (ws)-[:HAS_MEMBER]->(sm:SpaceMembership)-[:IS_MEMBER]->(m:Person)
       WITH ws, count(DISTINCT m) AS members
       OPTIONAL MATCH (ws)-[:HAS_CONTEXT]->(ctx:FieldContext)-[:HAS_PULSE]->(p:FieldPulse)
       WITH ws, members, count(p) AS pulses
       OPTIONAL MATCH (ws)-[:HAS_CONTEXT]->(:FieldContext)-[:HAS_RESONANCE]->(fr:FieldResonance)
       WITH ws, members, pulses, count(fr) AS resonances
       OPTIONAL MATCH (rl:ResonanceLink)-[:SOURCE]->(:FieldPulse)<-[:HAS_PULSE]-(:FieldContext)<-[:HAS_CONTEXT]-(ws)
       RETURN ws.name AS name, members, pulses, resonances, count(rl) AS links`,
      { spaceId: SPACE_ID }
    )
    const r = result.records[0]
    console.log('━━━ Sample Space Summary ━━━')
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
  console.log('║  SEED · Maple Street Mutual Aid (sample space)            ║')
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
