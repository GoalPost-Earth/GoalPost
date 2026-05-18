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
  StudioModeProvider,
  useStudioMode,
  STUDIO_MODES,
} from './studio-mode-context'
import { StudioChrome } from './studio-chrome'
import { FloatingAssistantTrigger } from './floating-assistant-trigger'
import { DashboardMode } from './modes/dashboard-mode'
import { GraphMode } from './modes/graph-mode'
import { AssistantMode } from './modes/assistant-mode'
import { VoiceMode } from './modes/voice-mode'

interface ApprovedActionPayload {
  tool: string
  args: Record<string, unknown>
}

const EMPTY_MESSAGES: UIMessage[] = []

export interface StudioShellProps {
  children: ReactNode
}

/**
 * The studio is now the protected layout. Hosts every `/protected/*` route
 * as `children` inside Dashboard mode, with Graph / Assistant / Voice modes
 * overlaying the same focal entity.
 */
export const StudioShell: FC<StudioShellProps> = ({ children }) => {
  return (
    <StudioModeProvider>
      <StudioBody>{children}</StudioBody>
    </StudioModeProvider>
  )
}

const StudioBody: FC<{ children: ReactNode }> = ({ children }) => {
  const { mode, setMode, isVisited } = useStudioMode()
  const [panelOpen, setPanelOpen] = useState(false)
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)

  const needsRuntime = isVisited('assistant') || isVisited('voice')

  // Slice 5 (GOAL-240) — open the assistant panel automatically when an
  // upload (or any caller) requests a thread switch. The panel itself also
  // listens for the same event and handles the re-hydrate; the shell's role
  // here is just to make sure the panel is visible.
  useEffect(() => {
    return onOpenAssistantThread(() => {
      setPanelOpen(true)
    })
  }, [])

  // Keyboard shortcuts: 1/2/3/4 to switch modes (ignored while typing).
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
      const idx = Number(e.key) - 1
      if (idx >= 0 && idx < STUDIO_MODES.length) {
        e.preventDefault()
        setMode(STUDIO_MODES[idx])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setMode])

  const aiPanels = (
    <>
      {isVisited('assistant') && (
        <AssistantMode
          visible={mode === 'assistant'}
          activeThreadId={selectedThreadId}
          onSelectThread={setSelectedThreadId}
        />
      )}
      {isVisited('voice') && <VoiceMode visible={mode === 'voice'} />}
    </>
  )

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950">
      <StudioChrome />

      <div className="relative flex-1 overflow-hidden">
        {/* Dashboard mode is always mounted — it owns the route content. */}
        <DashboardMode visible={mode === 'dashboard'}>{children}</DashboardMode>

        {/* Graph mode lazy-mounts on first visit. */}
        {isVisited('graph') && <GraphMode visible={mode === 'graph'} />}

        {/* Assistant + Voice share the AI runtime. Re-keyed when the user
            switches threads so the runtime reinitialises with the right history. */}
        {needsRuntime ? (
          <AssistantRuntimeBoundary
            key={selectedThreadId ?? 'active'}
            threadId={selectedThreadId ?? undefined}
          >
            {aiPanels}
          </AssistantRuntimeBoundary>
        ) : null}
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
 * Mounts the AI runtime once the user enters an AI-driven mode. Fetches the
 * persisted conversation thread first so messages hydrate before the
 * runtime is created (`useChatRuntime` reads `messages` only at init).
 * Re-keyed from StudioBody when `threadId` changes to reload a different thread.
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
