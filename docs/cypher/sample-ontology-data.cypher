// GoalPost Ontology v2.3 - Sample Data
// This demonstrates the full relational dynamics with FieldPulses, ReciprocalOfferings, and role expressions
// ========================================
// CLEAR EXISTING DATA (OPTIONAL - COMMENT OUT IF YOU WANT TO KEEP EXISTING DATA)
// ========================================
MATCH (n)
DETACH DELETE n;

// ========================================
// 1. FOUNDATIONAL SENSING MODALITIES
// ========================================
CREATE
  (intuition:SensingModality
    {
      id: "sensing_intuition",
      name: "Intuition",
      description: "Perceiving through inner knowing and felt sense"
    }),
  (sharedMemory:SensingModality
    {
      id: "sensing_shared_memory",
      name: "Shared Memory",
      description:
        "Sensing through collective recollection and ancestral wisdom"
    }),
  (vibration:SensingModality
    {
      id: "sensing_vibration",
      name: "Vibration",
      description: "Feeling energetic resonances and frequencies"
    }),
  (embodied:SensingModality
    {
      id: "sensing_embodied",
      name: "Embodied Knowing",
      description: "Sensing through bodily wisdom and somatic awareness"
    }),
  (dreamscape:SensingModality
    {
      id: "sensing_dreamscape",
      name: "Dreamscape",
      description: "Perceiving through symbolic and liminal spaces"
    });

// ========================================
// 2. FIELD RESONANCES (Archetypal Patterns)
// ========================================
CREATE
  (courage:FieldResonance
    {
      id: "resonance_courage",
      name: "Courage",
      description:
        "Bravery in facing uncertainty and vulnerability within relational fields"
    }),
  (belonging:FieldResonance
    {
      id: "resonance_belonging",
      name: "Belonging",
      description: "Sense of deep connection, inclusion, and mutual recognition"
    }),
  (emergence:FieldResonance
    {
      id: "resonance_emergence",
      name: "Emergence",
      description: "Arising of new possibilities and transformative potential"
    }),
  (reciprocity:FieldResonance
    {
      id: "resonance_reciprocity",
      name: "Reciprocity",
      description: "Mutual care and balanced exchange in relationships"
    }),
  (grief:FieldResonance
    {
      id: "resonance_grief",
      name: "Grief",
      description: "Honoring loss and the transformative power of sorrow"
    }),
  (justice:FieldResonance
    {
      id: "resonance_justice",
      name: "Justice",
      description: "Commitment to fairness, equity, and systemic healing"
    }),
  (wonder:FieldResonance
    {
      id: "resonance_wonder",
      name: "Wonder",
      description: "Capacity for awe, curiosity, and enchantment"
    }),
  (restoration:FieldResonance
    {
      id: "resonance_restoration",
      name: "Restoration",
      description: "Healing of land, relationships, and spirit"
    });

