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

MATCH (resource:Resource)
WHERE NOT EXISTS {
    MATCH (resource)<-[:PROVIDES]-(person:Person)
}
MATCH (person:Person {firstName: "Vanessa"})
MERGE (person)-[:PROVIDES]->(resource)
RETURN resource.name

MATCH (goal:Goal {id: "d6764f63-df6c-468c-9452-773879125322"})//<-[MOTIVATED_BY]-(motivee:Person)


MATCH (person:Person {firstName: "Vanessa"})
MERGE (goal)-[:CREATED_BY]->(person)

RETURN goal.name, person.firstName