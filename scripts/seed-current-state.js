/**
 * Seed Script: Recreate Current Graph State
 *
 * This script recreates the entire Neo4j graph to match the current database state.
 * It includes all nodes (Person, Community, Space, FieldContext, FieldPulse) and relationships.
 *
 * Usage: node scripts/seed-current-state.js
 *
 * Note: This script is idempotent - it will delete all existing data and recreate from scratch.
 */

import neo4j from 'neo4j-driver'

const uri = process.env.NEO4J_URI || 'neo4j+s://xxx.databases.neo4j.io'
const username = process.env.NEO4J_USERNAME || 'neo4j'
const password = process.env.NEO4J_PASSWORD || 'xxx'

const driver = neo4j.driver(uri, neo4j.auth.basic(username, password))
const session = driver.session()

const seedData = {
  // ============================================================================
  // PEOPLE
  // ============================================================================
  people: [
    {
      id: 'person_jd',
      firstName: 'JD',
      lastName: 'Addy',
      name: 'JD Addy',
      email: 'jd@goalpost.com',
      passions: ['graph databases', 'AI architecture', 'open source'],
      fieldsOfCare: ['technical excellence', 'system design', 'innovation'],
      traits: ['analytical', 'adaptable', 'confident'],
      createdAt: '2025-12-16T20:36:24.331000000+00:00',
    },
    {
      id: 'person_jennifer',
      firstName: 'Jennifer',
      lastName: 'Damashek',
      name: 'Jennifer Damashek',
      email: 'jennifer@goalpost.com',
      passions: [
        'supporting vision',
        'strategic clarity',
        'sustainable growth',
      ],
      fieldsOfCare: [
        'team wellbeing',
        'focused execution',
        'meaningful impact',
      ],
      traits: ['pragmatic', 'supportive', 'wise'],
      createdAt: '2025-12-16T20:36:24.085000000+00:00',
    },
    {
      id: 'person_jesse',
      firstName: 'Jesse',
      lastName: 'Adjei-Asare',
      name: 'Jesse Adjei-Asare',
      email: 'jesse@goalpost.com',
      passions: ['animation', 'UX design', 'delightful interactions'],
      fieldsOfCare: ['user experience', 'visual clarity', 'intuitive design'],
      traits: ['creative', 'meticulous', 'persistent'],
      createdAt: '2025-12-16T20:36:24.569000000+00:00',
    },
    {
      id: 'person_robert',
      firstName: 'Robert',
      lastName: 'Damashek',
      name: 'Robert Damashek',
      email: 'robert@goalpost.com',
      passions: ['product vision', 'user empowerment', 'privacy advocacy'],
      fieldsOfCare: ['data sovereignty', 'personal growth tools', 'ethical AI'],
      traits: ['visionary', 'detail-oriented', 'protective'],
      createdAt: '2025-12-16T20:36:23.771000000+00:00',
    },
  ],

  // ============================================================================
  // COMMUNITIES
  // ============================================================================
  communities: [
    {
      id: 'community_goalpost',
      name: 'GoalPost Core Team',
      type: 'team',
      createdAt: '2025-12-16T20:36:24.816000000+00:00',
    },
  ],

  // ============================================================================
  // SPACES
  // ============================================================================
  spaces: [
    {
      id: 'space_robert_me',
      name: "Robert's Vision Space",
      visibility: 'PRIVATE',
      spaceType: 'MeSpace',
      createdAt: '2025-12-16T20:36:26.161000000+00:00',
      owner: 'person_robert',
    },
    {
      id: 'space_jennifer_me',
      name: "Jennifer's Clarity Space",
      visibility: 'PRIVATE',
      spaceType: 'MeSpace',
      createdAt: '2025-12-16T20:36:26.655000000+00:00',
      owner: 'person_jennifer',
    },
    {
      id: 'space_jd_me',
      name: "JD's Tech Lab",
      visibility: 'PRIVATE',
      spaceType: 'MeSpace',
      createdAt: '2025-12-16T20:36:27.136000000+00:00',
      owner: 'person_jd',
    },
    {
      id: 'space_jesse_me',
      name: "Jesse's Design Studio",
      visibility: 'PRIVATE',
      spaceType: 'MeSpace',
      createdAt: '2025-12-16T20:36:27.610000000+00:00',
      owner: 'person_jesse',
    },
    {
      id: 'space_dev_team',
      name: 'Dev Environment',
      visibility: 'SHARED',
      spaceType: 'WeSpace',
      createdAt: '2025-12-16T20:36:28.091000000+00:00',
      owner: 'community_goalpost',
    },
    {
      id: 'space_founders',
      name: 'Founders Strategy Room',
      visibility: 'SHARED',
      spaceType: 'WeSpace',
      createdAt: '2025-12-16T20:36:29.075000000+00:00',
      owner: 'community_goalpost',
    },
    {
      id: 'space_full_team',
      name: 'GoalPost All Hands',
      visibility: 'SHARED',
      spaceType: 'WeSpace',
      createdAt: '2025-12-16T20:36:30.039000000+00:00',
      owner: 'community_goalpost',
    },
  ],

  // ============================================================================
  // FIELD CONTEXTS
  // ============================================================================
  contexts: [
    {
      id: 'ctx_robert_vision',
      title: 'Product Vision',
      emergentName: 'The North Star',
      createdAt: '2025-12-16T20:36:31.489000000+00:00',
      space: 'space_robert_me',
    },
    {
      id: 'ctx_robert_security',
      title: 'Privacy & Security',
      emergentName: 'The Trust Layer',
      createdAt: '2025-12-16T20:36:31.489000000+00:00',
      space: 'space_robert_me',
    },
    {
      id: 'ctx_robert_timelines',
      title: 'Project Timeline',
      emergentName: 'The Clock',
      createdAt: '2025-12-16T20:36:31.489000000+00:00',
      space: 'space_robert_me',
    },
    {
      id: 'ctx_jennifer_strategy',
      title: 'Strategic Focus',
      emergentName: 'What Matters Most',
      createdAt: '2025-12-16T20:36:31.963000000+00:00',
      space: 'space_jennifer_me',
    },
    {
      id: 'ctx_jennifer_support',
      title: 'Team Support',
      emergentName: 'Holding Space',
      createdAt: '2025-12-16T20:36:31.963000000+00:00',
      space: 'space_jennifer_me',
    },
    {
      id: 'ctx_jd_architecture',
      title: 'System Architecture',
      emergentName: 'The Foundation',
      createdAt: '2025-12-16T20:36:32.217000000+00:00',
      space: 'space_jd_me',
    },
    {
      id: 'ctx_jd_llm',
      title: 'LLM Strategy',
      emergentName: 'Choosing The Path',
      createdAt: '2025-12-16T20:36:32.217000000+00:00',
      space: 'space_jd_me',
    },
    {
      id: 'ctx_jesse_design',
      title: 'Design System',
      emergentName: 'Making It Flow',
      createdAt: '2025-12-16T20:36:32.475000000+00:00',
      space: 'space_jesse_me',
    },
    {
      id: 'ctx_jesse_ux',
      title: 'UX & Animation',
      emergentName: 'Finding Clarity',
      createdAt: '2025-12-16T20:36:32.475000000+00:00',
      space: 'space_jesse_me',
    },
    {
      id: 'ctx_dev_sprint',
      title: 'Implementation Sprint',
      emergentName: 'Building Together',
      createdAt: '2025-12-16T20:36:32.721000000+00:00',
      space: 'space_dev_team',
    },
    {
      id: 'ctx_founders_alignment',
      title: 'Strategic Alignment',
      emergentName: 'Holding The Vision',
      createdAt: '2025-12-16T20:36:32.959000000+00:00',
      space: 'space_founders',
    },
    {
      id: 'ctx_team_celebration',
      title: 'Wins & Milestones',
      emergentName: 'What We Built',
      createdAt: '2025-12-16T20:36:33.196000000+00:00',
      space: 'space_full_team',
    },
    {
      id: 'ctx_team_launch',
      title: 'GoalPost Launch',
      emergentName: 'The Convergence',
      createdAt: '2025-12-16T20:36:33.196000000+00:00',
      space: 'space_full_team',
    },
  ],

  // ============================================================================
  // FIELD PULSES
  // ============================================================================
  pulses: [
    {
      id: 'pulse_robert_1',
      content:
        'Build a tool that truly empowers personal growth through resonance discovery',
      why: 'People deserve sovereignty over their own data and insights',
      intensity: 0.95,
      horizon: 'LONG',
      createdAt: '2025-10-17T20:36:33.443000000+00:00',
      modifiedAt: '2025-12-16T21:07:46.117000000+00:00',
      status: 'COMPLETED',
      context: 'ctx_robert_vision',
      initiator: 'person_robert',
    },
    {
      id: 'pulse_robert_2',
      content: 'Will we hit our target timeline? The pressure is real',
      why: 'So much depends on getting this right and shipping on schedule',
      intensity: 0.8,
      createdAt: '2025-11-16T20:36:33.754000000+00:00',
      modifiedAt: '2025-12-16T21:07:52.148000000+00:00',
      context: 'ctx_robert_timelines',
      initiator: 'person_robert',
    },
    {
      id: 'pulse_robert_3',
      content: 'The team is pulling together - we might actually make it',
      why: "Seeing everyone's dedication gives me confidence",
      intensity: 0.7,
      createdAt: '2025-12-06T20:36:33.754000000+00:00',
      modifiedAt: '2025-12-16T21:07:53.998000000+00:00',
      context: 'ctx_robert_timelines',
      initiator: 'person_robert',
    },
    {
      id: 'pulse_robert_4',
      content: 'Implement enterprise-grade security and privacy controls',
      why: 'Users must be able to trust us with their most personal reflections',
      intensity: 0.9,
      horizon: 'MID',
      createdAt: '2025-11-06T20:36:34.042000000+00:00',
      modifiedAt: '2025-12-16T21:07:55.711000000+00:00',
      status: 'COMPLETED',
      context: 'ctx_robert_security',
      initiator: 'person_robert',
    },
    {
      id: 'pulse_robert_5',
      content:
        'Compliance and privacy are non-negotiable - this keeps me up at night',
      why: "One breach would destroy everything we're building",
      intensity: 0.85,
      createdAt: '2025-11-21T20:36:34.042000000+00:00',
      modifiedAt: '2025-12-16T21:07:57.123000000+00:00',
      context: 'ctx_robert_security',
      initiator: 'person_robert',
    },
    {
      id: 'pulse_jennifer_1',
      content:
        "The MeSpace alone delivers immense value - maybe that's our MVP",
      why: 'Personal resonance discovery is transformative even without collaboration',
      intensity: 0.8,
      createdAt: '2025-11-11T20:36:34.306000000+00:00',
      modifiedAt: '2025-12-16T21:07:58.909000000+00:00',
      context: 'ctx_jennifer_strategy',
      initiator: 'person_jennifer',
    },
    {
      id: 'pulse_jennifer_2',
      content: "Prototype should focus on MeSpace if we can't do everything",
      why: 'Better to nail one thing than half-deliver on many',
      intensity: 0.75,
      horizon: 'SHORT',
      createdAt: '2025-11-14T20:36:34.306000000+00:00',
      modifiedAt: '2025-12-16T21:08:00.689000000+00:00',
      status: 'COMPLETED',
      context: 'ctx_jennifer_strategy',
      initiator: 'person_jennifer',
    },
    {
      id: 'pulse_jennifer_3',
      content: 'Everyone is working so hard - need to ensure sustainable pace',
      why: 'Burnout would cost us more than any delay',
      intensity: 0.65,
      createdAt: '2025-11-26T20:36:34.577000000+00:00',
      modifiedAt: '2025-12-16T21:08:02.399000000+00:00',
      context: 'ctx_jennifer_support',
      initiator: 'person_jennifer',
    },
    {
      id: 'pulse_jennifer_4',
      content: 'So proud of what this team has accomplished together',
      why: "The final product exceeded even Robert's vision",
      intensity: 0.9,
      createdAt: '2025-12-14T20:36:34.577000000+00:00',
      modifiedAt: '2025-12-16T21:08:03.946000000+00:00',
      context: 'ctx_jennifer_support',
      initiator: 'person_jennifer',
    },
    {
      id: 'pulse_jd_1',
      content:
        'Build Neo4j vector index layer for semantic resonance discovery',
      why: 'Graph + vectors = perfect substrate for finding meaningful patterns',
      intensity: 0.9,
      horizon: 'MID',
      createdAt: '2025-10-27T20:36:34.839000000+00:00',
      modifiedAt: '2025-12-16T21:08:05.431000000+00:00',
      status: 'COMPLETED',
      context: 'ctx_jd_architecture',
      initiator: 'person_jd',
    },
    {
      id: 'pulse_jd_2',
      content: 'The architecture is coming together beautifully',
      why: 'Graph relationships + embeddings unlock something truly novel',
      intensity: 0.85,
      createdAt: '2025-12-01T20:36:34.839000000+00:00',
      modifiedAt: '2025-12-16T21:08:07.102000000+00:00',
      context: 'ctx_jd_architecture',
      initiator: 'person_jd',
    },
    {
      id: 'pulse_jd_3',
      content:
        'Open source LLMs vs proprietary - which path serves users best?',
      why: 'This choice impacts cost, privacy, and capability',
      intensity: 0.7,
      createdAt: '2025-11-01T20:36:35.314000000+00:00',
      modifiedAt: '2025-12-16T21:08:12.759000000+00:00',
      context: 'ctx_jd_llm',
      initiator: 'person_jd',
    },
    {
      id: 'pulse_jd_4',
      content: "OpenAI's API gives us speed and reliability for launch",
      why: 'We can always add open source options later as the ecosystem matures',
      intensity: 0.65,
      createdAt: '2025-11-08T20:36:35.314000000+00:00',
      modifiedAt: '2025-12-16T21:08:14.422000000+00:00',
      context: 'ctx_jd_llm',
      initiator: 'person_jd',
    },
    {
      id: 'pulse_jd_5',
      content: 'Implement LangChain + OpenAI for resonance pattern detection',
      why: 'Proven tech stack lets us focus on unique value proposition',
      intensity: 0.8,
      horizon: 'SHORT',
      createdAt: '2025-11-11T20:36:35.314000000+00:00',
      modifiedAt: '2025-12-16T21:08:16.184000000+00:00',
      status: 'COMPLETED',
      context: 'ctx_jd_llm',
      initiator: 'person_jd',
    },
    {
      id: 'pulse_jd_6',
      content: 'Not worried about timeline - the work is solid and progressing',
      why: 'Technical foundation is strong, features are falling into place',
      intensity: 0.6,
      createdAt: '2025-11-18T20:36:35.314000000+00:00',
      modifiedAt: '2025-12-16T21:08:18.207000000+00:00',
      context: 'ctx_jd_llm',
      initiator: 'person_jd',
    },
    {
      id: 'pulse_jesse_1',
      content:
        'How do we make resonance discovery feel intuitive, not overwhelming?',
      why: 'The complexity needs to dissolve into delightful interactions',
      intensity: 0.75,
      createdAt: '2025-11-04T20:36:35.804000000+00:00',
      modifiedAt: '2025-12-16T21:08:24.309000000+00:00',
      context: 'ctx_jesse_ux',
      initiator: 'person_jesse',
    },
    {
      id: 'pulse_jesse_2',
      content:
        'Design animation system that guides users through their insights',
      why: "Motion can show connections that static layouts can't",
      intensity: 0.85,
      horizon: 'MID',
      createdAt: '2025-11-06T20:36:35.804000000+00:00',
      modifiedAt: '2025-12-16T21:08:25.947000000+00:00',
      status: 'COMPLETED',
      context: 'ctx_jesse_ux',
      initiator: 'person_jesse',
    },
    {
      id: 'pulse_jesse_3',
      content: 'Finding the right balance between information and simplicity',
      why: 'Each screen needs to feel clear but not empty',
      intensity: 0.7,
      createdAt: '2025-11-24T20:36:35.804000000+00:00',
      modifiedAt: '2025-12-16T21:08:28.427000000+00:00',
      context: 'ctx_jesse_ux',
      initiator: 'person_jesse',
    },
    {
      id: 'pulse_jesse_4',
      content: 'The UX is clicking - users will love this flow',
      why: 'Tested with early users and saw immediate understanding',
      intensity: 0.9,
      createdAt: '2025-12-08T20:36:35.804000000+00:00',
      modifiedAt: '2025-12-16T21:08:30.130000000+00:00',
      context: 'ctx_jesse_ux',
      initiator: 'person_jesse',
    },
    {
      id: 'pulse_jesse_5',
      content: 'Create cohesive design language across MeSpace and WeSpace',
      why: 'Consistency builds trust and reduces cognitive load',
      intensity: 0.8,
      horizon: 'SHORT',
      createdAt: '2025-11-10T20:36:36.159000000+00:00',
      modifiedAt: '2025-12-16T21:08:31.794000000+00:00',
      status: 'COMPLETED',
      context: 'ctx_jesse_design',
      initiator: 'person_jesse',
    },
    {
      id: 'pulse_dev_1',
      content: 'Complete resonance discovery backend by end of sprint',
      why: 'Jesse needs working API to integrate with frontend',
      intensity: 0.85,
      horizon: 'SHORT',
      createdAt: '2025-11-28T20:36:36.423000000+00:00',
      modifiedAt: '2025-12-16T21:08:33.747000000+00:00',
      status: 'COMPLETED',
      context: 'ctx_dev_sprint',
      initiator: 'person_jd',
    },
    {
      id: 'pulse_dev_2',
      content: '20 hours this week for frontend integration',
      intensity: 0.75,
      createdAt: '2025-11-30T20:36:36.679000000+00:00',
      modifiedAt: '2025-12-16T21:08:36.381000000+00:00',
      context: 'ctx_dev_sprint',
      initiator: 'person_jesse',
    },
    {
      id: 'pulse_dev_3',
      content: 'JD and I are in flow - handoffs are seamless',
      why: 'When communication is this good, work feels effortless',
      intensity: 0.85,
      createdAt: '2025-12-04T20:36:36.679000000+00:00',
      modifiedAt: '2025-12-16T21:08:38.090000000+00:00',
      context: 'ctx_dev_sprint',
      initiator: 'person_jesse',
    },
    {
      id: 'pulse_founders_1',
      content: "Jennifer's insight about MeSpace-first is brilliant",
      why: 'Focusing our scope paradoxically expands our impact',
      intensity: 0.8,
      createdAt: '2025-11-13T20:36:36.941000000+00:00',
      modifiedAt: '2025-12-16T21:08:39.688000000+00:00',
      context: 'ctx_founders_alignment',
      initiator: 'person_robert',
    },
    {
      id: 'pulse_founders_2',
      content: "Robert's security obsession will make this product trusted",
      why: 'His attention to privacy details sets us apart',
      intensity: 0.75,
      createdAt: '2025-11-19T20:36:37.209000000+00:00',
      modifiedAt: '2025-12-16T21:08:41.205000000+00:00',
      context: 'ctx_founders_alignment',
      initiator: 'person_jennifer',
    },
    {
      id: 'pulse_celebrate_1',
      content: 'We actually did it - the system works beautifully',
      why: 'Seeing resonances emerge from real conversations is magical',
      intensity: 0.9,
      createdAt: '2025-12-14T20:36:37.784000000+00:00',
      modifiedAt: '2025-12-16T21:08:44.416000000+00:00',
      context: 'ctx_team_celebration',
      initiator: 'person_jd',
    },
    {
      id: 'pulse_celebrate_2',
      content:
        "Users are calling the UX 'intuitive and delightful' - mission accomplished",
      why: 'All those hours finding clarity in the design were worth it',
      intensity: 0.92,
      createdAt: '2025-12-15T20:36:38.051000000+00:00',
      modifiedAt: '2025-12-16T21:08:45.955000000+00:00',
      context: 'ctx_team_celebration',
      initiator: 'person_jesse',
    },
    {
      id: 'pulse_celebrate_3',
      content:
        'This team turned doubt into triumph through trust and collaboration',
      why: 'We proved that ambitious vision + focused execution works',
      intensity: 0.93,
      createdAt: '2025-12-15T20:36:38.320000000+00:00',
      modifiedAt: '2025-12-16T21:08:47.648000000+00:00',
      context: 'ctx_team_celebration',
      initiator: 'person_jennifer',
    },
    {
      id: 'pulse_launch_1',
      content: 'Ship GoalPost v1 with complete MeSpace + resonance system',
      why: "Time to share what we've built with the world",
      intensity: 0.95,
      horizon: 'SHORT',
      createdAt: '2025-10-22T20:36:37.475000000+00:00',
      modifiedAt: '2025-12-16T21:08:43.023000000+00:00',
      status: 'COMPLETED',
      context: 'ctx_team_launch',
      initiator: 'person_robert',
    },
  ],

  // ============================================================================
  // RELATIONSHIPS
  // ============================================================================
  relationships: {
    spaceMembers: [
      { space: 'space_dev_team', person: 'person_jd' },
      { space: 'space_dev_team', person: 'person_jesse' },
      { space: 'space_founders', person: 'person_jennifer' },
      { space: 'space_founders', person: 'person_robert' },
      { space: 'space_full_team', person: 'person_jd' },
      { space: 'space_full_team', person: 'person_jennifer' },
      { space: 'space_full_team', person: 'person_jesse' },
      { space: 'space_full_team', person: 'person_robert' },
    ],
    communityMembers: [
      { community: 'community_goalpost', person: 'person_jd' },
      { community: 'community_goalpost', person: 'person_jennifer' },
      { community: 'community_goalpost', person: 'person_jesse' },
      { community: 'community_goalpost', person: 'person_robert' },
    ],
  },
}

