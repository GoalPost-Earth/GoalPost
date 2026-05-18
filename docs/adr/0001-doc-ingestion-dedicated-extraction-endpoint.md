# Doc ingestion uses a dedicated extraction endpoint, not the chat route

Document ingestion (Build *document ingestion at the FieldContext level*) accepts uploads on the FieldContext page, runs an AI to extract Persons and FieldPulses, and lands the proposed creates/updates as pending HITL tool calls in the assistant chat. We considered routing the upload through the existing `POST /api/chat/simulation` as a synthesized user message so the chat assistant would handle both extraction and tool-call emission in one streamed turn. We instead chose to add a dedicated `POST /api/ingest/document` route: it loads the blob + the FieldContext roster, invokes its own model (free to be a reasoning model, free of the chat route's `stopWhen: stepCountIs(N)` budget and the Rule 6 non-reasoning default), and **synthesizes an assistant `ConversationTurn`** in the upload's fresh thread with pre-staged write tool-call parts that mimic the shape `runWriteTool` produces — so the existing HITL Dialog hydrates them as if the chat assistant had emitted them.

## Why

- **Model independence.** Extraction and chat have different ergonomics. Forcing extraction under the chat assistant's model choice and step budget would constrain it without benefit. A separate route lets the extraction model evolve independently.
- **Failure containment.** A malformed extraction is contained inside the ingestion endpoint and surfaced as a plain-text assistant turn; it cannot leave the chat assistant in a half-streamed state.
- **Re-extraction.** The "Re-extract on the Document" action becomes a simple re-invocation of the same endpoint, not a re-injection of a synthesized user message into chat.

## Consequences

- A "synthesized assistant turn" helper must construct `ConversationTurn.parts` containing pre-staged tool-call parts with the same `createApprovalHash` shape `runWriteTool` produces. Drift between the synthesized shape and the runtime HITL shape will silently break approval.
- The extraction model lives in its own factory entry, separate from `DEFAULT_ASSISTANT_MODEL` in `src/lib/llm/factory.ts`.
- The ingestion endpoint pre-loads the FieldContext roster server-side; the extraction model receives it inlined in its prompt and does **not** need read tools to discover what's in the context.
