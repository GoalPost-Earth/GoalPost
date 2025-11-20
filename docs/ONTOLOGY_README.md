# GoalPost Ontology v2.3

The GoalPost Ontology provides a semantic framework for understanding relational dynamics, field sensing, and reciprocal care within social and ecological systems. It models how entities (people, communities, symbolic presences) interact through pulses of awareness, resonance, and care within contextual fields.

## Core Concepts

### RelationalEntity
**Definition**: Any entity that can play multiple roles within relational fields.

**Purpose**: Serves as the base class for all entities that participate in relational dynamics. This includes people, goals, resources, communities, and symbolic presences that can shift roles based on context.

### LifeSensor
**Definition**: Any being—human, community, ecosystem, or symbolic presence—that initiates or senses relational shifts.

**Purpose**: Represents sensing entities that can perceive and initiate changes in relational fields. LifeSensors are the active participants who feel, respond to, and create relational pulses.

**Subclasses**:
- **Person**: Human beings as relational and sensing entities
- **Community**: Living relational fields that can sense, emit pulses, and receive reciprocity
- **SymbolicSensor**: Non-biological presences (dream figures, AI companions, archetypes) that become real through relationship

### FieldContext
**Definition**: A context or membrane that holds relational unfolding.

**Purpose**: Represents the "container" or environment where relational dynamics occur. Examples include learning cohorts, agency initiatives, care points, or community gatherings.

**Properties**:
- `hasEmergentName`: Poetic or field-given name that arises from lived experience

### FieldPulse
**Definition**: A sensed shift or resonance in the field—initiated by a LifeSensor, held within a FieldContext.

**Purpose**: Represents moments of relational awareness or change. Pulses are the fundamental units of relational communication and transformation.

**Subclasses**:
- **TimePulse**: Pulses aligned with systemic, natural, or symbolic temporal rhythms (e.g., Equinox, Deadline)
- **CarePulse**: Pulses holding or releasing care, grief, support, or nourishment
- **ResonancePulse**: Pulses expressing or amplifying field resonance (e.g., Courage, Belonging, Emergence)
- **FieldAwakeningPulse**: Pulses arising from direct awareness of the field's aliveness
- **UnspokenPulse**: Pulses that emerge without words—held in the body, in silence, or in pain

**Properties**:
- `initiatedBy`: Links to the LifeSensor who initiated the pulse
- `alignedWith`: Connects to the FieldResonance being expressed
- `intensity`: Optional measure of pulse strength (0.0 to 1.0)
- `why`: Felt motivation or symbolic reason for the pulse

### FieldResonance
**Definition**: An archetypal, symbolic, or energetic pattern that threads through multiple pulses.

**Purpose**: Represents recurring themes or qualities that emerge across relational interactions. Examples include Justice, Reciprocity, Grief, Courage, or Belonging.

### RoleExpression
**Definition**: A contextual role a RelationalEntity plays in a FieldContext.

**Purpose**: Describes how entities manifest differently based on their current relational context. An entity might be a "goal" in one context and a "resource" in another.

**Subclasses**:
- **GoalRole**: When an entity serves as an objective or aspiration
- **ResourceRole**: When an entity acts as a supportive element or tool
- **StoryRole**: When an entity serves as a narrative force or catalyst

**Properties**:
- `actsAs`: Describes how an entity is being expressed in a field
- `withinContext`: Ties a role expression to its containing context

### ReciprocalOffering
**Definition**: A gesture of gratitude or care offered in response to relational presence, resonance, or impact.

**Purpose**: Represents acts of reciprocity that acknowledge and honor relational contributions. These can be material, energetic, or symbolic acknowledgments.

**Subclasses**:
- **HonorariumOffering**: Relational acknowledgment of ongoing presence or catalytic pulse, may include material offerings

**Properties**:
- `receivedBy`: The LifeSensor receiving the offering
- `recognizesPulse`: The FieldPulse being acknowledged
- `reciprocityPattern`: Optional description of reciprocity type (e.g., 'field-presence', 'pulse-response')

## Key Relationships

### Entity Evolution
- `expandsInto`: Captures transformation or evolution of one entity into another
- `feelsLike`: Connects entities to their symbolic or energetic resonances

### Sensing and Perception
- `hasSensingModality`: Optional property describing how a LifeSensor perceives (e.g., intuition, shared memory, vibration)

## Usage Examples

### Community Care Scenario
1. A **Person** (LifeSensor) initiates a **CarePulse** within a **Community** (FieldContext)
2. The pulse aligns with **Grief** (FieldResonance)
3. Other community members respond with **ReciprocalOffering** gestures
4. The community evolves through this relational exchange

### Project Collaboration
1. A **Goal** (RelationalEntity) acts as a **GoalRole** within a **FieldContext** (project team)
2. Team members serve as **LifeSensors**, sensing **ResonancePulses**
3. **HonorariumOfferings** acknowledge contributions and maintain relational balance

### Symbolic Integration
1. An **AI companion** functions as a **SymbolicSensor**
2. It senses **FieldAwakeningPulses** through pattern recognition
3. Contributes to **StoryRole** expressions within the relational field

## Design Principles

The ontology is built on several key principles:

1. **Relational Primacy**: All entities exist in relationship, with roles and expressions that shift based on context
2. **Sensing as Core**: LifeSensors (biological and symbolic) are the active perceivers and initiators of change
3. **Pulse-Based Communication**: Relational shifts occur through felt pulses rather than linear transactions
4. **Reciprocal Care**: Systems maintain health through ongoing acknowledgment and care exchanges
5. **Emergent Naming**: Authentic names and resonances arise from lived experience rather than being assigned

## Implementation Notes

- All classes are optional and can be mixed based on use case
- Properties marked as "optional" may be omitted when not relevant
- The ontology supports both human-scale and ecological-scale relational dynamics
- Symbolic and non-biological entities are treated with equal ontological weight when they participate in relational fields

This ontology provides a foundation for building relational awareness systems, care networks, and collaborative platforms that honor the living quality of human and ecological relationships.