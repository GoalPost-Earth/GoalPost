'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { AssistantRuntimeProvider } from '@assistant-ui/react'
import {
  AssistantChatTransport,
  useChatRuntime,
} from '@assistant-ui/react-ai-sdk'
import type { UIMessage } from 'ai'
import { useFocalEntity } from '@/contexts'
import { usePreferences } from '@/contexts/preferences-context'
import type { FocalEntity } from '@/lib/focal-entity/types'
import {
  fetchHydratedThread,
  type HydratedThread,
} from '@/lib/simulation/conversation-thread-client'
import { onOpenAssistantThread } from '@/lib/simulation/assistant-panel-events'
import { AIAssistantPanel } from '@/components/ui/ai-assistant-panel'
import { TourController } from '@/components/onboarding/TourController'
import { TourOverlay } from '@/components/onboarding/TourOverlay'
import {
  StudioPanesProvider,
  useStudioPanes,
  STUDIO_MODES,
  type PaneId,
} from './studio-panes-context'
import { StudioChrome } from './studio-chrome'
import { FloatingAssistantTrigger } from './floating-assistant-trigger'
import { PaneHost } from './pane-host'

interface ApprovedActionPayload {
  tool: string
  args: Record<string, unknown>
}

const EMPTY_MESSAGES: UIMessage[] = []

export interface StudioShellProps {
  children: ReactNode
}

/**
 * The studio is the protected layout. A horizontal split hosts two panes,
 * each of which can render any of the three modes (dashboard / graph /
 * chat). Either pane can be fullscreened.
 */
export const StudioShell: FC<StudioShellProps> = ({ children }) => {
  return (
    <StudioPanesProvider>
      <StudioBody>{children}</StudioBody>
    </StudioPanesProvider>
  )
}

const StudioBody: FC<{ children: ReactNode }> = ({ children }) => {
  const {
    left,
    right,
    fullscreenPane,
    focusedPane,
    setPaneMode,
    focusPane,
    toggleFullscreen,
    exitFullscreen,
    isVisited,
  } = useStudioPanes()
  const [panelOpen, setPanelOpen] = useState(false)
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)

  // Mount the AI runtime if chat is (or has been) live in either pane.
  const needsRuntime =
    left === 'chat' ||
    right === 'chat' ||
    isVisited('left', 'chat') ||
    isVisited('right', 'chat')

  // Slice 5 (GOAL-240) — open the assistant panel automatically when an
  // upload (or any caller) requests a thread switch.
  useEffect(() => {
    return onOpenAssistantThread(() => {
      setPanelOpen(true)
    })
  }, [])

  // Keyboard shortcuts. All ignored while typing into inputs/textareas.
  //   1/2/3        → switch focused pane to dashboard/graph/chat
  //   Shift+1..3   → switch the OTHER pane
  //   Tab          → toggle pane focus
  //   F            → fullscreen the focused pane
  //   Esc          → exit fullscreen
  //   V            → toggle composer mic when focused pane is chat
  //   G is handled inside graph-mode (Spatial / Bloom).
  const DIGIT_CODE_TO_INDEX: Record<string, number> = useMemo(
    () => ({ Digit1: 0, Digit2: 1, Digit3: 2 }),
    []
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          target.isContentEditable
        ) {
          return
        }
      }

      const otherPane: PaneId = focusedPane === 'left' ? 'right' : 'left'
      const focusedMode = focusedPane === 'left' ? left : right

      // Shift+digit → switch the other pane (only when it exists).
      if (e.shiftKey) {
        const idx = DIGIT_CODE_TO_INDEX[e.code]
        if (idx !== undefined && right !== null) {
          e.preventDefault()
          setPaneMode(otherPane, STUDIO_MODES[idx])
        }
        return
      }

      // Plain digit → switch focused pane.
      const digitIdx = Number(e.key) - 1
      if (digitIdx >= 0 && digitIdx < STUDIO_MODES.length) {
        e.preventDefault()
        setPaneMode(focusedPane, STUDIO_MODES[digitIdx])
        return
      }

      if (e.key === 'Tab' && right !== null) {
        e.preventDefault()
        focusPane(otherPane)
        return
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        toggleFullscreen(focusedPane)
        return
      }

      if (e.key === 'Escape' && fullscreenPane !== null) {
        e.preventDefault()
        exitFullscreen()
        return
      }

      if ((e.key === 'v' || e.key === 'V') && focusedMode === 'chat') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('goalpost:voice-mic-toggle'))
        return
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    DIGIT_CODE_TO_INDEX,
    left,
    right,
    focusedPane,
    fullscreenPane,
    setPaneMode,
    focusPane,
    toggleFullscreen,
    exitFullscreen,
  ])

  // Below this breakpoint the studio collapses to single-pane (focused only).
  // Both pane modes stay in state so swapping focus returns the user to their
  // previous layout.
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 767px)')
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // When both panes hold the same mode that consumes `children` (dashboard
  // route content), rendering the subtree twice can cause Apollo queries to
  // duplicate. The non-focused pane gets a sentinel children fallback in
  // that case so only the focused pane drives navigation state.
  const leftChildren = children
  const rightChildren =
    left === 'dashboard' && right === 'dashboard' && focusedPane === 'left'
      ? null
      : children

  const renderPane = (pane: PaneId, fullscreen: boolean) => (
    <PaneHost
      pane={pane}
      fullscreen={fullscreen}
      selectedThreadId={selectedThreadId}
      onSelectThread={setSelectedThreadId}
      chatCompact={isMobile}
    >
      {pane === 'left' ? leftChildren : rightChildren}
    </PaneHost>
  )

  const splitView = (
    <div className="relative h-full w-full">
      {isMobile ? (
        // Mobile: only the focused pane is visible; tap the swap control in
        // the pane header to flip to the other pane.
        renderPane(focusedPane, true)
      ) : fullscreenPane !== null ? (
        // Fullscreen: render the active pane edge-to-edge, no splitter.
        <div className="h-full w-full" key={fullscreenPane}>
          {renderPane(fullscreenPane, true)}
        </div>
      ) : right === null ? (
        // Single-pane mode (legacy / explicit collapse) — show left only.
        renderPane('left', true)
      ) : (
        <PanelGroup
          direction="horizontal"
          autoSaveId="goalpost.studio.split.v1"
          className="h-full w-full"
        >
          <Panel defaultSize={50} minSize={20} order={1}>
            {renderPane('left', false)}
          </Panel>
          <PanelResizeHandle className="w-1.5 bg-slate-900 hover:bg-gp-primary/40 transition-colors data-[resize-handle-state=drag]:bg-gp-primary/60 cursor-col-resize" />
          <Panel defaultSize={50} minSize={20} order={2}>
            {renderPane('right', false)}
          </Panel>
        </PanelGroup>
      )}
    </div>
  )

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950">
      <StudioChrome />

      <div className="relative flex-1 overflow-hidden">
        {needsRuntime ? (
          <AssistantRuntimeBoundary
            key={selectedThreadId ?? 'active'}
            threadId={selectedThreadId ?? undefined}
          >
            {splitView}
          </AssistantRuntimeBoundary>
        ) : (
          splitView
        )}
      </div>

      <FloatingAssistantTrigger
        isOpen={panelOpen}
        onClick={() => setPanelOpen((v) => !v)}
      />
      <AIAssistantPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
      />

      <TourController />
      <TourOverlay />
    </div>
  )
}