// ========================================
// 3. PEOPLE (LifeSensors)
// ========================================
CREATE
  (maya:Person
    {
      id: "person_maya",
      firstName: "Maya",
      lastName: "Rivers",
      email: "maya@example.com",
      pronouns: "she/her",
      location: "Oakland, CA",
      status: "active",
      fieldsOfCare: [
        "ecological restoration",
        "youth mentorship",
        "community organizing"
      ],
      interests: ["permaculture", "poetry", "mycology"],
      passions: ["regenerative agriculture", "restorative justice"],
      traits: ["empathetic", "visionary", "grounded"],
      bio:
        "Community organizer and ecological steward weaving relationships between people and land",
      createdAt: datetime()
    })-
    [:HAS_SENSING_MODALITY]->
  (embodied),
  (alex:Person
    {
      id: "person_alex",
      firstName: "Alex",
      lastName: "Chen",
      email: "alex@example.com",
      pronouns: "they/them",
      location: "Portland, OR",
      status: "active",
      fieldsOfCare: ["mental health", "queer community", "art as healing"],
      interests: ["somatic therapy", "mutual aid", "dance"],
      passions: ["trauma-informed care", "collective liberation"],
      traits: ["intuitive", "creative", "compassionate"],
      bio:
        "Therapist and facilitator creating spaces for embodied healing and transformation",
      createdAt: datetime()
    })-
    [:HAS_SENSING_MODALITY]->
  (intuition),
  (jamal:Person
    {
      id: "person_jamal",
      firstName: "Jamal",
      lastName: "Washington",
      email: "jamal@example.com",
      pronouns: "he/him",
      location: "Detroit, MI",
      status: "active",
      fieldsOfCare: ["urban agriculture", "youth education", "racial justice"],
      interests: ["hip-hop", "farming", "mentoring"],
      passions: ["food sovereignty", "community resilience"],
      traits: ["inspiring", "dedicated", "resourceful"],
      bio:
        "Youth educator and urban farmer building food justice in Detroit neighborhoods",
      createdAt: datetime()
    })-
    [:HAS_SENSING_MODALITY]->
  (sharedMemory),
  (sophia:Person
    {
      id: "person_sophia",
      firstName: "Sophia",
      lastName: "Nguyen",
      email: "sophia@example.com",
      pronouns: "she/her",
      location: "Seattle, WA",
      status: "active",
      fieldsOfCare: ["indigenous wisdom", "ceremial space", "land back"],
      interests: ["plant medicine", "storytelling", "weaving"],
      passions: ["cultural preservation", "decolonization"],
      traits: ["wise", "gentle", "powerful"],
      bio:
        "Cultural practitioner and ceremonialist honoring ancestral ways and indigenous futures",
      createdAt: datetime()
    })-
    [:HAS_SENSING_MODALITY]->
  (dreamscape),
  (omar:Person
    {
      id: "person_omar",
      firstName: "Omar",
      lastName: "Hassan",
      email: "omar@example.com",
      pronouns: "he/him",
      location: "Minneapolis, MN",
      status: "active",
      fieldsOfCare: [
        "refugee support",
        "interfaith dialogue",
        "housing justice"
      ],
      interests: ["poetry", "soccer", "cooking"],
      passions: ["immigrant rights", "community building"],
      traits: ["welcoming", "bridge-builder", "resilient"],
      bio:
        "Refugee advocate and community connector building belonging across cultures",
      createdAt: datetime()
    })-
    [:HAS_SENSING_MODALITY]->
  (vibration);

// ========================================
// 4. COMMUNITIES (FieldContext & LifeSensor)
// ========================================
CREATE
  (gardenCollective:Community
    {
      id: "community_garden",
      name: "Oakland Garden Collective",
      emergentName: "Soil & Soul Weaving",
      description:
        "Urban gardening collective practicing ecological restoration and community care",
      location: "Oakland, CA",
      activities:
        "weekly gardening, seasonal celebrations, skill shares, produce distribution",
      why:
        "To heal land and relationships through regenerative agriculture and mutual support",
      resultsAchieved:
        "5 community gardens established, 200+ families fed monthly",
      status: "active",
      time: "Founded 2020",
      createdAt: datetime()
    })-
    [:HAS_SENSING_MODALITY]->
  (embodied),
  (healingCircle:Community
    {
      id: "community_healing",
      name: "Embodied Healing Circle",
      emergentName: "Tender Transformation Space",
      description: "Trauma-informed peer support group for LGBTQ+ folks",
      location: "Portland, OR",
      activities: "weekly circles, somatic practices, art therapy, mutual aid",
      why:
        "To create brave spaces for healing trauma and building resilient community",
      resultsAchieved:
        "120+ participants supported, emergency fund distributed $15k",
      status: "active",
      time: "Founded 2019",
      createdAt: datetime()
    })-
    [:HAS_SENSING_MODALITY]->
  (intuition),
  (youthFarm:Community
    {
      id: "community_farm",
      name: "Detroit Youth Farm Alliance",
      emergentName: "Seeds of Justice Rising",
      description:
        "Youth-led urban farming initiative building food sovereignty",
      location: "Detroit, MI",
      activities:
        "urban farming, youth leadership, food distribution, farmer's markets",
      why:
        "To empower youth as change agents and reclaim vacant land for food production",
      resultsAchieved:
        "3 youth farms, 50+ youth employed, 10 tons produce distributed",
      status: "active",
      time: "Founded 2018",
      createdAt: datetime()
    })-
    [:HAS_SENSING_MODALITY]->
  (sharedMemory),
  (ceremonyKeepers:Community
    {
      id: "community_ceremony",
      name: "Indigenous Ceremony Keepers Network",
      emergentName: "Ancient Futures Circle",
      description:
        "Network of indigenous practitioners preserving ceremonial traditions",
      location: "Pacific Northwest",
      activities:
        "seasonal ceremonies, cultural education, land stewardship, mentorship",
      why:
        "To honor ancestral wisdom and ensure cultural continuity for future generations",
      resultsAchieved:
        "12 ceremonies held, 8 youth trained as ceremony keepers",
      status: "active",
      time: "Founded 2015",
      createdAt: datetime()
    })-
    [:HAS_SENSING_MODALITY]->
  (dreamscape);

