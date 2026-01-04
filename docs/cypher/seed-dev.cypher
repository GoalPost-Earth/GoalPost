// ============================================================================
// GoalPost Demo & Onboarding Data - The Real GoalPost Journey
// A true story of vision, doubt, collaboration, and triumph
// Team: Robert Damashek, Jennifer Damashek, JD Addy, Jesse Adjei-Asare
// ============================================================================
// Clear existing data
MATCH (n)
DETACH DELETE n;

// ============================================================================
// STEP 1: Create People - The GoalPost Team
// ============================================================================

CREATE
  (robert:Person:LifeSensor:RelationalEntity
    {
      id: "person_robert",
      name: "Robert Damashek",
      email: "robert@goalpost.com",
      passions: ["product vision", "user empowerment", "privacy advocacy"],
      fieldsOfCare: ["data sovereignty", "personal growth tools", "ethical AI"],
      traits: ["visionary", "detail-oriented", "protective"],
      createdAt: datetime()
    });

CREATE
  (jennifer:Person:LifeSensor:RelationalEntity
    {
      id: "person_jennifer",
      name: "Jennifer Damashek",
      email: "jennifer@goalpost.com",
      passions: [
        "supporting vision",
        "strategic clarity",
        "sustainable growth"
      ],
      fieldsOfCare: [
        "team wellbeing",
        "focused execution",
        "meaningful impact"
      ],
      traits: ["pragmatic", "supportive", "wise"],
      createdAt: datetime()
    });

CREATE
  (jd:Person:LifeSensor:RelationalEntity
    {
      id: "person_jd",
      name: "JD Addy",
      email: "jd@goalpost.com",
      passions: ["graph databases", "AI architecture", "open source"],
      fieldsOfCare: ["technical excellence", "system design", "innovation"],
      traits: ["analytical", "adaptable", "confident"],
      createdAt: datetime()
    });

CREATE
  (jesse:Person:LifeSensor:RelationalEntity
    {
      id: "person_jesse",
      name: "Jesse Adjei-Asare",
      email: "jesse@goalpost.com",
      passions: ["animation", "UX design", "delightful interactions"],
      fieldsOfCare: ["user experience", "visual clarity", "intuitive design"],
      traits: ["creative", "meticulous", "persistent"],
      createdAt: datetime()
    });

// ============================================================================
// STEP 2: Create Community - GoalPost Core Team
// ============================================================================

CREATE
  (team:Community:LifeSensor:RelationalEntity
    {
      id: "community_goalpost",
      name: "GoalPost Core Team",
      type: "team",
      createdAt: datetime()
    });

// Add members to community
MATCH
  (robert:Person {id: "person_robert"}),
  (team:Community {id: "community_goalpost"})
CREATE (team)-[:HAS_MEMBER]->(robert);

MATCH
  (jennifer:Person {id: "person_jennifer"}),
  (team:Community {id: "community_goalpost"})
CREATE (team)-[:HAS_MEMBER]->(jennifer);

MATCH (jd:Person {id: "person_jd"}), (team:Community {id: "community_goalpost"})
CREATE (team)-[:HAS_MEMBER]->(jd);

MATCH
  (jesse:Person {id: "person_jesse"}),
  (team:Community {id: "community_goalpost"})
CREATE (team)-[:HAS_MEMBER]->(jesse);

// ============================================================================
// STEP 3: Create Spaces (MeSpace + WeSpace)
// ============================================================================

// Robert's MeSpace
CREATE
  (robertMe:Space:MeSpace
    {
      id: "space_robert_me",
      name: "Robert's Vision Space",
      visibility: "PRIVATE",
      createdAt: datetime()
    });

MATCH
  (robert:Person {id: "person_robert"}), (space:MeSpace {id: "space_robert_me"})
CREATE (robert)-[:OWNS]->(space);

// Jennifer's MeSpace
CREATE
  (jenniferMe:Space:MeSpace
    {
      id: "space_jennifer_me",
      name: "Jennifer's Clarity Space",
      visibility: "PRIVATE",
      createdAt: datetime()
    });

MATCH
  (jennifer:Person {id: "person_jennifer"}),
  (space:MeSpace {id: "space_jennifer_me"})
CREATE (jennifer)-[:OWNS]->(space);

// JD's MeSpace
CREATE
  (jdMe:Space:MeSpace
    {
      id: "space_jd_me",
      name: "JD's Tech Lab",
      visibility: "PRIVATE",
      createdAt: datetime()
    });

MATCH (jd:Person {id: "person_jd"}), (space:MeSpace {id: "space_jd_me"})
CREATE (jd)-[:OWNS]->(space);

// Jesse's MeSpace
CREATE
  (jesseMe:Space:MeSpace
    {
      id: "space_jesse_me",
      name: "Jesse's Design Studio",
      visibility: "PRIVATE",
      createdAt: datetime()
    });

MATCH
  (jesse:Person {id: "person_jesse"}), (space:MeSpace {id: "space_jesse_me"})
CREATE (jesse)-[:OWNS]->(space);

// Dev Team WeSpace (JD + Jesse)
CREATE
  (devWe:Space:WeSpace
    {
      id: "space_dev_team",
      name: "Dev Environment",
      visibility: "SHARED",
      createdAt: datetime()
    });

MATCH
  (team:Community {id: "community_goalpost"}),
  (space:WeSpace {id: "space_dev_team"})
CREATE (team)-[:OWNS]->(space);

