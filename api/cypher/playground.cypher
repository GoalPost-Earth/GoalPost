// Clear database
MATCH (n)
DETACH DELETE n;


// Import Communities
LOAD CSV WITH HEADERS from "https://docs.google.com/spreadsheets/d/e/2PACX-1vRsxl6zdeZRmys4qxl_MLVKGyA8Dh-O09aMdPNExTJXbUMflsxG3iiTa3_slGxZ5zn_1OwoSjWL521a/pub?gid=879515464&single=true&output=csv" AS row

MERGE (community:Community {id: row.id})
SET community.resultsAchieved = row.resultsAchieved,
community.time = row.time,
community.status = row.status,
community.location  = row.location,
community.description = row.description,
community.name = row.name,
community.caresFor = row.caresFor,
community.activities = row.activities,
community.why = row.why

RETURN community;


// Load Members
LOAD CSV WITH HEADERS from "https://docs.google.com/spreadsheets/d/e/2PACX-1vRsxl6zdeZRmys4qxl_MLVKGyA8Dh-O09aMdPNExTJXbUMflsxG3iiTa3_slGxZ5zn_1OwoSjWL521a/pub?gid=270681936&single=true&output=csv" AS row

MERGE (member:Member:Person {id: row.id})
SET member.lastName = row.lastName,
member.pronouns = row.pronouns,
member.status = row.status,
member.interests = row.interests,
member.passions = row.passions,
member.location = row.location,
member.favourites = row.favourites,
member.avatar = row.avatar,
member.photo = row.photo,
member.fieldsOfCare = row.fieldsOfCare,
member.manual = row.manual,
member.signupDate = datetime(row.signupDate),
member.phoneNumber = row.phoneNumber,
member.email = row.email,
member.gender = row.gender,
member.traits = row.traits,
member.firstName = row.firstName

WITH member, row
MATCH (community:Community {id: row.communityId})
MERGE (member)-[:MEMBER_OF]->(community)
RETURN member, community;


// Load Person - Person Connections
LOAD CSV WITH HEADERS FROM "https://docs.google.com/spreadsheets/d/e/2PACX-1vRsxl6zdeZRmys4qxl_MLVKGyA8Dh-O09aMdPNExTJXbUMflsxG3iiTa3_slGxZ5zn_1OwoSjWL521a/pub?gid=951795569&single=true&output=csv" as row
MATCH (source:Person {id: row.sourceId})
MATCH (target:Person {id: row.targetId})
MERGE (source)-[r:CONNECTS_TO]->(target)
SET r.type = row.type,
r.why = row.why,
r.interests = row.interests

RETURN source, target;


// Load Core Values
LOAD CSV WITH HEADERS FROM "https://docs.google.com/spreadsheets/d/e/2PACX-1vRsxl6zdeZRmys4qxl_MLVKGyA8Dh-O09aMdPNExTJXbUMflsxG3iiTa3_slGxZ5zn_1OwoSjWL521a/pub?gid=111745973&single=true&output=csv" AS row

MERGE (coreValue:CoreValue {id: row.id})
SET coreValue.name = row.name,
coreValue.alignmentChallenges = row.alignmentChallenges,
coreValue.description = row.description,
coreValue.whoSupports = row.whoSupports,
coreValue.alignmentExamples = row.alignmentExamples,
coreValue.caresFor = row.caresFor,
coreValue.why = row.why

WITH coreValue, row
MATCH (person:Person {id: row.personId})
MERGE (person)-[:GUIDED_BY]->(coreValue)

RETURN coreValue, person;


// Load Goals
LOAD CSV WITH HEADERS FROM "https://docs.google.com/spreadsheets/d/e/2PACX-1vRsxl6zdeZRmys4qxl_MLVKGyA8Dh-O09aMdPNExTJXbUMflsxG3iiTa3_slGxZ5zn_1OwoSjWL521a/pub?gid=1527651299&single=true&output=csv" AS row

MERGE (goal:Goal {id: row.id})
SET goal.time = row.time,
goal.status = row.status,
goal.location = row.location,
goal.description = row.description,
goal.name = row.name,
goal.photo = row.photo,
goal.successMeasures = row.successMeasures,
goal.why = row.why,
goal.type = row.type

RETURN goal;

// Show goal alignment to core values
LOAD CSV WITH HEADERS FROM "https://docs.google.com/spreadsheets/d/e/2PACX-1vRsxl6zdeZRmys4qxl_MLVKGyA8Dh-O09aMdPNExTJXbUMflsxG3iiTa3_slGxZ5zn_1OwoSjWL521a/pub?gid=233893666&single=true&output=csv" AS row
MATCH (goal:Goal {id: row.id})
MATCH (coreValue:CoreValue {id: row.coreValueId})
MERGE (goal)-[:ALIGNED_TO]->(coreValue)
RETURN goal, coreValue LIMIT 1;

