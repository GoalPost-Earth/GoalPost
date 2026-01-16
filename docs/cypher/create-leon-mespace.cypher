// Create MeSpace for Leon Schmidt (user id: 104)
// Run this in Neo4j Browser or via script to set up Leon's personal space

MATCH (leon:Person {id: "104"})
CREATE (leonMe:Space:MeSpace {
  id: "space_leon_me_104",
  name: "Leon's Personal Space",
  visibility: "PRIVATE",
  createdAt: datetime()
})
CREATE (leon)-[:OWNS]->(leonMe)
RETURN leon, leonMe;

// Verify the MeSpace was created
MATCH (leon:Person {id: "104"})-[:OWNS]->(meSpace:MeSpace)
RETURN leon.firstName, leon.lastName, meSpace.id, meSpace.name;
