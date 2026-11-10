# Open-weight small language models for content import and canvas generation — evaluation (GOAL-381)

**Status:** Research recommendation for Robert, the GoalPost team and the MAP
team. **No app code, schema or migration has changed.** Written 2026-11-10.

**Recommendation in one line:** **Not yet** — don't swap the models behind
content import or canvas generation today. Run a two-week bake-off on GoalPost
documents first, with **Gemma 4 26B-A4B** as the model to beat and
**Qwen3.8-27B** as the quality reference. Fold that bake-off into the
graph-navigating agent design Robert asked us to assess (§6), not a plain
model swap. §7 has the reasons and what would turn this into a "go".

Requested by Robert Damashek. This responds to his comment on the ticket: *"It
will require a shift in approach from simply replacing the LLM with an SLM … I'm
not approving this until we put some effort towards that."* Sections §6 and §7
are the response to that.

> **What this document did and did NOT measure.** The baseline (§2) comes from
> GoalPost's own usage metering on dev, so its token and cost figures are real.
> The open-weight figures (§4, §5) use published Apache-2.0 model cards and
> today's hosted list prices. **This pass did not run any of the three models
> on GoalPost documents.** The research box has no GPU, and the repo has no key
> for a hosted open-weight API. So the quality sections (§3) assess *risk
> against GoalPost's exact output contract*. They are not scores. Codefoundry
> Labs' earlier tested report (the claude.ai artifact linked on the ticket)
> requires a login and could not be read here. If it holds measured outputs,
> those outrank §3, and the two should be merged before the MAP review.

---

## 1. What "content import" and "canvas generation" are in GoalPost today

There are three model-driven jobs. Contact Import (WF-14) is deterministic
column mapping with no model, so it is out of scope.

| Job | Where | Model today | What it must produce |
| --- | --- | --- | --- |
| **Document extraction** (content import) | WF-10 Document Ingestion; WF-11 Bulk Article Import reads each fetched article through the same pipeline (GOAL-344). `src/lib/ingest/extraction-model-invoker.ts`, `extraction-schema.ts` | **Gemini 2.5 Pro** for PDFs and images (multimodal, reads the file by presigned URL). **gpt-5.4** for `.txt`/`.md`/Office text. Env: `*_INGEST_EXTRACTION_MODEL` | One strict nested JSON object (`ExtractionSchema`, ~25 fields): Persons (first *and* last name, or skipped), Organizations, and Goal/Resource/StoryPulses with type-specific fields (`status`, `horizon`, `resourceType`, `intensity` …). Per pulse it also gives the author and the related people/orgs, each with a free-text relationship label that becomes the edge caption on the Bloom canvas (GOAL-362). It must **dedupe against the FieldContext roster** that is inlined in the prompt (`update_*` with the roster id instead of `create_*`), and dedupe within the document. |
| **Document summary** | `src/lib/ingest/document-summarizer.ts` | Same vendor split (Gemini 2.5 Pro / gpt-5.4). Env: `*_INGEST_SUMMARY_MODEL` | A one-paragraph synopsis plus up to 5 concept phrases (`generateObject`). Failure is non-fatal. |
| **Canvas generation** | The assistant's Bloom tool, `generateAndRunForBloom` → `src/lib/cypher-generator/` | **gpt-5.4** (the assistant model, `getAssistantModelId`) | One **read-only Cypher query** plus a plain-English one-line label, from a natural-language intent. It gets a ~10K-token schema doc (`SCHEMA_DOC`), the active Space/FieldContext and the entities already on the canvas. `validate.ts` rejects writes, unlabelled nodes and queries without the user anchor, and feeds the reason back for **one retry**. Then it gives up with a friendly, id-free message (kb/07 Rule 1). |

Every write from extraction goes through `executeAuthorizedWriteTool`, the same
authorization and `:Log` path that manual creation uses. Each entity gets an
`EXTRACTED_FROM` edge to its Document (ADR-015). Any replacement must keep that
path. A model only *proposes*; GoalPost writes.

## 2. Baseline — what these jobs cost and emit today (measured)

Source: `:LlmUsage` nodes in **dev** Neo4j (GOAL-297 metering), 2026-07-21 →
2026-09-11. Prod could not supply this. The prod MCP still points at the legacy
pre-migration graph, which has no `LlmUsage` label. Dev traffic is test and demo
use, so treat the *per-call* figures as representative and the *volume* as a
floor.

