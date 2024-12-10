//! Transform Initial Dataset 
MATCH (person:Person)
SET person.id = randomUUID()
SET person.address = person.`person.Address`
SET person.city = person.`person.City`
SET person.country = person.`person.Country`
SET person.county = person.`person.County`
SET person.email = person.`person.Email`
SET person.gender = person.`person.Gender`
SET person.name = person.`person.Name`

//! Suggested Address Nodes
SET person.firstName = split(person.`person.Name`, " ")[0]
SET person.lastName = split(person.`person.Name`, " ")[1]
SET person.phone = person.`person.Phone`
SET person.state = person.`person.StateProvince`
SET person.zipPostal = person.`person.ZipPostal`
RETURN person LIMIT 1;

MATCH (area:Area)
SET area.city = area.`area.City`
SET area.country = area.`area.Country`
SET area.distance = area.`area.Distance`
SET area.id = randomUUID()
SET area.name = area.`area.Name`
SET area.region = area.`area.Region`
SET area.state = area.`area.State_Province`
RETURN area LIMIT 1;

MATCH (carePoint:`Care Point`)
SET carePoint:CarePoint
SET carePoint.id = randomUUID()
SET carePoint.description = carePoint.`carePoint.Description`
SET carePoint.status = carePoint.`carePoint.Status`
RETURN carePoint LIMIT 1;

MATCH (community:Community)
SET community.id = randomUUID()
SET community.name = community.`community.Name`
RETURN community LIMIT 1;

MATCH (coreValue:`Core Value`) 
SET coreValue:CoreValue
SET coreValue.id = randomUUID()
SET coreValue.name = coreValue.`coreValue.Name`
RETURN coreValue LIMIT 1;

MATCH (goal:Goal)
SET goal.id = randomUUID()
SET goal.contactible = goal.`goal.Contactible`
SET goal.cost = goal.`goal.Cost`
SET goal.createdAt = datetime()
SET goal.deliveryLocation = goal.`goal.DeliveryLocation`
SET goal.deliveryType = goal.`goal.DeliveryType`
SET goal.description = goal.`goal.Description`
SET goal.name = goal.`goal.Name`
SET goal.photo = goal.`goal.Photo`
SET goal.type = goal.`goal.Type`

RETURN goal LIMIT 1;

MATCH (period:Period)
SET period.id = randomUUID()
SET period.startDate = date()
SET period.endDate = date()
SET period.type = period.`period.Type`
SET period.day = period.`period.Day`
RETURN period LIMIT 1;

MATCH (resource:Resource)
SET resource.id = randomUUID()
SET resource.description = resource.`resource.Description`
SET resource.status = resource.`resource.Status`
RETURN resource LIMIT 1;

// REMOVE UNNEEDED PROPERTIES
MATCH (person:Person)
REMOVE person.`person.Address`
REMOVE person.`person.City`
REMOVE person.`person.Country`
REMOVE person.`person.County`
REMOVE person.`person.Email`
REMOVE person.`person.Gender`
REMOVE person.`person.Name`
REMOVE person.`person.Phone`
REMOVE person.`person.StateProvince`
REMOVE person.`person.ZipPostal`

REMOVE person.`person.Id`
REMOVE person.name
RETURN person LIMIT 1;

MATCH (area:Area)
REMOVE area.`area.City`
REMOVE area.`area.Country`
REMOVE area.`area.Distance`
REMOVE area.`area.Name`
REMOVE area.`area.Region`
REMOVE area.`area.State_Province`

REMOVE area.`area.Id`
RETURN area LIMIT 1;

MATCH (carePoint:`Care Point`)
REMOVE carePoint:`Care Point`
REMOVE carePoint.`carePoint.Description`
REMOVE carePoint.`carePoint.Status`

REMOVE carePoint.`carePoint.Id`
REMOVE carePoint.`carePoint.enablingGoalId`
REMOVE carePoint.`carePoint.resourceId`
REMOVE carePoint.`carePoint.supportedGoalId`
RETURN carePoint LIMIT 1;