/**
 * Mounts the AI runtime once a chat pane is live. Fetches the persisted
 * conversation thread first so messages hydrate before the runtime is
 * created (`useChatRuntime` reads `messages` only at init).
 */
const AssistantRuntimeBoundary: FC<{ children: ReactNode; threadId?: string }> = ({ children, threadId }) => {
  const { aiMode } = usePreferences()
  const { sessionContext } = useFocalEntity()

  const sessionContextRef = useRef(sessionContext)
  useEffect(() => {
    sessionContextRef.current = sessionContext
  }, [sessionContext])

  const lastSentFocalRef = useRef<FocalEntity | null>(null)
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
      threadId,
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
  }, [aiMode, threadId])

  const [hydration, setHydration] = useState<
    | { status: 'loading' }
    | { status: 'ready'; thread: HydratedThread | null }
  >({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    fetchHydratedThread(controller.signal, threadId).then((thread) => {
      if (controller.signal.aborted) return
      setHydration({ status: 'ready', thread })
    })
    return () => controller.abort()
  }, [threadId])

  if (hydration.status === 'loading') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/40" />
      </div>
    )
  }

  return (
    <AssistantRuntimeInner
      initialMessages={hydration.thread?.messages ?? EMPTY_MESSAGES}
      resolveBody={resolveBody}
    >
      {children}
    </AssistantRuntimeInner>
  )
}

interface AssistantRuntimeInnerProps {
  initialMessages: UIMessage[]
  resolveBody: () => Record<string, unknown>
  children: ReactNode
}

const AssistantRuntimeInner: FC<AssistantRuntimeInnerProps> = ({
  initialMessages,
  resolveBody,
  children,
}) => {
  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: '/api/chat/simulation',
        body: resolveBody,
      }),
    [resolveBody]
  )

  const runtime = useChatRuntime({ transport, messages: initialMessages })

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  )
}
