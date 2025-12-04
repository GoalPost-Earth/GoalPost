// Clear database
MATCH (n)
DETACH DELETE n;

// Create some SensingModality nodes for ontology alignment
MERGE
  (modality1:SensingModality
    {
      id: "intuition",
      name: "Intuition",
      description: "Perceiving through inner knowing"
    })
MERGE
  (modality2:SensingModality
    {
      id: "shared_memory",
      name: "Shared Memory",
      description: "Sensing through collective recollection"
    })
MERGE
  (modality3:SensingModality
    {
      id: "vibration",
      name: "Vibration",
      description: "Feeling energetic resonances"
    });

// Create some FieldResonance nodes (formerly CoreValues, but as resonances)
MERGE
  (resonance1:FieldResonance
    {
      id: "courage",
      name: "Courage",
      description: "Bravery in relational fields"
    })
MERGE
  (resonance2:FieldResonance
    {
      id: "belonging",
      name: "Belonging",
      description: "Sense of connection and inclusion"
    })
MERGE
  (resonance3:FieldResonance
    {
      id: "emergence",
      name: "Emergence",
      description: "Arising of new possibilities"
    });

// Import Communities (now implement LifeSensor)
LOAD CSV WITH HEADERS FROM "https://docs.google.com/spreadsheets/d/e/2PACX-1vTPDykek0DB89FZZciwPVautpd3VVlS3paHF3H6Bcp6bd1BMbCNWzA8NLx5gZ-7-d9GiGDjdQEOxafG/pub?gid=879515464&single=true&output=csv" AS row

MERGE (community:Community {id: row.id})
SET
  community.resultsAchieved = row.resultsAchieved,
  community.time = row.time,
  community.status = row.status,
  community.location = row.location,
  community.description = row.description,
  community.name = row.name,
  community.caresFor = row.caresFor,
  community.activities = row.activities,
  community.why = row.why,
  community.createdAt = datetime(),
  community.emergentName = row.name + " Emergence" // Ontology property
WITH community
// Assign random sensing modality
CALL {
  WITH community
  MATCH (modality:SensingModality)
  WITH modality, rand() AS r
  ORDER BY r
  LIMIT 1
  MERGE (community)-[:HAS_SENSING_MODALITY]->(modality)
}
WITH community
// Add feelsLike resonances
CALL {
  WITH community
  MATCH (resonance:FieldResonance)
  WITH resonance, rand() AS r
  ORDER BY r
  LIMIT 1
  MERGE (community)-[:FEELS_LIKE]->(resonance)
}

RETURN community;

// Load Members (as Person implementing LifeSensor)
LOAD CSV WITH HEADERS FROM "https://docs.google.com/spreadsheets/d/e/2PACX-1vTPDykek0DB89FZZciwPVautpd3VVlS3paHF3H6Bcp6bd1BMbCNWzA8NLx5gZ-7-d9GiGDjdQEOxafG/pub?gid=270681936&single=true&output=csv" AS row

MERGE (member:Person {id: row.id})
SET
  member.lastName = row.lastName,
  member.pronouns = row.pronouns,
  member.status = row.status,
  member.interests = row.interests,
  member.passions = row.passions,
  member.location = row.location,
  member.favorites = row.favourites,
  member.avatar = row.avatar,
  member.photo = row.photo,
  member.fieldsOfCare = row.fieldsOfCare,
  member.careManual = row.manual,
  member.signupDate = datetime(row.signupDate),
  member.phoneNumber = row.phoneNumber,
  member.email = row.email,
  member.gender = row.gender,
  member.traits = row.traits,
  member.firstName = row.firstName,
  member.createdAt = datetime()
WITH member, row
MATCH (community:Community {id: row.communityId})
MERGE
  (member)-
    [:BELONGS_TO {
        totem: "Community Member",
        signupDate: datetime(row.signupDate)
      }]->
  (community)
WITH member
// Assign random sensing modality
CALL {
  WITH member
  MATCH (modality:SensingModality)
  WITH modality, rand() AS r
  ORDER BY r
  LIMIT 1
  MERGE (member)-[:HAS_SENSING_MODALITY]->(modality)
}
WITH member
// Add feelsLike resonances
CALL {
  WITH member
  MATCH (resonance:FieldResonance)
  WITH resonance, rand() AS r
  ORDER BY r
  LIMIT 1
  MERGE (member)-[:FEELS_LIKE]->(resonance)
}
RETURN member;

