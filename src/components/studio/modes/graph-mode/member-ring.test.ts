import { memberRing } from './bloom-graph-builder'
import { BLOOM_PALETTE_DARK, BLOOM_PALETTE_LIGHT } from './bloom-palette'

/**
 * The ring marks a person who has access to the Space containing the field.
 *
 * It is an `overlayIcon` because NVL has no border/stroke channel on a node —
 * only colour, size, caption and icons. Colour was the obvious alternative and
 * is deliberately NOT used: colour is the legend's type key, so a member colour
 * would move members out of the Person row. A member is a Person.
 */
describe('memberRing', () => {
  it('is a self-contained SVG data URI (no network fetch, works offline)', () => {
    const { url } = memberRing('#fde68a')
    expect(url.startsWith('data:image/svg+xml,')).toBe(true)
    expect(url).not.toMatch(/^https?:/)
  })

  it('strokes with the colour it is handed and never fills', () => {
    const decoded = decodeURIComponent(memberRing('#fde68a').url)
    expect(decoded).toContain('stroke="#fde68a"')
    expect(decoded).toContain('fill="none"')
  })

  it('sits OUTSIDE the node — scaled past the node it rings', () => {
    // size is a multiple of the node's own size; <= 1 would hide the ring
    // inside the fill and the marker would be invisible.
    expect(memberRing('#fde68a').size).toBeGreaterThan(1)
  })

  it('keeps the stroke inside its own viewBox so the ring is not clipped', () => {
    const decoded = decodeURIComponent(memberRing('#fde68a').url)
    const r = Number(/r="(\d+)"/.exec(decoded)?.[1])
    const strokeWidth = Number(/stroke-width="(\d+)"/.exec(decoded)?.[1])
    // circle is centred at 50 in a 100x100 viewBox; half the stroke sits
    // outside the radius, so r + strokeWidth/2 must stay within 50.
    expect(r + strokeWidth / 2).toBeLessThanOrEqual(50)
  })

  it('escapes the markup so the data URI survives as a single URL', () => {
    const { url } = memberRing('#fde68a')
    expect(url).not.toContain('<')
    expect(url).not.toContain('"')
    expect(url).not.toContain(' ')
  })

  it('has a distinct ring colour in light and dark (parity rule)', () => {
    expect(BLOOM_PALETTE_LIGHT.memberRing).toBeDefined()
    expect(BLOOM_PALETTE_DARK.memberRing).toBeDefined()
    expect(BLOOM_PALETTE_LIGHT.memberRing).not.toBe(BLOOM_PALETTE_DARK.memberRing)
  })

  it('is distinguishable from the person fill it rings, in both modes', () => {
    expect(BLOOM_PALETTE_DARK.memberRing).not.toBe(BLOOM_PALETTE_DARK.person)
    expect(BLOOM_PALETTE_LIGHT.memberRing).not.toBe(BLOOM_PALETTE_LIGHT.person)
  })
})