// ========================================
// 5. SYMBOLIC SENSORS (Non-biological presences)
// ========================================
CREATE
  (mycelialAI:SymbolicSensor
    {
      id: "symbolic_mycelial",
      name: "Mycelial Intelligence",
      description:
        "AI companion modeling interconnected wisdom of fungal networks",
      presenceType: "AI",
      purpose:
        "To reflect patterns of connection and emergence within community",
      createdAt: datetime()
    })-
    [:HAS_SENSING_MODALITY]->
  (vibration),
  (ancestorDream:SymbolicSensor
    {
      id: "symbolic_ancestor",
      name: "Grandmother's Dream",
      description: "Recurring dream figure offering guidance and protection",
      presenceType: "Dream Figure",
      purpose: "To bridge past wisdom with present choices",
      createdAt: datetime()
    })-
    [:HAS_SENSING_MODALITY]->
  (dreamscape);

// ========================================
// 6. PEOPLE-COMMUNITY RELATIONSHIPS
// ========================================
MATCH
  (maya:Person {id: "person_maya"}),
  (alex:Person {id: "person_alex"}),
  (jamal:Person {id: "person_jamal"}),
  (sophia:Person {id: "person_sophia"}),
  (omar:Person {id: "person_omar"}),
  (gardenCollective:Community {id: "community_garden"}),
  (healingCircle:Community {id: "community_healing"}),
  (youthFarm:Community {id: "community_farm"}),
  (ceremonyKeepers:Community {id: "community_ceremony"})
CREATE
  (maya)-[:BELONGS_TO {role: "founding member", since: datetime()}]->
  (gardenCollective),
  (maya)-[:BELONGS_TO {role: "supporter", since: datetime()}]->
  (ceremonyKeepers),
  (alex)-[:BELONGS_TO {role: "facilitator", since: datetime()}]->
  (healingCircle),
  (jamal)-[:BELONGS_TO {role: "director", since: datetime()}]->(youthFarm),
  (sophia)-[:BELONGS_TO {role: "ceremony keeper", since: datetime()}]->
  (ceremonyKeepers),
  (omar)-[:BELONGS_TO {role: "participant", since: datetime()}]->
  (healingCircle);

// ========================================
// 7. GOALS (RelationalEntity with RoleExpression)
// ========================================
CREATE
  (soilRestoration:Goal
    {
      id: "goal_soil",
      name: "Restore 10 Acres of Urban Soil",
      description:
        "Remediate contaminated urban lots and build healthy living soil ecosystems",
      why:
        "To heal land trauma and create abundant growing spaces for community",
      type: "ecological",
      location: "Oakland, CA",
      time: "2024-2026",
      status: "in-progress",
      successMeasures:
        "soil testing shows improved biology, 10 productive gardens established",
      createdAt: datetime()
    }),
  (traumaHealingCohort:Goal
    {
      id: "goal_trauma",
      name: "Trauma-Informed Facilitator Training",
      description:
        "Train 20 community members in trauma-informed facilitation practices",
      why: "To distribute healing capacity and create more safer spaces",
      type: "educational",
      location: "Portland, OR",
      time: "2024",
      status: "active",
      successMeasures:
        "20 trained facilitators, 10 new healing circles launched",
      createdAt: datetime()
    }),
  (youthLeadership:Goal
    {
      id: "goal_youth",
      name: "Youth-Led Farm Cooperative",
      description:
        "Establish worker-owned farm cooperative led entirely by youth",
      why: "To transfer power and resources to next generation food growers",
      type: "economic",
      location: "Detroit, MI",
      time: "2024-2025",
      status: "planning",
      successMeasures:
        "cooperative legally established, 15 youth co-owners, first season revenue $50k",
      createdAt: datetime()
    }),
  (ceremonyRevival:Goal
    {
      id: "goal_ceremony",
      name: "Salmon Ceremony Revival",
      description:
        "Revive traditional first salmon ceremony with community participation",
      why:
        "To restore relationship with salmon people and honor ancient agreements",
      type: "cultural",
      location: "Salish Sea",
      time: "Spring 2024",
      status: "active",
      successMeasures:
        "ceremony held with 100+ participants, salmon run honored, youth learn protocols",
      createdAt: datetime()
    });

