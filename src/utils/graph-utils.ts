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

export function getInitials(name: string) {
  const names = name.trim().split(' ')
  const firstName = names[0] != null ? names[0] : ''
  const lastName = names.length > 1 ? names[names.length - 1] : ''
  return firstName && lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`
    : firstName.charAt(0)
}
