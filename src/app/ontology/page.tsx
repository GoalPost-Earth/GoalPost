'use client'

import React from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

const nodeTypes = {
  // Custom node types can be added here if needed
}

// Define node styles
const actorStyle = {
  background: '#6366f1',
  color: 'white',
  border: '2px solid #4f46e5',
  borderRadius: '8px',
  padding: '16px',
  fontSize: '14px',
  fontWeight: 600,
  minWidth: '160px',
}

const spaceStyle = {
  background: '#10b981',
  color: 'white',
  border: '2px solid #059669',
  borderRadius: '8px',
  padding: '16px',
  fontSize: '14px',
  fontWeight: 600,
  minWidth: '160px',
}

const contextStyle = {
  background: '#f59e0b',
  color: 'white',
  border: '2px solid #d97706',
  borderRadius: '8px',
  padding: '16px',
  fontSize: '14px',
  fontWeight: 600,
  minWidth: '160px',
}

const pulseStyle = {
  background: '#ec4899',
  color: 'white',
  border: '2px solid #db2777',
  borderRadius: '8px',
  padding: '16px',
  fontSize: '14px',
  fontWeight: 600,
  minWidth: '160px',
}

const resonanceStyle = {
  background: '#8b5cf6',
  color: 'white',
  border: '2px solid #7c3aed',
  borderRadius: '8px',
  padding: '16px',
  fontSize: '14px',
  fontWeight: 600,
  minWidth: '160px',
}