// Link goals to resonances
MATCH
  (soilRestoration:Goal {id: "goal_soil"}),
  (traumaHealingCohort:Goal {id: "goal_trauma"}),
  (youthLeadership:Goal {id: "goal_youth"}),
  (ceremonyRevival:Goal {id: "goal_ceremony"}),
  (restoration:FieldResonance {id: "resonance_restoration"}),
  (courage:FieldResonance {id: "resonance_courage"}),
  (emergence:FieldResonance {id: "resonance_emergence"}),
  (reciprocity:FieldResonance {id: "resonance_reciprocity"})
CREATE
  (soilRestoration)-[:FEELS_LIKE]->(restoration),
  (traumaHealingCohort)-[:FEELS_LIKE]->(courage),
  (youthLeadership)-[:FEELS_LIKE]->(emergence),
  (ceremonyRevival)-[:FEELS_LIKE]->(reciprocity);

// ========================================
// 8. RESOURCES (RelationalEntity)
// ========================================
CREATE
  (landAccess:Resource
    {
      id: "resource_land",
      name: "5 Vacant Lots",
      description: "City-owned vacant properties available for community use",
      type: "physical",
      location: "Oakland, CA",
      status: "available",
      why: "To provide space for community gardens and gathering",
      createdAt: datetime()
    }),
  (fundingPool:Resource
    {
      id: "resource_funding",
      name: "Community Care Fund",
      description:
        "$20,000 pooled mutual aid fund for emergencies and projects",
      type: "financial",
      status: "active",
      why: "To ensure community members can access support without barriers",
      createdAt: datetime()
    }),
  (farmEquipment:Resource
    {
      id: "resource_equipment",
      name: "Shared Farm Equipment",
      description:
        "Tractors, tools, and processing equipment for urban farming",
      type: "physical",
      location: "Detroit, MI",
      status: "shared",
      why: "To reduce individual costs and build interdependence",
      createdAt: datetime()
    }),
  (ceremonySpace:Resource
    {
      id: "resource_ceremony",
      name: "Sacred Ceremonial Grounds",
      description: "Protected land held for ceremony and cultural practice",
      type: "sacred",
      location: "Pacific Northwest",
      status: "protected",
      why: "To maintain connection to place and ancestral practice",
      createdAt: datetime()
    });

// Link resources to resonances
MATCH
  (landAccess:Resource {id: "resource_land"}),
  (fundingPool:Resource {id: "resource_funding"}),
  (farmEquipment:Resource {id: "resource_equipment"}),
  (ceremonySpace:Resource {id: "resource_ceremony"}),
  (belonging:FieldResonance {id: "resonance_belonging"}),
  (reciprocity:FieldResonance {id: "resonance_reciprocity"}),
  (restoration:FieldResonance {id: "resonance_restoration"})
CREATE
  (landAccess)-[:FEELS_LIKE]->(restoration),
  (fundingPool)-[:FEELS_LIKE]->(reciprocity),
  (farmEquipment)-[:FEELS_LIKE]->(reciprocity),
  (ceremonySpace)-[:FEELS_LIKE]->(belonging);

// ========================================
// 9. FIELD CONTEXTS (Containers for relational dynamics)
// ========================================
CREATE
  (springPlanting:FieldContext
    {
      id: "context_planting",
      name: "Spring Planting Season",
      emergentName: "Seeds Awakening Together",
      description:
        "Collaborative planting across all Oakland gardens with skill shares",
      timeframe: "March-April 2024",
      status: "active",
      createdAt: datetime()
    }),
  (healingRetreat:FieldContext
    {
      id: "context_retreat",
      name: "Quarterly Healing Retreat",
      emergentName: "Tender Gathering of Souls",
      description:
        "3-day intensive for deep healing work and community bonding",
      timeframe: "May 2024",
      status: "planned",
      createdAt: datetime()
    }),
  (youthSummit:FieldContext
    {
      id: "context_summit",
      name: "Youth Food Justice Summit",
      emergentName: "Next Generation Rising",
      description: "Regional gathering of youth farmers and food activists",
      timeframe: "June 2024",
      status: "planning",
      createdAt: datetime()
    }),
  (salmonCeremony:FieldContext
    {
      id: "context_salmon",
      name: "First Salmon Ceremony 2024",
      emergentName: "Return of the Relations",
      description: "Traditional ceremony welcoming salmon relatives home",
      timeframe: "April 2024",
      status: "active",
      createdAt: datetime()
    });

