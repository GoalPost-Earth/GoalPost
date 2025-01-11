MATCH (jd:Person {email: "jaedagy@gmail.com"})-[r:BELONGS_TO]->(community)
DELETE r
RETURN jd