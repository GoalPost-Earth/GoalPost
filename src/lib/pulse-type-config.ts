/**
 * Single source of truth for pulse type configurations
 * Defines icon, label, and color mappings for all pulse node types
 */

export type NodeType = 'goal' | 'resource' | 'story' | 'care' | 'coreValue'

export interface TypeConfig {
  icon: string
  label: string
  color: string
  /** Raw CSS custom property holding this entity's themed color. */
  cssVar: string
  shadowColor: string
  bgClass: string
}

export const PULSE_TYPE_CONFIG: Record<NodeType, TypeConfig> = {
  goal: {
    icon: 'flag',
    label: 'Goal',
    color: 'text-gp-goal',
    cssVar: '--gp-goal',
    shadowColor:
      'color-mix(in srgb, var(--gp-goal, var(--gp-primary)) 55%, transparent)',
    bgClass: 'bg-white/70 dark:bg-black/60',
  },
  resource: {
    icon: 'diamond',
    label: 'Resource',
    color: 'text-gp-resource',
    cssVar: '--gp-resource',
    shadowColor:
      'color-mix(in srgb, var(--gp-resource, var(--gp-primary)) 55%, transparent)',
    bgClass: 'bg-white/70 dark:bg-[#1a1a1a]/60',
  },
  story: {
    icon: 'auto_stories',
    label: 'Story',
    color: 'text-gp-story',
    cssVar: '--gp-story',
    shadowColor:
      'color-mix(in srgb, var(--gp-story, var(--gp-primary)) 55%, transparent)',
    bgClass: 'bg-white/70 dark:bg-[#262626]/60',
  },
  care: {
    icon: 'favorite',
    label: 'Care',
    color: 'text-gp-care',
    cssVar: '--gp-care',
    shadowColor: 'color-mix(in srgb, var(--gp-care, #10b981) 55%, transparent)',
    bgClass: 'bg-white/70 dark:bg-[#1a3a2e]/60',
  },
  coreValue: {
    icon: 'auto_awesome',
    label: 'Core Value',
    color: 'text-gp-coreValue',
    cssVar: '--gp-coreValue',
    shadowColor:
      'color-mix(in srgb, var(--gp-coreValue, #8b5cf6) 55%, transparent)',
    bgClass: 'bg-white/70 dark:bg-[#2d1f3a]/60',
  },
}

/**
 * Organization (GOAL-298 / GOAL-299) is a first-class relational entity, NOT a
 * pulse — so it lives outside `NodeType`/`PULSE_TYPE_CONFIG`. Kept here so the
 * one file that owns entity icon+color mappings stays the single source of
 * truth (drawer, graph legend, and bloom all read from it). Teal, matching the
 * cypher-generator graph color (`--gp-org` / `#5eead4`). Icon: `apartment`.
 */
export const ORGANIZATION_CONFIG = {
  icon: 'apartment',
  label: 'Organization',
  color: 'text-gp-org',
  cssVar: '--gp-org',
  shadowColor: 'color-mix(in srgb, var(--gp-org, var(--gp-story)) 55%, transparent)',
} as const

/** Display order for the pulse type selector. */
export const PULSE_TYPE_ORDER: NodeType[] = [
  'goal',
  'resource',
  'story',
  'care',
  'coreValue',
]

/**
 * Get the icon for a given pulse type
 */
export function getIconForType(type: NodeType): string {
  return PULSE_TYPE_CONFIG[type].icon
}

/**
 * Get the label for a given pulse type
 */
export function getLabelForType(type: NodeType): string {
  return PULSE_TYPE_CONFIG[type].label
}

/**
 * Get the full config for a given pulse type
 */
export function getConfigForType(type: NodeType): TypeConfig {
  return PULSE_TYPE_CONFIG[type]
}
