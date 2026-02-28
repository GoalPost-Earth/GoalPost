'use client'

import React, { useMemo } from 'react'

type PersonPosition = {
  personId: string
  x: number
  y: number
  firstName: string
  lastName: string
  name: string | null
  email: string | null
  photo: string | null
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST'
}

type PersonConnection = {
  personId: string
  connectedPersonIds: string[]
}

type PersonConnectionLinesProps = {
  personPositions: PersonPosition[]
  connections: PersonConnection[]
  canvasWidth: number
  canvasHeight: number
  scale: number
  activePersonIds?: Set<string>
}

/**
 * PersonConnectionLines
 * Visualizes connection lines between connected person nodes on the canvas.
 * Draws solid lines between persons who have direct connections.
 * Includes clickable midpoint elements to view connection details.
 */
export function PersonConnectionLines({
  personPositions,
  connections,
  canvasWidth,
  canvasHeight,
  scale,
  activePersonIds,
}: PersonConnectionLinesProps) {
  // Build position lookup map
  const positionMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>()
    personPositions.forEach((pos) => {
      map.set(pos.personId, { x: pos.x, y: pos.y })
    })
    return map
  }, [personPositions])

  // Generate line paths - bidirectional handling for active persons
  const lines = useMemo(() => {
    const result: Array<{
      id: string
      x1: number
      y1: number
      x2: number
      y2: number
      person1Id: string
      person2Id: string
    }> = []

    // If no active persons, show no connections
    if (!activePersonIds || activePersonIds.size === 0) return result

    // Track which connections we've already added (by sorted pair ID) to avoid duplicates
    const addedConnections = new Set<string>()

    connections.forEach((connection) => {
      const isSourceActive = activePersonIds.has(connection.personId)

      const sourcePos = positionMap.get(connection.personId)
      if (!sourcePos) return

      connection.connectedPersonIds.forEach((targetId) => {
        // Only show this line if at least one endpoint is active
        const isTargetActive = activePersonIds.has(targetId)
        if (!isSourceActive && !isTargetActive) return // Skip if neither endpoint is active

        const targetPos = positionMap.get(targetId)
        if (!targetPos) return

        // Create unique ID for this connection (sorted to avoid duplicates)
        const ids = [connection.personId, targetId].sort()
        const lineId = `connection-${ids[0]}-${ids[1]}`

        // Check if we've already added this line (to avoid duplicates)
        if (addedConnections.has(lineId)) return

        addedConnections.add(lineId)

        result.push({
          id: lineId,
          x1: sourcePos.x,
          y1: sourcePos.y,
          x2: targetPos.x,
          y2: targetPos.y,
          person1Id: connection.personId,
          person2Id: targetId,
        })
      })
    })

    return result
  }, [connections, positionMap, activePersonIds])

  return (
    <>
      {/* SVG for rendering connections - lines only, no click handling */}
      <svg
        className="absolute inset-0"
        width={canvasWidth}
        height={canvasHeight}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
      >
        <defs>
          <linearGradient
            id="connectionGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="rgb(96, 165, 250)" stopOpacity={0.4} />
            <stop
              offset="50%"
              stopColor="rgb(139, 92, 246)"
              stopOpacity={0.5}
            />
            <stop
              offset="100%"
              stopColor="rgb(96, 165, 250)"
              stopOpacity={0.4}
            />
          </linearGradient>
        </defs>

        {lines.map((line) => (
          <g key={line.id} pointerEvents="none">
            {/* Glow effect */}
            <line
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="url(#connectionGradient)"
              strokeWidth={3 / scale}
              strokeLinecap="round"
              filter="blur(4px)"
              opacity={0.6}
            />
            {/* Main line */}
            <line
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="url(#connectionGradient)"
              strokeWidth={2 / scale}
              strokeLinecap="round"
              strokeDasharray="5,5"
              opacity={0.8}
            />
          </g>
        ))}
      </svg>
    </>
  )
}