// LOAD People (additional Persons)
LOAD CSV WITH HEADERS FROM "https://docs.google.com/spreadsheets/d/e/2PACX-1vTPDykek0DB89FZZciwPVautpd3VVlS3paHF3H6Bcp6bd1BMbCNWzA8NLx5gZ-7-d9GiGDjdQEOxafG/pub?gid=824956865&single=true&output=csv" AS row

MERGE (member:Person {id: row.id})
SET
  member.lastName = row.lastName,
  member.pronouns = row.pronouns,
  member.status = row.status,
  member.interests = row.interests,
  member.passions = row.passions,
  member.location = row.location,
  member.favorites = row.favourites,
  member.avatar = row.avatar,
  member.photo = row.photo,
  member.fieldsOfCare = row.fieldsOfCare,
  member.careManual = row.manual,
  member.signupDate = datetime(row.signupDate),
  member.phoneNumber = row.phoneNumber,
  member.email = row.email,
  member.gender = row.gender,
  member.traits = row.traits,
  member.firstName = row.firstName,
  member.createdAt = datetime()
WITH member
// Assign random sensing modality
CALL {
  WITH member
  MATCH (modality:SensingModality)
  WITH modality, rand() AS r
  ORDER BY r
  LIMIT 1
  MERGE (member)-[:HAS_SENSING_MODALITY]->(modality)
}
WITH member
// Add feelsLike resonances
CALL {
  WITH member
  MATCH (resonance:FieldResonance)
  WITH resonance, rand() AS r
  ORDER BY r
  LIMIT 1
  MERGE (member)-[:FEELS_LIKE]->(resonance)
}
RETURN member;

// Load Person - Person Connections (as CONNECTED_TO)
LOAD CSV WITH HEADERS FROM "https://docs.google.com/spreadsheets/d/e/2PACX-1vTPDykek0DB89FZZciwPVautpd3VVlS3paHF3H6Bcp6bd1BMbCNWzA8NLx5gZ-7-d9GiGDjdQEOxafG/pub?gid=951795569&single=true&output=csv" AS row
MATCH (source:Person {id: row.sourceId})
MATCH (target:Person {id: row.targetId})
MERGE
  (source)-
    [r:CONNECTED_TO {type: row.type, why: row.why, interests: row.interests}]->
  (target)
RETURN source, target;

// Load Core Values (now as FieldResonance, but keeping as CoreValue for compatibility, implementing FieldResonance)
LOAD CSV WITH HEADERS FROM "https://docs.google.com/spreadsheets/d/e/2PACX-1vTPDykek0DB89FZZciwPVautpd3VVlS3paHF3H6Bcp6bd1BMbCNWzA8NLx5gZ-7-d9GiGDjdQEOxafG/pub?gid=111745973&single=true&output=csv" AS row

MERGE (coreValue:CoreValue {id: row.id})
SET
  coreValue.name = row.name,
  coreValue.alignmentChallenges = row.alignmentChallenges,
  coreValue.description = row.description,
  coreValue.whoSupports = row.whoSupports,
  coreValue.alignmentExamples = row.alignmentExamples,
  coreValue.caresFor = row.caresFor,
  coreValue.why = row.why,
  coreValue.createdAt = datetime()

WITH coreValue, row
MATCH (person:Person {id: row.personId})
MERGE (person)-[:EMBRACES]->(coreValue)
RETURN coreValue, person;

// Load Goals (implement RelationalEntity)
LOAD CSV WITH HEADERS FROM "https://docs.google.com/spreadsheets/d/e/2PACX-1vTPDykek0DB89FZZciwPVautpd3VVlS3paHF3H6Bcp6bd1BMbCNWzA8NLx5gZ-7-d9GiGDjdQEOxafG/pub?gid=1527651299&single=true&output=csv" AS row

MERGE (goal:Goal {id: row.id})
SET
  goal.time = row.time,
  goal.status = row.status,
  goal.location = row.location,
  goal.description = row.description,
  goal.name = row.name,
  goal.photo = row.photo,
  goal.successMeasures = row.successMeasures,
  goal.why = row.why,
  goal.type = row.type,
  goal.createdAt = datetime()

WITH goal
// Add feelsLike resonances
CALL {
  WITH goal
  MATCH (resonance:FieldResonance)
  WITH resonance, rand() AS r
  ORDER BY r
  LIMIT 1
  MERGE (goal)-[:FEELS_LIKE]->(resonance)
}
RETURN goal;

