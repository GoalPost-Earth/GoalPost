'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { cn } from '@/lib/utils'

export interface ConnectionLine {
  id: string
  x1: string
  y1: string
  x2: string
  y2: string
  dashArray: string
  duration: number
}

export interface ResonanceConnectionsProps {
  isActive: boolean
  lines: ConnectionLine[]
  className?: string
}

export function ResonanceConnections({
  isActive,
  lines,
  className,
}: ResonanceConnectionsProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const groupRef = useRef<SVGGElement>(null)

  useEffect(() => {
    if (groupRef.current) {
      if (isActive) {
        gsap.to(groupRef.current, {
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
        })
      } else {
        gsap.to(groupRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.in',
        })
      }
    }
  }, [isActive])

  return (
    <svg
      ref={svgRef}
      className={cn(
        'absolute inset-0 w-full h-full pointer-events-none z-0',
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Theme-driven gradient using var(--gp-primary) */}
        <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop
            offset="0%"
            style={{ stopColor: 'var(--gp-primary)', stopOpacity: 0 }}
          />
          <stop
            offset="50%"
            style={{ stopColor: 'var(--gp-primary)', stopOpacity: 0.45 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: 'var(--gp-primary)', stopOpacity: 0 }}
          />
        </linearGradient>

        {/* Glow filter */}
        <filter id="glow-line" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur result="blur" stdDeviation="2" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Lines group with fade in/out */}
      <g ref={groupRef} className="opacity-0 transition-opacity duration-1000">
        {lines.map((line) => (
          <line
            key={line.id}
            filter="url(#glow-line)"
            stroke="url(#pulseGradient)"
            strokeDasharray={line.dashArray}
            strokeWidth="2"
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            style={{ animation: `dash ${line.duration}s linear infinite` }}
          />
        ))}
      </g>

      <style jsx>{`
        @keyframes dash {
          0% {
            stroke-dashoffset: 100;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </svg>
  )
}
