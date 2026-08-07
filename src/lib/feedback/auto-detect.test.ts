import { detectRuleViolations, detectAutoSignals } from './auto-detect'

describe('detectRuleViolations — centralised one-row-per-turn', () => {
  it('emits a single combined signal when several rules trip in one response', () => {
    // A response that leaks BOTH a bare UUID and a graph label used to
    // produce two rows (same question/timestamp) — the "duplicate" noise.
    const text =
      'Your ResonanceLink 3f8a2b1c-1d2e-4a5b-8c7d-9e0f1a2b3c4d is ready.'
    const signals = detectRuleViolations(text)

    expect(signals).toHaveLength(1)
    expect(signals[0].source).toBe('auto_rule_violation')
    expect(signals[0].ruleViolated).toBe(
      'rule_1_uuid_leak+rule_1_graph_label_leak'
    )
    // autoSignal mirrors ruleViolated so downstream hint-matching still works.
    expect(signals[0].autoSignal).toBe(signals[0].ruleViolated)
  })

  it('orders combined rules canonically: id/uuid, then typename, then graph label', () => {
    const text = 'MeSpace __typename me_abcdef123456'
    const signals = detectRuleViolations(text)

    expect(signals).toHaveLength(1)
    expect(signals[0].ruleViolated).toBe(
      'rule_1_raw_id_leak+rule_1_typename_leak+rule_1_graph_label_leak'
    )
  })

  it('prefers the prefixed-id rule over the bare-UUID rule when they overlap', () => {
    // `me_<uuid>` matches both patterns; only raw_id should be recorded.
    const text = 'anchor me_3f8a2b1c-1d2e-4a5b-8c7d-9e0f1a2b3c4d'
    const signals = detectRuleViolations(text)

    expect(signals).toHaveLength(1)
    expect(signals[0].ruleViolated).toBe('rule_1_raw_id_leak')
  })

  it('returns a single-rule signal (no `+`) for a lone violation', () => {
    const signals = detectRuleViolations('The GoalPulse is on track.')
    expect(signals).toHaveLength(1)
    expect(signals[0].ruleViolated).toBe('rule_1_graph_label_leak')
  })

  it('returns nothing for clean copy', () => {
    expect(detectRuleViolations('Your goal is on track — nice work.')).toEqual(
      []
    )
  })

  // GOAL-322 — a leaked document-download locator self-reports. Neither
  // existing pattern catches it: `doc_` doesn't match the `document_` prefix we
  // mint, and `document_<uuid>` gives the UUID pattern no word boundary to
  // anchor on, so before this rule the leak produced NO signal at all.
  it('flags a durable document-download URL', () => {
    const signals = detectRuleViolations(
      'You can grab it at https://app.goalpost.test/api/ingest/document/document_9f1c2d3e-4a5b-6c7d-8e9f-0a1b2c3d4e5f/download'
    )

    expect(signals).toHaveLength(1)
    expect(signals[0].ruleViolated).toBe('rule_1_document_url_leak')
  })

  it('flags a bare document id even without the surrounding URL', () => {
    const signals = detectRuleViolations(
      'The source is document_9f1c2d3e-4a5b-6c7d-8e9f-0a1b2c3d4e5f.'
    )

    expect(signals).toHaveLength(1)
    expect(signals[0].ruleViolated).toBe('rule_1_document_url_leak')
  })

  it('folds the document leak into the combined signal alongside other rules', () => {
    const signals = detectRuleViolations(
      'The ResourcePulse lives at /api/ingest/document/document_abc123/download'
    )

    expect(signals).toHaveLength(1)
    expect(signals[0].ruleViolated).toBe(
      'rule_1_document_url_leak+rule_1_graph_label_leak'
    )
  })

  it('does not flag ordinary copy about a document', () => {
    expect(
      detectRuleViolations(
        'That resource has an attached document you can open from its card.'
      )
    ).toEqual([])
  })
})

describe('detectAutoSignals — tool errors stay per-tool, rule leaks centralise', () => {
  it('keeps one row per errored tool but folds multi-rule leaks into one', () => {
    const parts = [
      { type: 'text', text: 'Here is FieldContext ctx_abcdef123456.' },
      { type: 'tool-search_person', toolName: 'search_person', isError: true },
      {
        type: 'tool-query_for_bloom',
        toolName: 'query_for_bloom',
        isError: true,
      },
    ]
    const signals = detectAutoSignals(parts)

    const ruleRows = signals.filter((s) => s.source === 'auto_rule_violation')
    const toolRows = signals.filter((s) => s.source === 'auto_tool_error')

    // Two independent tool failures are still triaged separately...
    expect(toolRows).toHaveLength(2)
    // ...but the raw-id + graph-label leak is a single centralised row.
    expect(ruleRows).toHaveLength(1)
    expect(ruleRows[0].ruleViolated).toBe(
      'rule_1_raw_id_leak+rule_1_graph_label_leak'
    )
  })
})
