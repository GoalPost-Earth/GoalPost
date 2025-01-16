MATCH (care:CarePoint) WHERE care.name IS NULL
SET care.name = "CarePoint " + id(care)

RETURN care.name