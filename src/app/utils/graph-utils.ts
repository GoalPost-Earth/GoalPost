export function getRandomPosition() {
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth
  const x = Math.floor((Math.random() * viewportWidth * 2) / 3)
  const y = Math.floor((Math.random() * viewportHeight * 2) / 3)
  return { x, y }
}