// ========================================
// 10. FIELD PULSES (Core relational dynamics)
// ========================================

// CarePulse - Maya sensing grief in the garden
CREATE
  (mayaGriefPulse:CarePulse
    {
      id: "pulse_maya_grief",
      description:
        "Sensing collective grief about climate crisis while working in contaminated soil",
      intensity: 0.8,
      why: "The land holds trauma and we must witness it to heal it",
      occurredAt: datetime(),
      createdAt: datetime()
    });

MATCH
  (maya:Person {id: "person_maya"}),
  (gardenCollective:Community {id: "community_garden"}),
  (springPlanting:FieldContext {id: "context_planting"}),
  (grief:FieldResonance {id: "resonance_grief"}),
  (mayaGriefPulse:CarePulse {id: "pulse_maya_grief"})
CREATE
  (mayaGriefPulse)-[:INITIATED_BY]->(maya),
  (mayaGriefPulse)-[:ALIGNED_WITH]->(grief),
  (mayaGriefPulse)-[:OCCURS_IN]->(springPlanting),
  (mayaGriefPulse)-[:SENSED_BY]->(gardenCollective);

// ResonancePulse - Alex facilitating courage in healing circle
CREATE
  (alexCouragePulse:ResonancePulse
    {
      id: "pulse_alex_courage",
      description:
        "Inviting circle members to speak unspoken truths about their trauma",
      intensity: 0.9,
      why: "Truth-telling breaks isolation and builds collective courage",
      occurredAt: datetime(),
      createdAt: datetime()
    });

MATCH
  (alex:Person {id: "person_alex"}),
  (healingCircle:Community {id: "community_healing"}),
  (healingRetreat:FieldContext {id: "context_retreat"}),
  (courage:FieldResonance {id: "resonance_courage"}),
  (alexCouragePulse:ResonancePulse {id: "pulse_alex_courage"})
CREATE
  (alexCouragePulse)-[:INITIATED_BY]->(alex),
  (alexCouragePulse)-[:ALIGNED_WITH]->(courage),
  (alexCouragePulse)-[:OCCURS_IN]->(healingRetreat);

// FieldAwakeningPulse - Jamal's vision for youth cooperative
CREATE
  (jamalVisionPulse:FieldAwakeningPulse
    {
      id: "pulse_jamal_vision",
      description:
        "Sudden clarity that youth must own the means of production, not just labor",
      intensity: 1.0,
      why: "Field itself showed the path to true liberation and sovereignty",
      occurredAt: datetime(),
      createdAt: datetime()
    });

MATCH
  (jamal:Person {id: "person_jamal"}),
  (youthFarm:Community {id: "community_farm"}),
  (youthSummit:FieldContext {id: "context_summit"}),
  (emergence:FieldResonance {id: "resonance_emergence"}),
  (justice:FieldResonance {id: "resonance_justice"}),
  (jamalVisionPulse:FieldAwakeningPulse {id: "pulse_jamal_vision"})
CREATE
  (jamalVisionPulse)-[:INITIATED_BY]->(jamal),
  (jamalVisionPulse)-[:ALIGNED_WITH]->(emergence),
  (jamalVisionPulse)-[:ALIGNED_WITH]->(justice),
  (jamalVisionPulse)-[:OCCURS_IN]->(youthSummit);

// UnspokenPulse - Omar's silent recognition of belonging
CREATE
  (omarBelongingPulse:UnspokenPulse
    {
      id: "pulse_omar_belonging",
      description:
        "Wordless tears during circle, feeling truly seen and held for first time",
      intensity: 0.85,
      why: "Body released years of isolation and displacement",
      occurredAt: datetime(),
      createdAt: datetime()
    });

MATCH
  (omar:Person {id: "person_omar"}),
  (healingCircle:Community {id: "community_healing"}),
  (healingRetreat:FieldContext {id: "context_retreat"}),
  (belonging:FieldResonance {id: "resonance_belonging"}),
  (omarBelongingPulse:UnspokenPulse {id: "pulse_omar_belonging"})