MATCH (jd:Person {id: "person_jd"}), (space:WeSpace {id: "space_dev_team"})
CREATE (space)-[:HAS_MEMBER]->(jd);

MATCH
  (jesse:Person {id: "person_jesse"}), (space:WeSpace {id: "space_dev_team"})
CREATE (space)-[:HAS_MEMBER]->(jesse);

// Founders WeSpace (Robert + Jennifer)
CREATE
  (foundersWe:Space:WeSpace
    {
      id: "space_founders",
      name: "Founders Strategy Room",
      visibility: "SHARED",
      createdAt: datetime()
    });

MATCH
  (team:Community {id: "community_goalpost"}),
  (space:WeSpace {id: "space_founders"})
CREATE (team)-[:OWNS]->(space);

MATCH
  (robert:Person {id: "person_robert"}), (space:WeSpace {id: "space_founders"})
CREATE (space)-[:HAS_MEMBER]->(robert);

MATCH
  (jennifer:Person {id: "person_jennifer"}),
  (space:WeSpace {id: "space_founders"})
CREATE (space)-[:HAS_MEMBER]->(jennifer);

// Full Team WeSpace (All hands)
CREATE
  (teamWe:Space:WeSpace
    {
      id: "space_full_team",
      name: "GoalPost All Hands",
      visibility: "SHARED",
      createdAt: datetime()
    });

MATCH
  (team:Community {id: "community_goalpost"}),
  (space:WeSpace {id: "space_full_team"})
CREATE (team)-[:OWNS]->(space);

MATCH
  (robert:Person {id: "person_robert"}), (space:WeSpace {id: "space_full_team"})
CREATE (space)-[:HAS_MEMBER]->(robert);

MATCH
  (jennifer:Person {id: "person_jennifer"}),
  (space:WeSpace {id: "space_full_team"})
CREATE (space)-[:HAS_MEMBER]->(jennifer);

MATCH (jd:Person {id: "person_jd"}), (space:WeSpace {id: "space_full_team"})
CREATE (space)-[:HAS_MEMBER]->(jd);

MATCH
  (jesse:Person {id: "person_jesse"}), (space:WeSpace {id: "space_full_team"})
CREATE (space)-[:HAS_MEMBER]->(jesse);

// ============================================================================
// STEP 4: Create FieldContexts - The GoalPost Journey
// ============================================================================

// Robert's MeSpace Contexts
MATCH (space:MeSpace {id: "space_robert_me"})
CREATE
  (ctx1:FieldContext
    {
      id: "ctx_robert_vision",
      title: "Product Vision",
      emergentName: "The North Star",
      createdAt: datetime()
    })
CREATE
  (ctx2:FieldContext
    {
      id: "ctx_robert_timelines",
      title: "Project Timeline",
      emergentName: "The Clock",
      createdAt: datetime()
    })
CREATE
  (ctx3:FieldContext
    {
      id: "ctx_robert_security",
      title: "Privacy & Security",
      emergentName: "The Trust Layer",
      createdAt: datetime()
    })
CREATE (space)-[:HAS_CONTEXT]->(ctx1)
CREATE (space)-[:HAS_CONTEXT]->(ctx2)
CREATE (space)-[:HAS_CONTEXT]->(ctx3);

// Jennifer's MeSpace Contexts
MATCH (space:MeSpace {id: "space_jennifer_me"})
CREATE
  (ctx4:FieldContext
    {
      id: "ctx_jennifer_strategy",
      title: "Strategic Focus",
      emergentName: "What Matters Most",
      createdAt: datetime()
    })
CREATE
  (ctx5:FieldContext
    {
      id: "ctx_jennifer_support",
      title: "Team Support",
      emergentName: "Holding Space",
      createdAt: datetime()
    })
CREATE (space)-[:HAS_CONTEXT]->(ctx4)
CREATE (space)-[:HAS_CONTEXT]->(ctx5);

// JD's MeSpace Contexts
MATCH (space:MeSpace {id: "space_jd_me"})
CREATE
  (ctx6:FieldContext
    {
      id: "ctx_jd_architecture",
      title: "System Architecture",
      emergentName: "The Foundation",
      createdAt: datetime()
    })
CREATE
  (ctx7:FieldContext
    {
      id: "ctx_jd_llm",
      title: "LLM Strategy",
      emergentName: "Choosing The Path",
      createdAt: datetime()
    })
CREATE (space)-[:HAS_CONTEXT]->(ctx6)
CREATE (space)-[:HAS_CONTEXT]->(ctx7);

// Jesse's MeSpace Contexts
MATCH (space:MeSpace {id: "space_jesse_me"})
CREATE
  (ctx8:FieldContext
    {
      id: "ctx_jesse_ux",
      title: "UX & Animation",
      emergentName: "Finding Clarity",
      createdAt: datetime()
    })
CREATE
  (ctx9:FieldContext
    {
      id: "ctx_jesse_design",
      title: "Design System",
      emergentName: "Making It Flow",
      createdAt: datetime()
    })
CREATE (space)-[:HAS_CONTEXT]->(ctx8)
CREATE (space)-[:HAS_CONTEXT]->(ctx9);

// Dev Team WeSpace Contexts
MATCH (space:WeSpace {id: "space_dev_team"})
CREATE
  (ctx10:FieldContext
    {
      id: "ctx_dev_sprint",
      title: "Implementation Sprint",
      emergentName: "Building Together",
      createdAt: datetime()
    })
CREATE (space)-[:HAS_CONTEXT]->(ctx10);

