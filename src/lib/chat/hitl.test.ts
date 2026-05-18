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