// Load Resources
LOAD CSV WITH HEADERS FROM "https://docs.google.com/spreadsheets/d/e/2PACX-1vRsxl6zdeZRmys4qxl_MLVKGyA8Dh-O09aMdPNExTJXbUMflsxG3iiTa3_slGxZ5zn_1OwoSjWL521a/pub?gid=1338102812&single=true&output=csv" AS row

MERGE (resource:Resource {id: row.id})
SET resource.time = row.time,
resource.status = row.status,
resource.location = row.location,
resource.description = row.description,
resource.name = row.name, 
resource.why = row.why

WITH resource, row
MATCH (person:Person {id: row.personId})
MERGE (person)-[:PROVIDES]->(resource)
RETURN person, resource;


// Load Community - Community Relationships
LOAD CSV WITH HEADERS FROM "https://docs.google.com/spreadsheets/d/e/2PACX-1vRsxl6zdeZRmys4qxl_MLVKGyA8Dh-O09aMdPNExTJXbUMflsxG3iiTa3_slGxZ5zn_1OwoSjWL521a/pub?gid=1106113832&single=true&output=csv" AS row

MATCH (source:Community {id: row.sourceId})
MATCH (target:Community {id: row.targetId})
MERGE (source)-[r:RELATES_TO]->(target)
SET r.type = row.type,
r.why = row.why
RETURN source, target;

// Load COmmunity CoreValue
LOAD CSV WITH HEADERS FROM "https://docs.google.com/spreadsheets/d/e/2PACX-1vRsxl6zdeZRmys4qxl_MLVKGyA8Dh-O09aMdPNExTJXbUMflsxG3iiTa3_slGxZ5zn_1OwoSjWL521a/pub?gid=574310506&single=true&output=csv" AS row
MATCH (community:Community {id: row.id})
MATCH (coreValue:CoreValue {id: row.coreValueId})
MERGE (community)-[:ALIGNED_TO]->(coreValue)
RETURN community, coreValue;


// Load Care Points
LOAD CSV WITH HEADERS FROM "https://docs.google.com/spreadsheets/d/e/2PACX-1vRsxl6zdeZRmys4qxl_MLVKGyA8Dh-O09aMdPNExTJXbUMflsxG3iiTa3_slGxZ5zn_1OwoSjWL521a/pub?gid=124737581&single=true&output=csv" AS row

MERGE (carePoint:CarePoint {id: randomUUID()})
SET carePoint.issuesResolved = row.issuesResolved,
carePoint.percentFulfilled = row.percentFulfilled,
carePoint.location = row.location,
carePoint.status = row.status,
carePoint.issuesIdentified = row.issuesIdentified,
carePoint.fulfillmentDate = row.fulfillmentDate,
carePoint.successMeasures = row.successMeasures,
carePoint.time = row.time, 
carePoint.description = row.description,
carePoint.why = row.why

WITH carePoint, row
MATCH (offer:Goal {id: row.offerId})
MATCH (need:Goal {id: row.needId})
MATCH (resource:Resource {id: row.resourceId})

MERGE (carePoint)-[:APPLIED_IN]->(resource)
MERGE (offer)-[:ENABLES]->(carePoint)
MERGE (carePoint)-[:CARES_FOR]->(need)


RETURN carePoint, offer, need, resource;

// Load Person - Goal Relationships
LOAD CSV WITH HEADERS FROM "https://docs.google.com/spreadsheets/d/e/2PACX-1vRsxl6zdeZRmys4qxl_MLVKGyA8Dh-O09aMdPNExTJXbUMflsxG3iiTa3_slGxZ5zn_1OwoSjWL521a/pub?gid=1729232360&single=true&output=csv" AS row
MATCH (person:Person {id: row.personId})
MATCH (goal:Goal {id: row.goalId})
MERGE (person)-[r:MOTIVATED_BY]->(goal)
RETURN person, goal;

// Load Community - Goal Relationships
LOAD CSV WITH HEADERS FROM "https://docs.google.com/spreadsheets/d/e/2PACX-1vRsxl6zdeZRmys4qxl_MLVKGyA8Dh-O09aMdPNExTJXbUMflsxG3iiTa3_slGxZ5zn_1OwoSjWL521a/pub?gid=281806365&single=true&output=csv" AS row
MATCH (community:Community {id: row.communityId})
MATCH (goal:Goal {id: row.goalId})
MERGE (community)-[r:MOTIVATED_BY]->(goal)
RETURN community, goal;

// Load Community - Resource Relationships
LOAD CSV WITH HEADERS FROM "https://docs.google.com/spreadsheets/d/e/2PACX-1vRsxl6zdeZRmys4qxl_MLVKGyA8Dh-O09aMdPNExTJXbUMflsxG3iiTa3_slGxZ5zn_1OwoSjWL521a/pub?gid=2114184472&single=true&output=csv" AS row
MATCH (community:Community {id: row.communityId})
MATCH (resource:Resource {id: row.resourceId})
MERGE (community)-[:HAS_ACCESS_TO]->(resource)
RETURN community, resource;
