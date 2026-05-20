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
import { TourController } from '@/components/onboarding/TourController'
import { TourOverlay } from '@/components/onboarding/TourOverlay'
import {
  StudioCanvasProvider,
  useStudioCanvas,
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

interface ApprovedActionPayload {
  tool: string
  args: Record<string, unknown>
}

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
    <StudioCanvasProvider>
      <BloomOverlayProvider>
        <VisibleEntitiesProvider>
          <StudioBody>{children}</StudioBody>
        </VisibleEntitiesProvider>
      </BloomOverlayProvider>
    </StudioCanvasProvider>
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

  // Open the canvas whenever an external caller wants the assistant to
  // jump into a particular thread or surface — keeps the workflow visible.
  useEffect(() => {
    return onOpenAssistantThread(() => {
      setCanvasOpen(true)
    })
  }, [setCanvasOpen])

  // Effective layout: mobile always forces 'floating', regardless of the
  // user's stored desktop preference.
  const effectiveLayout: 'docked' | 'floating' = isMobile
    ? 'floating'
    : chatLayout

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
        <PanelResizeHandle className="w-1.5 bg-slate-900 hover:bg-gp-primary/40 transition-colors data-[resize-handle-state=drag]:bg-gp-primary/60 cursor-col-resize" />
        <Panel defaultSize={65} minSize={25} order={2}>
          {canvasNode}
        </Panel>
      </PanelGroup>
    )
  })()

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950">
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

  const sessionContextRef = useRef(sessionContext)
  useEffect(() => {
    sessionContextRef.current = sessionContext
  }, [sessionContext])

  // Mirror the canvas snapshot into refs so `resolveBody` (called by
  // assistant-ui at submit time, outside React's render cycle) reads
  // the latest values without forcing a transport rebuild every time
  // the user clicks a node.
  const canvasViewRef = useRef(canvasView)
  useEffect(() => {
    canvasViewRef.current = canvasView
  }, [canvasView])
  const visibleEntitiesRef = useRef(visibleEntities)
  useEffect(() => {
    visibleEntitiesRef.current = visibleEntities
  }, [visibleEntities])

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
      canvasView: canvasViewRef.current,
      canvasVisibleEntities: visibleEntitiesRef.current,
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