async function clearDatabase() {
  console.log('🗑️  Clearing existing database...')
  const clearQueries = [
    'MATCH (n) DETACH DELETE n',
    'CALL apoc.schema.assert({}, {}) YIELD value RETURN value',
  ]

  for (const query of clearQueries) {
    try {
      await session.run(query)
    } catch {
      // apoc.schema.assert might not be available, continue
    }
  }
  console.log('✓ Database cleared')
}

async function createPeople() {
  console.log('\n👥 Creating people...')
  const query = `
    UNWIND $people as person
    CREATE (p:Person:LifeSensor:RelationalEntity {
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      name: person.name,
      email: person.email,
      passions: person.passions,
      fieldsOfCare: person.fieldsOfCare,
      traits: person.traits,
      createdAt: datetime(person.createdAt)
    })
    RETURN count(p) as created
  `
  const result = await session.run(query, { people: seedData.people })
  const count = result.records[0].get('created').toNumber()
  console.log(`✓ Created ${count} people`)
}

async function createCommunities() {
  console.log('\n🏘️  Creating communities...')
  const query = `
    UNWIND $communities as community
    CREATE (c:Community:LifeSensor:RelationalEntity {
      id: community.id,
      name: community.name,
      type: community.type,
      createdAt: datetime(community.createdAt)
    })
    RETURN count(c) as created
  `
  const result = await session.run(query, { communities: seedData.communities })
  const count = result.records[0].get('created').toNumber()
  console.log(`✓ Created ${count} communities`)
}