// Founders WeSpace Contexts
MATCH (space:WeSpace {id: "space_founders"})
CREATE
  (ctx11:FieldContext
    {
      id: "ctx_founders_alignment",
      title: "Strategic Alignment",
      emergentName: "Holding The Vision",
      createdAt: datetime()
    })
CREATE (space)-[:HAS_CONTEXT]->(ctx11);

// Full Team WeSpace Contexts
MATCH (space:WeSpace {id: "space_full_team"})
CREATE
  (ctx12:FieldContext
    {
      id: "ctx_team_launch",
      title: "GoalPost Launch",
      emergentName: "The Convergence",
      createdAt: datetime()
    })
CREATE
  (ctx13:FieldContext
    {
      id: "ctx_team_celebration",
      title: "Wins & Milestones",
      emergentName: "What We Built",
      createdAt: datetime()
    })
CREATE (space)-[:HAS_CONTEXT]->(ctx12)
CREATE (space)-[:HAS_CONTEXT]->(ctx13);

// ============================================================================
// STEP 5: Create FieldPulses - The GoalPost Story
// Timeline: The journey from uncertainty to triumph
// ============================================================================

// Robert - Vision & Timeline Concerns
MATCH
  (robert:Person {id: "person_robert"}),
  (ctx:FieldContext {id: "ctx_robert_vision"})
CREATE
  (p1:FieldPulse:GoalPulse
    {
      id: "pulse_robert_1",
      content:
        "Build a tool that truly empowers personal growth through resonance discovery",
      why: "People deserve sovereignty over their own data and insights",
      status: "COMPLETED",
      horizon: "LONG",
      intensity: 0.95,
      createdAt: datetime() - duration('P60D'),
      modifiedAt: datetime() - duration('P1D')
    })
CREATE (ctx)-[:HAS_PULSE]->(p1)
CREATE (p1)-[:INITIATED_BY]->(robert);

MATCH
  (robert:Person {id: "person_robert"}),
  (ctx:FieldContext {id: "ctx_robert_timelines"})
CREATE
  (p2:FieldPulse:StoryPulse
    {
      id: "pulse_robert_2",
      content: "Will we hit our target timeline? The pressure is real",
      why: "So much depends on getting this right and shipping on schedule",
      intensity: 0.8,
      createdAt: datetime() - duration('P30D'),
      modifiedAt: datetime() - duration('P30D')
    })
CREATE
  (p3:FieldPulse:StoryPulse
    {
      id: "pulse_robert_3",
      content: "The team is pulling together - we might actually make it",
      why: "Seeing everyone's dedication gives me confidence",
      intensity: 0.7,
      createdAt: datetime() - duration('P10D'),
      modifiedAt: datetime() - duration('P10D')
    })
CREATE (ctx)-[:HAS_PULSE]->(p2)
CREATE (ctx)-[:HAS_PULSE]->(p3)
CREATE (p2)-[:INITIATED_BY]->(robert)
CREATE (p3)-[:INITIATED_BY]->(robert);

MATCH
  (robert:Person {id: "person_robert"}),
  (ctx:FieldContext {id: "ctx_robert_security"})
CREATE
  (p4:FieldPulse:GoalPulse
    {
      id: "pulse_robert_4",
      content: "Implement enterprise-grade security and privacy controls",
      why:
        "Users must be able to trust us with their most personal reflections",
      status: "COMPLETED",
      horizon: "MID",
      intensity: 0.9,
      createdAt: datetime() - duration('P40D'),
      modifiedAt: datetime() - duration('P5D')
    })
CREATE
  (p5:FieldPulse:StoryPulse
    {
      id: "pulse_robert_5",
      content:
        "Compliance and privacy are non-negotiable - this keeps me up at night",
      why: "One breach would destroy everything we're building",
      intensity: 0.85,
      createdAt: datetime() - duration('P25D'),
      modifiedAt: datetime() - duration('P25D')
    })
CREATE (ctx)-[:HAS_PULSE]->(p4)
CREATE (ctx)-[:HAS_PULSE]->(p5)
CREATE (p4)-[:INITIATED_BY]->(robert)
CREATE (p5)-[:INITIATED_BY]->(robert);

// Jennifer - Strategic Focus & MeSpace Priority
MATCH
  (jennifer:Person {id: "person_jennifer"}),
  (ctx:FieldContext {id: "ctx_jennifer_strategy"})
CREATE
  (p6:FieldPulse:StoryPulse
    {
      id: "pulse_jennifer_1",
      content:
        "The MeSpace alone delivers immense value - maybe that's our MVP",
      why:
        "Personal resonance discovery is transformative even without collaboration",
      intensity: 0.8,
      createdAt: datetime() - duration('P35D'),
      modifiedAt: datetime() - duration('P35D')
    })
CREATE
  (p7:FieldPulse:GoalPulse
    {
      id: "pulse_jennifer_2",
      content: "Prototype should focus on MeSpace if we can't do everything",
      why: "Better to nail one thing than half-deliver on many",
      status: "COMPLETED",
      horizon: "SHORT",
      intensity: 0.75,
      createdAt: datetime() - duration('P32D'),
      modifiedAt: datetime() - duration('P5D')
    })
CREATE (ctx)-[:HAS_PULSE]->(p6)
CREATE (ctx)-[:HAS_PULSE]->(p7)
CREATE (p6)-[:INITIATED_BY]->(jennifer)
CREATE (p7)-[:INITIATED_BY]->(jennifer);

