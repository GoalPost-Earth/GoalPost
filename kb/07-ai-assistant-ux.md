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

---

## Rule 6 — Choose a non-reasoning model for the chat assistant.

**The bug this prevents:** reasoning models (e.g. `gpt-5.1`) "think internally" and can return empty text after a tool error, producing a silent assistant bubble. They also reject `temperature`.

For chat + tool-calling + HITL flows the default is **`gpt-5.4`** (agent-tuned, non-reasoning) — see `DEFAULT_ASSISTANT_MODEL` in `src/lib/llm/factory.ts`. If you have reason to bump to a reasoning model, do so deliberately and:

1. Remove `temperature` from the `streamText`/`generateText` call for reasoning paths.
2. Add a system-prompt requirement that the model emit at least one text part even when tool errors occur, so the UI bubble is never blank.

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

---

## When adding a new assistant surface

Before merging:

- [ ] Every id in the request body has a paired name in SESSION CONTEXT (Rule 2)
- [ ] Every tool's result includes a human-readable name for any entity referenced (Rule 3)
- [ ] Conditional tools are only registered when their required session state is present (Rule 4)
- [ ] All write tools route through `runWriteTool` (Rule 5)
- [ ] Model is non-reasoning unless you've handled the reasoning caveats (Rule 6)
- [ ] `streamText` / `generateText` calls set `stopWhen: stepCountIs(N)` with N high enough to cover tool-call → tool-result → text (Rule 7)
- [ ] System prompts still include the "NEVER expose raw IDs" rule (Rule 1)
- [ ] Manually test the path "what {entity} is this" — assistant must respond with a name, not an id

If your change touches Cypher (a new resolver, a new tool, etc.), dispatch the `cypher-reviewer` agent per the project's mandatory agent rules.