MATCH (community:Community)
REMOVE community.`community.Name`
REMOVE community.`community.Id`
RETURN community LIMIT 1;

MATCH (coreValue:`Core Value`)
REMOVE coreValue:`Core Value`
REMOVE coreValue.`coreValue.Name`
REMOVE coreValue.`coreValue.Id`
RETURN coreValue LIMIT 1;

MATCH (goal:Goal)
REMOVE goal.`goal.Contactible`
REMOVE goal.`goal.Cost`
REMOVE goal.`goal.CreationDate`
REMOVE goal.`goal.DeliveryLocation`
REMOVE goal.`goal.DeliveryType`
REMOVE goal.`goal.Description`
REMOVE goal.`goal.Name`
REMOVE goal.`goal.Photo`
REMOVE goal.`goal.Type`

REMOVE goal.`goal.Id`
RETURN goal LIMIT 1;

MATCH (period:Period)
REMOVE period.`period.StartDate`
REMOVE period.`period.EndDate`
REMOVE period.`period.Day`
REMOVE period.`period.Type`
REMOVE period.`period.Id`
RETURN period LIMIT 1;

MATCH (resource:Resource)
REMOVE resource.`resource.Description`
REMOVE resource.`resource.Status`

REMOVE resource.`resource.AreaId`
REMOVE resource.`resource.Id`
REMOVE resource.`resource.PeriodId`
REMOVE resource.`resource.Status`
RETURN resource LIMIT 1;

//! Disconnect and reconnect relationships
// Person Relationships
MATCH (community:Community)-[r:`MEMBERSHIPS-OF`|`HAS-MEMBERS`]-(person:Person)
MERGE (person)-[:BELONGS_TO]->(community)
DELETE r
RETURN community, person LIMIT 1;

MATCH (person:Person)-[r:`MOTIVATED-BY`|`OF-PERSON`]-(goal:Goal)
MERGE (person)-[:MOTIVATED_BY]->(goal)
DELETE r
RETURN person, goal LIMIT 1;

// TODO: Confirm from Robert before running this
MATCH (person:Person)-[r:`DRIVER-FOR`|`GUIDED-BY`]-(coreValue:CoreValue)
MERGE (person)-[:GUIDED_BY]->(coreValue)
DELETE r
RETURN person, coreValue LIMIT 1;

MATCH (person:Person)-[r:`HAS-ACCESS-TO`]-(resource:Resource)
MERGE (person)-[:HAS_ACCESS_TO]->(resource)
DELETE r
RETURN person, resource LIMIT 1;

MATCH (person:Person)-[r:`OF-PERSON`]-(resource:Resource)
MERGE (person)-[:PROVIDES]->(resource)
DELETE r
RETURN person, resource LIMIT 1;


// Area Relationships
MATCH (area:Area)-[r:`WHERE-AVAILABLE`|`GOAL-AREA`]-(goal:Goal)
MERGE (goal)-[:IS_AVAILABLE_IN]->(area)
DELETE r
RETURN area, goal LIMIT 1;

MATCH (area:Area)-[r:`WHERE-AVAILABLE`|`COMMUNITY-AREA`]-(community:Community)
MERGE (community)-[:IS_AVAILABLE_IN]->(area)
DELETE r
RETURN area, community LIMIT 1;

MATCH (area:Area)-[r:`WHERE-AVAILABLE`|`RESOURCE-AREA`]-(resource:Resource)
MERGE (resource)-[:IS_AVAILABLE_IN]->(area)
DELETE r
RETURN area, resource LIMIT 1;

// Care Point Relationships
MATCH (carePoint:CarePoint)-[r:`APPLICATION-OF`|`APPLIED-IN`]-(resource:Resource)
MERGE (carePoint)-[:APPLIED_IN]->(resource)
DELETE r
RETURN carePoint, resource LIMIT 1;


