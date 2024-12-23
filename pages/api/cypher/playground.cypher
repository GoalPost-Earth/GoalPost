MATCH (person:Person)
SET person.createdAt = datetime()
RETURN person LIMIT 1;