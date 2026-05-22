/**
 * Schema descriptor for the AI Cypher generator.
 *
 * Sourced from `kb/05-data-entities.md`. Two roles:
 *
 *   1. SCHEMA_DOC — a compact textual description fed into the generator's
 *      system prompt so the LLM knows what labels, properties, and
 *      relationships actually exist in GoalPost's Neo4j graph.
 *   2. ALLOWED_LABELS / ALLOWED_RELATIONSHIPS — the validator's whitelist.
 *      Any `:LabelName` or `[:REL_TYPE]` token in generated Cypher that
 *      does not appear here is rejected before execution.
 *
 * Keep these in sync when entities or relationships are added/renamed in
 * the schema. Conversation* nodes and Log are deliberately excluded —
 * they are not meaningful to render in a graph canvas and surfacing them
 * would blow past the relevance budget.
 */

export const ALLOWED_LABELS = [
  // Identity / membership
  'Person',
  'User',
  'PersonPulse',
  'SpaceMembership',
  'Community',
  // Containers
  'Space',
  'MeSpace',
  'WeSpace',
  // Content
  'FieldContext',
  'FieldPulse',
  'GoalPulse',
  'ResourcePulse',
  'StoryPulse',
  'CarePulse',
  'CoreValuePulse',
  // Relational discoveries
  'ResonanceLink',
  'FieldResonance',
] as const

export type AllowedLabel = (typeof ALLOWED_LABELS)[number]

export const ALLOWED_RELATIONSHIPS = [
  'OWNS',
  'HAS_MEMBER',
  'IS_MEMBER',
  'HAS_CONTEXT',
  'HAS_PULSE',
  'HAS_RESONANCE',
  'CREATED_BY',
  'CONNECTED_TO',
  'SOURCE',
  'TARGET',
  'RESONATES_AS',
] as const

export type AllowedRelationship = (typeof ALLOWED_RELATIONSHIPS)[number]

export const ALLOWED_LABELS_SET: ReadonlySet<string> = new Set(ALLOWED_LABELS)
export const ALLOWED_RELATIONSHIPS_SET: ReadonlySet<string> = new Set(
  ALLOWED_RELATIONSHIPS
)

/**
 * The schema description shown to the Cypher-generation LLM. Stays small
 * but exhaustive enough that the model can write correct queries against
 * any of the labels above. Kept inline (not loaded from KB at runtime) so
 * the production prompt is deterministic and the bundle has no fs read.
 */
export const SCHEMA_DOC = `
GoalPost Neo4j schema (read-only). Use only the labels and relationship types listed.

# Labels and key properties

Person { id, firstName, lastName, name, email, pronouns, photo, location, careManual, passions, traits, fieldsOfCare, interests }
  - Adjacent labels: "User" (registered platform user), "PersonPulse" (non-user person in someone's relational world).

Space { id, name, description, visibility, why, location, createdAt }
  - Always co-labeled as MeSpace or WeSpace.

MeSpace : Space  — one per Person, owned by exactly one Person.
WeSpace : Space  — collaborative, owner + members.

SpaceMembership { id, role, addedAt } — role ∈ {ADMIN, MEMBER, GUEST}.

Community { id, name, description } — a public collective (e.g. "GoalPost Core Team"). Communities are NOT private — every authenticated user can see them and discover other members.

FieldContext { id, title, emergentName, createdAt }
  - Belongs to exactly one Space.

FieldPulse { id, title, content, status, intensity, horizon, why, location, time, createdAt }
  - Always co-labeled with one specific pulse subtype:
    GoalPulse, ResourcePulse, StoryPulse, CarePulse, CoreValuePulse.

ResonanceLink { id, label, description, confidence, evidence, status }
  - Connects two FieldPulses via SOURCE / TARGET.

FieldResonance { label, description } — semantic theme node.

# Relationships (directed)

(Person)-[:OWNS]->(Space)
(Space)-[:HAS_MEMBER]->(SpaceMembership)
(SpaceMembership)-[:IS_MEMBER]->(Person)
(Space)-[:HAS_CONTEXT]->(FieldContext)
(FieldContext)-[:HAS_PULSE]->(FieldPulse)
(FieldContext)-[:HAS_RESONANCE]->(ResonanceLink)
(ResonanceLink)-[:SOURCE]->(FieldPulse)
(ResonanceLink)-[:TARGET]->(FieldPulse)
(ResonanceLink)-[:RESONATES_AS]->(FieldResonance)
(FieldPulse)-[:CREATED_BY]->(Person)
(Person)-[:CONNECTED_TO]-(Person)  // bidirectional
(Community)-[:HAS_MEMBER]->(Person)  // direct community membership (no intermediary node)
(Community)-[:OWNS]->(Space)         // a community can own a WeSpace

NOTE on HAS_MEMBER: it has two valid domains.
  (Space)-[:HAS_MEMBER]->(SpaceMembership)  // Space membership goes through a SpaceMembership node carrying the role
  (Community)-[:HAS_MEMBER]->(Person)       // Community membership is a direct edge to Person, no role node

# Access pattern

Every viewable node reaches a Space OR a Community the current user can see:
- Space access: the user OWNS the Space, OR
  (Space)-[:HAS_MEMBER]->(:SpaceMembership)-[:IS_MEMBER]->(:Person {id: $userId})
- Community access: communities are public to all authenticated users.
  (Community)-[:HAS_MEMBER]->(:Person {id: $userId})  // or just any Community node — visibility is permissive

This makes Community a useful bridge node for path-finding between two Persons who share no Space — e.g. "How is X connected to Y?" can travel (X)<-[:HAS_MEMBER]-(c:Community)-[:HAS_MEMBER]->(Y).

# Conventions

- All ids are stored on the node as the property "id" (string).
- Names: Space.name, FieldContext.title (fallback: emergentName), FieldPulse.title.
- Person names: \`Person.name\` is OFTEN NULL — most Persons only carry \`firstName\` + \`lastName\`. When matching a Person by a user-typed name, do NOT use \`a.name\` alone. Use the four-clause tolerant predicate (CONTAINS over \`name\`, \`firstName\`, \`lastName\`, and the trimmed \`firstName + ' ' + lastName\` concatenation) so single-token, partial, and full-name inputs all match.
- Pulse subtypes share the FieldPulse base — match on FieldPulse for cross-type queries,
  match on the subtype label (e.g. GoalPulse) when filtering by type.
`.trim()