MATCH
  (jennifer:Person {id: "person_jennifer"}),
  (ctx:FieldContext {id: "ctx_jennifer_support"})
CREATE
  (p8:FieldPulse:StoryPulse
    {
      id: "pulse_jennifer_3",
      content: "Everyone is working so hard - need to ensure sustainable pace",
      why: "Burnout would cost us more than any delay",
      intensity: 0.65,
      createdAt: datetime() - duration('P20D'),
      modifiedAt: datetime() - duration('P20D')
    })
CREATE
  (p9:FieldPulse:StoryPulse
    {
      id: "pulse_jennifer_4",
      content: "So proud of what this team has accomplished together",
      why: "The final product exceeded even Robert's vision",
      intensity: 0.9,
      createdAt: datetime() - duration('P2D'),
      modifiedAt: datetime() - duration('P2D')
    })
CREATE (ctx)-[:HAS_PULSE]->(p8)
CREATE (ctx)-[:HAS_PULSE]->(p9)
CREATE (p8)-[:INITIATED_BY]->(jennifer)
CREATE (p9)-[:INITIATED_BY]->(jennifer);

// JD - LLM Strategy & Architecture
MATCH
  (jd:Person {id: "person_jd"}), (ctx:FieldContext {id: "ctx_jd_architecture"})
CREATE
  (p10:FieldPulse:GoalPulse
    {
      id: "pulse_jd_1",
      content:
        "Build Neo4j vector index layer for semantic resonance discovery",
      why:
        "Graph + vectors = perfect substrate for finding meaningful patterns",
      status: "COMPLETED",
      horizon: "MID",
      intensity: 0.9,
      createdAt: datetime() - duration('P50D'),
      modifiedAt: datetime() - duration('P3D')
    })
CREATE
  (p11:FieldPulse:StoryPulse
    {
      id: "pulse_jd_2",
      content: "The architecture is coming together beautifully",
      why: "Graph relationships + embeddings unlock something truly novel",
      intensity: 0.85,
      createdAt: datetime() - duration('P15D'),
      modifiedAt: datetime() - duration('P15D')
    })
CREATE (ctx)-[:HAS_PULSE]->(p10)
CREATE (ctx)-[:HAS_PULSE]->(p11)
CREATE (p10)-[:INITIATED_BY]->(jd)
CREATE (p11)-[:INITIATED_BY]->(jd);

MATCH (jd:Person {id: "person_jd"}), (ctx:FieldContext {id: "ctx_jd_llm"})
CREATE
  (p12:FieldPulse:StoryPulse
    {
      id: "pulse_jd_3",
      content:
        "Open source LLMs vs proprietary - which path serves users best?",
      why: "This choice impacts cost, privacy, and capability",
      intensity: 0.7,
      createdAt: datetime() - duration('P45D'),
      modifiedAt: datetime() - duration('P45D')
    })
CREATE
  (p13:FieldPulse:StoryPulse
    {
      id: "pulse_jd_4",
      content: "OpenAI's API gives us speed and reliability for launch",
      why:
        "We can always add open source options later as the ecosystem matures",
      intensity: 0.65,
      createdAt: datetime() - duration('P38D'),
      modifiedAt: datetime() - duration('P38D')
    })
CREATE
  (p14:FieldPulse:GoalPulse
    {
      id: "pulse_jd_5",
      content: "Implement LangChain + OpenAI for resonance pattern detection",
      why: "Proven tech stack lets us focus on unique value proposition",
      status: "COMPLETED",
      horizon: "SHORT",
      intensity: 0.8,
      createdAt: datetime() - duration('P35D'),
      modifiedAt: datetime() - duration('P4D')
    })
CREATE
  (p15:FieldPulse:StoryPulse
    {
      id: "pulse_jd_6",
      content: "Not worried about timeline - the work is solid and progressing",
      why: "Technical foundation is strong, features are falling into place",
      intensity: 0.6,
      createdAt: datetime() - duration('P28D'),
      modifiedAt: datetime() - duration('P28D')
    })
CREATE (ctx)-[:HAS_PULSE]->(p12)
CREATE (ctx)-[:HAS_PULSE]->(p13)
CREATE (ctx)-[:HAS_PULSE]->(p14)
CREATE (ctx)-[:HAS_PULSE]->(p15)
CREATE (p12)-[:INITIATED_BY]->(jd)
CREATE (p13)-[:INITIATED_BY]->(jd)
CREATE (p14)-[:INITIATED_BY]->(jd)
CREATE (p15)-[:INITIATED_BY]->(jd);

// Jesse - UX/Animation Clarity
MATCH
  (jesse:Person {id: "person_jesse"}), (ctx:FieldContext {id: "ctx_jesse_ux"})
CREATE
  (p16:FieldPulse:StoryPulse
    {
      id: "pulse_jesse_1",
      content:
        "How do we make resonance discovery feel intuitive, not overwhelming?",
      why: "The complexity needs to dissolve into delightful interactions",
      intensity: 0.75,
      createdAt: datetime() - duration('P42D'),
      modifiedAt: datetime() - duration('P42D')
    })
CREATE
  (p17:FieldPulse:GoalPulse
    {
      id: "pulse_jesse_2",
      content:
        "Design animation system that guides users through their insights",
      why: "Motion can show connections that static layouts can't",
      status: "COMPLETED",
      horizon: "MID",
      intensity: 0.85,
      createdAt: datetime() - duration('P40D'),
      modifiedAt: datetime() - duration('P6D')
    })
