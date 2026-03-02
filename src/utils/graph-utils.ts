import * as d3 from 'd3-force'

export function getRandomPosition() {
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth
  const x = Math.floor((Math.random() * viewportWidth * 2) / 3)
  const y = Math.floor((Math.random() * viewportHeight * 2) / 3)
  return { x, y }
}

export const createForceLayout = (
  nodes: d3.SimulationNodeDatum[]
): d3.SimulationNodeDatum[] => {
  const simulation = d3
    .forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(1000))
    .force('center', d3.forceCenter(200, 200))
    .force('collision', d3.forceCollide(80))

  for (let i = 0; i < 300; i++) simulation.tick()

  return nodes.map((node) => ({
    ...node,
    position: { x: node.x ?? 0, y: node.y ?? 0 },
  }))
}

export function formatDate(inputDate: string) {
  const date = new Date(inputDate)

  if (!date) {
    throw new Error('Invalid date input')
  }

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}.${month}.${year}`
}

/**
 * Format resonance link labels from snake_case/UPPER_CASE
 * Example: "APPLIED_TO" -> "APPLIED TO", "CONNECTED_TO" -> "CONNECTED TO"
 * For mixed case labels, apply Title Case
 */
export function formatResonanceLabel(label: string): string {
  if (!label) return ''

  // If the label is all uppercase (like APPLIED_TO), keep uppercase and replace underscores
  if (label === label.toUpperCase() && label.includes('_')) {
    return label.replace(/_/g, ' ')
  }

  // Otherwise, apply title case (for mixed case labels)
  return label
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
