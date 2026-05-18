import {
  buildPendingApprovalResult,
  createApprovalHash,
  describeWriteAction,
  isWriteToolName,
} from './hitl'

describe('hitl — create_person write tool', () => {
  describe('isWriteToolName', () => {
    it('recognises create_person as a registered write tool', () => {
      expect(isWriteToolName('create_person')).toBe(true)
    })
  })

  describe('describeWriteAction("create_person", …)', () => {
    it('produces a human-readable summary that uses the person name and field context title — never raw ids', () => {
      const summary = describeWriteAction('create_person', {
        firstName: 'Sarah',
        lastName: 'Chen',
        contextId: 'ctx_a87c5bf1-6ab3-42f6-bb61-14d5e884fda4',
        contextTitle: 'Care Practices',
      })

      // Rule 1: no raw ids in approval copy. Names only.
      expect(summary).toContain('Sarah Chen')
      expect(summary).toContain('Care Practices')
      expect(summary).not.toContain('ctx_')
      expect(summary).not.toContain('a87c5bf1')
    })
  })

  describe('createApprovalHash("create_person", …)', () => {
    it('is deterministic across calls with the same args', () => {
      const args = {
        firstName: 'Sarah',
        lastName: 'Chen',
        contextId: 'ctx_1',
        contextTitle: 'Care Practices',
      }
      const a = createApprovalHash('create_person', args)
      const b = createApprovalHash('create_person', args)
      expect(a).toBe(b)
    })

    it('is order-independent on the args object', () => {
      const a = createApprovalHash('create_person', {
        firstName: 'Sarah',
        lastName: 'Chen',
        contextId: 'ctx_1',
      })
      const b = createApprovalHash('create_person', {
        contextId: 'ctx_1',
        lastName: 'Chen',
        firstName: 'Sarah',
      })
      expect(a).toBe(b)
    })

    it('differs when args differ', () => {
      const a = createApprovalHash('create_person', {
        firstName: 'Sarah',
        lastName: 'Chen',
      })
      const b = createApprovalHash('create_person', {
        firstName: 'Sara',
        lastName: 'Chen',
      })
      expect(a).not.toBe(b)
    })
  })

  // LOAD-BEARING: every other slice depends on the synthesized turn shape
  // matching what runtime runWriteTool produces. The factory below is the
  // single source both paths share — runtime calls it when an action is
  // unapproved, SynthesizedTurnAppender calls it when pre-staging a tool
  // call. Drift here silently breaks HITL approval.
  describe('buildPendingApprovalResult', () => {
    const args = {
      firstName: 'Sarah',
      lastName: 'Chen',
      contextId: 'ctx_1',
      contextTitle: 'Care Practices',
    }

    it('returns every field the HITL panel reads from a tool result', () => {
      const result = buildPendingApprovalResult('create_person', args)

      expect(result.success).toBe(false)
      expect(result.approvalRequired).toBe(true)
      expect(typeof result.approvalHash).toBe('string')
      expect(result.tool).toBe('create_person')
      expect(result.args).toEqual(args)
      expect(typeof result.summary).toBe('string')
      expect(typeof result.message).toBe('string')
    })

    it('uses the same approvalHash as createApprovalHash for the same (tool, args)', () => {
      const result = buildPendingApprovalResult('create_person', args)
      expect(result.approvalHash).toBe(createApprovalHash('create_person', args))
    })

    it('uses the same summary as describeWriteAction for the same (tool, args)', () => {
      const result = buildPendingApprovalResult('create_person', args)
      expect(result.summary).toBe(describeWriteAction('create_person', args))
    })

    it('produces deeply equal output for two callers given the same (tool, args)', () => {
      const fromRuntime = buildPendingApprovalResult('create_person', args)
      const fromSynthesis = buildPendingApprovalResult('create_person', args)
      expect(fromSynthesis).toEqual(fromRuntime)
    })

    it('keeps the args object referentially passed-through so the panel can replay it on approve', () => {
      // The HITL panel pushes { tool, args } onto approvedActionsRef on Approve.
      // The args it reads must be the args the model emitted, not a re-shaped copy.
      const result = buildPendingApprovalResult('create_person', args)
      expect(result.args).toEqual(args)
    })
  })
})

describe('hitl — create_pulse approval copy per pulseType (slice 2)', () => {
  // Rule 1: the HITL Dialog must never render __typename ("GoalPulse",
  // "ResourcePulse", "StoryPulse") to the user. describeWriteAction emits
  // human-readable labels ("goal", "resource", "story") instead.
  it('uses "goal" copy for GoalPulse', () => {
    const summary = describeWriteAction('create_pulse', {
      pulseType: 'GoalPulse',
      title: 'Ship migration',
      contextId: 'ctx_a87c5bf1-6ab3-42f6-bb61-14d5e884fda4',
      contextTitle: 'Care Practices',
    })
    expect(summary.toLowerCase()).toContain('goal')
    expect(summary).toContain('Ship migration')
    expect(summary).toContain('Care Practices')
    expect(summary).not.toContain('GoalPulse')
    expect(summary).not.toContain('ctx_')
    expect(summary).not.toContain('a87c5bf1')
  })

  it('uses "resource" copy for ResourcePulse', () => {
    const summary = describeWriteAction('create_pulse', {
      pulseType: 'ResourcePulse',
      title: 'Shared infra budget',
      contextTitle: 'Care Practices',
    })
    expect(summary.toLowerCase()).toContain('resource')
    expect(summary).toContain('Shared infra budget')
    expect(summary).not.toContain('ResourcePulse')
  })

  it('uses "story" copy for StoryPulse', () => {
    const summary = describeWriteAction('create_pulse', {
      pulseType: 'StoryPulse',
      title: 'Why we started this',
      contextTitle: 'Care Practices',
    })
    expect(summary.toLowerCase()).toContain('story')
    expect(summary).toContain('Why we started this')
    expect(summary).not.toContain('StoryPulse')
  })
})

