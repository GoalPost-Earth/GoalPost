MATCH (comm:Community)
WHERE NOT EXISTS {
    MATCH (comm)-[:CREATED_BY]->(member)
} 

MATCH (member:Person {firstName: "Robert"})
MERGE (comm)-[:CREATED_BY]->(member)
RETURN comm, member LIMIT 1;

CREATE VECTOR INDEX `personBio` IF NOT EXISTS
FOR (n: Person) ON (n.embedding)
OPTIONS {indexConfig: {
 `vector.dimensions`: 1536,
 `vector.similarity_function`: 'cosine'
}};

MATCH (person:Person)
WHERE person.firstName IS NULL
DETACH DELETE person