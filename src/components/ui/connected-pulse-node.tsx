'use client'

import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { cn } from '@/lib/utils'
import { PulseNode, type PulseNodeProps } from '@/components/ui/pulse-node'

export type ConnectedPulseType = 'goal' | 'resource' | 'story'

export interface ConnectedPulseNodeProps {
  id: string
  icon: string
  label: string
  type: ConnectedPulseType
  animation?: PulseNodeProps['animation']
  canvasPosition: { x: number; y: number }
  isVisible: boolean
  scale?: number
  delay?: number
  onClick?: () => void
  onPositionChange?: (x: number, y: number) => void
}

// Visuals are unified by delegating rendering to PulseNode.

export function ConnectedPulseNode({
  id,
  icon,
  label,
  type,
  animation,
  canvasPosition,
  isVisible,
  scale = 1,
  delay = 0,
  onClick,
  onPositionChange,
}: ConnectedPulseNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const [isLocalDragging, setIsLocalDragging] = useState(false)
  const hasDraggedRef = useRef(false)
  const [dragContext, setDragContext] = useState<null | {
    startMouseX: number
    startMouseY: number
    startX: number
    startY: number
  }>(null)
  // UI is provided by PulseNode for consistency with draggable pulse nodes

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
          {
            opacity: 0,
            scale: 0,
          },
          {
            opacity: 0.8,
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

  return (
    <div
      ref={nodeRef}
      className={cn(
        'absolute -translate-x-1/2 -translate-y-1/2 z-10 opacity-0 scale-0',
        'hover:opacity-100 transition-opacity duration-300',
        isLocalDragging
          ? 'cursor-grabbing transition-none'
          : 'cursor-grab transition-transform duration-150 ease-out'
      )}
      style={{
        top: 0,
        left: 0,
        transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) translate(-50%, -50%)`,
      }}
      onMouseDown={handleMouseDown}
    >
      <PulseNode
        icon={icon}
        label={label}
        type={type}
        animation={animation ?? 'float'}
        position="center"
        onClick={handleClick}
      />
    </div>
  )
}