| Job | Model | Calls | Avg input tok | Avg output tok | p90 in / out | Cost per call |
| --- | --- | ---: | ---: | ---: | --- | ---: |
| Document extraction | gemini-2.5-pro | 93 | 8,145 | 4,835 | 12,189 / 7,491 | **$0.059** |
| Document summary | gemini-2.5-pro | 93 | 1,463 | 976 | 1,700 / 1,353 | **$0.012** |
| Canvas generation (cypher-gen) | gpt-5.4 | 12 | 10,003 | 487 | 9,807 / 1,027 | **$0.017**¹ |

- **One ingested document costs ≈ $0.07 end to end.** All 93 dev ingests
  together cost **$6.52**. That is about 54 documents a month, or roughly
  **$4/month**.
- Most of an extraction prompt is the **inlined FieldContext roster**, not the
  document. That matters for §6: the prompt grows with the size of the field,
  not just the size of the file.
- Output is large because Gemini 2.5 Pro is a reasoning model. Billed
  completion tokens include its thinking.

¹ `src/lib/llm/pricing.ts` prices gpt-5.4 at $1.25 / $10 per M tokens. Today's
list price (OpenRouter catalogue, 2026-11-10) is **$2.50 / $15**, so actual
canvas-generation spend is closer to **$0.032 per call**. See follow-ups.

**Quality baseline.** In practice it is defined by the contract in §1 and by
the behaviour members already accept. Extraction returns schema-valid JSON on
the first try. Roster dedup works, and re-extract dedupes rather than doubling
up. Partial names are skipped. Relationship labels read like a person wrote
them. Canvas generation usually passes the validator on the first or second
attempt. **No gold-labelled extraction set exists yet.** The 93 dev documents
behind the metering have since been deleted, so their extracted entities are
not available as a reference. Building that set is step 1 of the bake-off (§8).

## 3. The three candidates

All three are open-weight under **Apache-2.0** (licence and parameter counts
were read from each Hugging Face model card on 2026-11-10). All three support
structured (JSON-schema) output through standard servers (vLLM, Ollama,
llama.cpp) and through hosted OpenAI-compatible APIs.

| | **Gemma 4 26B-A4B-it** (Google) | **Qwen3.8-27B** (Alibaba Qwen) | **gpt-oss-20b** (OpenAI) |
| --- | --- | --- | --- |
| Size | 25.8B total, mixture-of-experts, ~4B active per token | 27.8B dense | 20.9B total, mixture-of-experts, ~3.6B active |
| Input | Text + images | Text + images | **Text only** |
| Context | 256K | 256K–1M (provider-dependent) | 128K |
| Why it's on the list | The cheapest and fastest model that can still *see* a PDF page. Small enough to run on one 24 GB GPU at 4-bit. | The most-downloaded open model at this size on Hugging Face. It is the model Pleias's graph agent ran on (§6), so it is the natural reference for the agent approach. | Lowest cost. Fits in 16 GB. Same vendor family as today's gpt-5.4 assistant, with the same prompt and tool-calling conventions. |

Excluded: the Qwen3.8 small sizes (1.7B–14B) are not publicly downloadable;
their HF repos return 401. Qwen3.8-Flash-Next (180B) and Mistral Large 4 are
not small. Phi-4 / Mistral Small 3.x are a generation behind the three above.
Pleias's own RAG models (350M–1B) are built for cited question answering, not
for producing GoalPost's extraction schema.

### Output quality vs. today — risk against GoalPost's contract (not measured)

| Contract requirement | Today (Gemini 2.5 Pro / gpt-5.4) | Gemma 4 26B-A4B | Qwen3.8-27B | gpt-oss-20b |
| --- | --- | --- | --- | --- |
| Schema-valid nested JSON | Reliable | Likely fine *with* constrained decoding (vLLM/Ollama JSON-schema mode). Without it, expect some invalid output. | Likely fine | Likely fine (trained on structured tool output) |
| Read PDFs as-is (layout, tables, scans) | Gemini multimodal reads the file | Must rasterize pages to images ourselves. Weaker on long multi-page documents. | Same as Gemma, but stronger | **Can't.** It would fall back to the existing `pdf-parse` text branch and lose scanned PDFs and table layout. |
| Roster dedup (match by id, not create a duplicate) | Good | **Highest risk.** A ~4B-active model matching against a long inlined roster is where small models slip. | Moderate risk | High risk |
| Partial-person rule, org-vs-person routing, pulse-type allowlist | Good (server also enforces the allowlist) | Moderate | Low–moderate | Moderate |
| Human-sounding relationship labels and summary | Good | Good | Good | Adequate |
| Canvas generation (text → Cypher over a 10K schema doc) | Usually passes in ≤ 2 attempts | **More "couldn't find that" fallbacks.** The validator keeps it *safe*, not *correct*. | Closest to today | More fallbacks |

