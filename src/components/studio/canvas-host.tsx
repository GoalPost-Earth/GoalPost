'use client'

import { type FC, type ReactNode } from 'react'
import { Maximize2, Minimize2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStudioCanvas } from './studio-canvas-context'

interface CanvasHostProps {
  /** Route content rendered inside the canvas (Next.js `children`). */
  children: ReactNode
  /** True when the canvas is occupying the full viewport (chat hidden). */
  fullscreen: boolean
}

/**
 * The canvas pane — hosts whatever route the user is on. Has a thin glass
 * header with a fullscreen toggle and a close button.
 */
export const CanvasHost: FC<CanvasHostProps> = ({ children, fullscreen }) => {
  const { toggleFullscreen, setCanvasOpen } = useStudioCanvas()

  return (
    <section
      aria-label="Canvas"
      className={cn(
        'relative h-full w-full flex flex-col overflow-hidden bg-slate-950'
      )}
    >
      <header className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-white/10 bg-slate-900/40 backdrop-blur-md">
        <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-white/55">
          Canvas
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => toggleFullscreen('canvas')}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen canvas'}
            title={fullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen (F)'}
            className="hidden md:flex items-center justify-center size-7 rounded-md text-white/55 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            {fullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setCanvasOpen(false)}
            aria-label="Close canvas"
            title="Close canvas"
            className="flex items-center justify-center size-7 rounded-md text-white/55 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <div className="relative flex-1 overflow-hidden">{children}</div>
    </section>
  )
}
