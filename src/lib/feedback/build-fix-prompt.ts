/**
 * Build a paste-ready Claude Code prompt for fixing a single bad
 * assistant turn captured in `AssistantFeedback`. The dev paste this
 * into a fresh Claude Code session (or the same project's editor) and
 * the model has enough grounding to diagnose + implement + verify.
 *
 * The prompt is intentionally opinionated:
 *   - Tells the model WHERE to look based on the classification.
 *   - Forces it to read the relevant `kb/` rules before touching code.
 *   - Specifies the verification step so it doesn't claim "done" without
 *     reproducing the original question.
 */

import type { AssistantFeedbackRow } from './assistant-feedback.service'

interface FixHint {
  /** Files most likely to contain the root cause. */
  files: string[]
  /** Short directive describing what kind of change is usually needed. */
  guidance: string
}

const CLASSIFICATION_HINTS: Record<string, FixHint> = {
  raw_id_leak: {
    files: [
      'src/lib/simulation/system-prompts.ts (mode-specific prompts)',
      'src/lib/simulation/chat-tools.ts (tool result shapes — Rule 3)',
      'src/lib/simulation/session-context-prompt.ts',
    ],
    guidance:
      'Find the source: either the tool returned a bare id (fix the tool result shape per Rule 3 — pair every id with a name), or the prompt rule was missing/weak (tighten the mode prompt per Rule 1). Prefer fixing tool result shape — the prompt is a secondary defense.',
  },
  prompt_rule_violation: {
    files: [
      'src/lib/simulation/system-prompts.ts',
      'kb/07-ai-assistant-ux.md (the canonical rules)',
    ],
    guidance:
      'Tighten the relevant mode prompt to make the broken rule unambiguous, then add a verification line that demonstrates the rule survives on the original question.',
  },
  missing_tool: {
    files: [
      'src/lib/simulation/chat-tools.ts (add a new tool here, registered in buildSimulationChatTools)',
      'src/lib/chat/hitl.ts (only if the new tool is a write tool — must route through runWriteTool)',
    ],
    guidance:
      'Identify what data the model needed but could not reach. Add a new read tool (or a write tool gated through runWriteTool per Rule 5). Tool results MUST include human-readable names alongside any ids (Rule 3).',
  },
  wrong_tool: {
    files: [
      'src/lib/simulation/chat-tools.ts (look at the tool descriptions)',
      'src/lib/simulation/system-prompts.ts (look at tool-selection guidance)',
    ],
    guidance:
      'Disambiguate the wrong tool from the right one. Usually the fix is sharpening the wrong tool\'s description (when to NOT use it) or the right tool\'s description (when TO use it). Avoid duplicating logic across tools.',
  },
  hallucination: {
    files: [
      'src/lib/simulation/system-prompts.ts (look for "ground" / "facts" directives)',
      'src/lib/simulation/chat-tools.ts (does the model have enough tools to answer this without making it up?)',
    ],
    guidance:
      'Hallucination is usually the absence of a tool combined with a too-helpful prompt. Either add the tool that grounds the claim, or add an explicit "say you don\'t know" directive to the mode prompt for that domain of questions.',
  },
  tone_issue: {
    files: [
      'src/lib/simulation/system-prompts.ts (the mode-specific prompt)',
    ],
    guidance:
      'Adjust the voice in the relevant mode prompt. Be specific about register (e.g. "warm but concise; never confessional"). Test against the captured question to confirm the change holds.',
  },
  off_topic: {
    files: [
      'src/lib/simulation/system-prompts.ts',
      'src/lib/simulation/session-context-prompt.ts',
    ],
    guidance:
      'The model answered a different question than the one asked. Usually a prompt fix: add an explicit "restate the user\'s question before answering" or strengthen the focal-entity grounding rules.',
  },
  partial_answer: {
    files: [
      'src/lib/simulation/system-prompts.ts',
      'src/lib/simulation/chat-tools.ts (was the model out of tool budget?)',
    ],
    guidance:
      'Partial answers often come from `stopWhen: stepCountIs(N)` being too low for the question shape. Confirm the tool-call loop completed; if not, raise the budget for that mode. If it did complete, the prompt needs a "answer the full question, not just part" reinforcement.',
  },
}

const AUTO_SIGNAL_HINTS: Partial<Record<string, FixHint>> = {
  empty_text: {
    files: [
      'src/app/api/chat/simulation/route.ts (check stopWhen + model choice — kb/07 Rules 6 & 7)',
      'src/lib/llm/factory.ts (the DEFAULT_ASSISTANT_MODEL)',
    ],
    guidance:
      'Empty bubble = the model produced no text part. Causes: stopWhen too low (the loop halted after a tool call without a follow-up step), reasoning model returning empty text after a tool error, or a streaming abort. Diagnose by reproducing the question and looking at the captured `responseParts`.',
  },
}

