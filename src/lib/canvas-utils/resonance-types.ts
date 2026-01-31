/**
 * Type definitions for the resonance visualization system
 */

export interface FieldResonanceNode {
  id: string
  label: string
  description: string
  linkCount: number
  confidence: number // Average confidence of links
  position: { top: string; left: string }
  x: number
  y: number
}

export interface ResonanceLinkNode {
  id: string
  confidence: number
  evidence: string
  resonanceId: string
  position: { top: string; left: string }
  x: number
  y: number
}

export interface PulseNode {
  id: string
  content: string
  type: 'goal' | 'resource' | 'story'
  x: number
  y: number
}

export type ExpandedType = 'field-resonance' | 'resonance-link' | null

export interface ExpandedState {
  type: ExpandedType
  id: string | null
}
