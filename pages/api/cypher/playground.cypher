MATCH (comm:Community)
WHERE NOT EXISTS {
    MATCH (comm)-[:CREATED_BY]->(member)
} 

MATCH (member:Person {firstName: "Robert"})
MERGE (comm)-[:CREATED_BY]->(member)
RETURN comm, member LIMIT 1;