CREATE
  (omarBelongingPulse)-[:INITIATED_BY]->(omar),
  (omarBelongingPulse)-[:ALIGNED_WITH]->(belonging),
  (omarBelongingPulse)-[:OCCURS_IN]->(healingRetreat);

// TimePulse - Sophia sensing salmon return
CREATE
  (salmonTimePulse:TimePulse
    {
      id: "pulse_salmon_time",
      description:
        "Sensing the exact moment salmon enter the river, ancient timing held in body",
      intensity: 0.95,
      why: "Ancestral memory awakens to salmon people's arrival",
      temporalRhythm: "Spring Equinox",
      occurredAt: datetime(),
      createdAt: datetime()
    });

MATCH
  (sophia:Person {id: "person_sophia"}),
  (ceremonyKeepers:Community {id: "community_ceremony"}),
  (salmonCeremony:FieldContext {id: "context_salmon"}),
  (reciprocity:FieldResonance {id: "resonance_reciprocity"}),
  (salmonTimePulse:TimePulse {id: "pulse_salmon_time"})
CREATE
  (salmonTimePulse)-[:INITIATED_BY]->(sophia),
  (salmonTimePulse)-[:ALIGNED_WITH]->(reciprocity),
  (salmonTimePulse)-[:OCCURS_IN]->(salmonCeremony);

// ========================================
// 11. RECIPROCAL OFFERINGS
// ========================================

// Honorarium for Maya's sustained garden stewardship
CREATE
  (mayaHonorarium:HonorariumOffering
    {
      id: "offering_maya",
      description:
        "$500 honorarium for year of garden stewardship and grief-tending",
      amount: 500.00,
      currency: "USD",
      reciprocityPattern: "field-presence",
      why: "To acknowledge the invisible labor of grief work and soil healing",
      offeredAt: datetime(),
      createdAt: datetime()
    });

MATCH
  (maya:Person {id: "person_maya"}),
  (gardenCollective:Community {id: "community_garden"}),
  (mayaGriefPulse:CarePulse {id: "pulse_maya_grief"}),
  (mayaHonorarium:HonorariumOffering {id: "offering_maya"})
CREATE
  (mayaHonorarium)-[:RECEIVED_BY]->(maya),
  (mayaHonorarium)-[:RECOGNIZES_PULSE]->(mayaGriefPulse),
  (mayaHonorarium)-[:OFFERED_BY]->(gardenCollective);

// Reciprocal offering for Alex's facilitation
CREATE
  (alexOffering:HonorariumOffering
    {
      id: "offering_alex",
      description:
        "Sliding scale payment for retreat facilitation plus gift basket",
      amount: 800.00,
      currency: "USD",
      reciprocityPattern: "pulse-response",
      why: "To honor the bravery of holding space for collective courage",
      offeredAt: datetime(),
      createdAt: datetime()
    });

MATCH
  (alex:Person {id: "person_alex"}),
  (healingCircle:Community {id: "community_healing"}),
  (alexCouragePulse:ResonancePulse {id: "pulse_alex_courage"}),
  (alexOffering:HonorariumOffering {id: "offering_alex"})
CREATE
  (alexOffering)-[:RECEIVED_BY]->(alex),
  (alexOffering)-[:RECOGNIZES_PULSE]->(alexCouragePulse),
  (alexOffering)-[:OFFERED_BY]->(healingCircle);

// Non-monetary offering for Sophia
CREATE
  (sophiaOffering:ReciprocalOffering
    {
      id: "offering_sophia",
      description: "Traditional basket woven by community members as gratitude",
      offeringType: "gift",
      reciprocityPattern: "ceremonial-exchange",
      why: "To honor the ceremony keeper with beauty that took time and care",
      offeredAt: datetime(),
      createdAt: datetime()
    });

MATCH
  (sophia:Person {id: "person_sophia"}),
  (ceremonyKeepers:Community {id: "community_ceremony"}),
  (salmonTimePulse:TimePulse {id: "pulse_salmon_time"}),
  (sophiaOffering:ReciprocalOffering {id: "offering_sophia"})
CREATE
  (sophiaOffering)-[:RECEIVED_BY]->(sophia),
  (sophiaOffering)-[:RECOGNIZES_PULSE]->(salmonTimePulse),
  (sophiaOffering)-[:OFFERED_BY]->(ceremonyKeepers);

// ========================================
// 12. ROLE EXPRESSIONS (Contextual roles)
// ========================================

