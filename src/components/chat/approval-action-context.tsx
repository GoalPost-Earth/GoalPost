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
}

const ApprovalActionContext = createContext<ApprovalActionValue | null>(null)

interface ApprovalActionProviderProps {
  /**
   * One-shot ref owned by the runtime boundary and read+cleared by its
   * `resolveBody`. Bridges the approval card (deep in the message stream) to
   * the request body without re-rendering on every approve.
   */
  pendingActionRef: MutableRefObject<ApprovalAction | null>
  children: ReactNode
}

export function ApprovalActionProvider({
  pendingActionRef,
  children,
}: ApprovalActionProviderProps) {
  const requestExecuteAction = useCallback(
    (action: ApprovalAction) => {
      pendingActionRef.current = action
    },
    [pendingActionRef]
  )

  const value = useMemo(
    () => ({ requestExecuteAction }),
    [requestExecuteAction]
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