**Net:** Qwen3.8-27B is the only candidate likely to be close to today's
quality across all three jobs. Gemma 4 26B-A4B is likely good enough for
**summaries** and plausibly for **extraction from short text**. Dedup and
canvas generation are where it has to prove itself. gpt-oss-20b is ruled out
for the PDF path unless we accept losing scanned and table-heavy documents.

## 4. Running cost

### 4a. Same token volume, hosted open-weight API (list prices, OpenRouter, 2026-11-10)

Assumes each model emits about as many tokens as today's baseline. Reasoning
modes can change that either way.

| Per… | Today | Gemma 4 26B-A4B ($0.08 / $0.10 per M) | Qwen3.8-27B ($0.15 / $1.875 per M) | gpt-oss-20b ($0.03 / $0.13 per M) |
| --- | ---: | ---: | ---: | ---: |
| Document (extract + summary) | $0.070 | **$0.0014** | **$0.012** | **$0.0010** |
| Canvas generation call | $0.017–0.032 | $0.0009 | $0.0024 | $0.0004 |
| Month at today's dev volume (~54 docs) | ~$4 | < $0.10 | ~$0.65 | < $0.10 |
| Month at 1,000 docs | ~$70 | ~$1.40 | ~$12 | ~$1 |

Hosted open-weight cuts the per-document cost by **6× (Qwen) to 50–70×
(Gemma / gpt-oss)**. But the absolute saving at GoalPost's real volume is
**single-digit dollars a month**. Hosting also *doesn't* improve data
sovereignty. Member documents still leave for a third-party inference provider,
and a routing service may spread them over several providers unless we pin one
and require zero data retention.

### 4b. Self-hosted — the only option that keeps documents in our own infrastructure

GPU list prices, late Oct 2026 (RunPod pods / Modal serverless). These are
estimates, so re-check before budgeting.

| Setup | Fits | Approx. cost |
| --- | --- | --- |
| Always-on **L4 24 GB** pod (~$0.39/h) | Gemma 4 26B-A4B (4-bit), gpt-oss-20b | **~$285 / month** |
| Always-on **L40S 48 GB** pod (~$0.79–0.99/h) | Qwen3.8-27B (FP8), or any of the three | **~$580–720 / month** |
| Always-on **H100 80 GB** (~$2–2.70/h) | Qwen3.8-27B with headroom (what Pleias used) | ~$1,450–1,950 / month |
| Serverless per-second (Modal L4 ~$0.80/h, L40S ~$1.95/h) | Any | ≈ $0.01–0.02/doc for the MoE models; **≈ $0.05–0.11/doc for Qwen 27B** at ~5.8K output tokens. Cold starts of 30–90 s land on the one-minute ingest cron, which is acceptable for the async queue but not for canvas generation in chat. |

**Break-even vs today's ~$0.07/doc:** an always-on L4 pays for itself at around
**4,000 documents a month**, and an L40S at around **8,000–10,000**. GoalPost
is two to three orders of magnitude below that. **On cost alone, self-hosting
is a net increase**, roughly $285–720 a month instead of about $4.

## 5. Where each model would run

GoalPost is a single Next.js app on Vercel. Vercel functions can't host a GPU
model, so every option is an extra service the app calls. The AI SDK already
supports this. `@ai-sdk/openai` accepts an OpenAI-compatible `baseURL` (vLLM,
llama.cpp server, OpenRouter, Together…). `ollama-ai-provider-v2` is already in
`package.json`, though nothing imports it yet. The extraction and summary
clients are dependency-injected (`ExtractionModelClient`,
`DocumentSummarizerClient`), so a bake-off needs **no change to the pipeline**,
only a new client factory behind an env var.

