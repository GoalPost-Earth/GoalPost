'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { cn } from '@/lib/utils'

export interface DraggableResonanceLinkNodeProps {
  id: string
  confidence: number
  evidence: string
  canvasPosition: { x: number; y: number }
  scale?: number
  onPositionChange?: (x: number, y: number) => void
  isDragging?: boolean
  onClick?: () => void
  isVisible?: boolean
  delay?: number
}

export function DraggableResonanceLinkNode({
  confidence,
  evidence,
  canvasPosition,
  scale = 1,
  onPositionChange,
  isDragging = false,
  onClick,
  isVisible = true,
  delay = 0,
}: DraggableResonanceLinkNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const [isLocalDragging, setIsLocalDragging] = useState(false)
  const hasDraggedRef = useRef(false)
  const [dragContext, setDragContext] = useState<null | {
    startMouseX: number
    startMouseY: number
    startX: number
    startY: number
  }>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    hasDraggedRef.current = false
    setDragContext({
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: canvasPosition.x,
      startY: canvasPosition.y,
    })
    setIsLocalDragging(true)
  }

  useEffect(() => {
    if (!isLocalDragging || !dragContext) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragContext.startMouseX
      const deltaY = e.clientY - dragContext.startMouseY

      if (
        !hasDraggedRef.current &&
        (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)
      ) {
        hasDraggedRef.current = true
      }

      onPositionChange?.(
        dragContext.startX + deltaX / scale,
        dragContext.startY + deltaY / scale
      )
    }

    const handleMouseUp = () => {
      setIsLocalDragging(false)
      setDragContext(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isLocalDragging, dragContext, onPositionChange, scale])

  const handleClick = () => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false
      return
    }
    onClick?.()
  }

  useEffect(() => {
    if (nodeRef.current) {
      if (isVisible) {
        gsap.fromTo(
          nodeRef.current,
          { opacity: 0, scale: 0 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            delay: delay,
            ease: 'back.out(1.7)',
          }
        )
      } else {
        gsap.to(nodeRef.current, {
          opacity: 0,
          scale: 0,
          duration: 0.3,
          ease: 'power2.in',
        })
      }
    }
  }, [isVisible, delay])

  const confidenceColor =
    confidence > 0.85
      ? 'from-green-400 to-emerald-500'
      : confidence > 0.75
        ? 'from-blue-400 to-cyan-500'
        : 'from-amber-400 to-orange-500'

  return (
    <div
      ref={nodeRef}
      className={cn(
        'absolute',
        isLocalDragging
          ? 'z-50 cursor-grabbing transition-none'
          : 'cursor-grab transition-transform duration-150 ease-out'
      )}
      style={{
        top: 0,
        left: 0,
        transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) translate(-50%, -50%)`,
        opacity: isDragging ? 0.85 : 1,
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className="flex flex-col items-center gap-2 group cursor-pointer"
        onClick={handleClick}
      >
        {/* Link Node */}
        <div className="relative">
          <div
            className={cn(
              'flex items-center justify-center size-12 rounded-lg shadow-lg backdrop-blur-md transition-all duration-300',
              'group-hover:scale-110 group-hover:shadow-xl',
              `bg-gradient-to-br ${confidenceColor}`,
              'border border-white/20'
            )}
          >
            <span className="material-symbols-outlined text-xl text-white font-bold">
              link
            </span>
          </div>

          {/* Confidence Badge */}
          <div className="absolute -top-2 -right-2 size-7 rounded-full bg-white dark:bg-neutral-800 border-2 border-slate-200 dark:border-white/30 flex items-center justify-center shadow-md">
            <span className="text-[11px] font-bold text-slate-700 dark:text-white/90">
              {Math.round(confidence * 100)}
            </span>
          </div>
        </div>

        {/* Label and Evidence */}
        <div className="flex flex-col items-center text-center transition-all duration-300 group-hover:translate-y-1 max-w-[140px]">
          <span className="text-[10px] font-medium text-slate-700 dark:text-white/90 tracking-wide drop-shadow-sm line-clamp-2">
            {evidence?.substring(0, 40) || 'Resonance Link'}
          </span>
          <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/40 mt-0.5">
            Connection
          </span>
        </div>
      </div>
    </div>
  )
}