CREATE
  (p18:FieldPulse:StoryPulse
    {
      id: "pulse_jesse_3",
      content: "Finding the right balance between information and simplicity",
      why: "Each screen needs to feel clear but not empty",
      intensity: 0.7,
      createdAt: datetime() - duration('P22D'),
      modifiedAt: datetime() - duration('P22D')
    })
CREATE
  (p19:FieldPulse:StoryPulse
    {
      id: "pulse_jesse_4",
      content: "The UX is clicking - users will love this flow",
      why: "Tested with early users and saw immediate understanding",
      intensity: 0.9,
      createdAt: datetime() - duration('P8D'),
      modifiedAt: datetime() - duration('P8D')
    })
CREATE (ctx)-[:HAS_PULSE]->(p16)
CREATE (ctx)-[:HAS_PULSE]->(p17)
CREATE (ctx)-[:HAS_PULSE]->(p18)
CREATE (ctx)-[:HAS_PULSE]->(p19)
CREATE (p16)-[:INITIATED_BY]->(jesse)
CREATE (p17)-[:INITIATED_BY]->(jesse)
CREATE (p18)-[:INITIATED_BY]->(jesse)
CREATE (p19)-[:INITIATED_BY]->(jesse);

MATCH
  (jesse:Person {id: "person_jesse"}),
  (ctx:FieldContext {id: "ctx_jesse_design"})
CREATE
  (p20:FieldPulse:GoalPulse
    {
      id: "pulse_jesse_5",
      content: "Create cohesive design language across MeSpace and WeSpace",
      why: "Consistency builds trust and reduces cognitive load",
      status: "COMPLETED",
      horizon: "SHORT",
      intensity: 0.8,
      createdAt: datetime() - duration('P36D'),
      modifiedAt: datetime() - duration('P5D')
    })
CREATE (ctx)-[:HAS_PULSE]->(p20)
CREATE (p20)-[:INITIATED_BY]->(jesse);

// WeSpace - Dev Team Collaboration
MATCH (jd:Person {id: "person_jd"}), (ctx:FieldContext {id: "ctx_dev_sprint"})
CREATE
  (p21:FieldPulse:GoalPulse
    {
      id: "pulse_dev_1",
      content: "Complete resonance discovery backend by end of sprint",
      why: "Jesse needs working API to integrate with frontend",
      status: "COMPLETED",
      horizon: "SHORT",
      intensity: 0.85,
      createdAt: datetime() - duration('P18D'),
      modifiedAt: datetime() - duration('P7D')
    })
CREATE (ctx)-[:HAS_PULSE]->(p21)
CREATE (p21)-[:INITIATED_BY]->(jd);

MATCH
  (jesse:Person {id: "person_jesse"}), (ctx:FieldContext {id: "ctx_dev_sprint"})
CREATE
  (p22:FieldPulse:ResourcePulse
    {
      id: "pulse_dev_2",
      content: "20 hours this week for frontend integration",
      resourceType: "time",
      availability: 0.8,
      intensity: 0.75,
      createdAt: datetime() - duration('P16D'),
      modifiedAt: datetime() - duration('P16D')
    })
CREATE
  (p23:FieldPulse:StoryPulse
    {
      id: "pulse_dev_3",
      content: "JD and I are in flow - handoffs are seamless",
      why: "When communication is this good, work feels effortless",
      intensity: 0.85,
      createdAt: datetime() - duration('P12D'),
      modifiedAt: datetime() - duration('P12D')
    })
CREATE (ctx)-[:HAS_PULSE]->(p22)
CREATE (ctx)-[:HAS_PULSE]->(p23)
CREATE (p22)-[:INITIATED_BY]->(jesse)
CREATE (p23)-[:INITIATED_BY]->(jesse);

// WeSpace - Founders Strategic Alignment
MATCH
  (robert:Person {id: "person_robert"}),
  (ctx:FieldContext {id: "ctx_founders_alignment"})
CREATE
  (p24:FieldPulse:StoryPulse
    {
      id: "pulse_founders_1",
      content: "Jennifer's insight about MeSpace-first is brilliant",
      why: "Focusing our scope paradoxically expands our impact",
      intensity: 0.8,
      createdAt: datetime() - duration('P33D'),
      modifiedAt: datetime() - duration('P33D')
    })
CREATE (ctx)-[:HAS_PULSE]->(p24)
CREATE (p24)-[:INITIATED_BY]->(robert);

MATCH
  (jennifer:Person {id: "person_jennifer"}),
  (ctx:FieldContext {id: "ctx_founders_alignment"})
CREATE
  (p25:FieldPulse:StoryPulse
    {
      id: "pulse_founders_2",
      content: "Robert's security obsession will make this product trusted",
      why: "His attention to privacy details sets us apart",
      intensity: 0.75,
      createdAt: datetime() - duration('P27D'),
      modifiedAt: datetime() - duration('P27D')
    })
CREATE (ctx)-[:HAS_PULSE]->(p25)
CREATE (p25)-[:INITIATED_BY]->(jennifer);

// WeSpace - Team Launch & Celebration
MATCH
  (robert:Person {id: "person_robert"}),
  (ctx:FieldContext {id: "ctx_team_launch"})
CREATE
  (p26:FieldPulse:GoalPulse
    {
      id: "pulse_launch_1",
      content: "Ship GoalPost v1 with complete MeSpace + resonance system",
      why: "Time to share what we've built with the world",
      status: "COMPLETED",
      horizon: "SHORT",
      intensity: 0.95,
      createdAt: datetime() - duration('P55D'),
      modifiedAt: datetime() - duration('P1D')
    })
