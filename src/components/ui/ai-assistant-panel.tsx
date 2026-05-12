'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { usePreferences } from '@/contexts/preferences-context'
import { useFocalEntity } from '@/contexts'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Thread } from '@/components/assistant-ui/thread'
import {
  AssistantRuntimeProvider,
  useAssistantApi,
  useAssistantState,
} from '@assistant-ui/react'
import {
  AssistantChatTransport,
  useChatRuntime,
} from '@assistant-ui/react-ai-sdk'
import type { UIMessage } from 'ai'
import type { FocalEntity } from '@/lib/focal-entity/types'
import { AIAssistantPivotFooter } from '@/components/ui/ai-assistant-pivot-footer'
import {
  fetchHydratedThread,
  type HydratedThread,
} from '@/lib/simulation/conversation-thread-client'

interface AIAssistantPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface ApprovedActionPayload {
  tool: string
  args: Record<string, unknown>
}

interface PendingApproval extends ApprovedActionPayload {
  summary: string
  approvalHash: string
}

export function AIAssistantPanel({ isOpen, onClose }: AIAssistantPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const { aiMode } = usePreferences()
  const { sessionContext } = useFocalEntity()

  const sessionContextRef = useRef(sessionContext)
  useEffect(() => {
    sessionContextRef.current = sessionContext
  }, [sessionContext])

  // Focal entity actually sent on the previous turn — used to surface a
  // soft-transition prompt when the user shifts focus mid-conversation.
  const lastSentFocalRef = useRef<FocalEntity | null>(null)

  // Approved action payloads, replayed on each subsequent turn so the
  // backend's HITL gate executes them via executeAuthorizedWriteTool.
  const approvedActionsRef = useRef<ApprovedActionPayload[]>([])

  const resolveBody = useCallback(() => {
    const snapshot = sessionContextRef.current
    const focalEntity = snapshot.focalEntity
    const previousFocalEntity = lastSentFocalRef.current
    lastSentFocalRef.current = focalEntity
    return {
      aiMode,
      currentUserId: snapshot.currentUserId,
      spaceId: snapshot.activeSpaceId,
      fieldContextId: snapshot.activeFieldContextId,
      focalEntity: focalEntity
        ? {
            type: focalEntity.type,
            id: focalEntity.id,
            label: focalEntity.label,
          }
        : null,
      previousFocalEntity:
        previousFocalEntity &&
        (!focalEntity ||
          previousFocalEntity.id !== focalEntity.id ||
          previousFocalEntity.type !== focalEntity.type)
          ? {
              type: previousFocalEntity.type,
              id: previousFocalEntity.id,
              label: previousFocalEntity.label,
            }
          : null,
      approvedActions: approvedActionsRef.current,
    }
  }, [aiMode])

  // Fetch the user's persisted ConversationThread when the panel opens.
  // `useChatRuntime` needs its `messages` at first call — it isn't reactive
  // to later changes — so the actual runtime is lifted into <HydratedChat/>
  // which only mounts after hydration resolves. While loading we render a
  // light skeleton in place of <Thread/>.
  const [hydration, setHydration] = useState<
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'ready'; thread: HydratedThread | null }
  >({ status: 'idle' })

  useEffect(() => {
    if (!isOpen) {
      setHydration({ status: 'idle' })
      return
    }
    setHydration({ status: 'loading' })
    const controller = new AbortController()
    fetchHydratedThread(controller.signal).then((thread) => {
      if (controller.signal.aborted) return
      setHydration({ status: 'ready', thread })
    })
    return () => controller.abort()
  }, [isOpen])

  useEffect(() => {
    if (!panelRef.current || !overlayRef.current) return
    if (isOpen) {
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
      gsap.fromTo(
        panelRef.current,
        { x: '100%' },
        { x: '0%', duration: 0.4, ease: 'power3.out' }
      )
    } else {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      })
      gsap.to(panelRef.current, {
        x: '100%',
        duration: 0.3,
        ease: 'power3.in',
      })
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xs z-60 opacity-0"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className="fixed right-0 top-0 h-full w-full max-w-120 bg-white dark:bg-[#121b21] border-l border-slate-200 dark:border-white/10 shadow-[-20px_0_60px_rgba(0,0,0,0.3)] dark:shadow-[-20px_0_60px_rgba(0,0,0,0.6)] z-70 flex flex-col translate-x-full"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/5 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-8 rounded-full bg-gp-primary/20 text-gp-primary border border-gp-primary/20 shadow-[0_0_12px_rgba(19,164,236,0.3)] dark:shadow-[0_0_12px_rgba(19,164,236,0.2)]">
              <span className="material-symbols-outlined text-[18px]">
                smart_toy
              </span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide">
                GoalPost AI
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex size-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-1.5 bg-green-500" />
                </span>
                <p className="text-[10px] text-slate-500 dark:text-white/50 uppercase tracking-widest font-medium">
                  Active
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer size-8 flex items-center justify-center rounded-full text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <TooltipProvider>
          <div className="flex-1 overflow-hidden flex flex-col">
            {hydration.status === 'ready' ? (
              <HydratedChat
                initialMessages={hydration.thread?.messages ?? []}
                resolveBody={resolveBody}
                approvedActionsRef={approvedActionsRef}
                onClose={onClose}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400 dark:text-white/40">
                Loading conversation…
              </div>
            )}
          </div>
        </TooltipProvider>

        <div className="border-t border-slate-200 dark:border-white/5 px-4 py-2 bg-white/50 dark:bg-white/5 backdrop-blur-md">
          <p className="text-[10px] text-slate-500 dark:text-white/40 text-center">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </>
  )
}

