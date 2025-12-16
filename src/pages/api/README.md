# GoalPost Relational Graph Backend
_Backbone spec for an AI coding agent building the Neo4j + Neo4j-GraphQL application._

This README is the **source of truth** for the backend data model and how it should be implemented and used.

The system models:
- **LifeSensors**: `Person`, `Community` (actors who initiate meaning)
- **Spaces**: `MeSpace`, `WeSpace` (privacy + ownership boundaries)
- **FieldContexts**: thematic/temporal containers inside spaces
- **FieldPulses**: first-class "units of meaning" contributed into contexts
- **Resonance**: semantic patterns discovered across pulses (often AI-generated)

Goals and resources are **not rigid node categories** that users "own."  
Instead they are **pulse types** (interpretations of contributions inside a context).

---

## 1) Core Concepts

### 1.1 LifeSensors
A **LifeSensor** is anything that can initiate pulses and participate in spaces.
- `Person` is a human user.
- `Community` is a collective identity (team, family, cohort, group).

Both can:
- own spaces
- initiate pulses

### 1.2 Spaces
A **Space** is a privacy and access boundary, and a parent container for contexts.

There are two space types:

#### MeSpace
- Private by nature
- Owned by exactly **one** `LifeSensor` (either a `Person` or a `Community`)
- Typically used for "my inner field," but ownership may also be a community (e.g., "community private workspace").

#### WeSpace
- Shared space
- Has an **owner** (exactly one `LifeSensor`)
- Has **members** (one or more `LifeSensor`s)
- Used for collaborative contexts, shared pulses, shared resonance.

**Important:** In this system, both `MeSpace` and `WeSpace` can be owned by either `Person` or `Community`.  
(Ownership is separate from membership.)

### 1.3 FieldContexts
A **FieldContext** is a "membrane" within a space that holds unfolding.
Examples:
- "Q1 Planning"
- "Health"
- "Product Launch"
- "Family Rhythm"

Contexts contain pulses.

### 1.4 FieldPulses (First-Class Citizens)
A **FieldPulse** is the atomic unit of meaning in the system.

A pulse is:
- timestamped
- initiated by a LifeSensor
- stored within a FieldContext
- optionally typed (GoalPulse, ResourcePulse, etc.)
- may later be analyzed by AI to discover resonance

Pulses are "facts" contributed into the field.  
Interpretation can evolve over time without restructuring the graph.

#### Pulse Types (multi-label)
A pulse node always has `:FieldPulse`, and may also have:
- `:GoalPulse`
- `:ResourcePulse`
- `:StoryPulse`
- `:CarePulse`
- `:TimePulse`
- etc.

Example: `(p:FieldPulse:GoalPulse)`.

This keeps the model flexible:
- a pulse can change type later
- AI can assign types after the fact
- no schema migrations needed

### 1.5 Resonance (AI-friendly meaning layer)
**FieldResonance** represents a semantic/symbolic pattern that can appear across multiple pulses.

Examples:
- "Focus"
- "Overload"
- "Momentum"
- "Belonging"
- "Scarcity"
- "Reciprocity"

Resonance is often created **after the fact**, typically by AI jobs, and can be confirmed/edited by humans later.

#### ResonanceLink (explainability)
Resonance is not just a tag. We store **why** a resonance connection exists using a `ResonanceLink` node.

A `ResonanceLink` connects:
- a source pulse
- a target pulse
- a resonance label/pattern
- confidence score
- evidence text
- who/what detected it

This supports:
- explainable AI
- debugging
- "why did you recommend this?" UI

---

## 2) Neo4j Graph Schema (Labels + Relationships)

### 2.1 Node Labels

**Actors**
- `:Person` (also treated as LifeSensor)
- `:Community` (also treated as LifeSensor)

**Spaces**
- `:Space:MeSpace`
- `:Space:WeSpace`

**Contexts**
- `:FieldContext`

**Pulses**
- `:FieldPulse` base label
- plus one or more pulse-type labels:
  - `:GoalPulse`
  - `:ResourcePulse`
  - `:StoryPulse`
  - (others later)

**Resonance**
- `:FieldResonance`
- `:ResonanceLink`

### 2.2 Relationships

**Ownership**
- `(LifeSensor)-[:OWNS]->(Space)`

**Membership (WeSpace only)**
- `(WeSpace)-[:HAS_MEMBER]->(LifeSensor)`

**Containment**
- `(Space)-[:HAS_CONTEXT]->(FieldContext)`
- `(FieldContext)-[:HAS_PULSE]->(FieldPulse)`

