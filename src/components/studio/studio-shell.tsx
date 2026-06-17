'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type MutableRefObject,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { AssistantRuntimeProvider } from '@assistant-ui/react'
import {
  AssistantChatTransport,
  useChatRuntime,
} from '@assistant-ui/react-ai-sdk'
import type { UIMessage } from 'ai'
import {
  NavigationHistoryProvider,
  useFocalEntity,
  useNavigationHistory,
} from '@/contexts'
import { usePreferences } from '@/contexts/preferences-context'
import type { FocalEntity } from '@/lib/focal-entity/types'
import { routeHasCanvasScope } from './canvas-scope'
import {
  fetchHydratedThread,
  type HydratedThread,
} from '@/lib/simulation/conversation-thread-client'
import {
  emitAssistantThreadUpdated,
  onOpenAssistantThread,
} from '@/lib/simulation/assistant-panel-events'
import { TourController } from '@/components/onboarding/TourController'
import { TourOverlay } from '@/components/onboarding/TourOverlay'
import {
  StudioCanvasProvider,
  useStudioCanvas,
  type CanvasView,
} from './studio-canvas-context'
import { BloomOverlayProvider } from './bloom-overlay-context'
import {
  VisibleEntitiesProvider,
  useVisibleEntities,
} from './visible-entities-context'
import { StudioChrome } from './studio-chrome'
import { CanvasHost } from './canvas-host'
import { ChatHost } from './chat-host'
import { FloatingChatTrigger } from './floating-chat-trigger'
import { FloatingChatPanel } from './floating-chat-panel'
import {
  ApprovalActionProvider,
  type ApprovalAction,
} from '@/components/chat/approval-action-context'

const EMPTY_MESSAGES: UIMessage[] = []

export interface StudioShellProps {
  children: ReactNode
}

/**
 * The studio is the protected layout. A primary chat surface sits on the
 * right; a togglable canvas on the left hosts the active route content
 * (dashboard cards, pulse detail, graph, etc.). Either side can be
 * fullscreened.
 */
export const StudioShell: FC<StudioShellProps> = ({ children }) => {
  return (
    <NavigationHistoryProvider>
      <StudioCanvasProvider>
        <BloomOverlayProvider>
          <VisibleEntitiesProvider>
            <StudioBody>{children}</StudioBody>
          </VisibleEntitiesProvider>
        </BloomOverlayProvider>
      </StudioCanvasProvider>
    </NavigationHistoryProvider>
  )
}

