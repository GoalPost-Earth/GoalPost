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

See ADR-014 (dedicated extraction endpoint) and ADR-015 (Document + blob storage + `EXTRACTED_FROM` edges) in `kb/06-adr.md` for rationale.

1. User picks a `.txt` / `.md` / `.pdf` from the studio with a
   FieldContext focused. The browser POSTs to
   `/api/ingest/document/presign` to get a short-lived presigned PUT URL,
   then uploads the file **directly to S3** (bytes never traverse our
   server). It then POSTs `/api/ingest/document/process` to trigger
   extraction. (The legacy GraphQL `uploadDocument` mutation has been
   removed — see ADR-015.)
2. The process endpoint gates on `canEditContent`, anchors a Document
   node to the FieldContext via `HAS_DOCUMENT` and to the uploader via
   `UPLOADED_BY`, and stamps the S3 `blobKey`.
3. A dedicated extraction model (independent of the chat assistant; may
   be reasoning — `kb/07-ai-assistant-ux.md` Rule 6) reads the document
   alongside the FieldContext roster (persons + pulses + **organizations**)
   and proposes Persons, Organizations, and FieldPulses — plus, per pulse,
   the people/orgs *related to* it (GOAL-298). PDFs route through Gemini
   multimodal via a freshly minted presigned GET URL (`file_data.fileUri`);
   `.txt`/`.md` route through OpenAI against the decoded body.
4. A fresh ConversationThread titled `Ingest: <filename>` is created
   (`kind = 'ingest'`, `mode = 'default'`). The thread is linked back to
   the source Document via `HAS_INGEST_THREAD`.
5. In parallel with the entity extractor, a separate **summarizer** model
   call produces a 1-paragraph synopsis + up to 5 concept phrases. Both
   are persisted on the Document node (`summary`, `concepts`). Failure is
   non-fatal — the upload still lands with empty values.
6. Every proposed tool call is **auto-executed** server-side via
   `executeAuthorizedWriteTool` — the same path manual creation uses.
   Auto-approve replaced the original HITL-gated flow because the upload
   itself already gates on `canEditContent` and the "upload + nothing
   happens until you click Approve" experience was the most common
   confusion point. Each created entity gets:
   - an `EXTRACTED_FROM` edge from the Person/Organization/FieldPulse to
     the Document,
   - one `:Log` row attributed to the uploader via `CREATED_BY`,
     stamping `metadata.documentId` + `metadata.conversationThreadId`.

   Tool calls run in the order persons → organizations → pulses →
   `link_entity_to_pulse` (MENTIONED_IN). The single pulse author is linked
   via `INITIATED_BY`; every other person/org the extractor named as related
   to a pulse is linked to it via `MENTIONED_IN`, with endpoints resolved by
   name/title from the entities created earlier in the same run. Attribution
   also rides on `update_pulse` (GOAL-318): when a re-extract or a second
   document matches an existing pulse, the write re-points `INITIATED_BY` at
   the credited author — but only when the pulse's current author is the
   acting uploader or absent, so corrected default attribution never steals
   authorship a different person already holds.
7. A synthesized assistant turn carries the **execution result** of each
   tool call (not a pending-approval payload). The chat panel auto-
   switches to the new ingest thread so the user sees a record of what
   ran, plus a one-line "Created N entities" header. Partial failures
   render per-row.
8. Re-extract reuses the stored blob + original hint, creates a new
   ingest thread, refreshes the summary + concepts, and auto-executes
   the new proposals. Delete removes the blob and Document node;
   extracted entities survive (their `EXTRACTED_FROM` edges drop with
   the Document).
9. Extracted pulses flow through the existing post-creation embedding and
   enrichment jobs (WF-05) and become eligible for daily resonance
   discovery (WF-06) without any ingest-specific pipeline.

### WF-10 v1 implementation constraints

- **Accepted formats.** `text/plain`, `text/markdown`, `application/pdf` only. Hard size cap ~20 pages / ~50K characters of extracted text. `.docx`, `.xlsx`, image OCR, and audio transcription are v2 candidates.
- **Pulse types extracted.** `GoalPulse`, `ResourcePulse`, `StoryPulse` only. `CarePulse` and `CoreValuePulse` remain manual-only (StoryPulse absorbs the legacy Care + CoreValue concepts).
- **Organizations are captured (GOAL-298).** Named organizations / groups / cooperatives are extracted as first-class `:Organization` nodes (`create_organization`), attached to the FieldContext via `HAS_ORGANIZATION`, and idempotent by name-within-context. Full first-class org modelling beyond upload-time capture (Living-System / LifeSensor sub-classes) is a follow-up.
- **Deduplication is in-extractor.** The process endpoint pre-loads the FieldContext roster (persons + pulses + organizations, projected to id + name + minimal context) and inlines it in the model prompt; the model emits `update_person` / `update_pulse` for roster matches rather than creating duplicates (orgs dedup at write time by name-in-context).
- **Partial persons are skipped.** `create_person` / `update_person` is emitted only when both `firstName` AND `lastName` can be confidently filled. First-name-only / initial-only / role-only mentions are listed in the assistant's free-text reply for manual follow-up — but a single-name mention that is actually an organization is routed to `organizations`, not dropped.
- **No auto-`CONNECTED_TO`.** Extraction does not create `CONNECTED_TO` edges between the uploader and extracted Persons. `EXTRACTED_FROM` records "this person came from a doc the user has"; `CONNECTED_TO` remains a deliberate user gesture.
- **Failure path.** On extraction failure (model error, malformed output, empty result), the synthesized assistant turn carries a plain-text "Extraction failed" / "Nothing to extract" message. The Document persists; re-extract is the uniform retry path.
- **Re-upload semantics.** Uploading the same file again creates a new `Document` node with its own ingest thread — no file versioning in v1.