**Initiation**
- `(FieldPulse)-[:INITIATED_BY]->(LifeSensor)`

**Resonance**
- `(ResonanceLink)-[:SOURCE]->(FieldPulse)`
- `(ResonanceLink)-[:TARGET]->(FieldPulse)`
- `(ResonanceLink)-[:RESONATES_AS]->(FieldResonance)`
- `(ResonanceLink)-[:DETECTED_BY]->(LifeSensor|System)` (System is optional)

---

## 3) Properties (What each node represents)

### 3.1 Person
Represents a user.

Recommended properties:
- `id: string (UUID)`
- `name: string`
- `email: string?`

### 3.2 Community
Represents a collective.

Recommended properties:
- `id: string (UUID)`
- `name: string`
- `type: string?` (e.g., "team", "family", "cohort")

### 3.3 Space (MeSpace/WeSpace)
Represents access/privacy boundary.

Recommended properties:
- `id: string (UUID)`
- `name: string`
- `visibility: "PRIVATE" | "SHARED"`
- `createdAt: datetime`

### 3.4 FieldContext
Represents a thematic/temporal container inside a space.

Recommended properties:
- `id: string (UUID)`
- `title: string`
- `emergentName: string?` (poetic name)
- `createdAt: datetime`

### 3.5 FieldPulse (base)
Represents a single contributed unit of meaning.

Recommended properties:
- `id: string (UUID)`
- `content: string`
- `createdAt: datetime`
- `intensity: float?` (0..1 typically)
- `why: string?` (optional felt motivation / context)

GoalPulse adds:
- `status: "ACTIVE"|"PAUSED"|"COMPLETED"`
- `horizon: "SHORT"|"MID"|"LONG"?`

ResourcePulse adds:
- `resourceType: string` (time|money|skill|person|tool|energy etc.)
- `availability: float?` (0..1)

### 3.6 FieldResonance
Represents a semantic pattern.

Recommended properties:
- `id: string (UUID)`
- `label: string`
- `description: string?`
- (optional later) `embedding: float[]` for vector search

### 3.7 ResonanceLink
Represents explainable resonance between two pulses.

Recommended properties:
- `id: string (UUID)`
- `confidence: float` (0..1)
- `evidence: string?`
- `createdAt: datetime`

---

## 4) Neo4j GraphQL Model

The GraphQL schema should:
- support `Person` and `Community`
- model `MeSpace` / `WeSpace` as `Space` interface implementations
- model pulse types using `FieldPulse` interface implemented by concrete pulse types
- model resonance via `FieldResonance` and `ResonanceLink`

Key design constraints:
- Ownership is represented by `OWNS` relationship incoming to spaces.
- WeSpace membership is explicit via `HAS_MEMBER`.

Auth is not defined here; implement later using Neo4j GraphQL `@auth` rules or API layer filtering.

---

## 5) Recommended Database Constraints & Indexes

Create uniqueness constraints on `id` for core labels:

```cypher
CREATE CONSTRAINT person_id IF NOT EXISTS
FOR (n:Person) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT community_id IF NOT EXISTS
FOR (n:Community) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT space_id IF NOT EXISTS
FOR (n:Space) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT context_id IF NOT EXISTS
FOR (n:FieldContext) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT pulse_id IF NOT EXISTS
FOR (n:FieldPulse) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT resonance_id IF NOT EXISTS
FOR (n:FieldResonance) REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT resonance_link_id IF NOT EXISTS
FOR (n:ResonanceLink) REQUIRE n.id IS UNIQUE;
```

Useful indexes:

```cypher
CREATE INDEX resonance_label IF NOT EXISTS
FOR (r:FieldResonance) ON (r.label);

CREATE INDEX pulse_createdAt IF NOT EXISTS
FOR (p:FieldPulse) ON (p.createdAt);
```

---

## 6) How the system is used (Architecture)

### 6.1 Write Path (human-generated)

1. User creates or selects a `Space` (MeSpace or WeSpace)
2. User creates or selects a `FieldContext` within that space
3. User creates a pulse in that context

   * The pulse is stored as a node with `:FieldPulse` plus a type label if known (`:GoalPulse`, `:ResourcePulse`, etc.)
4. The pulse is linked to:

   * its `FieldContext`
   * its initiator (`Person` or `Community`)

### 6.2 AI Path (after-the-fact meaning discovery)

AI jobs operate within a scope (usually a space or context):

1. Read pulses in contexts
2. Generate embeddings (optional)
3. Cluster or classify pulses
4. Create or update `FieldResonance` nodes (patterns)
5. Create `ResonanceLink` nodes between related pulses with:

   * confidence
   * evidence
   * detector (AI/system)

