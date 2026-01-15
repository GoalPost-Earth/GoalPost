'use client'

export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import type { Node, Relationship } from '@neo4j-nvl/base'
import { InteractiveNvlWrapper } from '@neo4j-nvl/react'
import type { MouseEventCallbacks } from '@neo4j-nvl/react'
import { X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Node metadata for the ontology
const nodeMetadata: Record<
  string,
  {
    category: string
    description: string
    properties: string[]
    relationships: string[]
  }
> = {
  Person: {
    category: 'LifeSensor',
    description: 'Individual user or actor in the system',
    properties: ['id', 'name', 'email', 'passions', 'fieldsOfCare'],
    relationships: [
      'OWNS MeSpace/WeSpace',
      'INITIATED_BY Pulse',
      'HAS_MEMBER Space',
    ],
  },
  Community: {
    category: 'LifeSensor',
    description: 'Group of users with shared interests',
    properties: ['id', 'name', 'type', 'members'],
    relationships: [
      'OWNS MeSpace/WeSpace',
      'HAS_MEMBER Person',
      'INITIATED_BY Pulse',
    ],
  },
  MeSpace: {
    category: 'Personal Space',
    description: 'Private or shared personal container',
    properties: ['id', 'owner', 'members', 'visibility'],
    relationships: ['OWNED_BY Person/Community', 'HAS_CONTEXT', 'HAS_MEMBER'],
  },
  WeSpace: {
    category: 'Collaborative Space',
    description: 'Always-shared collaborative container',
    properties: ['id', 'owner', 'members', 'collaborationType'],
    relationships: ['OWNED_BY Person/Community', 'HAS_CONTEXT', 'HAS_MEMBER'],
  },
  FieldContext: {
    category: 'Thematic Container',
    description: 'Contextual container for related pulses',
    properties: ['id', 'title', 'emergentName', 'pulses'],
    relationships: ['CONTAINED_IN Space', 'HAS_PULSE'],
  },
  GoalPulse: {
    category: 'FieldPulse',
    description: 'Goal-oriented contribution',
    properties: ['id', 'content', 'status', 'horizon', 'initiatedBy'],
    relationships: [
      'CONTAINED_IN Context',
      'INITIATED_BY Person',
      'RESONATES_WITH',
    ],
  },
  ResourcePulse: {
    category: 'FieldPulse',
    description: 'Resource or capability contribution',
    properties: ['id', 'content', 'resourceType', 'availability'],
    relationships: [
      'CONTAINED_IN Context',
      'INITIATED_BY Person/Community',
      'RESONATES_WITH',
    ],
  },
  StoryPulse: {
    category: 'FieldPulse',
    description: 'Narrative or experience contribution',
    properties: ['id', 'content', 'narrative', 'initiatedBy'],
    relationships: [
      'CONTAINED_IN Context',
      'INITIATED_BY Person',
      'RESONATES_WITH',
    ],
  },
  FieldResonance: {
    category: 'AI Pattern',
    description: 'Discovered semantic pattern across pulses',
    properties: ['id', 'label', 'description', 'confidence'],
    relationships: ['RESONATES_AS ResonanceLink', 'DETECTED_BY AI'],
  },
  ResonanceLink: {
    category: 'Explainability',
    description: 'Connection between pulses via resonance',
    properties: ['id', 'confidence', 'evidence', 'source', 'target'],
    relationships: ['SOURCE Pulse', 'TARGET Pulse', 'RESONATES_AS Pattern'],
  },
}

export default function GraphVisualization() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  // Define ontology nodes with NVL structure
  const nodes: Node[] = [
    // Actors (LifeSensors)
    { id: 'Person', caption: 'Person', size: 30, color: '#93c5fd' },
    { id: 'Community', caption: 'Community', size: 30, color: '#93c5fd' },

    // Spaces
    { id: 'MeSpace', caption: 'MeSpace', size: 40, color: '#86efac' },
    { id: 'WeSpace', caption: 'WeSpace', size: 40, color: '#86efac' },

    // Context
    { id: 'FieldContext', caption: 'FieldContext', size: 35, color: '#fde68a' },

    // Pulses
    { id: 'GoalPulse', caption: 'GoalPulse', size: 28, color: '#f9a8d4' },
    {
      id: 'ResourcePulse',
      caption: 'ResourcePulse',
      size: 28,
      color: '#f9a8d4',
    },
    { id: 'StoryPulse', caption: 'StoryPulse', size: 28, color: '#f9a8d4' },

    // Resonance
    {
      id: 'FieldResonance',
      caption: 'FieldResonance',
      size: 28,
      color: '#c4b5fd',
    },
    {
      id: 'ResonanceLink',
      caption: 'ResonanceLink',
      size: 28,
      color: '#c4b5fd',
    },
  ]

  // Define ontology relationships
  const relationships: Relationship[] = [
    // OWNS relationships
    { id: 'r1', from: 'Person', to: 'MeSpace', caption: 'OWNS' },
    { id: 'r2', from: 'Person', to: 'WeSpace', caption: 'OWNS' },
    { id: 'r3', from: 'Community', to: 'MeSpace', caption: 'OWNS' },
    { id: 'r4', from: 'Community', to: 'WeSpace', caption: 'OWNS' },

    // HAS_MEMBER relationships
    { id: 'r5', from: 'Community', to: 'Person', caption: 'HAS_MEMBER' },
    { id: 'r6', from: 'MeSpace', to: 'Person', caption: 'HAS_MEMBER' },
    { id: 'r7', from: 'WeSpace', to: 'Person', caption: 'HAS_MEMBER' },
    { id: 'r8', from: 'WeSpace', to: 'Community', caption: 'HAS_MEMBER' },

    // HAS_CONTEXT relationships
    { id: 'r9', from: 'MeSpace', to: 'FieldContext', caption: 'HAS_CONTEXT' },
    { id: 'r10', from: 'WeSpace', to: 'FieldContext', caption: 'HAS_CONTEXT' },

    // HAS_PULSE relationships
    { id: 'r11', from: 'FieldContext', to: 'GoalPulse', caption: 'HAS_PULSE' },
    {
      id: 'r12',
      from: 'FieldContext',
      to: 'ResourcePulse',
      caption: 'HAS_PULSE',
    },
    { id: 'r13', from: 'FieldContext', to: 'StoryPulse', caption: 'HAS_PULSE' },

    // INITIATED_BY relationships
    { id: 'r14', from: 'GoalPulse', to: 'Person', caption: 'INITIATED_BY' },
    {
      id: 'r15',
      from: 'ResourcePulse',
      to: 'Community',
      caption: 'INITIATED_BY',
    },
    { id: 'r16', from: 'StoryPulse', to: 'Person', caption: 'INITIATED_BY' },

    // Resonance relationships
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
  ]

  const mouseEventCallbacks: MouseEventCallbacks = {
    onNodeClick: (node) => {
      setSelectedNode(node)
    },
    onCanvasClick: () => {
      setSelectedNode(null)
    },
    onDrag: true,
    onPan: true,
    onZoom: true,
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative flex">
      {/* Header */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5 text-slate-300" />
          <span className="text-sm font-medium text-slate-300">Home</span>
        </Link>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-32 z-10 bg-slate-800/80 backdrop-blur border border-white/10 rounded-lg shadow-lg p-6 max-w-md">
        <h1 className="text-2xl font-bold text-white mb-2">Graph Ontology</h1>
        <p className="text-sm text-slate-300 mb-4">
          Pulse-first, context-aware relational data model
        </p>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ background: '#93c5fd' }}
            />
            <span className="font-semibold text-slate-100">Actors:</span>
            <span className="text-slate-300">Person, Community</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ background: '#86efac' }}
            />
            <span className="font-semibold text-slate-100">Spaces:</span>
            <span className="text-slate-300">MeSpace, WeSpace</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ background: '#fde68a' }}
            />
            <span className="font-semibold text-slate-100">Context:</span>
            <span className="text-slate-300">FieldContext</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ background: '#f9a8d4' }}
            />
            <span className="font-semibold text-slate-100">Pulses:</span>
            <span className="text-slate-300">Goal, Resource, Story</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ background: '#c4b5fd' }}
            />
            <span className="font-semibold text-slate-100">AI Layer:</span>
            <span className="text-slate-300">Resonance, Links</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-xs text-slate-300">
            <strong>Click a node</strong> to view details
          </div>
        </div>
      </div>

      {/* Main Graph Visualization */}
      <div className="flex-1">
        <InteractiveNvlWrapper
          nodes={nodes}
          rels={relationships}
          mouseEventCallbacks={mouseEventCallbacks}
        />
      </div>

      {/* Side Panel */}
      {selectedNode && (
        <div className="w-96 h-screen bg-slate-800/80 backdrop-blur shadow-2xl border-l border-white/10 overflow-y-auto z-20">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {selectedNode.caption}
                </h2>
                <p className="text-sm text-slate-300 mt-1">
                  {nodeMetadata[selectedNode.id as string]?.category ||
                    'Node Type'}
                </p>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close panel"
              >
                <X className="w-5 h-5 text-slate-300" />
              </button>
            </div>

            {/* Node Color Indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: selectedNode.color }}
              />
              <span className="text-sm font-medium text-slate-200">
                Node Color
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-100 mb-2">
                Description
              </h3>
              <p className="text-sm text-slate-300">
                {nodeMetadata[selectedNode.id as string]?.description ||
                  'No description available'}
              </p>
            </div>

            {/* Properties */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-100 mb-2">
                Properties
              </h3>
              <div className="bg-slate-700/50 border border-white/10 rounded-lg p-3">
                <ul className="space-y-1 text-sm text-slate-300">
                  {nodeMetadata[selectedNode.id as string]?.properties?.map(
                    (prop) => (
                      <li key={prop} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <code className="text-xs font-mono">{prop}</code>
                      </li>
                    )
                  ) || (
                    <li className="text-slate-400 italic">
                      No properties defined
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Relationships */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-100 mb-2">
                Relationships
              </h3>
              <div className="bg-slate-700/50 border border-white/10 rounded-lg p-3">
                <ul className="space-y-2 text-sm text-slate-300">
                  {nodeMetadata[selectedNode.id as string]?.relationships?.map(
                    (rel, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-slate-400 mt-0.5">→</span>
                        <span>{rel}</span>
                      </li>
                    )
                  ) || (
                    <li className="text-slate-400 italic">
                      No relationships defined
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Technical Details */}
            <div className="pt-6 border-t border-white/10">
              <h3 className="text-sm font-semibold text-slate-100 mb-2">
                Technical Details
              </h3>
              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Node ID:</span>
                  <code className="font-mono">{selectedNode.id}</code>
                </div>
                <div className="flex justify-between">
                  <span>Size:</span>
                  <code className="font-mono">{selectedNode.size}</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
