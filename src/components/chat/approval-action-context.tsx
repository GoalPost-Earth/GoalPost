'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type MutableRefObject,
  type ReactNode,
} from 'react'

/**
 * A write action the user has approved on an inline HITL card. It is handed to
 * the backend as a one-shot `executeAction` (GOAL-261) and executed verbatim —
 * never replayed and never re-emitted by the model — so approval is fully
 * deterministic and can't loop.
 */
export interface ApprovalAction {
  tool: string
  args: Record<string, unknown>
}

interface ApprovalActionValue {
  /**
   * Queue an approved action for one-shot execution on the next request. The
   * transport body resolver reads (and clears) the ref this writes, so the
   * action rides exactly one outgoing turn.
   */
  requestExecuteAction: (action: ApprovalAction) => void
  /**
   * Queue MULTIPLE approved actions to execute together on the next request —
   * one turn, one stream. Used by batch-accept surfaces (GOAL-272 pulse
   * suggestions): firing a separate turn per action races assistant-ui's
   * MessageRepository (duplicate message id in the parent tree → crash), so a
   * multi-select accept must ride a single turn.
   */
  requestExecuteActions: (actions: ApprovalAction[]) => void
}

const ApprovalActionContext = createContext<ApprovalActionValue | null>(null)

interface ApprovalActionProviderProps {
  /**
   * One-shot ref owned by the runtime boundary and read+cleared by its
   * `resolveBody`. Bridges the approval card (deep in the message stream) to
   * the request body without re-rendering on every approve. Holds the queued
   * actions as an array — a single approval is just a one-element batch.
   */
  pendingActionRef: MutableRefObject<ApprovalAction[] | null>
  children: ReactNode
}

export function ApprovalActionProvider({
  pendingActionRef,
  children,
}: ApprovalActionProviderProps) {
  const requestExecuteAction = useCallback(
    (action: ApprovalAction) => {
      pendingActionRef.current = [action]
    },
    [pendingActionRef]
  )

  const requestExecuteActions = useCallback(
    (actions: ApprovalAction[]) => {
      const valid = actions.filter((a) => a && a.tool)
      pendingActionRef.current = valid.length > 0 ? valid : null
    },
    [pendingActionRef]
  )

  const value = useMemo(
    () => ({ requestExecuteAction, requestExecuteActions }),
    [requestExecuteAction, requestExecuteActions]
  )

  return (
    <ApprovalActionContext.Provider value={value}>
      {children}
    </ApprovalActionContext.Provider>
  )
}

export function useApprovalAction(): ApprovalActionValue | null {
  return useContext(ApprovalActionContext)
}