CREATE (ctx)-[:HAS_PULSE]->(p26)
CREATE (p26)-[:INITIATED_BY]->(robert);

MATCH
  (jd:Person {id: "person_jd"}), (ctx:FieldContext {id: "ctx_team_celebration"})
CREATE
  (p27:FieldPulse:StoryPulse
    {
      id: "pulse_celebrate_1",
      content: "We actually did it - the system works beautifully",
      why: "Seeing resonances emerge from real conversations is magical",
      intensity: 0.9,
      createdAt: datetime() - duration('P2D'),
      modifiedAt: datetime() - duration('P2D')
    })
CREATE (ctx)-[:HAS_PULSE]->(p27)
CREATE (p27)-[:INITIATED_BY]->(jd);

MATCH
  (jesse:Person {id: "person_jesse"}),
  (ctx:FieldContext {id: "ctx_team_celebration"})
CREATE
  (p28:FieldPulse:StoryPulse
    {
      id: "pulse_celebrate_2",
      content:
        "Users are calling the UX 'intuitive and delightful' - mission accomplished",
      why: "All those hours finding clarity in the design were worth it",
      intensity: 0.92,
      createdAt: datetime() - duration('P1D'),
      modifiedAt: datetime() - duration('P1D')
    })
CREATE (ctx)-[:HAS_PULSE]->(p28)
CREATE (p28)-[:INITIATED_BY]->(jesse);

MATCH
  (jennifer:Person {id: "person_jennifer"}),
  (ctx:FieldContext {id: "ctx_team_celebration"})
CREATE
  (p29:FieldPulse:StoryPulse
    {
      id: "pulse_celebrate_3",
      content:
        "This team turned doubt into triumph through trust and collaboration",
      why: "We proved that ambitious vision + focused execution works",
      intensity: 0.93,
      createdAt: datetime() - duration('P1D'),
      modifiedAt: datetime() - duration('P1D')
    })
CREATE (ctx)-[:HAS_PULSE]->(p29)
CREATE (p29)-[:INITIATED_BY]->(jennifer);

// ============================================================================
// STEP 6: Create FieldResonances (AI-discovered patterns)
// These would normally be created by the background worker
// ============================================================================

// Resonance 1: Timeline Anxiety → Confidence
CREATE
  (res1:FieldResonance
    {
      id: "res_timeline_doubt",
      label: "Timeline Anxiety",
      description:
        "Shared uncertainty about meeting deadlines, resolved through steady progress",
      createdAt: datetime() - duration('P3D'),
      detectedBy: "AI"
    });

// Resonance 2: Technical Decision-Making
CREATE
  (res2:FieldResonance
    {
      id: "res_technical_clarity",
      label: "Technical Clarity",
      description:
        "Finding confidence through architectural decisions and pragmatic choices",
      createdAt: datetime() - duration('P3D'),
      detectedBy: "AI"
    });

// Resonance 3: Design Journey to Simplicity
CREATE
  (res3:FieldResonance
    {
      id: "res_ux_clarity",
      label: "UX Clarity",
      description: "Journey from complexity to intuitive simplicity in design",
      createdAt: datetime() - duration('P3D'),
      detectedBy: "AI"
    });

// Resonance 4: Strategic Focus
CREATE
  (res4:FieldResonance
    {
      id: "res_strategic_focus",
      label: "Strategic Focus",
      description: "Wisdom of narrowing scope to deepen impact",
      createdAt: datetime() - duration('P3D'),
      detectedBy: "AI"
    });

// Resonance 5: Collective Triumph
CREATE
  (res5:FieldResonance
    {
      id: "res_triumph",
      label: "Triumph",
      description: "Collective celebration of turning vision into reality",
      createdAt: datetime() - duration('P1D'),
      detectedBy: "AI"
    });

// ============================================================================
// STEP 7: Create ResonanceLinks (Explainable connections)
// ============================================================================

// Timeline anxiety pattern
MATCH
  (p1:FieldPulse {id: "pulse_robert_2"}),
  (p2:FieldPulse {id: "pulse_robert_3"}),
  (res:FieldResonance {id: "res_timeline_doubt"})
CREATE
  (link1:ResonanceLink
    {
      id: "rl_timeline_1",
      confidence: 0.89,
      evidence:
        "Robert's timeline concerns evolve from anxiety to confidence as team execution proves solid",
      createdAt: datetime() - duration('P3D')
    })
CREATE (link1)-[:SOURCE]->(p1)
CREATE (link1)-[:TARGET]->(p2)
CREATE (link1)-[:RESONATES_AS]->(res);

// Technical clarity - LLM decision
MATCH
  (p1:FieldPulse {id: "pulse_jd_3"}),
  (p2:FieldPulse {id: "pulse_jd_4"}),
  (res:FieldResonance {id: "res_technical_clarity"})
CREATE
  (link2:ResonanceLink
    {
      id: "rl_tech_1",
      confidence: 0.87,
      evidence:
        "JD's LLM strategy uncertainty resolves through pragmatic analysis of launch priorities",
      createdAt: datetime() - duration('P3D')
    })
CREATE (link2)-[:SOURCE]->(p1)
CREATE (link2)-[:TARGET]->(p2)
CREATE (link2)-[:RESONATES_AS]->(res);

MATCH
  (p1:FieldPulse {id: "pulse_jd_4"}),
  (p2:FieldPulse {id: "pulse_jd_6"}),
  (res:FieldResonance {id: "res_technical_clarity"})
