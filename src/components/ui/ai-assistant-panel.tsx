'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { usePreferences } from '@/contexts/preferences-context'
import { useFocalEntity } from '@/contexts'
import { Button } from '@/components/ui/button'
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
  persistLastViewedThread,
  type HydratedThread,
} from '@/lib/simulation/conversation-thread-client'
import { ThreadSwitcher } from '@/components/chat/thread-switcher'
import { onOpenAssistantThread } from '@/lib/simulation/assistant-panel-events'
import { ApprovalBatchDialog } from '@/components/chat/approval-batch-dialog'
import { applyFieldEdits } from '@/lib/chat/approval-display'

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

  // Slice 5 (GOAL-240) — hydrate state carries the active thread so the
  // panel can lock the mode selector on ingest threads, render a title in
  // the switcher trigger, and force `aiMode='default'` for ingest threads.
  const [hydration, setHydration] = useState<
    | { status: 'idle' }
    | { status: 'loading'; targetThreadId: string | null }
    | { status: 'ready'; thread: HydratedThread | null }
  >({ status: 'idle' })
  // Bumped when a new ingest thread lands so the switcher refetches its list.
  const [switcherRefreshKey, setSwitcherRefreshKey] = useState(0)

  const isIngestThread =
    hydration.status === 'ready' && hydration.thread?.kind === 'ingest'

  // The chat assistant's mode is normally driven by the user's global
  // preference. Slice 5 makes ingest threads pin Standard regardless —
  // Aiden / Braider never take action, so their behaviour would break the
  // synthesized turn's pre-staged tool calls. The lock is enforced both
  // server-side (ConversationThread.mode = 'default' at create) and
  // request-side here.
  const effectiveAiMode = isIngestThread ? 'default' : aiMode

  const resolveBody = useCallback(() => {
    const snapshot = sessionContextRef.current
    const focalEntity = snapshot.focalEntity
    const previousFocalEntity = lastSentFocalRef.current
    lastSentFocalRef.current = focalEntity
    return {
      aiMode: effectiveAiMode,
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
  }, [effectiveAiMode])

  // Hydration loader. Re-fires whenever `targetThreadId` changes — `null`
  // means "active thread per server state" (last-viewed pin or most recent).
  useEffect(() => {
    if (!isOpen) {
      setHydration({ status: 'idle' })
      return
    }
    const target =
      hydration.status === 'loading' ? hydration.targetThreadId : null
    const controller = new AbortController()
    fetchHydratedThread(controller.signal, target ?? undefined).then(
      (thread) => {
        if (controller.signal.aborted) return
        setHydration({ status: 'ready', thread })
        // Persist last-viewed so a hard refresh re-opens the same thread.
        if (thread?.id) {
          void persistLastViewedThread(thread.id)
        }
      }
    )
    return () => controller.abort()
    // We deliberately do not depend on hydration here — when a switch is
    // requested we transition through `loading` and re-trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, hydration.status === 'loading' ? hydration.targetThreadId : null])

  // Open this panel and switch to a specific thread when other components
  // (e.g. the FieldContext upload handler) request it.
  useEffect(() => {
    if (!isOpen) return
    return onOpenAssistantThread(({ threadId }) => {
      setSwitcherRefreshKey((k) => k + 1)
      setHydration({ status: 'loading', targetThreadId: threadId })
    })
  }, [isOpen])

  // Initial fetch when the panel opens fresh (no target → server-active).
  useEffect(() => {
    if (!isOpen) return
    if (hydration.status !== 'idle') return
    setHydration({ status: 'loading', targetThreadId: null })
  }, [isOpen, hydration.status])

  const handleSelectThread = useCallback((threadId: string) => {
    setHydration({ status: 'loading', targetThreadId: threadId })
  }, [])

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
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex items-center justify-center size-8 rounded-full bg-gp-primary/20 text-gp-primary border border-gp-primary/20 shadow-[0_0_12px_rgba(19,164,236,0.3)] dark:shadow-[0_0_12px_rgba(19,164,236,0.2)] shrink-0">
              <span className="material-symbols-outlined text-[18px]">
                smart_toy
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide">
                GoalPost AI
              </h3>
              <div className="mt-0.5">
                <ThreadSwitcher
                  activeThreadId={
                    hydration.status === 'ready'
                      ? hydration.thread?.id ?? null
                      : null
                  }
                  onSelectThread={(t) => handleSelectThread(t.id)}
                  refreshKey={switcherRefreshKey}
                />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close assistant panel"
            className="cursor-pointer size-8 flex items-center justify-center rounded-full text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {isIngestThread && (
          <div
            role="status"
            className="border-b border-gp-primary/20 bg-gp-primary/5 dark:bg-gp-primary/10 px-6 py-2 text-[11px] text-slate-700 dark:text-white/70 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[14px] text-gp-primary">
              lock
            </span>
            <span>Ingest threads run in Standard mode.</span>
          </div>
        )}

        <TooltipProvider>
          <div className="flex-1 overflow-hidden flex flex-col">
            {hydration.status === 'ready' ? (
              <HydratedChat
                // Key by thread id so switching threads forces useChatRuntime
                // to remount with fresh `initialMessages` — the runtime reads
                // them once at construction time.
                key={hydration.thread?.id ?? 'empty'}
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
  const [batchOpen, setBatchOpen] = useState(false)

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
  }, [])

  const sendComposerMessage = useCallback(
    (text: string) => {
      try {
        const composer = api.thread().composer()
        composer.setText(text)
        composer.send()
      } catch (error) {
        console.warn(
          '[AIAssistantPanel] Failed to send approval message:',
          error
        )
      }
    },
    [api]
  )

  const approveOne = useCallback(
    (
      approvalHash: string,
      edits: Record<string, string>
    ) => {
      const target = pendingApprovals.find(
        (a) => a.approvalHash === approvalHash
      )
      if (!target) return
      const mergedArgs = applyFieldEdits(target.args, edits)
      approvedActionsRef.current = [
        ...approvedActionsRef.current,
        { tool: target.tool, args: mergedArgs },
      ]
      dismiss(approvalHash)
      sendComposerMessage(
        `Please execute the approved action: ${target.summary}`
      )
    },
    [approvedActionsRef, dismiss, pendingApprovals, sendComposerMessage]
  )

  const approveAll = useCallback(
    (
      approvals: Array<{
        approvalHash: string
        tool: string
        args: Record<string, unknown>
      }>
    ) => {
      if (approvals.length === 0) return
      approvedActionsRef.current = [
        ...approvedActionsRef.current,
        ...approvals.map((a) => ({ tool: a.tool, args: a.args })),
      ]
      const hashes = new Set(approvals.map((a) => a.approvalHash))
      setPendingApprovals((prev) =>
        prev.filter((a) => !hashes.has(a.approvalHash))
      )
      setBatchOpen(false)
      const summary =
        approvals.length === 1
          ? `Please execute the approved action: ${
              pendingApprovals.find(
                (p) => p.approvalHash === approvals[0].approvalHash
              )?.summary ?? approvals[0].tool
            }`
          : `Please execute the ${approvals.length} approved actions I just confirmed.`
      sendComposerMessage(summary)
    },
    [approvedActionsRef, pendingApprovals, sendComposerMessage]
  )

  if (pendingApprovals.length === 0) return null

  return (
    <>
      <div className="border-t border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
            {pendingApprovals.length === 1
              ? 'Approval required for 1 proposed change'
              : `Approval required for ${pendingApprovals.length} proposed changes`}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setBatchOpen(true)}
            >
              Review {pendingApprovals.length > 1 ? 'batch' : ''}
            </Button>
          </div>
        </div>
      </div>

      <ApprovalBatchDialog
        open={batchOpen}
        pendingApprovals={pendingApprovals.map((a) => ({
          approvalHash: a.approvalHash,
          tool: a.tool,
          args: a.args,
          summary: a.summary,
        }))}
        onOpenChange={setBatchOpen}
        onApproveAll={approveAll}
        onApproveOne={approveOne}
        onReject={dismiss}
      />
    </>
  )
}