async function createSpaces() {
  console.log('\n📍 Creating spaces...')
  let totalSpaces = 0

  for (const space of seedData.spaces) {
    const labels =
      space.spaceType === 'MeSpace' ? ':Space:MeSpace' : ':Space:WeSpace'

    const query = `
      CREATE (s${labels} {
        id: $id,
        name: $name,
        visibility: $visibility,
        createdAt: datetime($createdAt)
      })
      RETURN id(s) as nodeId
    `

    await session.run(query, {
      id: space.id,
      name: space.name,
      visibility: space.visibility,
      createdAt: space.createdAt,
    })

    totalSpaces++
  }

  console.log(`✓ Created ${totalSpaces} spaces`)
}

async function createContexts() {
  console.log('\n🎯 Creating field contexts...')
  const query = `
    UNWIND $contexts as context
    CREATE (fc:FieldContext {
      id: context.id,
      title: context.title,
      emergentName: context.emergentName,
      createdAt: datetime(context.createdAt)
    })
    RETURN count(fc) as created
  `
  const result = await session.run(query, { contexts: seedData.contexts })
  const count = result.records[0].get('created').toNumber()
  console.log(`✓ Created ${count} field contexts`)
}

async function createPulses() {
  console.log('\n💫 Creating field pulses...')
  const query = `
    UNWIND $pulses as pulse
    CREATE (fp:FieldPulse:GoalPulse {
      id: pulse.id,
      content: pulse.content,
      why: pulse.why,
      intensity: pulse.intensity,
      horizon: pulse.horizon,
      status: pulse.status,
      createdAt: datetime(pulse.createdAt),
      modifiedAt: datetime(pulse.modifiedAt)
    })
    RETURN count(fp) as created
  `
  const result = await session.run(query, { pulses: seedData.pulses })
  const count = result.records[0].get('created').toNumber()
  console.log(`✓ Created ${count} field pulses`)
}