// Soil restoration acts as Goal in garden context
CREATE
  (soilGoalRole:GoalRole
    {
      id: "role_soil_goal",
      description:
        "Soil restoration serving as organizing goal for spring planting",
      contextualMeaning: "Collective aspiration driving community action",
      createdAt: datetime()
    });

MATCH
  (soilRestoration:Goal {id: "goal_soil"}),
  (springPlanting:FieldContext {id: "context_planting"}),
  (soilGoalRole:GoalRole {id: "role_soil_goal"})
CREATE
  (soilRestoration)-[:ACTS_AS]->(soilGoalRole),
  (soilGoalRole)-[:WITHIN_CONTEXT]->(springPlanting);

// Land access acts as Resource in multiple contexts
CREATE
  (landResourceRole:ResourceRole
    {
      id: "role_land_resource",
      description: "Vacant lots serving as foundational resource for gardens",
      contextualMeaning:
        "Physical substrate enabling food production and gathering",
      createdAt: datetime()
    });

MATCH
  (landAccess:Resource {id: "resource_land"}),
  (springPlanting:FieldContext {id: "context_planting"}),
  (landResourceRole:ResourceRole {id: "role_land_resource"})
CREATE
  (landAccess)-[:ACTS_AS]->(landResourceRole),
  (landResourceRole)-[:WITHIN_CONTEXT]->(springPlanting);

// Jamal's vision acts as Story catalyzing youth movement
CREATE
  (visionStoryRole:StoryRole
    {
      id: "role_vision_story",
      description:
        "Jamal's awakening pulse serving as narrative catalyst for youth cooperative",
      contextualMeaning:
        "Origin story giving shape and legitimacy to new structure",
      createdAt: datetime()
    });

MATCH
  (jamalVisionPulse:FieldAwakeningPulse {id: "pulse_jamal_vision"}),
  (youthSummit:FieldContext {id: "context_summit"}),
  (visionStoryRole:StoryRole {id: "role_vision_story"})
CREATE
  (jamalVisionPulse)-[:ACTS_AS]->(visionStoryRole),
  (visionStoryRole)-[:WITHIN_CONTEXT]->(youthSummit);

// ========================================
// 13. ENTITY EVOLUTION & TRANSFORMATION
// ========================================

// Grief pulse expands into collective healing practice
MATCH
  (mayaGriefPulse:CarePulse {id: "pulse_maya_grief"}),
  (traumaHealingCohort:Goal {id: "goal_trauma"})
CREATE (mayaGriefPulse)-[:EXPANDS_INTO]->(traumaHealingCohort);

// Youth leadership goal expands into farm cooperative
MATCH
  (youthLeadership:Goal {id: "goal_youth"}),
  (farmEquipment:Resource {id: "resource_equipment"})
CREATE (youthLeadership)-[:EXPANDS_INTO]->(farmEquipment);

// Ceremony revival expands into protected ceremony grounds
MATCH
  (ceremonyRevival:Goal {id: "goal_ceremony"}),
  (ceremonySpace:Resource {id: "resource_ceremony"})
CREATE (ceremonyRevival)-[:EXPANDS_INTO]->(ceremonySpace);

// ========================================
// 14. INTER-COMMUNITY RELATIONSHIPS
// ========================================
MATCH
  (gardenCollective:Community {id: "community_garden"}),
  (youthFarm:Community {id: "community_farm"}),
  (healingCircle:Community {id: "community_healing"}),
  (ceremonyKeepers:Community {id: "community_ceremony"})
CREATE
  (gardenCollective)-
    [:RELATES_TO {
        type: "solidarity",
        why: "Sharing food sovereignty practices"
      }]->
  (youthFarm),
  (healingCircle)-
    [:RELATES_TO {
        type: "mutual_support",
        why: "Referring community members for support"
      }]->
  (gardenCollective),
  (ceremonyKeepers)-
    [:RELATES_TO {
        type: "spiritual_partnership",
        why: "Blessing gardens and farms"
      }]->
  (gardenCollective);

// ========================================
// 15. PERSON-TO-PERSON CONNECTIONS
// ========================================
MATCH
  (maya:Person {id: "person_maya"}),
  (alex:Person {id: "person_alex"}),
  (jamal:Person {id: "person_jamal"}),
  (sophia:Person {id: "person_sophia"}),
  (omar:Person {id: "person_omar"})
