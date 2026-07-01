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
  // Connective container (reified connector, like ResonanceLink — NOT a pulse
  // subtype). Wraps a migrated care point so "show surrounding relationships"
  // has a starting point. Surfaced inside a FieldContext via HAS_WEAVE.
  'PromiseWeave',
] as const

export type AllowedLabel = (typeof ALLOWED_LABELS)[number]

export const ALLOWED_RELATIONSHIPS = [
  'OWNS',
  'HAS_MEMBER',
  'IS_MEMBER',
  'HAS_CONTEXT',
  'HAS_PULSE',
  // A FieldContext surfaces the people in its relational world via HAS_PERSON
  // → (:Person). The target is USUALLY a non-member (:Person:PersonPulse) but
  // can be a :Person:User (the uploader self-links their own node on ingest),
  // so match the base :Person label and filter membership by the :User label.
  // Without this edge whitelisted the generator cannot reach contacts attached
  // to a field, so "show the non-members connected to me" came back empty
  // (GOAL-277).
  'HAS_PERSON',
  'HAS_RESONANCE',
  // PromiseWeave edges — directly analogous to ResonanceLink's
  // SOURCE/TARGET/HAS_RESONANCE. A weave WEAVES the pulse(s) it connects, is
  // WOVEN_FOR the person it concerns, and is surfaced inside its FieldContext
  // via a HAS_WEAVE context edge.
  'WEAVES',
  'WOVEN_FOR',
  'HAS_WEAVE',
  'CREATED_BY',
  'CONNECTED_TO',
  'SOURCE',
  'TARGET',
  'RESONATES_AS',
  // Semantic ontology edges between pulses (and pulse↔person/community).
  // These are the migrated GoalPost ontology relationships — a Goal
  // ENABLES a Story, a Goal DEPENDS_ON a Resource, a Goal is ALIGNED_TO a
  // CoreValue, a Person PROVIDES a Resource, etc. They are PUBLIC schema
  // surface (unlike the private internals LOGGED_FOR / CONTEXT /
  // HAS_THREAD / HAS_TURN / HAS_CHUNK, which stay off this list), so the
  // generator may traverse them. Node visibility is still gated by the
  // post-execute Space auth filter in execute.ts — whitelisting an edge
  // type never bypasses canViewContent.
  'ENABLES',
  'ENABLED_BY',
  'DEPENDS_ON',
  'APPLIED_TO',
  'APPLIED_IN',
  'ALIGNED_TO',
  'CARES_FOR',
  'MOTIVATED_BY',
  'EMBRACES',
  'PROVIDES',
  'HAS_ACCESS_TO',
  'GUIDED_BY',
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
  - Every human is a :Person. An ADJACENT label distinguishes platform access:
      :User        → a MEMBER — a registered platform user who can log in, owns a MeSpace, creates pulses. Labels: ["Person","User"].
      :PersonPulse → a NON-MEMBER — someone in a user's relational world (a contact, family, colleague) with no platform login. Labels: ["Person","PersonPulse"].
      (neither)    → a bare :Person — a NON-MEMBER contact/imported record not yet classified. Labels: ["Person"].
  - "member(s)" / "platform user(s)" / "people on GoalPost" ⇒ :Person:User.
  - "non-member(s)" / "contacts" / "people NOT on the platform" / "my relational world" ⇒ a :Person that is NOT a :User (a bare :Person or a :Person:PersonPulse).
  - To match ONLY non-members, filter by the ABSENCE of the User label with a WHERE predicate: \`MATCH (x:Person) WHERE NOT x:User\`. Do NOT assume every Person is a :User — most Persons in the graph are non-members.
  - To match ONLY members, add the label to the pattern: \`MATCH (x:Person:User)\` or \`WHERE x:User\`.

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

PromiseWeave { id, title, status, createdAt }
  - A connective CONTAINER node — its own type, NOT a pulse subtype (just like
    ResonanceLink). Wraps a migrated care point so its neighbourhood is
    navigable. Its human label is "title". Surfaced inside a FieldContext via a
    HAS_WEAVE context edge (exactly as ResonanceLink is surfaced via
    HAS_RESONANCE). When the user names a "promise weave" / "weave", or asks to
    show a node whose title matches a PromiseWeave title, MATCH the
    \`:PromiseWeave\` label — these nodes are invisible to any query that omits
    it.

FieldResonance { label, description } — semantic theme node.

# Relationships (directed)

(Person)-[:OWNS]->(Space)
(Space)-[:HAS_MEMBER]->(SpaceMembership)
(SpaceMembership)-[:IS_MEMBER]->(Person)
(Space)-[:HAS_CONTEXT]->(FieldContext)
(FieldContext)-[:HAS_PULSE]->(FieldPulse)
(FieldContext)-[:HAS_PERSON]->(Person)   // people attached to a field's relational world — usually a non-member (:Person:PersonPulse), but occasionally the :Person:User uploader who self-linked. Match base :Person and filter membership by the :User label.
(FieldContext)-[:HAS_RESONANCE]->(ResonanceLink)
(ResonanceLink)-[:SOURCE]->(FieldPulse)
(ResonanceLink)-[:TARGET]->(FieldPulse)
(ResonanceLink)-[:RESONATES_AS]->(FieldResonance)
(FieldContext)-[:HAS_WEAVE]->(PromiseWeave)
(PromiseWeave)-[:WEAVES]->(FieldPulse)     // the care point(s) it connects (1..n)
(PromiseWeave)-[:WOVEN_FOR]->(Person)      // the person it concerns
(PromiseWeave)-[:CREATED_BY]->(Person)     // authorship
(FieldPulse)-[:CREATED_BY]->(Person)
(Person)-[:CONNECTED_TO]-(Person)  // bidirectional
(Community)-[:HAS_MEMBER]->(Person)  // direct community membership (no intermediary node)
(Community)-[:OWNS]->(Space)         // a community can own a WeSpace

# Semantic pulse relationships (the GoalPost ontology — directed)

Pulses are NOT connected only through ResonanceLink. Migrated GoalPost
content carries DIRECT, typed edges between pulses (and between pulses and
the people/communities they involve). When a user asks to "expand",
"explore", or see the "surrounding relationships" of a pulse, these are
usually the edges they mean — alongside the structural HAS_PULSE /
CREATED_BY edges. A query that omits them will look empty even though the
pulse is richly connected.

(GoalPulse)-[:DEPENDS_ON]->(ResourcePulse)     // a goal needs a resource ("supporting resources")
(StoryPulse)-[:DEPENDS_ON]->(ResourcePulse)
(GoalPulse)-[:ENABLES]->(StoryPulse)           // a goal enables a story/outcome ("enabled goals")
(StoryPulse)-[:ENABLED_BY]->(GoalPulse)        // inverse of ENABLES
(ResourcePulse)-[:APPLIED_TO]->(GoalPulse)     // a resource applied to a goal
(ResourcePulse)-[:APPLIED_IN]->(StoryPulse)
(GoalPulse)-[:ALIGNED_TO]->(CoreValuePulse)    // a goal aligned to a value
(StoryPulse)-[:CARES_FOR]->(GoalPulse)
(Person)-[:MOTIVATED_BY]->(GoalPulse)          // a person motivated by a goal
(Person)-[:PROVIDES]->(ResourcePulse)          // a person provides a resource
(Person)-[:EMBRACES]->(CoreValuePulse)         // a person embraces a value
(Person)-[:HAS_ACCESS_TO]->(ResourcePulse)
(StoryPulse)-[:GUIDED_BY]->(Person)

These edges run in BOTH directions depending on subtype, so match them
WITHOUT an arrow — \`(focal)-[r:ENABLES|DEPENDS_ON|…]-(other)\` — to catch
incoming and outgoing without guessing direction.

Intent phrasing → edge:
- "enabled goals" / "what does this enable" → ENABLES / ENABLED_BY (a GoalPulse / StoryPulse)
- "supporting resources" / "resources it depends on" → DEPENDS_ON / APPLIED_TO / APPLIED_IN (a ResourcePulse)
- "values it aligns to" → ALIGNED_TO (a CoreValuePulse)
- "who is motivated by / provides this" → MOTIVATED_BY / PROVIDES (a Person)

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
