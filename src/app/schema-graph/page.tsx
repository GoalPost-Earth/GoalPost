'use client'

export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import type { Node, Relationship } from '@neo4j-nvl/base'
import { InteractiveNvlWrapper } from '@neo4j-nvl/react'
import type { MouseEventCallbacks } from '@neo4j-nvl/react'

export default function SchemaGraphVisualization() {
  // Define schema nodes
  const [nodes] = useState<Node[]>([
    {
      id: 'Person',
      caption: 'Person',
      size: 30,
      color: '#93c5fd',
    },
    {
      id: 'Community',
      caption: 'Community',
      size: 30,
      color: '#93c5fd',
    },
    {
      id: 'MeSpace',
      caption: 'MeSpace',
      size: 50,
      color: '#86efac',
    },
    {
      id: 'WeSpace',
      caption: 'WeSpace',
      size: 50,
      color: '#86efac',
    },
    {
      id: 'FieldContext',
      caption: 'FieldContext',
      size: 30,
      color: '#fde68a',
    },
    {
      id: 'GoalPulse',
      caption: 'GoalPulse',
      size: 25,
      color: '#f9a8d4',
    },
    {
      id: 'ResourcePulse',
      caption: 'ResourcePulse',
      size: 25,
      color: '#f9a8d4',
    },
    {
      id: 'StoryPulse',
      caption: 'StoryPulse',
      size: 25,
      color: '#f9a8d4',
    },
    {
      id: 'FieldResonance',
      caption: 'FieldResonance',
      size: 25,
      color: '#c4b5fd',
    },
    {
      id: 'ResonanceLink',
      caption: 'ResonanceLink',
      size: 25,
      color: '#c4b5fd',
    },
  ])

  // Define schema relationships
  const [relationships] = useState<Relationship[]>([
    // OWNS
    { id: 'r1', from: 'Person', to: 'MeSpace', caption: 'OWNS' },
    { id: 'r2', from: 'Person', to: 'WeSpace', caption: 'OWNS' },
    { id: 'r3', from: 'Community', to: 'MeSpace', caption: 'OWNS' },
    { id: 'r4', from: 'Community', to: 'WeSpace', caption: 'OWNS' },

    // HAS_MEMBER
    { id: 'r5', from: 'Community', to: 'Person', caption: 'HAS_MEMBER' },
    { id: 'r6', from: 'MeSpace', to: 'Person', caption: 'HAS_MEMBER' },
    { id: 'r7', from: 'WeSpace', to: 'Person', caption: 'HAS_MEMBER' },
    { id: 'r8', from: 'WeSpace', to: 'Community', caption: 'HAS_MEMBER' },

    // HAS_CONTEXT
    { id: 'r9', from: 'MeSpace', to: 'FieldContext', caption: 'HAS_CONTEXT' },
    { id: 'r10', from: 'WeSpace', to: 'FieldContext', caption: 'HAS_CONTEXT' },

    // HAS_PULSE
    { id: 'r11', from: 'FieldContext', to: 'GoalPulse', caption: 'HAS_PULSE' },
    {
      id: 'r12',
      from: 'FieldContext',
      to: 'ResourcePulse',
      caption: 'HAS_PULSE',
    },
    { id: 'r13', from: 'FieldContext', to: 'StoryPulse', caption: 'HAS_PULSE' },

    // INITIATED_BY
    { id: 'r14', from: 'GoalPulse', to: 'Person', caption: 'INITIATED_BY' },
    {
      id: 'r15',
      from: 'ResourcePulse',
      to: 'Community',
      caption: 'INITIATED_BY',
    },
    { id: 'r16', from: 'StoryPulse', to: 'Person', caption: 'INITIATED_BY' },

    // Resonance
    { id: 'r17', from: 'ResonanceLink', to: 'GoalPulse', caption: 'SOURCE' },
    {
      id: 'r18',
      from: 'ResonanceLink',
      to: 'ResourcePulse',
      caption: 'TARGET',
    },
    {
      id: 'r19',
      from: 'ResonanceLink',
      to: 'FieldResonance',
      caption: 'RESONATES_AS',
    },
    { id: 'r20', from: 'ResonanceLink', to: 'Person', caption: 'DETECTED_BY' },
  ])

  const mouseEventCallbacks: MouseEventCallbacks = {
    onNodeClick: (node) => {
      console.log('Clicked node:', node)
    },
    onRelationshipClick: (rel) => {
      console.log('Clicked relationship:', rel)
    },
    onCanvasClick: () => {
      console.log('Clicked canvas')
    },
    onDrag: true,
    onPan: true,
    onZoom: (zoomLevel) => {
      console.log('Zoom level:', zoomLevel)
    },
  }

  return (
    <div className="w-full h-screen bg-gray-50 relative">
      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-6 max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Neo4j Graph Schema
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Complete ontology with all node labels and relationships
        </p>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span className="font-semibold">LifeSensors:</span>
            <span className="text-gray-600">Person, Community</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="font-semibold">Spaces:</span>
            <span className="text-gray-600">MeSpace, WeSpace</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <span className="font-semibold">Contexts:</span>
            <span className="text-gray-600">FieldContext</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-pink-500" />
            <span className="font-semibold">Pulses:</span>
            <span className="text-gray-600">Goal, Resource, Story</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-500" />
            <span className="font-semibold">Resonance:</span>
            <span className="text-gray-600">Links, Patterns</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs font-semibold text-gray-700 mb-2">
            Relationships:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>• OWNS</div>
            <div>• HAS_MEMBER</div>
            <div>• HAS_CONTEXT</div>
            <div>• HAS_PULSE</div>
            <div>• INITIATED_BY</div>
            <div>• SOURCE/TARGET</div>
            <div>• RESONATES_AS</div>
            <div>• DETECTED_BY</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <div>
              <strong>Tip:</strong> Click nodes to inspect
            </div>
            <div>
              <strong>Tip:</strong> Drag to pan, scroll to zoom
            </div>
            <div>
              <strong>Tip:</strong> Check console for click events
            </div>
          </div>
        </div>
      </div>

      {/* Graph Visualization */}
      <InteractiveNvlWrapper
        nodes={nodes}
        rels={relationships}
        mouseEventCallbacks={mouseEventCallbacks}
        nvlOptions={{
          layout: 'forceDirected',
          initialZoom: 0.8,
          allowDynamicMinZoom: true,
        }}
      />
    </div>
  )
}