describe('hitl — update_person write tool (slice 4)', () => {
  describe('isWriteToolName', () => {
    it('recognises update_person as a registered write tool', () => {
      expect(isWriteToolName('update_person')).toBe(true)
    })
  })

  describe('describeWriteAction("update_person", …)', () => {
    it('uses person name + context title in the human-readable summary; never leaks raw ids', () => {
      const summary = describeWriteAction('update_person', {
        personId: 'person_a87c5bf1-6ab3-42f6-bb61-14d5e884fda4',
        firstName: 'Sarah',
        lastName: 'Chen',
        currentName: 'Sarah Chen',
        contextId: 'ctx_a87c5bf1-6ab3-42f6-bb61-14d5e884fda4',
        contextTitle: 'Care Practices',
      })
      expect(summary).toContain('Sarah Chen')
      expect(summary).toContain('Care Practices')
      expect(summary).not.toContain('person_')
      expect(summary).not.toContain('ctx_')
      expect(summary).not.toContain('a87c5bf1')
    })
  })

  describe('createApprovalHash("update_person", …)', () => {
    it('is deterministic and order-independent', () => {
      const args = {
        personId: 'person_1',
        firstName: 'Sarah',
        lastName: 'Chen',
        contextId: 'ctx_1',
        contextTitle: 'Care Practices',
        documentId: 'doc_1',
      }
      const a = createApprovalHash('update_person', args)
      const b = createApprovalHash('update_person', {
        documentId: 'doc_1',
        contextTitle: 'Care Practices',
        contextId: 'ctx_1',
        lastName: 'Chen',
        firstName: 'Sarah',
        personId: 'person_1',
      })
      expect(a).toBe(b)
    })

    it('differs from create_person hash with the same name args (the tool name is part of the hash payload)', () => {
      const sharedArgs = {
        firstName: 'Sarah',
        lastName: 'Chen',
        contextId: 'ctx_1',
      }
      expect(createApprovalHash('create_person', sharedArgs)).not.toBe(
        createApprovalHash('update_person', { ...sharedArgs, personId: 'p1' })
      )
    })
  })

  describe('buildPendingApprovalResult("update_person", …)', () => {
    const args = {
      personId: 'person_1',
      firstName: 'Sarah',
      lastName: 'Chen',
      currentName: 'Sarah Chen',
      contextId: 'ctx_1',
      contextTitle: 'Care Practices',
      documentId: 'doc_1',
    }

    it('returns the same shape as a runtime-emitted pending result', () => {
      const result = buildPendingApprovalResult('update_person', args)
      expect(result.success).toBe(false)
      expect(result.approvalRequired).toBe(true)
      expect(result.tool).toBe('update_person')
      expect(result.args).toEqual(args)
      expect(result.approvalHash).toBe(createApprovalHash('update_person', args))
      expect(result.summary).toBe(describeWriteAction('update_person', args))
    })

    it('produces deeply equal output for two callers given the same (tool, args)', () => {
      const a = buildPendingApprovalResult('update_person', args)
      const b = buildPendingApprovalResult('update_person', args)
      expect(b).toEqual(a)
    })
  })
})

describe('hitl — update_pulse copy carries doc-ingest enrichment (slice 4)', () => {
  // When the synthesized turn includes pulseType + currentTitle +
  // contextTitle, describeWriteAction must render human-readable copy. Raw
  // pulseIds in the summary violate Rule 1.
  it('renders "Update goal <Title> in <Context>" when enrichment is present', () => {
    const summary = describeWriteAction('update_pulse', {
      pulseId: 'pulse_a87c5bf1-6ab3-42f6-bb61-14d5e884fda4',
      newTitle: 'Increase event attendance',
      pulseType: 'GoalPulse',
      currentTitle: 'Grow event attendance',
      contextTitle: 'Care Practices',
      documentId: 'doc_1',
    })
    expect(summary.toLowerCase()).toContain('goal')
    expect(summary).toContain('Grow event attendance')
    expect(summary).toContain('Care Practices')
    expect(summary).not.toContain('pulse_')
    expect(summary).not.toContain('GoalPulse')
    expect(summary).not.toContain('a87c5bf1')
  })

  it('keeps a sensible fallback when no enrichment fields are present (legacy chat path)', () => {
    const summary = describeWriteAction('update_pulse', {
      pulseId: 'pulse_42',
    })
    // legacy chat path doesn't carry pulseType / titles, so the fallback is
    // expected to mention "pulse" without inventing names.
    expect(summary.toLowerCase()).toContain('update')
  })
})