Resonance is **derived** from pulses; it can change over time.

### 6.3 Read Path (product queries)

Common queries:

* "Show all contexts in my MeSpace"
* "Show active GoalPulses in a context"
* "Show resources available this week"
* "Show resonances emerging in a context"
* "Why are these two pulses linked?"

---

## 7) Dummy Data (Seed Script)

This section provides Cypher to insert realistic dummy data for development.

### 7.1 Create People + Community

```cypher
CREATE (jd:Person {id:"p_jd", name:"JD", email:"jd@example.com"})
CREATE (naa:Person {id:"p_naa", name:"Naa", email:"naa@example.com"})
CREATE (team:Community {id:"c_team", name:"Codefoundry Core", type:"team"});
```

### 7.2 Create Spaces (MeSpace + WeSpace) with Ownership

```cypher
MATCH (jd:Person {id:"p_jd"}), (team:Community {id:"c_team"})
CREATE (me:Space:MeSpace {id:"s_me_jd", name:"JD Me Space", visibility:"PRIVATE", createdAt:datetime()})
CREATE (we:Space:WeSpace {id:"s_we_team", name:"Core Team We Space", visibility:"SHARED", createdAt:datetime()})
CREATE (jd)-[:OWNS]->(me)
CREATE (team)-[:OWNS]->(we);
```

### 7.3 Add Members to WeSpace

```cypher
MATCH (we:WeSpace {id:"s_we_team"}), (jd:Person {id:"p_jd"}), (naa:Person {id:"p_naa"}), (team:Community {id:"c_team"})
CREATE (we)-[:HAS_MEMBER]->(jd)
CREATE (we)-[:HAS_MEMBER]->(naa)
CREATE (we)-[:HAS_MEMBER]->(team);
```

### 7.4 Create FieldContexts inside Spaces

```cypher
MATCH (me:MeSpace {id:"s_me_jd"}), (we:WeSpace {id:"s_we_team"})
CREATE (c1:FieldContext {id:"ctx_health", title:"Health", emergentName:"The Body's Agreement", createdAt:datetime()})
CREATE (c2:FieldContext {id:"ctx_launch", title:"Product Launch", emergentName:"The Narrow Path", createdAt:datetime()})
CREATE (me)-[:HAS_CONTEXT]->(c1)
CREATE (we)-[:HAS_CONTEXT]->(c2);
```

### 7.5 Create Pulses (GoalPulse + ResourcePulse + StoryPulse)

```cypher
MATCH (jd:Person {id:"p_jd"}), (naa:Person {id:"p_naa"})
MATCH (c1:FieldContext {id:"ctx_health"}), (c2:FieldContext {id:"ctx_launch"})

CREATE (g1:FieldPulse:GoalPulse {
  id:"pulse_g1",
  content:"Exercise 3x per week",
  createdAt:datetime(),
  intensity:0.6,
  why:"More energy and consistency",
  status:"ACTIVE",
  horizon:"MID"
})
CREATE (r1:FieldPulse:ResourcePulse {
  id:"pulse_r1",
  content:"I have 4 hours on Saturday morning",
  createdAt:datetime(),
  intensity:0.5,
  resourceType:"time",
  availability:0.7
})
CREATE (s1:FieldPulse:StoryPulse {
  id:"pulse_s1",
  content:"This week feels heavy but clear",
  createdAt:datetime(),
  intensity:0.8,
  why:"Too many parallel obligations"
})

CREATE (g2:FieldPulse:GoalPulse {
  id:"pulse_g2",
  content:"Ship onboarding v1",
  createdAt:datetime(),
  intensity:0.7,
  why:"Unblocks activation",
  status:"ACTIVE",
  horizon:"SHORT"
})
CREATE (r2:FieldPulse:ResourcePulse {
  id:"pulse_r2",
  content:"We can allocate 10 dev-hours this week",
  createdAt:datetime(),
  intensity:0.6,
  resourceType:"time",
  availability:0.6
})

CREATE (c1)-[:HAS_PULSE]->(g1)
CREATE (c1)-[:HAS_PULSE]->(r1)
CREATE (c1)-[:HAS_PULSE]->(s1)
CREATE (g1)-[:INITIATED_BY]->(jd)
CREATE (r1)-[:INITIATED_BY]->(jd)
CREATE (s1)-[:INITIATED_BY]->(naa)

CREATE (c2)-[:HAS_PULSE]->(g2)
CREATE (c2)-[:HAS_PULSE]->(r2)
CREATE (g2)-[:INITIATED_BY]->(jd)
CREATE (r2)-[:INITIATED_BY]->(jd);
```