const StudioBody: FC<{ children: ReactNode }> = ({ children }) => {
  const {
    canvasOpen,
    fullscreenSide,
    chatLayout,
    floatingChatOpen,
    setCanvasOpen,
    toggleCanvas,
    toggleFullscreen,
    exitFullscreen,
    toggleFloatingChat,
    setFloatingChatOpen,
  } = useStudioCanvas()
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const pathname = usePathname()

  // Content routes other than the dashboard root only ever render through the
  // dashboard canvas surface. When the user navigates to one, make sure the
  // canvas is open and un-fullscreened — otherwise the page is hidden behind a
  // closed canvas or a fullscreened chat and the route appears to do nothing.
  //
  // We deliberately do NOT force the canvas *view* back to 'dashboard' here:
  // `canvasView` is a sticky user preference (persisted in
  // studio-canvas-context). Drilling space → field → pulse must keep whatever
  // view the user was already in, and even routes with no graph representation
  // (persons, profile, settings, search) must not clobber the stored
  // preference — `CanvasHost` falls back to the dashboard view for *display*
  // on those routes via `routeHasCanvasScope`, so returning to a Space /
  // FieldContext restores the user's graph/bloom view intact.
  useEffect(() => {
    if (pathname === '/protected/dashboard') return
    setCanvasOpen(true)
    exitFullscreen()
  }, [pathname, setCanvasOpen, exitFullscreen])

  // Below this breakpoint the studio shows only one surface at a time. The
  // canvas takes priority when open; the user closes it to access chat.
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 767px)')
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // Effective layout: mobile always forces 'floating', regardless of the
  // user's stored desktop preference.
  const effectiveLayout: 'docked' | 'floating' = isMobile
    ? 'floating'
    : chatLayout

  // Open the canvas whenever an external caller wants the assistant to
  // jump into a particular thread or surface — keeps the workflow visible.
  // Doc-ingestion (GOAL-235) emits this with a threadId after upload so the
  // assistant runtime hydrates into the freshly created ingest thread; if
  // the chat is in floating mode we also pop it open so the user actually
  // sees it.
  useEffect(() => {
    return onOpenAssistantThread(({ threadId }) => {
      if (threadId) setSelectedThreadId(threadId)
      setCanvasOpen(true)
      if (effectiveLayout === 'floating') setFloatingChatOpen(true)
    })
  }, [setCanvasOpen, setFloatingChatOpen, effectiveLayout])

  // Keyboard shortcuts.
  //   C   → toggle canvas (docked only)
  //   F   → fullscreen the active side (docked) / toggle floating chat
  //   Esc → exit fullscreen / close floating chat
  //   V   → toggle composer mic (forwarded to chat composer)
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

      if (effectiveLayout === 'docked' && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault()
        toggleCanvas()
        return
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        if (effectiveLayout === 'floating') {
          toggleFloatingChat()
        } else {
          toggleFullscreen(canvasOpen ? 'canvas' : 'chat')
        }
        return
      }

      if (e.key === 'Escape') {
        if (effectiveLayout === 'floating' && floatingChatOpen) {
          e.preventDefault()
          setFloatingChatOpen(false)
          return
        }
        if (fullscreenSide !== null) {
          e.preventDefault()
          exitFullscreen()
          return
        }
      }

      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('goalpost:voice-mic-toggle'))
        return
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    effectiveLayout,
    canvasOpen,
    fullscreenSide,
    floatingChatOpen,
    toggleCanvas,
    toggleFullscreen,
    exitFullscreen,
    toggleFloatingChat,
    setFloatingChatOpen,
  ])

  const canvasNode = (
    <CanvasHost fullscreen={fullscreenSide === 'canvas'}>{children}</CanvasHost>
  )

  const chatNode = (
    <ChatHost
      fullscreen={fullscreenSide === 'chat'}
      selectedThreadId={selectedThreadId}
      onSelectThread={setSelectedThreadId}
      compact={isMobile}
    />
  )

  const mainView = (() => {
    // Floating layout (desktop pref OR mobile): canvas always takes the full
    // viewport; chat is summoned via the floating trigger.
    if (effectiveLayout === 'floating') return canvasNode

    // Docked: classic split with fullscreen shortcuts.
    if (fullscreenSide === 'canvas') return canvasNode
    if (fullscreenSide === 'chat') return chatNode
    if (!canvasOpen) return chatNode

    return (
      <PanelGroup
        direction="horizontal"
        autoSaveId="goalpost.studio.chat35-canvas65.v1"
        className="h-full w-full"
      >
        <Panel defaultSize={35} minSize={20} order={1}>
          {chatNode}
        </Panel>
        <PanelResizeHandle className="w-1.5 bg-gp-glass-border hover:bg-gp-primary/40 transition-colors data-[resize-handle-state=drag]:bg-gp-primary/60 cursor-col-resize" />
        <Panel defaultSize={65} minSize={25} order={2}>
          {canvasNode}
        </Panel>
      </PanelGroup>
    )
  })()

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gp-surface dark:bg-gp-surface-dark">
      <StudioChrome />

      <div className="relative flex-1 overflow-hidden">
        <AssistantRuntimeBoundary
          key={selectedThreadId ?? 'active'}
          threadId={selectedThreadId ?? undefined}
        >
          {mainView}

          {effectiveLayout === 'floating' && (
            <>
              <FloatingChatTrigger />
              <FloatingChatPanel
                fullViewport={isMobile}
                selectedThreadId={selectedThreadId}
                onSelectThread={setSelectedThreadId}
              />
            </>
          )}
        </AssistantRuntimeBoundary>
      </div>

      <TourController />
      <TourOverlay />
    </div>
  )
}

/**
 * Mounts the AI runtime for the chat surface. Fetches the persisted
 * conversation thread first so messages hydrate before the runtime is
 * created (`useChatRuntime` reads `messages` only at init).
 */
