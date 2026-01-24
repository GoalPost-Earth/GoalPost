'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useAnimations } from '@/app/contexts/animation-context'
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
  const { animationsEnabled } = useAnimations()
  const nodeRef = useRef<HTMLDivElement>(null)
  const [isLocalDragging, setIsLocalDragging] = useState(false)
  const hasDraggedRef = useRef(false)
  const velocityRef = useRef({ x: 0, y: 0 })
  const lastMoveTimeRef = useRef(Date.now())
  const animationRef = useRef<gsap.core.Tween | null>(null)
  const displayPositionRef = useRef({
    x: canvasPosition.x,
    y: canvasPosition.y,
  })
  const [displayPosition, setDisplayPosition] = useState(canvasPosition)
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

    let lastX = dragContext.startX
    let lastY = dragContext.startY

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragContext.startMouseX
      const deltaY = e.clientY - dragContext.startMouseY

      if (
        !hasDraggedRef.current &&
        (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)
      ) {
        hasDraggedRef.current = true
      }

      const newX = dragContext.startX + deltaX / scale
      const newY = dragContext.startY + deltaY / scale

      // Track velocity
      const now = Date.now()
      const dt = Math.max(now - lastMoveTimeRef.current, 1) / 16.67 // Normalize to 60fps
      velocityRef.current = {
        x: (newX - lastX) / dt,
        y: (newY - lastY) / dt,
      }
      lastMoveTimeRef.current = now
      lastX = newX
      lastY = newY

      // Cancel any ongoing animation
      if (animationRef.current) {
        animationRef.current.kill()
      }

      // Update visual position immediately while dragging
      displayPositionRef.current = { x: newX, y: newY }
      setDisplayPosition(displayPositionRef.current)

      onPositionChange?.(newX, newY)
    }

    const handleMouseUp = () => {
      setIsLocalDragging(false)
      setDragContext(null)

      // No extra movement on release; rely on last move position already applied

      // Reset velocity
      velocityRef.current = { x: 0, y: 0 }
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

  // Animate to externally imposed positions (e.g., collision resolution) with a soft bounce
  useEffect(() => {
    if (isLocalDragging) return

    const { x, y } = canvasPosition
    const current = displayPositionRef.current

    if (Math.abs(current.x - x) < 0.1 && Math.abs(current.y - y) < 0.1) {
      return
    }

    if (animationRef.current) {
      animationRef.current.kill()
    }

    if (animationsEnabled) {
      animationRef.current = gsap.to(displayPositionRef.current, {
        x,
        y,
        duration: 0.45,
        ease: 'elastic.out(0.42, 0.8)',
        overwrite: true,
        onUpdate: () => {
          setDisplayPosition({ ...displayPositionRef.current })
        },
      })
    } else {
      // Instantly update position without animation
      displayPositionRef.current = { x, y }
      setDisplayPosition({ x, y })
    }

    return () => {
      animationRef.current?.kill()
    }
  }, [canvasPosition, isLocalDragging, animationsEnabled])

  useEffect(() => {
    if (nodeRef.current) {
      if (isVisible) {
        if (animationsEnabled) {
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
          gsap.set(nodeRef.current, { opacity: 1, scale: 1 })
        }
      } else {
        if (animationsEnabled) {
          gsap.to(nodeRef.current, {
            opacity: 0,
            scale: 0,
            duration: 0.3,
            ease: 'power2.in',
          })
        } else {
          gsap.set(nodeRef.current, { opacity: 0, scale: 0 })
        }
      }
    }
  }, [isVisible, delay, animationsEnabled])

  const iconColor =
    confidence > 0.85
      ? 'text-emerald-400'
      : confidence > 0.75
        ? 'text-cyan-400'
        : 'text-amber-400'

  const ringColor =
    confidence > 0.85
      ? 'rgba(16,185,129,0.9)'
      : confidence > 0.75
        ? 'rgba(34,211,238,0.9)'
        : 'rgba(251,191,36,0.9)'

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
        transform: `translate(${displayPosition.x}px, ${displayPosition.y}px) translate(-50%, -50%)`,
        opacity: isDragging ? 0.85 : 1,
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className="flex flex-col items-center gap-3 group cursor-pointer"
        onClick={handleClick}
      >
        {/* Link Node */}
        <div className="relative">
          <div
            className={cn(
              'relative flex items-center justify-center size-14 rounded-full gp-glass border border-white/20',
              'shadow-[0_0_30px_-12px_rgba(19,164,236,0.45)] dark:shadow-[0_0_30px_-12px_rgba(19,164,236,0.6)]',
              'transition-all duration-300 ease-out group-hover:scale-105 group-hover:-translate-y-1'
            )}
          >
            {/* Confidence ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(${ringColor} ${Math.round(confidence * 100)}%, transparent ${Math.round(confidence * 100)}%)`,
                filter: 'blur(6px)',
                opacity: 0.6,
              }}
            />

            {/* Inner core */}
            <div
              className={cn(
                'relative flex items-center justify-center size-12 rounded-full',
                'bg-white/75 dark:bg-black/40 backdrop-blur-md border border-white/30 dark:border-white/10'
              )}
            >
              <span
                className={cn(
                  'material-symbols-outlined text-2xl font-bold',
                  iconColor
                )}
              >
                link
              </span>
            </div>
          </div>

          {/* Confidence Badge */}
          <div className="absolute -top-2 -right-2 size-7 rounded-full bg-white/90 dark:bg-black/60 border border-white/40 dark:border-white/20 flex items-center justify-center shadow-sm">
            <span className="text-[10px] font-bold text-slate-700 dark:text-white/90">
              {Math.round(confidence * 100)}
            </span>
          </div>
        </div>

        {/* Label and Evidence */}
        <div className="flex flex-col items-center text-center transition-all duration-300 group-hover:translate-y-1 max-w-37.5">
          <span className="text-[11px] font-bold text-gp-ink-strong dark:text-white/90 leading-tight line-clamp-2">
            {evidence?.substring(0, 50) || 'Resonance Link'}
          </span>
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-gp-ink-soft dark:text-white/60 mt-0.5">
            Connection
          </span>
        </div>
      </div>
    </div>
  )
}