| Model | Pilot | Production option A — hosted | Production option B — sovereign |
| --- | --- | --- | --- |
| Gemma 4 26B-A4B | OpenRouter / any hosted provider, or Ollama on a dev workstation with a 24 GB GPU | Hosted provider, pinned, with zero data retention | vLLM on one L4 / L40S (RunPod, Modal, or an EU host), called from the ingest cron worker |
| Qwen3.8-27B | Hosted provider | Hosted provider | vLLM FP8 on one L40S or H100 |
| gpt-oss-20b | Hosted provider, or Ollama on a 16 GB GPU or Apple-silicon laptop | Hosted provider | vLLM / llama.cpp on one L4 (text documents only) |

Content import is a **background job** (the cron worker claims PENDING
documents and article-import jobs), so it tolerates a remote, slow or
cold-starting model well. **Canvas generation is interactive** (inside a chat
turn) and is the least forgiving of cold starts. It should move last, if at all.

## 6. Robert's steer: a graph-navigating agent, not an LLM→SLM swap

Robert asked us to assess the approach in the article he shared, the attached
research list ("Progress towards semantic knowledge graph plus SLM") and
Semantica, rather than a like-for-like swap.

**The article** is Pleias' *"An RLM agent for searching Wikidata, and the
traces to train on it"* (Oct 5 2026, with AI-BRIDGES / University of London;
paper arXiv:2610.06650, code `github.com/aibridges/RLM_Wikidata`, 10,235 traces
on Hugging Face). The model doesn't paste graph results into its context.
Instead it works the graph *through code*: 13 graph functions, intermediate
results kept as variables, and only the needed evidence sent to sub-calls.
Self-reported result: **Qwen3.8-27B on one H100 answered 74/100 questions (28/50
multi-hop), ahead of a frontier tool-calling agent (61/100)**, at about $0.04
per question. Two caveats matter for us. The "small" part is still a plan: the
traces are released *so that* SLMs can be fine-tuned on them, and no SLM
results are published yet. And the task is *question answering over an
existing graph*.

**How it maps onto GoalPost:**

1. **Canvas generation is the best fit, and GoalPost is already halfway there.**
   Today one call writes one Cypher query from a 10K-token schema doc. The
   agent version would let the model call a small set of *GoalPost-owned*,
   Space-scoped graph functions (find a person/pulse in this field, expand
   one hop, follow resonance…) and pick the result, instead of writing raw
   Cypher. That is a *smaller* job per step, which is exactly what makes a
   small model viable. It also removes the most common small-model failure,
   wrong Cypher. **Constraint:** authorization stays in `execute.ts` and the
   graph functions (ADR-003). The model must never run its own code against
   Neo4j. Pleias's harness runs model-written Python, and we should not copy
   that part.
2. **Content import benefits in one specific place: dedup.** Extraction
   *writes* the graph from unstructured text, so a graph-reading agent can't
   replace it. But the most expensive and riskiest part of today's prompt is
   the **inlined roster**. An extractor that *looks up* "is there already a
   Maria Lopez in this field?" through a function, instead of reading the whole
   roster, keeps the prompt small as fields grow. It also turns roster dedup —
   the job where small models do worst (§3) — into a lookup. This is the
   change that would make Gemma-class models realistic for extraction.
3. **Training our own small model on our own traces is the long-term
   sovereignty path**, the same move Pleias is making. GoalPost already logs
   every extraction as an ingest `ConversationThread` with its tool calls.
   With member consent, and only from Spaces whose members agree, those runs
   are training data. That conversation belongs with the MAP team, because it
   is a data-governance decision before it is a technical one.

**Semantica** (`github.com/semantica-agi/semantica`, MIT, Python, v0.7.0, ~14.5K
GitHub stars, actively maintained) is a Python semantic-layer toolkit. It
covers ingestion, entity extraction and resolution, provenance, GraphRAG, an
MCP server, Neo4j as a supported store, and any model through LiteLLM/Ollama.
**It does not fit as a drop-in.** It would be a second, Python write path into
Neo4j that bypasses `executeAuthorizedWriteTool`, `:Log` activity logging,
`@authorization`, `EXTRACTED_FROM` provenance and GoalPost's own OWL ontology,
all of which are mandatory here. **Where it could fit:** a read-only or
sandboxed pilot against the **demo** database, to benchmark its entity
resolution against our roster dedup, or to borrow its dedup method. Its writes
would still have to flow back through GoalPost's tools. Their small-pilot offer
is worth taking up on those terms only.

**The attached research list** (RANGER arXiv:2610.28010, Think-on-Graph,
LeanRAG arXiv:2508.10391, GNN+SLM hybrids). The arXiv entries checked out. All
of them point the same way as above: small models do well when the *graph
does the navigation* and the model judges a local neighbourhood at each step.
None of them is a component we could adopt as-is. They support the direction
in point 1 more than any specific product.