CREATE
  (link3:ResonanceLink
    {
      id: "rl_tech_2",
      confidence: 0.85,
      evidence:
        "Technical confidence in OpenAI choice leads to reduced timeline anxiety",
      createdAt: datetime() - duration('P3D')
    })
CREATE (link3)-[:SOURCE]->(p1)
CREATE (link3)-[:TARGET]->(p2)
CREATE (link3)-[:RESONATES_AS]->(res);

// UX clarity pattern
MATCH
  (p1:FieldPulse {id: "pulse_jesse_1"}),
  (p2:FieldPulse {id: "pulse_jesse_3"}),
  (res:FieldResonance {id: "res_ux_clarity"})
CREATE
  (link4:ResonanceLink
    {
      id: "rl_ux_1",
      confidence: 0.91,
      evidence:
        "Jesse's journey from 'how do we make this intuitive?' to 'finding the right balance' shows design process",
      createdAt: datetime() - duration('P3D')
    })
CREATE (link4)-[:SOURCE]->(p1)
CREATE (link4)-[:TARGET]->(p2)
CREATE (link4)-[:RESONATES_AS]->(res);

MATCH
  (p1:FieldPulse {id: "pulse_jesse_3"}),
  (p2:FieldPulse {id: "pulse_jesse_4"}),
  (res:FieldResonance {id: "res_ux_clarity"})
CREATE
  (link5:ResonanceLink
    {
      id: "rl_ux_2",
      confidence: 0.93,
      evidence:
        "Design clarity achieved through iteration and user testing - breakthrough moment",
      createdAt: datetime() - duration('P3D')
    })
CREATE (link5)-[:SOURCE]->(p1)
CREATE (link5)-[:TARGET]->(p2)
CREATE (link5)-[:RESONATES_AS]->(res);

// Strategic focus pattern
MATCH
  (p1:FieldPulse {id: "pulse_jennifer_1"}),
  (p2:FieldPulse {id: "pulse_jennifer_2"}),
  (res:FieldResonance {id: "res_strategic_focus"})
CREATE
  (link6:ResonanceLink
    {
      id: "rl_strategy_1",
      confidence: 0.88,
      evidence:
        "Jennifer's insight about MeSpace value leads to strategic scope decision",
      createdAt: datetime() - duration('P3D')
    })
CREATE (link6)-[:SOURCE]->(p1)
CREATE (link6)-[:TARGET]->(p2)
CREATE (link6)-[:RESONATES_AS]->(res);

MATCH
  (p1:FieldPulse {id: "pulse_jennifer_2"}),
  (p2:FieldPulse {id: "pulse_founders_1"}),
  (res:FieldResonance {id: "res_strategic_focus"})
CREATE
  (link7:ResonanceLink
    {
      id: "rl_strategy_2",
      confidence: 0.90,
      evidence:
        "Robert recognizes brilliance of MeSpace-first strategy - founders aligned",
      createdAt: datetime() - duration('P3D')
    })
CREATE (link7)-[:SOURCE]->(p1)
CREATE (link7)-[:TARGET]->(p2)
CREATE (link7)-[:RESONATES_AS]->(res);

// Triumph pattern - celebrating success
MATCH
  (p1:FieldPulse {id: "pulse_celebrate_1"}),
  (p2:FieldPulse {id: "pulse_celebrate_2"}),
  (res:FieldResonance {id: "res_triumph"})
CREATE
  (link8:ResonanceLink
    {
      id: "rl_triumph_1",
      confidence: 0.94,
      evidence:
        "JD and Jesse both celebrating successful execution in their respective domains",
      createdAt: datetime() - duration('P1D')
    })
CREATE (link8)-[:SOURCE]->(p1)
CREATE (link8)-[:TARGET]->(p2)
CREATE (link8)-[:RESONATES_AS]->(res);

MATCH
  (p1:FieldPulse {id: "pulse_celebrate_2"}),
  (p2:FieldPulse {id: "pulse_celebrate_3"}),
  (res:FieldResonance {id: "res_triumph"})
CREATE
  (link9:ResonanceLink
    {
      id: "rl_triumph_2",
      confidence: 0.95,
      evidence:
        "Jesse's UX victory and Jennifer's team reflection unite in celebration of collaborative triumph",
      createdAt: datetime() - duration('P1D')
    })
CREATE (link9)-[:SOURCE]->(p1)
CREATE (link9)-[:TARGET]->(p2)
CREATE (link9)-[:RESONATES_AS]->(res);

MATCH
  (p1:FieldPulse {id: "pulse_jennifer_4"}),
  (p2:FieldPulse {id: "pulse_celebrate_3"}),
  (res:FieldResonance {id: "res_triumph"})
CREATE
  (link10:ResonanceLink
    {
      id: "rl_triumph_3",
      confidence: 0.92,
      evidence:
        "Jennifer's pride pulses showing arc from support to celebration",
      createdAt: datetime() - duration('P1D')
    })
CREATE (link10)-[:SOURCE]->(p1)
CREATE (link10)-[:TARGET]->(p2)
CREATE (link10)-[:RESONATES_AS]->(res);

// ============================================================================
// STEP 8: Create sample ConversationChunks (from chat deepening)
// Demonstrates how conversation is chunked and stored
// ============================================================================