interface HydratedChatProps {
  initialMessages: UIMessage[]
  resolveBody: () => Record<string, unknown>
  approvedActionsRef: React.MutableRefObject<ApprovedActionPayload[]>
  onClose: () => void
}

/**
 * Mounts the assistant runtime with hydrated messages from the persisted
 * ConversationThread. Lives in its own component because `useChatRuntime`
 * reads `messages` once at initialization — if we called it inline in
 * AIAssistantPanel, the initial fetch would resolve too late to seed the
 * runtime, and the user would lose their thread history on every reopen.
 */
function HydratedChat({
  initialMessages,
  resolveBody,
  approvedActionsRef,
  onClose,
}: HydratedChatProps) {
  const transport = useMemo(
    () =>
      // eslint-disable-next-line react-hooks/refs -- body is invoked at fetch time, not during render
      new AssistantChatTransport({
        api: '/api/chat/simulation',
        body: resolveBody,
      }),
    [resolveBody]
  )

  const runtime = useChatRuntime({ transport, messages: initialMessages })

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
      <ApprovalLayer approvedActionsRef={approvedActionsRef} />
      <AIAssistantPivotFooter onPivot={onClose} />
    </AssistantRuntimeProvider>
  )
}

interface ApprovalLayerProps {
  approvedActionsRef: React.MutableRefObject<ApprovedActionPayload[]>
}

/**
 * Watches thread messages for tool results that return `approvalRequired:true`
 * (the HITL pending response from /lib/chat/hitl.ts), collects them as
 * pending approvals, and exposes a Dialog so the user can approve or dismiss.
 *
 * On approve, the action is pushed onto `approvedActionsRef` (which the
 * transport body resolver replays on every subsequent turn), then a new user
 * message is appended that nudges the assistant to retry the gated action.
 */
function ApprovalLayer({ approvedActionsRef }: ApprovalLayerProps) {
  const api = useAssistantApi()
  const messages = useAssistantState(({ thread }) => thread.messages)

  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>(
    []
  )
  const [activeApproval, setActiveApproval] = useState<PendingApproval | null>(
    null
  )

  useEffect(() => {
    if (!messages) return
    const seen = new Set(pendingApprovals.map((a) => a.approvalHash))
    const found: PendingApproval[] = []

    for (const message of messages) {
      if (message.role !== 'assistant') continue
      const parts = (
        message as unknown as {
          parts?: Array<{
            type?: string
            toolName?: string
            result?: unknown
          }>
        }
      ).parts
      if (!parts) continue
      for (const part of parts) {
        if (part?.type !== 'tool-result' || !part.result) continue
        const result = part.result as Record<string, unknown>
        if (result.approvalRequired !== true) continue
        const hash =
          typeof result.approvalHash === 'string' ? result.approvalHash : null
        if (!hash || seen.has(hash)) continue
        if (
          approvedActionsRef.current.some(
            (a) =>
              a.tool === result.tool &&
              JSON.stringify(a.args) === JSON.stringify(result.args)
          )
        ) {
          // Already approved earlier in this session; the next turn will replay it.
          continue
        }
        seen.add(hash)
        found.push({
          tool: String(result.tool ?? part.toolName ?? ''),
          args: (result.args as Record<string, unknown>) ?? {},
          summary:
            typeof result.summary === 'string'
              ? result.summary
              : `Approve ${String(result.tool ?? '')}`,
          approvalHash: hash,
        })
      }
    }

    if (found.length > 0) {
      setPendingApprovals((prev) => [...prev, ...found])
    }
  }, [messages, pendingApprovals, approvedActionsRef])

  const dismiss = useCallback((hash: string) => {
    setPendingApprovals((prev) => prev.filter((a) => a.approvalHash !== hash))
    setActiveApproval((prev) => (prev?.approvalHash === hash ? null : prev))
  }, [])

  const approve = useCallback(
    (approval: PendingApproval) => {
      approvedActionsRef.current = [
        ...approvedActionsRef.current,
        { tool: approval.tool, args: approval.args },
      ]
      dismiss(approval.approvalHash)
      try {
        const composer = api.thread().composer()
        composer.setText(
          `Please execute the approved action: ${approval.summary}`
        )
        composer.send()
      } catch (error) {
        console.warn(
          '[AIAssistantPanel] Failed to send approval message:',
          error
        )
      }
    },
    [api, approvedActionsRef, dismiss]
  )

  if (pendingApprovals.length === 0) return null

  return (
    <>
      <div className="border-t border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-2">
        <p className="text-xs font-medium text-amber-900 dark:text-amber-200 mb-2">
          Approval required for {pendingApprovals.length} AI change
          {pendingApprovals.length > 1 ? 's' : ''}
        </p>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {pendingApprovals.map((approval) => (
            <div
              key={approval.approvalHash}
              className="rounded-md bg-white/70 dark:bg-black/20 px-2 py-2"
            >
              <p className="text-xs text-slate-700 dark:text-slate-200">
                {approval.summary}
              </p>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setActiveApproval(approval)}
                >
                  Review
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs"
                  onClick={() => dismiss(approval.approvalHash)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog
        open={Boolean(activeApproval)}
        onOpenChange={(open) => {
          if (!open) setActiveApproval(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve AI Action</DialogTitle>
            <DialogDescription>
              Review this requested change before execution.
            </DialogDescription>
          </DialogHeader>

          {activeApproval && (
            <div className="space-y-3">
              <p className="text-sm text-slate-700 dark:text-slate-200">
                {activeApproval.summary}
              </p>
              <pre className="max-h-48 overflow-auto rounded-md bg-slate-100 dark:bg-white/10 p-3 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {JSON.stringify(activeApproval.args, null, 2)}
              </pre>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (activeApproval) dismiss(activeApproval.approvalHash)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (activeApproval) approve(activeApproval)
              }}
            >
              Approve And Run
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
