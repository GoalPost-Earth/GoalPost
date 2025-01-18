MATCH (person:Person)
SET person.status = "Active"
RETURN person;

MATCH (carePoint:CarePoint)
SET carePoint.status = "Active"
RETURN carePoint;

MATCH (community:Community)
SET community.status = "Active"
RETURN community;

MATCH (goal:Goal)
SET goal.status = "Active"
RETURN goal;

MATCH (resource:Resource)
SET resource.status = "Active"
RETURN resource;