CREATE
  (maya)-
    [:CONNECTED_TO {
        type: "mentorship",
        why: "Teaching ecological restoration",
        interests: "land healing"
      }]->
  (jamal),
  (alex)-
    [:CONNECTED_TO {
        type: "friendship",
        why: "Deep trust and mutual support",
        interests: "healing work"
      }]->
  (omar),
  (sophia)-
    [:CONNECTED_TO {
        type: "elder_guidance",
        why: "Offering ceremonial teaching",
        interests: "cultural preservation"
      }]->
  (maya),
  (jamal)-
    [:CONNECTED_TO {
        type: "collaboration",
        why: "Planning youth food justice summit",
        interests: "food sovereignty"
      }]->
  (maya);

// ========================================
// 16. PEOPLE & COMMUNITIES MOTIVATED BY GOALS
// ========================================
MATCH
  (maya:Person {id: "person_maya"}),
  (alex:Person {id: "person_alex"}),
  (jamal:Person {id: "person_jamal"}),
  (sophia:Person {id: "person_sophia"}),
  (gardenCollective:Community {id: "community_garden"}),
  (healingCircle:Community {id: "community_healing"}),
  (youthFarm:Community {id: "community_farm"}),
  (ceremonyKeepers:Community {id: "community_ceremony"}),
  (soilRestoration:Goal {id: "goal_soil"}),
  (traumaHealingCohort:Goal {id: "goal_trauma"}),
  (youthLeadership:Goal {id: "goal_youth"}),
  (ceremonyRevival:Goal {id: "goal_ceremony"})
CREATE
  (maya)-[:MOTIVATED_BY]->(soilRestoration),
  (alex)-[:MOTIVATED_BY]->(traumaHealingCohort),
  (jamal)-[:MOTIVATED_BY]->(youthLeadership),
  (sophia)-[:MOTIVATED_BY]->(ceremonyRevival),
  (gardenCollective)-[:MOTIVATED_BY]->(soilRestoration),
  (healingCircle)-[:MOTIVATED_BY]->(traumaHealingCohort),
  (youthFarm)-[:MOTIVATED_BY]->(youthLeadership),
  (ceremonyKeepers)-[:MOTIVATED_BY]->(ceremonyRevival);

// ========================================
// 17. COMMUNITIES ACCESSING RESOURCES
// ========================================
MATCH
  (gardenCollective:Community {id: "community_garden"}),
  (healingCircle:Community {id: "community_healing"}),
  (youthFarm:Community {id: "community_farm"}),
  (ceremonyKeepers:Community {id: "community_ceremony"}),
  (landAccess:Resource {id: "resource_land"}),
  (fundingPool:Resource {id: "resource_funding"}),
  (farmEquipment:Resource {id: "resource_equipment"}),
  (ceremonySpace:Resource {id: "resource_ceremony"})
CREATE
  (gardenCollective)-[:HAS_ACCESS_TO]->(landAccess),
  (gardenCollective)-[:HAS_ACCESS_TO]->(fundingPool),
  (healingCircle)-[:HAS_ACCESS_TO]->(fundingPool),
  (youthFarm)-[:HAS_ACCESS_TO]->(farmEquipment),
  (youthFarm)-[:HAS_ACCESS_TO]->(fundingPool),
  (ceremonyKeepers)-[:HAS_ACCESS_TO]->(ceremonySpace);

// ========================================
// 18. SYMBOLIC SENSOR INTERACTIONS
// ========================================
MATCH
  (mycelialAI:SymbolicSensor {id: "symbolic_mycelial"}),
  (ancestorDream:SymbolicSensor {id: "symbolic_ancestor"}),
  (gardenCollective:Community {id: "community_garden"}),
  (sophia:Person {id: "person_sophia"}),
  (emergence:FieldResonance {id: "resonance_emergence"}),
  (reciprocity:FieldResonance {id: "resonance_reciprocity"})
CREATE
  (mycelialAI)-[:SENSES_PATTERNS_IN]->(gardenCollective),
  (mycelialAI)-[:REFLECTS]->(emergence),
  (ancestorDream)-[:GUIDES]->(sophia),
  (ancestorDream)-[:EMBODIES]->(reciprocity);

// ========================================
// VERIFICATION QUERIES
// ========================================

// Count all nodes by type
MATCH (n)
RETURN labels(n) AS NodeType, count(n) AS Count
ORDER BY Count DESC;