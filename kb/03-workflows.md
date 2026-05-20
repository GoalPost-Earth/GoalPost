# GoalPost Workflows

Core workflows for the GoalPost platform.

## Workflow Sequence

```
WF-01: User Registration & Onboarding     (New user signs up, completes profile)
WF-02: Space Creation                     (User creates MeSpace or WeSpace)
WF-03: FieldContext Creation              (User creates a thematic container within a space)
WF-04: Conversation & Pulse Creation      (User converses with AI, captures a pulse)
WF-05: Embedding & Person Enrichment      (Background: generate embeddings, enrich profiles)
WF-06: Resonance Discovery               (Background: AI finds semantic connections between pulses)
WF-07: Human Resonance Review            (User confirms, edits, or rejects AI-found resonances)
WF-08: WeSpace Collaboration             (Owner invites members, shared pulse creation)
WF-09: Data Import                       (User imports CSV/XLSX data into the system)
```

---

## WF-01 — User Registration & Onboarding

**Actor:** New User

1. User signs up with name, email, and password.
2. JWT token issued, user redirected to onboarding flow.
3. Onboarding guides user through profile setup (pronouns, location, interests, passions, careManual).
4. MeSpace automatically created for the user on account creation.
5. Onboarding state tracked via `onboardingCurrentStepIndex`, `onboardingCompletedSteps`, `onboardingIsCompleted`.
6. User can skip onboarding (`onboardingSkipped = true`).

---

## WF-02 — Space Creation

**Actor:** Authenticated User

### MeSpace (automatic)

1. Created automatically during user registration.
2. One MeSpace per user — personal, private container.
3. Only the owner can access content within it.

### WeSpace (manual)

1. User creates a new WeSpace from the Spaces page.
2. Specifies: name, description, visibility (PRIVATE / SHARED).
3. Optional fields: why, location, time, activities.
4. WeSpace becomes available for member invitations.

---

## WF-03 — FieldContext Creation

**Actor:** Space Owner or Member (with edit permissions)

1. User navigates to a Space (MeSpace or WeSpace).
2. Creates a new FieldContext with a title.
3. FieldContext appears within the space, ready to receive pulses.
4. Over time, an emergent name may be generated from the content within.

---

## WF-04 — Conversation & Pulse Creation

**Actor:** Authenticated User

1. User opens the AI assistant (Standard, Aiden, or Braider mode).
2. User converses with the AI — messages are chunked into sentences.
3. Each sentence becomes a `ConversationChunk` node.
4. User clicks "Create Pulse" to capture a pulse from the conversation.
5. User selects pulse type: GoalPulse, ResourcePulse, StoryPulse, CarePulse, or CoreValuePulse.
6. User provides: title, content, intensity, and type-specific fields.
7. Pulse created as a `FieldPulse` node, linked to its `FieldContext` and `ConversationChunks`.
8. Background job queued for embedding generation and person enrichment.

### Direct Pulse Creation (without conversation)

1. User navigates to a FieldContext within a Space.
2. Creates a pulse directly with title, content, type, and optional fields.
3. Same background processing applies.

---

## WF-05 — Embedding & Person Enrichment

**Actors:** Vercel Cron Jobs (API route handlers)

### Pulse Processing Job

1. Triggered on every pulse creation.
2. Generates individual embeddings for each ConversationChunk (sentence-level).
3. Generates composite pulse embedding (pulse content + all linked chunks).
4. Stores embeddings in Neo4j vector indexes.

### Person Enrichment Job

1. Triggered after pulse processing.
2. Fetches the person's last 30 days of pulses.
3. Sends to LLM: "Extract themes, passions, traits from these pulses."
4. Updates Person node properties (passions, fieldsOfCare, traits).
5. Regenerates Person embedding with enriched profile data.

---

## WF-06 — Resonance Discovery

**Actors:** Vercel Cron Job (daily schedule)