const initialNodes: Node[] = [
  // Actors
  {
    id: 'person',
    type: 'default',
    position: { x: 100, y: 100 },
    data: {
      label: (
        <div>
          <div className="font-bold text-lg">Person</div>
          <div className="text-xs mt-1">LifeSensor</div>
          <div className="text-xs opacity-80 mt-2">id, name, email</div>
        </div>
      ),
    },
    style: actorStyle,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'community',
    type: 'default',
    position: { x: 100, y: 280 },
    data: {
      label: (
        <div>
          <div className="font-bold text-lg">Community</div>
          <div className="text-xs mt-1">LifeSensor</div>
          <div className="text-xs opacity-80 mt-2">id, name, type</div>
          <div className="text-xs opacity-80">members</div>
        </div>
      ),
    },
    style: actorStyle,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },

  // Spaces
  {
    id: 'mespace',
    type: 'default',
    position: { x: 450, y: 50 },
    data: {
      label: (
        <div>
          <div className="font-bold text-lg">MeSpace</div>
          <div className="text-xs mt-1">Personal Space</div>
          <div className="text-xs opacity-80 mt-2">Private or Shared</div>
          <div className="text-xs opacity-80">owner, members</div>
        </div>
      ),
    },
    style: spaceStyle,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'wespace',
    type: 'default',
    position: { x: 450, y: 230 },
    data: {
      label: (
        <div>
          <div className="font-bold text-lg">WeSpace</div>
          <div className="text-xs mt-1">Collaborative Space</div>
          <div className="text-xs opacity-80 mt-2">Always Shared</div>
          <div className="text-xs opacity-80">owner, members</div>
        </div>
      ),
    },
    style: spaceStyle,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },

  // Context
  {
    id: 'context',
    type: 'default',
    position: { x: 800, y: 140 },
    data: {
      label: (
        <div>
          <div className="font-bold text-lg">FieldContext</div>
          <div className="text-xs mt-1">Thematic Container</div>
          <div className="text-xs opacity-80 mt-2">title, emergentName</div>
          <div className="text-xs opacity-80">pulses</div>
        </div>
      ),
    },
    style: contextStyle,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },

  // Pulses
  {
    id: 'goalpulse',
    type: 'default',
    position: { x: 1150, y: 0 },
    data: {
      label: (
        <div>
          <div className="font-bold text-lg">GoalPulse</div>
          <div className="text-xs mt-1">FieldPulse</div>
          <div className="text-xs opacity-80 mt-2">status, horizon</div>
          <div className="text-xs opacity-80">initiatedBy</div>
        </div>
      ),
    },
    style: pulseStyle,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'resourcepulse',
    type: 'default',
    position: { x: 1150, y: 140 },
    data: {
      label: (
        <div>
          <div className="font-bold text-lg">ResourcePulse</div>
          <div className="text-xs mt-1">FieldPulse</div>
          <div className="text-xs opacity-80 mt-2">resourceType</div>
          <div className="text-xs opacity-80">availability</div>
        </div>
      ),
    },
    style: pulseStyle,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'storypulse',
    type: 'default',
    position: { x: 1150, y: 280 },
    data: {
      label: (
        <div>
          <div className="font-bold text-lg">StoryPulse</div>
          <div className="text-xs mt-1">FieldPulse</div>
          <div className="text-xs opacity-80 mt-2">Narrative pulse</div>
          <div className="text-xs opacity-80">initiatedBy</div>
        </div>
      ),
    },
    style: pulseStyle,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },

  // Resonance
  {
    id: 'resonance',
    type: 'default',
    position: { x: 1500, y: 100 },
    data: {
      label: (
        <div>
          <div className="font-bold text-lg">FieldResonance</div>
          <div className="text-xs mt-1">AI Pattern</div>
          <div className="text-xs opacity-80 mt-2">label, description</div>
        </div>
      ),
    },
    style: resonanceStyle,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'resonancelink',
    type: 'default',
    position: { x: 1500, y: 260 },
    data: {
      label: (
        <div>
          <div className="font-bold text-lg">ResonanceLink</div>
          <div className="text-xs mt-1">Explainability</div>
          <div className="text-xs opacity-80 mt-2">confidence, evidence</div>
          <div className="text-xs opacity-80">source, target</div>
        </div>
      ),
    },
    style: resonanceStyle,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
]

const initialEdges: Edge[] = [
  // Person/Community -> Spaces (OWNS)
  {
    id: 'person-mespace',
    source: 'person',
    target: 'mespace',
    label: 'OWNS',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#6366f1', strokeWidth: 2 },
  },
  {
    id: 'person-wespace',
    source: 'person',
    target: 'wespace',
    label: 'OWNS',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#6366f1', strokeWidth: 2 },
  },
  {
    id: 'community-mespace',
    source: 'community',
    target: 'mespace',
    label: 'OWNS',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#6366f1', strokeWidth: 2 },
  },
  {
    id: 'community-wespace',
    source: 'community',
    target: 'wespace',
    label: 'OWNS',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#6366f1', strokeWidth: 2 },
  },

  // Spaces -> Members (HAS_MEMBER)
  {
    id: 'mespace-members',
    source: 'mespace',
    target: 'person',
    label: 'HAS_MEMBER',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5,5' },
  },
  {
    id: 'wespace-members',
    source: 'wespace',
    target: 'community',
    label: 'HAS_MEMBER',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5,5' },
  },
  {
    id: 'community-members',
    source: 'community',
    target: 'person',
    label: 'HAS_MEMBER',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5,5' },
  },

  // Spaces -> Context (HAS_CONTEXT)
  {
    id: 'mespace-context',
    source: 'mespace',
    target: 'context',
    label: 'HAS_CONTEXT',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#10b981', strokeWidth: 2 },
  },
  {
    id: 'wespace-context',
    source: 'wespace',
    target: 'context',
    label: 'HAS_CONTEXT',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#10b981', strokeWidth: 2 },
  },

  // Context -> Pulses (HAS_PULSE)
  {
    id: 'context-goalpulse',
    source: 'context',
    target: 'goalpulse',
    label: 'HAS_PULSE',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#f59e0b', strokeWidth: 2 },
  },
  {
    id: 'context-resourcepulse',
    source: 'context',
    target: 'resourcepulse',
    label: 'HAS_PULSE',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#f59e0b', strokeWidth: 2 },
  },
  {
    id: 'context-storypulse',
    source: 'context',
    target: 'storypulse',
    label: 'HAS_PULSE',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#f59e0b', strokeWidth: 2 },
  },

  // Pulses -> Person/Community (INITIATED_BY)
  {
    id: 'goalpulse-person',
    source: 'goalpulse',
    target: 'person',
    label: 'INITIATED_BY',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#ec4899', strokeWidth: 2, strokeDasharray: '5,5' },
  },

  // ResonanceLink relationships
  {
    id: 'link-goalpulse',
    source: 'resonancelink',
    target: 'goalpulse',
    label: 'SOURCE/TARGET',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#8b5cf6', strokeWidth: 2 },
  },
  {
    id: 'link-resourcepulse',
    source: 'resonancelink',
    target: 'resourcepulse',
    label: 'SOURCE/TARGET',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#8b5cf6', strokeWidth: 2 },
  },
  {
    id: 'link-resonance',
    source: 'resonancelink',
    target: 'resonance',
    label: 'RESONATES_AS',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#8b5cf6', strokeWidth: 2 },
  },
]

export default function OntologyVisualization() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  return (
    <div className="w-full h-screen bg-gray-50">
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-6 max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          GoalPost Ontology
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Pulse-first, context-aware relational data model
        </p>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ background: '#6366f1' }}
            />
            <span className="font-semibold">Actors:</span>
            <span className="text-gray-600">Person, Community</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ background: '#10b981' }}
            />
            <span className="font-semibold">Spaces:</span>
            <span className="text-gray-600">MeSpace, WeSpace</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ background: '#f59e0b' }}
            />
            <span className="font-semibold">Context:</span>
            <span className="text-gray-600">FieldContext</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ background: '#ec4899' }}
            />
            <span className="font-semibold">Pulses:</span>
            <span className="text-gray-600">Goal, Resource, Story</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ background: '#8b5cf6' }}
            />
            <span className="font-semibold">AI Layer:</span>
            <span className="text-gray-600">Resonance, Links</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <div>
              <strong>Solid lines:</strong> Primary relationships
            </div>
            <div>
              <strong>Dashed lines:</strong> Membership/Initiation
            </div>
            <div>
              <strong>Animated:</strong> Active data flow
            </div>
          </div>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.id === 'person' || node.id === 'community')
              return '#6366f1'
            if (node.id === 'mespace' || node.id === 'wespace') return '#10b981'
            if (node.id === 'context') return '#f59e0b'
            if (node.id.includes('pulse')) return '#ec4899'
            return '#8b5cf6'
          }}
          maskColor="rgb(240, 240, 240, 0.6)"
        />
      </ReactFlow>
    </div>
  )
}