## 7. Recommendation — **not yet**

Do **not** replace the models behind content import or canvas generation today,
for these reasons:

1. **Cost isn't the problem we would be solving.** Today's spend is about
   $0.07 per document and a few dollars a month. Hosted open-weight saves a few
   dollars and doesn't change where member data goes. Self-hosting, the only
   option that improves sovereignty, *raises* cost by $285–720 a month until
   volume grows about 100×.
2. **Quality on GoalPost's contract is unproven, and the contract is the hard
   part.** Strict nested JSON, roster dedup, the partial-person rule and PDFs
   read as-is are where small models are weakest. Of the three, only
   Qwen3.8-27B is plausibly at parity, and it is the most expensive to host.
   No gold-labelled set exists to prove it either way.
3. **Robert's direction changes what we should test.** A plain swap tests the
   wrong thing. The approach most likely to make a *small* model work here is
   the agent pattern in §6: function-based roster lookup for extraction, and
   Space-scoped graph functions instead of raw Cypher for canvas generation.
   But published evidence for *small* models in that pattern doesn't exist
   yet. Pleias used a 27B model on an H100, and its SLM fine-tunes are "next".
4. **Semantica can't take over the write path** without breaking GoalPost's
   authorization, activity-log and provenance rules. It is a pilot, not a
   replacement.
5. **The real reason to move is data sovereignty**, which is GoalPost's core
   principle. That is a deliberate infrastructure and governance decision
   (who runs the GPU, where, whose consent covers training) to make *with the
   MAP team*. A model swap shouldn't make it implicitly.

**What turns this into a "go":** in the bake-off (§8), **Gemma 4 26B-A4B**
matches today on ≥ 95% schema-valid first attempts, ≥ 90% of today's entity
recall, and no more duplicates than today on roster-matched documents; **and**
the MAP conversation decides that self-hosting for sovereignty is worth about
$285/month. If Gemma misses and **Qwen3.8-27B** clears the bar, the pick
becomes Qwen on one L40S at about $600–700/month. Then the question is purely
whether sovereignty is worth that.

## 8. Proposed next step — a two-week bake-off (for the MAP review)

1. **Gold set.** 20–30 real documents (PDF, text, article URLs) across 3–4
   FieldContexts with existing rosters. Run today's pipeline and have a human
   correct the output. That corrected output is the baseline the ticket asks
   for.
2. **Plain swap, all three models.** Add an env-selected OpenAI-compatible
   client (hosted provider first, no GPU needed) behind the existing
   `ExtractionModelClient` / `DocumentSummarizerClient` injection points. Score
   schema validity, entity precision/recall, dedup errors, label quality
   (blind human rating), latency and cost.
3. **Agent variant, best two models.** The same extraction, but roster lookup
   is a function call instead of an inlined roster. For canvas generation,
   replay 30 real assistant intents against 5–8 Space-scoped graph functions.
4. **Write up the numbers** in place of §3's risk ratings, and bring them to the
   MAP discussion together with the sovereignty and training-data question.

---

### Sources

- GoalPost: `kb/03-workflows.md` WF-10 / WF-11, `kb/06-adr.md` ADR-014/015/018/019,
  `src/lib/ingest/*`, `src/lib/cypher-generator/*`, `src/lib/llm/{factory,pricing}.ts`,
  dev `:LlmUsage` metering (queried 2026-11-10).
- Model cards (licence, size, modality): huggingface.co/google/gemma-4-26B-A4B-it,
  huggingface.co/Qwen/Qwen3.8-27B, huggingface.co/openai/gpt-oss-20b.
- Hosted prices: openrouter.ai/api/v1/models (2026-11-10).
- GPU prices: RunPod / Modal published rates as aggregated by
  northflank.com/blog/runpod-gpu-pricing and spheron.network (late Oct 2026).
- Pleias, "An RLM agent for searching Wikidata, and the traces to train on it",
  pleias.ai/blog/rlm-for-wikidata (2026-10-05); arXiv:2610.06650.
- Semantica: github.com/semantica-agi/semantica; pypi.org/project/semantica (0.7.0).
- Attached "Progress towards semantic knowledge graph plus SLM.docx";
  arXiv:2610.28010 (RANGER), arXiv:2508.10391 (LeanRAG).