// Show goal alignment to core values (EMBRACES now ALIGNED_TO? Wait, in schema CoreValue has goals: ALIGNED_TO in, so from goal to coreValue)
LOAD CSV WITH HEADERS FROM "https://docs.google.com/spreadsheets/d/e/2PACX-1vTPDykek0DB89FZZciwPVautpd3VVlS3paHF3H6Bcp6bd1BMbCNWzA8NLx5gZ-7-d9GiGDjdQEOxafG/pub?gid=595870152&single=true&output=csv" AS row
MATCH (goal:Goal {id: row.goalId})
MATCH (coreValue:CoreValue {id: row.coreValueId})
MERGE (goal)-[:ALIGNED_TO]->(coreValue)
RETURN goal, coreValue
LIMIT 1;

// Load Resources (implement RelationalEntity)
LOAD CSV WITH HEADERS FROM "https://docs.google.com/spreadsheets/d/e/2PACX-1vTPDykek0DB89FZZciwPVautpd3VVlS3paHF3H6Bcp6bd1BMbCNWzA8NLx5gZ-7-d9GiGDjdQEOxafG/pub?gid=1338102812&single=true&output=csv" AS row

MERGE (resource:Resource {id: row.id})
SET
  resource.time = row.time,
  resource.status = row.status,
  resource.location = row.location,
  resource.description = row.description,
  resource.name = row.name,
  resource.why = row.why,
  resource.createdAt = datetime()

WITH resource
// Add feelsLike resonances
CALL {
  WITH resource
  MATCH (resonance:FieldResonance)
  WITH resonance, rand() AS r
  ORDER BY r
  LIMIT 1
  MERGE (resource)-[:FEELS_LIKE]->(resonance)
}
RETURN resource;

// Load Community - Community Relationships (RELATES_TO)
LOAD CSV WITH HEADERS FROM "https://docs.google.com/spreadsheets/d/e/2PACX-1vTPDykek0DB89FZZciwPVautpd3VVlS3paHF3H6Bcp6bd1BMbCNWzA8NLx5gZ-7-d9GiGDjdQEOxafG/pub?gid=1106113832&single=true&output=csv" AS row

MATCH (source:Community {id: row.sourceId})
MATCH (target:Community {id: row.targetId})
MERGE (source)-[r:RELATES_TO {type: row.type, why: row.why}]->(target)
RETURN source, target;

// Load COmmunity CoreValue (EMBRACES)
LOAD CSV WITH HEADERS FROM "https://docs.google.com/spreadsheets/d/e/2PACX-1vTPDykek0DB89FZZciwPVautpd3VVlS3paHF3H6Bcp6bd1BMbCNWzA8NLx5gZ-7-d9GiGDjdQEOxafG/pub?gid=574310506&single=true&output=csv" AS row
MATCH (community:Community {id: row.id})
MATCH (coreValue:CoreValue {id: row.coreValueId})
MERGE (community)-[:EMBRACES]->(coreValue)
RETURN community, coreValue;

// Load Field Contexts (formerly Care Points, now FieldContextNode)
LOAD CSV WITH HEADERS FROM "https://docs.google.com/spreadsheets/d/e/2PACX-1vTPDykek0DB89FZZciwPVautpd3VVlS3paHF3H6Bcp6bd1BMbCNWzA8NLx5gZ-7-d9GiGDjdQEOxafG/pub?gid=124737581&single=true&output=csv" AS row

MERGE (fieldContext:FieldContextNode {id: randomUUID()})
SET
  fieldContext.issuesResolved = row.issuesResolved,
  fieldContext.levelFulfilled = row.percentFulfilled,
  fieldContext.location = row.location,
  fieldContext.status = row.status,
  fieldContext.issuesIdentified = row.issuesIdentified,
  fieldContext.fulfillmentDate = row.fulfillmentDate,
  fieldContext.successMeasures = row.successMeasures,
  fieldContext.time = row.time,
  fieldContext.description = row.description,
  fieldContext.why = row.why,
  fieldContext.name = row.name,
  fieldContext.emergentName = row.name + " Field",
  fieldContext.createdAt = datetime()

WITH fieldContext, row
MATCH (offer:Goal {id: row.offerId})
MATCH (need:Goal {id: row.needId})
MATCH (resource:Resource {id: row.resourceId})

MERGE (fieldContext)-[:DEPENDS_ON]->(resource)
MERGE (offer)-[:ENABLES]->(fieldContext)
MERGE (fieldContext)-[:CARES_FOR]->(need)

RETURN fieldContext, offer, need, resource;