// JD's LLM strategy conversation
MATCH (pulse:FieldPulse {id: "pulse_jd_3"})
CREATE
  (chunk1:ConversationChunk
    {
      id: "chunk_jd_llm_1",
      content: "I'm weighing open source LLMs versus proprietary models",
      role: "user",
      order: 0,
      createdAt: datetime() - duration('P45D')
    })
CREATE
  (chunk2:ConversationChunk
    {
      id: "chunk_jd_llm_2",
      content: "What factors are most important in this decision?",
      role: "assistant",
      order: 1,
      createdAt: datetime() - duration('P45D')
    })
CREATE
  (chunk3:ConversationChunk
    {
      id: "chunk_jd_llm_3",
      content:
        "Cost, privacy, reliability, and speed to launch. Open source gives control but proprietary is proven.",
      role: "user",
      order: 2,
      createdAt: datetime() - duration('P45D')
    })
CREATE
  (chunk4:ConversationChunk
    {
      id: "chunk_jd_llm_4",
      content:
        "For launch, OpenAI's API means we can focus on our unique value - resonance discovery logic.",
      role: "user",
      order: 3,
      createdAt: datetime() - duration('P45D')
    })
CREATE (pulse)-[:HAS_CHUNK]->(chunk1)
CREATE (pulse)-[:HAS_CHUNK]->(chunk2)
CREATE (pulse)-[:HAS_CHUNK]->(chunk3)
CREATE (pulse)-[:HAS_CHUNK]->(chunk4);

// Jesse's UX clarity conversation
MATCH (pulse:FieldPulse {id: "pulse_jesse_1"})
CREATE
  (chunk5:ConversationChunk
    {
      id: "chunk_jesse_ux_1",
      content: "How do we make resonance discovery feel intuitive?",
      role: "user",
      order: 0,
      createdAt: datetime() - duration('P42D')
    })
CREATE
  (chunk6:ConversationChunk
    {
      id: "chunk_jesse_ux_2",
      content: "What feels overwhelming about the current approach?",
      role: "assistant",
      order: 1,
      createdAt: datetime() - duration('P42D')
    })
CREATE
  (chunk7:ConversationChunk
    {
      id: "chunk_jesse_ux_3",
      content:
        "There's so much data - pulses, contexts, resonances. Users might get lost.",
      role: "user",
      order: 2,
      createdAt: datetime() - duration('P42D')
    })
CREATE
  (chunk8:ConversationChunk
    {
      id: "chunk_jesse_ux_4",
      content:
        "I think animation can guide attention. Show connections forming, not all at once.",
      role: "user",
      order: 3,
      createdAt: datetime() - duration('P42D')
    })
CREATE (pulse)-[:HAS_CHUNK]->(chunk5)
CREATE (pulse)-[:HAS_CHUNK]->(chunk6)
CREATE (pulse)-[:HAS_CHUNK]->(chunk7)
CREATE (pulse)-[:HAS_CHUNK]->(chunk8);

// Robert's timeline anxiety conversation
MATCH (pulse:FieldPulse {id: "pulse_robert_2"})
CREATE
  (chunk9:ConversationChunk
    {
      id: "chunk_robert_timeline_1",
      content: "Will we hit our target timeline?",
      role: "user",
      order: 0,
      createdAt: datetime() - duration('P30D')
    })
CREATE
  (chunk10:ConversationChunk
    {
      id: "chunk_robert_timeline_2",
      content: "What's causing the most concern?",
      role: "assistant",
      order: 1,
      createdAt: datetime() - duration('P30D')
    })
CREATE
  (chunk11:ConversationChunk
    {
      id: "chunk_robert_timeline_3",
      content: "So much depends on this launch. The pressure feels intense.",
      role: "user",
      order: 2,
      createdAt: datetime() - duration('P30D')
    })
CREATE
  (chunk12:ConversationChunk
    {
      id: "chunk_robert_timeline_4",
      content: "I worry we've set expectations that we might not meet.",
      role: "user",
      order: 3,
      createdAt: datetime() - duration('P30D')
    })
CREATE (pulse)-[:HAS_CHUNK]->(chunk9)
CREATE (pulse)-[:HAS_CHUNK]->(chunk10)
CREATE (pulse)-[:HAS_CHUNK]->(chunk11)
CREATE (pulse)-[:HAS_CHUNK]->(chunk12);

// ============================================================================
// Summary Statistics
// ============================================================================

MATCH (p:Person)
WITH count(p) AS personCount
MATCH (c:Community)
WITH personCount, count(c) AS communityCount
MATCH (s:Space)
WITH personCount, communityCount, count(s) AS spaceCount
MATCH (ctx:FieldContext)
WITH personCount, communityCount, spaceCount, count(ctx) AS contextCount
MATCH (pulse:FieldPulse)
WITH
  personCount,
  communityCount,
  spaceCount,
  contextCount,
  count(pulse) AS pulseCount
MATCH (res:FieldResonance)
WITH
  personCount,
  communityCount,
  spaceCount,
  contextCount,
  pulseCount,
  count(res) AS resonanceCount
MATCH (link:ResonanceLink)
WITH
  personCount,
  communityCount,
  spaceCount,
  contextCount,
  pulseCount,
  resonanceCount,
  count(link) AS linkCount
MATCH (chunk:ConversationChunk)
RETURN
  personCount AS Persons,
  communityCount AS Communities,
  spaceCount AS Spaces,
  contextCount AS Contexts,
  pulseCount AS Pulses,
  resonanceCount AS Resonances,
  linkCount AS ResonanceLinks,
  count(chunk) AS ConversationChunks;