function hintFor(row: AssistantFeedbackRow): FixHint | null {
  if (row.classification && CLASSIFICATION_HINTS[row.classification]) {
    return CLASSIFICATION_HINTS[row.classification]!
  }
  if (row.autoSignal) {
    // Match either the exact code or the prefix (e.g. `tool_error:search_person`).
    const direct = AUTO_SIGNAL_HINTS[row.autoSignal]
    if (direct) return direct
    if (row.autoSignal.startsWith('tool_error:')) {
      const toolName = row.autoSignal.slice('tool_error:'.length)
      return {
        files: [
          `src/lib/simulation/chat-tools.ts — find the \`${toolName}\` tool implementation`,
          'src/lib/chat/hitl.ts (only if it\'s a write tool)',
        ],
        guidance: `The \`${toolName}\` tool threw. Read its implementation, the captured tool args + error in \`responseParts\`, and identify whether the failure is the tool's bug or bad input from the model. Fix the underlying issue, not the symptom.`,
      }
    }
    if (row.autoSignal === 'rule_1_raw_id_leak' || row.autoSignal === 'rule_1_uuid_leak') {
      return CLASSIFICATION_HINTS.raw_id_leak
    }
  }
  return null
}

function fence(content: string | null | undefined, language = ''): string {
  const safe = (content ?? '').toString()
  return ['```' + language, safe, '```'].join('\n')
}

function truncateParts(parts: unknown[] | null, maxChars = 6000): string {
  if (!parts || parts.length === 0) return '(no tool calls)'
  const json = JSON.stringify(parts, null, 2)
  if (json.length <= maxChars) return json
  return (
    json.slice(0, maxChars) +
    `\n\n… (truncated ${json.length - maxChars} more chars)`
  )
}

/**
 * Build the markdown Claude-Code prompt for a single feedback row.
 *
 * The output is paste-ready — the caller does not need to wrap it. It
 * includes the failure record, the relevant `kb/` files to read, fix
 * hints based on classification + auto signal, and a verification step.
 */
export function buildFixPrompt(row: AssistantFeedbackRow): string {
  const hint = hintFor(row)

  const verdictLines = [
    row.classification ? `- Classification: \`${row.classification}\`` : null,
    row.classificationReason
      ? `- Classifier reason: ${row.classificationReason}`
      : null,
    row.ruleViolated ? `- Rule violated: \`${row.ruleViolated}\`` : null,
    row.autoSignal ? `- Auto signal: \`${row.autoSignal}\`` : null,
    `- Source: \`${row.source}\``,
    `- Rating: \`${row.rating}\``,
    `- Mode active when this happened: \`${row.mode}\``,
    row.cluster ? `- Cluster: \`${row.cluster}\` (other feedback rows in this cluster show the same pattern — consider fixing the cluster, not just this row)` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const userCommentBlock = row.userComment
    ? `\n## User's own words on what would have been better\n\n${fence(row.userComment)}\n`
    : ''

  const hintBlock = hint
    ? [
        '## Where to look first',
        '',
        ...hint.files.map((f) => `- \`${f}\``),
        '',
        hint.guidance,
        '',
      ].join('\n')
    : [
        '## Where to look first',
        '',
        'No classification-specific hint available. Start by reading the tool calls + system prompt for the active mode, then trace the question through to the failure point.',
        '',
      ].join('\n')

  return `# Fix a captured AI assistant failure

A user reported (or our server auto-detected) that the GoalPost AI assistant did something wrong. Below is the full record. Diagnose the root cause, fix it, and verify.

## Failure record (from /dev/ai-quality)

${verdictLines}

### User question

${fence(row.question, '')}

### Assistant response (the bad one)

${fence(row.response, '')}
${userCommentBlock}
### Response parts (tool calls + tool results)

${fence(truncateParts(row.responseParts), 'json')}

## Mandatory reading before you touch code

- \`kb/07-ai-assistant-ux.md\` — assistant UX rules (raw-id leakage, session context, tool result shape, HITL, stopWhen).
- \`kb/01-glossary.md\` — use the correct GoalPost terminology in any prompt/tool changes.
${row.source === 'user_thumb' ? '- The user\'s comment above is ground truth. Whatever fix you propose must produce a response the user would have rated positive.' : ''}

${hintBlock}
## What I want you to do

1. **Diagnose** — explain in 2-3 sentences what's broken and why the captured response happened.
2. **Implement the fix** — edit the files above (or others if your diagnosis points elsewhere). Keep the change minimal — fix this failure, do not refactor surrounding code.
3. **Preserve invariants** — don't break other modes, don't expose raw ids (Rule 1), keep \`stopWhen\` ≥ 8 on streamText (Rule 7), don't bypass \`runWriteTool\` for write tools (Rule 5).
4. **Verify** — run the dev server. Ask the assistant the exact question above (in the same mode if possible). Confirm:
   - The new response does NOT exhibit the original failure.
   - No raw ids / \`__typename\` / internal labels leak.
   - The tool loop completed without errors.
5. **Summarize** — tell me what changed, in which files, and which Rule from \`kb/07\` your fix satisfies.

The original feedback row id is \`${row.id}\` — once your fix is verified, the matching cluster (\`${row.cluster ?? 'unclustered'}\`) should stop accumulating new bad rows. If new rows show up with the same classification within 24h of merging, the fix is incomplete.
`
}