1. Finds all pulses created or modified since the last discovery run.
2. For each pulse, performs vector similarity search (cosine > 0.7).
3. Groups similar pulses into clusters.
4. Sends clusters to LLM for pattern analysis.
5. LLM returns: label (e.g., "grief"), description, and connections with confidence scores.
6. Creates `FieldResonance` node for the pattern (if new).
7. Creates `ResonanceLink` nodes between pulse pairs with confidence and evidence.
8. Links are created with status `pending` — awaiting human review.

---

## WF-07 — Human Resonance Review

**Actor:** Authenticated User

1. User views pending resonances via the review interface (`GET /api/resonance/review`).
2. For each AI-generated link, sees: source pulse, target pulse, resonance label, confidence, and evidence.
3. User takes one of three actions:
   - **Confirm** — marks the link as `confirmed`.
   - **Edit** — adjusts confidence, rewrites evidence, then confirms.
   - **Reject** — marks the link as `rejected`.
4. Review metadata stored: `reviewedBy`, `reviewedAt`, `editedBy`.

---

## WF-08 — WeSpace Collaboration

**Actor:** Space Owner + Members

1. Owner creates a WeSpace (see WF-02).
2. Owner invites members — each gets a `SpaceMembership` with a role (ADMIN / MEMBER / GUEST).
3. Members can browse the space's FieldContexts and pulses (based on role permissions).
4. ADMIN and MEMBER roles can create pulses within shared FieldContexts.
5. Resonances form across contributions from different members.
6. Owner or ADMIN can manage membership (add/remove members, change roles).

---

## WF-09 — Data Import

**Actor:** Authenticated User

1. User navigates to the import page.
2. Uploads a CSV or XLSX file.
3. System parses the file (Papa Parse for CSV, XLSX library for Excel).
4. Data mapped to GoalPost entities (Persons, Pulses, etc.).
5. Entities created in Neo4j with appropriate relationships.
6. Import status tracked and reported to user.

## WF-10 — Document Ingestion (FieldContext)

**Actor:** Authenticated User with `canEditContent` on the parent Space.

See PRD `docs/prd/document-ingestion.md` for the full spec and
`docs/adr/0001-doc-ingestion-dedicated-extraction-endpoint.md` /
`docs/adr/0002-document-node-and-blob-provenance.md` for rationale.

1. User uploads a `.txt` / `.md` / `.pdf` from the studio with a
   FieldContext focused (`uploadDocument` mutation / `POST /api/ingest/document`).
2. Server gates on `canEditContent`, extracts text, persists the blob,
   creates a Document node anchored to the FieldContext via `HAS_DOCUMENT`
   and to the uploader via `UPLOADED_BY`.
3. A dedicated extraction model (independent of the chat assistant; may
   be reasoning — `kb/07-ai-assistant-ux.md` Rule 6) reads the text
   alongside the FieldContext roster and proposes Persons + FieldPulses.
4. A fresh ConversationThread titled `Ingest: <filename>` is created
   (`kind = 'ingest'`, `mode = 'default'`). The thread is linked back to
   the source Document via `HAS_INGEST_THREAD`.
5. A synthesized assistant turn is appended carrying pre-staged HITL
   write tool calls (matching the runtime HITL hash/shape). The chat
   panel auto-switches to the new thread.
6. User reviews the batch approval dialog and approves / edits / rejects.
   Approved tool calls flow through `executeAuthorizedWriteTool` — same
   path as manual creation, plus an `EXTRACTED_FROM` edge from each
   approved Person/FieldPulse back to the Document, and a `Log` per entity
   stamping `metadata.documentId` + `metadata.conversationThreadId`.
7. Re-extract reuses the stored blob + original hint and creates a new
   ingest thread. Delete removes the blob and Document node; extracted
   entities survive (their `EXTRACTED_FROM` edges drop with the Document).
8. Extracted pulses flow through the existing post-creation embedding and
   enrichment jobs (WF-05) and become eligible for daily resonance
   discovery (WF-06) without any ingest-specific pipeline.
