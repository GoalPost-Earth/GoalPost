import { Node } from '@xyflow/react'

export const help = () => console.log('help')

export const getHumanReadableDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const getHumanReadableDateTime = (date: string) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  })
}

export function calculateNodePositionsAsRings(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  collections: any,
  radiusStep = 300,
  centerX = 100,
  centerY = 100
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodesWithPositions: any = []
  let currentRadius = radiusStep

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  collections.forEach((collection: any) => {
    const numberOfNodes = collection.length
    const angleStep = (2 * Math.PI) / numberOfNodes

    collection.forEach((node: Node, index: number) => {
      const angle = index * angleStep + 10
      const x = centerX + currentRadius * Math.cos(angle)
      const y = centerY + currentRadius * Math.sin(angle)

      nodesWithPositions.push({
        ...node,
        position: { x, y },
      })
    })

    currentRadius += radiusStep / 2
  })

  return nodesWithPositions
}