async function createRelationships() {
  console.log('\n🔗 Creating relationships...')

  // OWNS relationships
  console.log('  Setting up OWNS relationships...')
  let ownsCount = 0

  // Community owns spaces
  for (const space of seedData.spaces) {
    if (space.owner && space.owner.startsWith('community_')) {
      await session.run(
        `
        MATCH (c:Community {id: $cId}), (s:Space {id: $sId})
        CREATE (c)-[:OWNS]->(s)
      `,
        { cId: space.owner, sId: space.id }
      )
      ownsCount++
    }
  }

  // Person owns spaces
  for (const space of seedData.spaces) {
    if (space.owner && space.owner.startsWith('person_')) {
      await session.run(
        `
        MATCH (p:Person {id: $pId}), (s:Space {id: $sId})
        CREATE (p)-[:OWNS]->(s)
      `,
        { pId: space.owner, sId: space.id }
      )
      ownsCount++
    }
  }

  console.log(`  ✓ Created ${ownsCount} OWNS relationships`)

  // HAS_MEMBER relationships
  console.log('  Setting up HAS_MEMBER relationships...')
  let memberCount = 0

  // Community members
  for (const member of seedData.relationships.communityMembers) {
    await session.run(
      `
      MATCH (c:Community {id: $cId}), (p:Person {id: $pId})
      CREATE (c)-[:HAS_MEMBER]->(p)
    `,
      { cId: member.community, pId: member.person }
    )
    memberCount++
  }

  // Space members
  for (const member of seedData.relationships.spaceMembers) {
    await session.run(
      `
      MATCH (s:Space {id: $sId}), (p:Person {id: $pId})
      CREATE (s)-[:HAS_MEMBER]->(p)
    `,
      { sId: member.space, pId: member.person }
    )
    memberCount++
  }

  console.log(`  ✓ Created ${memberCount} HAS_MEMBER relationships`)

  // HAS_CONTEXT relationships
  console.log('  Setting up HAS_CONTEXT relationships...')
  let contextCount = 0

  for (const context of seedData.contexts) {
    await session.run(
      `
      MATCH (s:Space {id: $sId}), (fc:FieldContext {id: $fcId})
      CREATE (s)-[:HAS_CONTEXT]->(fc)
    `,
      { sId: context.space, fcId: context.id }
    )
    contextCount++
  }

  console.log(`  ✓ Created ${contextCount} HAS_CONTEXT relationships`)

  // HAS_PULSE relationships
  console.log('  Setting up HAS_PULSE relationships...')
  let pulseCount = 0

  for (const pulse of seedData.pulses) {
    await session.run(
      `
      MATCH (fc:FieldContext {id: $fcId}), (fp:FieldPulse {id: $fpId})
      CREATE (fc)-[:HAS_PULSE]->(fp)
    `,
      { fcId: pulse.context, fpId: pulse.id }
    )
    pulseCount++
  }

  console.log(`  ✓ Created ${pulseCount} HAS_PULSE relationships`)

  console.log(`\n✓ All relationships created`)
}

async function seed() {
  try {
    console.log('🌱 Starting graph seeding...\n')
    console.log('This will:')
    console.log('  - Delete all existing data')
    console.log('  - Create 4 people')
    console.log('  - Create 1 community')
    console.log('  - Create 7 spaces (4 MeSpaces, 3 WeSpaces)')
    console.log('  - Create 13 field contexts')
    console.log('  - Create 29 field pulses')
    console.log('  - Create all relationships\n')

    await clearDatabase()
    await createPeople()
    await createCommunities()
    await createSpaces()
    await createContexts()
    await createPulses()
    await createRelationships()

    console.log(
      '\n✅ Graph seeding complete! Your database now matches the current production state.\n'
    )
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  } finally {
    await session.close()
    await driver.close()
  }
}

seed()