### 7.6 Create Resonances + ResonanceLinks (AI-created after the fact)

```cypher
MATCH (g1:FieldPulse {id:"pulse_g1"}), (g2:FieldPulse {id:"pulse_g2"}), (s1:FieldPulse {id:"pulse_s1"})
CREATE (resFocus:FieldResonance {id:"res_focus", label:"Focus", description:"Narrowing toward what matters"})
CREATE (resOverload:FieldResonance {id:"res_overload", label:"Overload", description:"Too many parallel demands"});

WITH resFocus, resOverload, g1, g2, s1
CREATE (l1:ResonanceLink {id:"rl_1", confidence:0.82, evidence:"Both pulses describe narrowing + disciplined action", createdAt:datetime()})
CREATE (l1)-[:SOURCE]->(g1)
CREATE (l1)-[:TARGET]->(g2)
CREATE (l1)-[:RESONATES_AS]->(resFocus)

CREATE (l2:ResonanceLink {id:"rl_2", confidence:0.77, evidence:"Story pulse indicates overload pattern", createdAt:datetime()})
CREATE (l2)-[:SOURCE]->(s1)
CREATE (l2)-[:TARGET]->(g2)
CREATE (l2)-[:RESONATES_AS]->(resOverload);
```

---

## 8) Query Templates (Cypher)

### 8.1 Get all contexts in a person's MeSpace

```cypher
MATCH (p:Person {id:$personId})-[:OWNS]->(s:MeSpace)-[:HAS_CONTEXT]->(c:FieldContext)
RETURN c ORDER BY c.createdAt DESC;
```

### 8.2 Get active goals in a context

```cypher
MATCH (c:FieldContext {id:$contextId})-[:HAS_PULSE]->(g:FieldPulse:GoalPulse)
WHERE g.status = "ACTIVE"
RETURN g ORDER BY g.createdAt DESC;
```

### 8.3 Show resonance patterns emerging in a context

```cypher
MATCH (c:FieldContext {id:$contextId})-[:HAS_PULSE]->(p:FieldPulse)
MATCH (link:ResonanceLink)-[:SOURCE]->(p)
MATCH (link)-[:RESONATES_AS]->(r:FieldResonance)
RETURN r.label AS resonance, count(*) AS links, avg(link.confidence) AS avgConfidence
ORDER BY links DESC, avgConfidence DESC;
```

### 8.4 Explain "why are these two pulses linked?"

```cypher
MATCH (a:FieldPulse {id:$pulseA}), (b:FieldPulse {id:$pulseB})
MATCH (l:ResonanceLink)-[:SOURCE]->(a)
MATCH (l)-[:TARGET]->(b)
MATCH (l)-[:RESONATES_AS]->(r:FieldResonance)
RETURN r.label, l.confidence, l.evidence, l.createdAt
ORDER BY l.confidence DESC;
```

---

## 9) Implementation Notes for the AI Coding Agent

### 9.1 Modeling choices to preserve

* Pulses are first-class nodes.
* Goal/Resource are pulse **types**, not separate owned objects.
* Spaces define privacy boundaries and containment.
* Resonance is derived after the fact and stored in the graph (not computed only at runtime).
* Explainability is stored via `ResonanceLink`.

### 9.2 Do not overcomplicate v1

Avoid prematurely implementing:

* OWL reasoning in runtime
* complex role-expression layers everywhere
* multiple competing containment relationships

Start with:

* spaces → contexts → pulses → resonance links

### 9.3 Neo4j GraphQL usage

* Implement GraphQL types mirroring this schema.
* Use multi-label nodes (Neo4j GraphQL supports `@node(labels: [...])`).
* Keep IDs stable and generated at app layer.

### 9.4 Seeding dummy data

Use the Cypher scripts above to create:

* 2 persons
* 1 community
* 1 MeSpace + 1 WeSpace
* 2 contexts
* 5 pulses
* 2 resonances
* 2 resonance links

This should be enough for UI + API development.

---

## 10) Glossary (Plain English)

* **Space**: who can see what + the container for contexts.
* **FieldContext**: the topic/time "room" where activity happens.
* **Pulse**: a contributed unit of meaning.
* **GoalPulse**: a pulse interpreted as a goal.
* **ResourcePulse**: a pulse interpreted as a resource.
* **Resonance**: a discovered pattern that connects pulses.
* **ResonanceLink**: the explainable proof of a resonance between pulses.

---

End of README.
