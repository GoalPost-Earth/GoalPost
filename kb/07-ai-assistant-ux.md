# AI Assistant UX Conventions

Required reading before touching any code that:

- Shapes what the assistant says (`src/lib/simulation/system-prompts.ts`, `src/lib/simulation/session-context-prompt.ts`)
- Defines or modifies assistant tools (`src/lib/simulation/chat-tools.ts`, `src/lib/chat/hitl.ts`)
- Builds, resolves, or sends the assistant request body (`src/app/api/chat/simulation/route.ts`, `src/components/studio/studio-shell.tsx`, `src/components/simulation/AidenSimulationChat.tsx`)
- Adds a new chat surface, voice surface, or other LLM-facing entry point
- Routes graph entities through any prompt, tool result, or model output

The rules here exist to prevent specific bugs that have already shipped to users once. Do not regress them.

---

## Rule 1 — The model speaks to humans. Internal artifacts must never appear in chat.

**The bug this prevents:** "You're currently in space ID: `me_a87c5bf1-6ab3-42f6-bb61-14d5e884fda4`."

**What is forbidden in user-facing assistant output:**

| Forbidden token in chat       | Use instead                                       |
| ----------------------------- | ------------------------------------------------- |
| Raw entity ids (`me_...`, `ws_...`, `ctx_...`, `pulse_...`, person UUIDs) | Human-readable name (`activeSpace.name`, `focalEntity.label`, etc.) |
| `__typename` (e.g. "GoalPulse")                                          | A user-facing label ("goal", "resource", "story") |
| Internal flags (`approvalRequired`, `pendingApproval`, hash strings)     | Approval is a UI concern, not chat copy           |
| Cypher fragments, Neo4j labels, GraphQL field names                      | Plain English                                     |
| Embedding vectors, scores, raw confidence floats                         | Qualitative phrasing ("strong resonance", "loose match") |

**Where the rule is enforced today:**

