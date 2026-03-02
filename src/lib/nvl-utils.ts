import { createRoot, Root } from 'react-dom/client'
import type { Node, Relationship } from '@neo4j-nvl/base'
import type { ReactNode } from 'react'

// WeakMap to store React roots per container (garbage collects when container is removed)
const rootMap = new WeakMap<HTMLElement, Root>()

/**
 * Creates an empty DOM element container for NVL nodes
 * (actual React rendering happens in useEffect, not during render)
 *
 * CRITICAL: Set pointer-events to none so NVL's drag/pan/zoom handlers work.
 * Interactive elements (buttons, inputs) inside will have pointer-events: auto.
 */
export function createNvlNodeElement(containerId?: string): HTMLElement {
  const container = document.createElement('div')
  if (containerId) {
    container.id = containerId
  }
  container.style.width = '100%'
  container.style.height = '100%'
  container.style.display = 'flex'
  container.style.alignItems = 'center'
  container.style.justifyContent = 'center'
  container.style.pointerEvents = 'none'

  return container
}

/**
 * Renders a React component into an existing container
 * Reuses the same React root for the container to avoid "createRoot called twice" errors
 * Safe to call multiple times with the same container
 */
export function renderReactComponentToContainer(
  component: ReactNode,
  container: HTMLElement
): void {
  // Get existing root or create new one
  let root = rootMap.get(container)
  if (!root) {
    root = createRoot(container)
    rootMap.set(container, root)
  }

  // Update the component
  root.render(component)
}

/**
 * Converts NVL node data to include React component HTML
 * Uses transparent nodes with significant size for drag interaction
 *
 * @param nodeData - Base node data from your application
 * @param size - Optional size for the transparent hitbox (default: 50)
 * @returns NVL Node object with HTML overlay and transparent hitbox
 */
export function createNvlNode(
  nodeData: {
    id: string
    [key: string]: unknown
  },
  size = 50
): Node {
  return {
    ...nodeData,
    html: createNvlNodeElement(`node-${nodeData.id}`),
    size, // Transparent hitbox size for drag interaction
    color: 'rgba(0, 0, 0, 0)', // Fully transparent - only custom components visible
  }
}

/**
 * Converts an array of node data to NVL nodes (without React rendering)
 *
 * @param nodes - Array of node data from your application
 * @returns Array of NVL Node objects with empty containers
 */
export function createNvlNodes(
  nodes: Array<{
    id: string
    [key: string]: unknown
  }>
): Node[] {
  return nodes.map((nodeData) => createNvlNode(nodeData))
}

/**
 * Helper to create NVL relationships from your application data
 *
 * @param relationships - Array of relationship data
 * @returns Array of NVL Relationship objects
 */
export function createNvlRelationships(
  relationships: Array<{
    id: string
    from: string
    to: string
    [key: string]: unknown
  }>
): Relationship[] {
  return relationships.map((rel) => {
    const { id, from, to, ...rest } = rel
    return {
      id,
      from,
      to,
      caption: (rel.caption as string) || (rel.type as string) || '',
      ...Object.fromEntries(
        Object.entries(rest).filter(([key]) => key !== 'caption')
      ),
    } as Relationship
  })
}

/**
 * Updates NVL node HTML when props change (for reactive updates)
 */
export function updateNvlNodeElement(
  node: Node,
  newComponent: ReactNode
): Node {
  if (node.html && node.html instanceof HTMLElement) {
    const root = createRoot(node.html)
    root.render(newComponent)
  }

  return node
}
