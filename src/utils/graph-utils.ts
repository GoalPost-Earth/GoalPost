import { Node } from '@xyflow/react'

export function getRandomPosition() {
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth
  const x = Math.floor((Math.random() * viewportWidth * 2) / 3)
  const y = Math.floor((Math.random() * viewportHeight * 2) / 3)
  return { x, y }
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