- `src/lib/simulation/session-context-prompt.ts` — emits an unconditional "NEVER expose raw IDs" directive in every SESSION CONTEXT block.
- `src/lib/simulation/system-prompts.ts` — every mode (default / Aiden / Braider) has a numbered rule (#11 or #12) repeating the prohibition.

**If you add new mode prompts or rewrite an existing one,** the rule must survive. Search for `NEVER expose raw IDs` before merging and confirm it still renders for every mode.

---

## Rule 2 — Pair every id in SESSION CONTEXT with a resolved name.

The model regurgitates whatever it sees. If the prompt block carries only `activeSpaceId: me_a87c5bf1-...`, the model has nothing else to say and will leak the id. Always resolve names server-side before the prompt is assembled.

**Today's resolver:** `src/lib/simulation/session-context-resolve.ts` reads `Space.name` + space subtype + `FieldContext.title` by id and feeds them to `buildSystemPromptWithSessionContext` as `spaceName` / `spaceType` / `fieldContextTitle`. Output looks like:

```
- activeSpaceId: me_a87c5bf1-...
- activeSpace.name: My MeSpace
- activeSpace.type: MeSpace
- activeFieldContextId: ctx_...
- activeFieldContext.title: Care Practices
```

**When you add a new id to SESSION CONTEXT, you MUST also resolve and emit its human-readable name in the same block.** Adding an id alone is a regression of this rule.

**Equally important: every id you emit must reflect the user's *actual current navigation*, not a cached default.** For example, the user's `meSpaceId` is cached in localStorage so the navbar can link to it — that does not mean the user "is in" their MeSpace. The user is in their MeSpace only when the route resolves to one, or when their focal entity is one. Do NOT fall back to cached ids; an absent `activeSpaceId` is a load-bearing signal that the user is on a neutral surface.

**Important:** the resolver intentionally does **not** bind to `$userId` — it trusts upstream route auth. Its `RETURN` is therefore limited to name/title/subtype. **Do not add descriptions, pulse counts, related-people fields, or anything else to that RETURN without re-introducing a `$userId`-bound auth check.** See the inline comment in `session-context-resolve.ts` for the constraint.

---

## Rule 3 — Tool results carry both id AND human label.

When you write a new assistant tool (in `src/lib/simulation/chat-tools.ts` or anywhere consumed by the assistant), the result object MUST include a human-readable name field whenever it references a graph entity. **Returning bare ids forces the model to either pass them through to the user (Rule 1 violation) or make an extra round-trip tool call.**

**Good:**

```ts
return { found: true, spaces: [{ id, name, description, type }, ...] }
```

**Bad:**

```ts
return { found: true, spaceIds: ['me_...', 'ws_...'] }
```

This applies equally to error returns. When a tool fails on an entity, the error message MUST reference the entity by name, not by id ("Could not find Field Care Practices" — not "Could not find ctx_...").

---

## Rule 4 — `get_focal_entity` is conditional. Tools whose only useful path requires a session field MUST NOT register without that field.

The model will call any tool whose description matches its current intent. If a tool's only useful path requires session state that is absent, **do not register the tool**. The model cannot misfire on a tool that isn't in its tool list.

**Today's pattern:** `get_focal_entity` is included in `buildSimulationChatTools`'s return object only when `ctx.focalEntity` is non-null (see the conditional spread in `src/lib/simulation/chat-tools.ts`). On neutral surfaces (dashboard root, `/graph`, `/assistant`) the tool simply doesn't exist for the model.

**Apply the same pattern to any future tool** whose existence is only meaningful in a specific session state.

---

## Rule 5 — All write tools route through HITL approval.

`src/lib/chat/hitl.ts` is the canonical approval gate. Every write tool must:

1. Use `runWriteTool(toolName, args, ctx)` inside its `execute` (see existing patterns in `chat-tools.ts`).
2. Be listed in the `WriteToolName` union in `src/lib/chat/hitl.ts` AND wired into `executeAuthorizedWriteTool`'s dispatch.
3. Include a clear `describeWriteAction` clause so the approval Dialog renders human-readable copy (which itself must follow Rule 1 — no ids in the description).

**Never bypass this gate.** Calling `updatePulse(graph, input)` directly from a tool's execute (instead of via `runWriteTool('update_pulse', ...)`) means the user never sees an approval prompt and the audit chain is broken.

**Read-only suggestion surfaces are ALSO a HITL gate.** `suggest_pulses` and `suggest_connections` never write — they return conversation-derived candidates for inline cards. The card's accept dispatches the matching write (`create_person` / `create_pulse` / `create_connection`) via the deterministic `executeActions` path, which re-authorizes server-side. So the card IS the gate: nothing is created until an explicit accept. Both tools are registered ONLY when a `FieldContext` is active (Rule 4) — people and the relationships between them live inside Fields, so on a neutral surface the model has no creation tools and the runtime prompt nudges the user to open a Field instead of writing prose.

**Relationships (`CONNECTED_TO`) are first-class writes.** The assistant can create person-to-person connections (`create_connection`) carrying a relationship `why`, and surface them proactively (`suggest_connections`). Separately, **every assistant-created person carries the user's relationship**: `create_person` accepts a `relationshipWhy` and, when provided, MERGEs a `CONNECTED_TO` edge from the current user to the new person in the same write. The approval/suggestion card ALWAYS surfaces a "Your relationship" field (an `alwaysShow` field in `approval-display.ts`, or an inline input on the person/connection card) — we always ask, but the user may leave it blank (the edge is then skipped). Like every other write, these route through `runWriteTool` and write an activity `Log` (the GraphQL `connection-resolver` does not log — the assistant path must).

---

## Rule 6 — Keep the chat model's reasoning low, and never let its deliberation reach chat.

**The bug this prevents:** reasoning models "think internally" and can (a) return empty text after a tool error, producing a silent assistant bubble, and (b) reject `temperature`. They can also narrate their own retry deliberation into visible text ("let me retry without the cap…"), leaking internal mechanics to the user (GOAL-296).

The current default is **`gpt-5.4`** — a reasoning model in the gpt-5 family, run at **`reasoningEffort: 'low'`** (`DEFAULT_ASSISTANT_MODEL` + `DEFAULT_ASSISTANT_REASONING_EFFORT` in `src/lib/llm/factory.ts`), routed through OpenAI's Responses API. Because it IS a reasoning model:

1. Do NOT pass `temperature` on the `streamText`/`generateText` call — tune via `providerOptions.openai.reasoningEffort` instead (the route already does this).
2. Keep the assistant-ui config from rendering `reasoning` parts in the bubble (they render invisibly by default — do not add a reasoning renderer without re-checking Rule 1).
3. Make tool failures return a clean, member-safe message (never a raw error the model can paraphrase into "limit/cap" copy) — see `toErrorResult` in `chat-tools.ts` and the `query_for_bloom` orchestrator in `cypher-generator/index.ts`. A model given raw internals WILL surface them.
4. System prompts must require at least one text part even when tool errors occur, so the UI bubble is never blank.

> Historical note: earlier revisions of this rule called gpt-5.4 "non-reasoning." That was inaccurate — it is a low-effort reasoning model. The invariant that matters is #1–#4 above, not the model's family.

---

## Rule 7 — `streamText` and `generateText` MUST set `stopWhen` for tool loops.

**The bug this prevents:** the model emits a tool call, the tool runs, the
stream stops without the model ever writing user-visible text. Blank bubble.

AI SDK v5's `streamText` (and `generateText`) default to
`stopWhen: stepCountIs(1)`. A "step" is one model invocation with optional
tool calls. After the first step finishes — even if it produced *only* a
tool call — the SDK stops. The model never gets a second step where it
would integrate the tool result and write text.

Every assistant route that registers tools MUST raise the step budget. The
current convention is `stopWhen: stepCountIs(8)` — enough headroom for a
handful of sequential tool calls plus the final text response:

```ts
const result = streamText({
  model,
  messages,
  system,
  tools,
  stopWhen: stepCountIs(8),
})
```

This applies equally to `generateText`. If you write a new chat route or a
non-streaming tool-using path, copy the same setting.

---

## Rule 8 — Pronoun resolution and focal shifts are runtime directives.

The pronoun-resolution rule ("call `get_focal_entity` when the user says 'this' AND focalEntity is in SESSION CONTEXT") and the soft-transition behavior ("acknowledge the move before grounding") are emitted by `buildSystemPromptWithSessionContext` **conditionally** on whether `focalEntity` and `previousFocalEntity` are present.

Do not move these directives into the static mode prompts — they'd fire on neutral surfaces where the tool isn't registered (per Rule 4). Keep them runtime-conditional.

---

## Rule 9 — `query_for_bloom`'s generator only knows the labels in `schema-context.ts`. New node/edge types must be whitelisted there or they are invisible.

**The bug this prevents:** the user asks "show the node *Enable use of generative AI…*" — a `PromiseWeave` node — and the assistant replies "I couldn't find any." The node exists and the user can see it, but the assistant's graph tool returned `found: false`.

The `query_for_bloom` tool generates Cypher with an LLM whose entire schema vocabulary is `src/lib/cypher-generator/schema-context.ts`. That file's `ALLOWED_LABELS` / `ALLOWED_RELATIONSHIPS` arrays do **double duty**:

1. They are injected into the generator's prompt (`SCHEMA_DOC`) — the model can only name labels/edges it has been told exist.
2. They are the validator's whitelist — any `:Label` or `[:REL]` token in generated Cypher that is **not** in these arrays is rejected before execution.

So a label/edge that exists in Neo4j but is absent from this file is doubly invisible: the generator won't emit it, and a lucky guess gets rejected. The tool returns `found: false` for every request about that entity type — a silent dead end, not an error.

**When you add a new node label or relationship type to the graph** (a migration, a new feature, a reified connector like `PromiseWeave`/`ResonanceLink`), update the generator in the SAME change:

1. Add the label to `ALLOWED_LABELS` and each edge to `ALLOWED_RELATIONSHIPS` in `schema-context.ts`.
2. Document the node (its props + the human-label field) and its edge directions in `SCHEMA_DOC`, and add an Intent-Glossary line in `cypher-generator/generate.ts` so the model knows what phrasing maps to it.
3. In `cypher-generator/execute.ts`, add a `NODE_STYLE` entry **and** an auth-anchor branch in `mapNodesToEnclosingSpaces` that maps the node to its enclosing Space — otherwise the post-execute `canViewContent` filter can't resolve a Space for it and silently drops it (fail-closed). Connector nodes anchor through their context edge, e.g. `(:PromiseWeave {id})<-[:HAS_WEAVE]-(:FieldContext)<-[:HAS_CONTEXT]-(:Space)`, mirroring how `ResonanceLink` anchors via `HAS_RESONANCE`.

Whitelisting an edge never bypasses authorization — node visibility is always re-gated by the Space post-filter in `execute.ts`. The whitelist only controls what the generator may *traverse*.

---

## Where to look when something goes wrong

| Symptom                                                              | Likely culprit                                                                  |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Assistant exposes a UUID                                             | New id added to SESSION CONTEXT without a paired name (Rule 2); or a tool returning bare ids (Rule 3) |
| Empty assistant bubble                                               | First check `stopWhen` on the route's `streamText`/`generateText` call — if it's missing or set to `stepCountIs(1)`, the model halts after a tool call without writing text (Rule 7). Then check Rule 6 (reasoning model + tool error) and Rule 4 (tool registered when its session state is missing). |
| Assistant asks "which space?"                                        | `activeSpaceId` not being sent in body (check the route's body resolver in `studio-shell.tsx` — `resolveBody`) |
| Assistant insists user is in a Space when they are on a neutral surface | Some fallback (e.g. a cached id in localStorage) is being treated as "active." `activeSpaceId` may ONLY come from the user's actual current navigation (a `MeSpace`/`WeSpace` focal entity, or a Space id present in the URL). Cached/owned ids are NOT the current Space. See the FocalEntityProvider — it intentionally has no `meSpaceId` fallback. |
| Write tool ran without user approval                                 | Tool execute bypassed `runWriteTool` and called the service directly (Rule 5)   |
| User sees `__typename` or `GoalPulse` strings                        | Static mode prompts leaking internal labels — Rule 1                            |
| Approval Dialog summary contains an id                               | `describeWriteAction` formatting an id; fix to use name (Rule 1 + Rule 3)       |
| Assistant says "couldn't find" a node/entity the user can clearly see | The node's label or an edge to it is missing from `cypher-generator/schema-context.ts` — `query_for_bloom` can neither name nor return it (Rule 9). Also check `execute.ts` has an auth-anchor branch for the label, or the Space post-filter drops it. |

---

## When adding a new assistant surface

Before merging:

- [ ] Every id in the request body has a paired name in SESSION CONTEXT (Rule 2)
- [ ] Every tool's result includes a human-readable name for any entity referenced (Rule 3)
- [ ] Conditional tools are only registered when their required session state is present (Rule 4)
- [ ] All write tools route through `runWriteTool` (Rule 5)
- [ ] Reasoning caveats #1–#4 handled — no `temperature`, reasoning parts stay unrendered, tool errors return member-safe copy, at least one text part on error (Rule 6)
- [ ] `streamText` / `generateText` calls set `stopWhen: stepCountIs(N)` with N high enough to cover tool-call → tool-result → text (Rule 7)
- [ ] System prompts still include the "NEVER expose raw IDs" rule (Rule 1)
- [ ] Manually test the path "what {entity} is this" — assistant must respond with a name, not an id

If your change touches Cypher (a new resolver, a new tool, etc.), dispatch the `cypher-reviewer` agent per the project's mandatory agent rules.
