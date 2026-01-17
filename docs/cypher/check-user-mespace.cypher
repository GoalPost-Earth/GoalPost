// Check if MeSpace exists for user f59c41b9-014b-4ea6-95e8-f633413b1dbb
MATCH (p:Person {id: "f59c41b9-014b-4ea6-95e8-f633413b1dbb"})
OPTIONAL MATCH (p)-[:OWNS]->(meSpace:MeSpace)
RETURN p.id as personId, p.firstName, p.lastName, p.email, 
       meSpace.id as meSpaceId, meSpace.name as meSpaceName,
       EXISTS((p)-[:OWNS]->(meSpace)) as hasOwnsRelationship;

// If no MeSpace found, create one for this user
MATCH (p:Person {id: "f59c41b9-014b-4ea6-95e8-f633413b1dbb"})
WHERE NOT EXISTS((p)-[:OWNS]->(:MeSpace))
CREATE (meSpace:Space:MeSpace {
  id: randomUUID(),
  name: CASE 
    WHEN p.firstName IS NOT NULL AND p.lastName IS NOT NULL AND p.firstName <> '' AND p.lastName <> '' 
    THEN p.firstName + ' ' + p.lastName + "'s Personal Space"
    WHEN p.firstName IS NOT NULL AND p.firstName <> '' 
    THEN p.firstName + "'s Personal Space"
    ELSE 'My Personal Space'
  END,
  visibility: 'PRIVATE',
  createdAt: datetime()
})
CREATE (p)-[:OWNS]->(meSpace)
RETURN p.id as personId, meSpace.id as meSpaceId, meSpace.name as meSpaceName;

// Verify the MeSpace was created
MATCH (p:Person {id: "f59c41b9-014b-4ea6-95e8-f633413b1dbb"})-[:OWNS]->(meSpace:MeSpace)
RETURN p.firstName, p.lastName, meSpace.id, meSpace.name;