const AssistantRuntimeBoundary: FC<{ children: ReactNode; threadId?: string }> = ({ children, threadId }) => {
  const { aiMode } = usePreferences()
  const { sessionContext } = useFocalEntity()
  const { canvasView } = useStudioCanvas()
  const { entities: visibleEntities } = useVisibleEntities()
  const { history: navigationHistory } = useNavigationHistory()
  const pathname = usePathname()

  // What the canvas actually shows the user — the stored `canvasView`
  // preference falls back to 'dashboard' on routes the graph/bloom surfaces
  // can't scope to (persons, profile, settings, search). The assistant's
  // SESSION CONTEXT must reflect this *effective* view, not the raw
  // preference, so it never tells the user they're "in the graph" while the
  // canvas is showing a dashboard page. Mirrors `CanvasHost`'s effective-view.
  const effectiveCanvasView: CanvasView = routeHasCanvasScope(pathname)
    ? canvasView
    : 'dashboard'

  const sessionContextRef = useRef(sessionContext)
  useEffect(() => {
    sessionContextRef.current = sessionContext
  }, [sessionContext])

  // Mirror the canvas snapshot into refs so `resolveBody` (called by
  // assistant-ui at submit time, outside React's render cycle) reads
  // the latest values without forcing a transport rebuild every time
  // the user clicks a node.
  const canvasViewRef = useRef(effectiveCanvasView)
  useEffect(() => {
    canvasViewRef.current = effectiveCanvasView
  }, [effectiveCanvasView])
  const visibleEntitiesRef = useRef(visibleEntities)
  useEffect(() => {
    visibleEntitiesRef.current = visibleEntities
  }, [visibleEntities])
  const navigationHistoryRef = useRef(navigationHistory)
  useEffect(() => {
    navigationHistoryRef.current = navigationHistory
  }, [navigationHistory])

  const lastSentFocalRef = useRef<FocalEntity | null>(null)
  // One-shot approved write action (GOAL-261). Set when the user clicks Approve
  // on an inline HITL card; read and cleared by resolveBody so it rides exactly
  // one outgoing turn, then the backend executes it verbatim.
  const pendingExecuteActionRef = useRef<ApprovalAction | null>(null)

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
      // Phase 1a: forward the names the client already knows so the chat route
      // can skip its server-side Neo4j name resolve. Cosmetic-only (phrasing,
      // not authz); the route falls back to the DB when any present id lacks a
      // hint, so partial/empty hints are always safe.
      sessionNames: {
        currentUserName: snapshot.currentUserName,
        spaceName: snapshot.activeSpaceName,
        spaceType: snapshot.activeSpaceType,
        fieldContextTitle: snapshot.activeFieldContextTitle,
        spaceOwnedByCurrentUser: snapshot.activeSpaceOwnedByCurrentUser,
      },
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
      canvasView: canvasViewRef.current,
      canvasVisibleEntities: visibleEntitiesRef.current,
      navigationHistory: navigationHistoryRef.current
        .filter((entry) => Boolean(entry.label))
        .map((entry) => ({
          type: entry.type,
          id: entry.id,
          label: entry.label,
          visitedAt: entry.visitedAt,
        })),
      // Read-and-clear: a queued approval rides exactly one request, then the
      // ref resets so subsequent turns never re-execute it (mirrors the
      // lastSentFocalRef mutation pattern above).
      executeAction: (() => {
        const action = pendingExecuteActionRef.current
        pendingExecuteActionRef.current = null
        return action
      })(),
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
      <div className="absolute inset-0 flex items-center justify-center bg-gp-surface dark:bg-gp-surface-dark">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gp-ink-soft/40" />
      </div>
    )
  }

  return (
    <AssistantRuntimeInner
      initialMessages={hydration.thread?.messages ?? EMPTY_MESSAGES}
      resolveBody={resolveBody}
      pendingActionRef={pendingExecuteActionRef}
    >
      {children}
    </AssistantRuntimeInner>
  )
}

interface AssistantRuntimeInnerProps {
  initialMessages: UIMessage[]
  resolveBody: () => Record<string, unknown>
  pendingActionRef: MutableRefObject<ApprovalAction | null>
  children: ReactNode
}

const AssistantRuntimeInner: FC<AssistantRuntimeInnerProps> = ({
  initialMessages,
  resolveBody,
  pendingActionRef,
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

  const runtime = useChatRuntime({
    transport,
    messages: initialMessages,
    onFinish: () => emitAssistantThreadUpdated(),
  })

  // Wake the threads sidebar the moment the user clicks send / hits Enter.
  // `composer.send` fires synchronously on submit — earlier than `runStart`
  // (which only fires once assistant-ui has finished building the request),
  // and far earlier than `onFinish` (which waits for the full stream to
  // complete, leaving the sidebar stuck on "No conversations yet" for 5–10s
  // while the user's message bubble is already visible). The chat route
  // persists the user turn fire-and-forget at request-start, so 600ms is
  // enough headroom for the Neo4j write to land before the refetch hits;
  // the sidebar's existing +2.5s retry catches any final state.
  useEffect(() => {
    const unsubscribe = runtime.thread.composer.unstable_on('send', () => {
      window.setTimeout(emitAssistantThreadUpdated, 600)
    })
    return () => unsubscribe()
  }, [runtime])

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ApprovalActionProvider pendingActionRef={pendingActionRef}>
        {children}
      </ApprovalActionProvider>
    </AssistantRuntimeProvider>
  )
}
