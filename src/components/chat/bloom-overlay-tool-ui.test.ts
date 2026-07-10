import { toBloomOverlayPayload } from './bloom-overlay-tool-ui'

/**
 * Guards the fix for the "graph is not showing anything" failure: the Bloom
 * canvas must render the FULL payload the `query_for_bloom` tool returned, not
 * a subset the model re-serialised. `toBloomOverlayPayload` is the pass-through
 * that feeds `setOverlay`, so it must (a) keep every node/edge verbatim and
 * (b) apply NOTHING on found=false / error / partial shapes.
 */
describe('toBloomOverlayPayload', () => {
  it('passes every node and relationship through verbatim (the multi-node fix)', () => {
    // The exact shape query_for_bloom returns for "my connection to Naa & Ashong".
    const result = {
      found: true,
      summary: 'Two connection chains from you to Naa and Ashong.',
      nodes: [
        { id: 'a', caption: 'John-Dag Addy', color: '#f9a8d4', size: 30, labels: ['Person', 'User'] },
        { id: 'b', caption: 'Naa', color: '#f9a8d4', size: 26, labels: ['Person', 'PersonPulse'] },
        { id: 'c', caption: 'Ashong', color: '#f9a8d4', size: 26, labels: ['Person', 'PersonPulse'] },
      ],
      relationships: [
        { id: 'r1', from: 'a', to: 'b', caption: 'CONNECTED_TO' },
        { id: 'r2', from: 'a', to: 'c', caption: 'CONNECTED_TO' },
      ],
    }
    const payload = toBloomOverlayPayload(result)
    expect(payload).not.toBeNull()
    // All three nodes survive — the regression was 3 → 1.
    expect(payload!.nodes).toHaveLength(3)
    expect(payload!.nodes.map((n) => n.caption)).toEqual([
      'John-Dag Addy',
      'Naa',
      'Ashong',
    ])
    expect(payload!.relationships).toHaveLength(2)
    // Same array references — nothing re-derived.
    expect(payload!.nodes).toBe(result.nodes)
    expect(payload!.relationships).toBe(result.relationships)
    expect(payload!.summary).toBe(result.summary)
  })

  it('does not apply an overlay when the tool found nothing', () => {
    expect(
      toBloomOverlayPayload({ found: false, summary: 'No matching graph data.' })
    ).toBeNull()
  })

  it('does not apply an overlay for an error / non-found result shape', () => {
    expect(toBloomOverlayPayload({ error: 'Failed to query graph' })).toBeNull()
    expect(toBloomOverlayPayload(null)).toBeNull()
    expect(toBloomOverlayPayload(undefined)).toBeNull()
    expect(toBloomOverlayPayload('BLOOM')).toBeNull()
  })

  it('rejects a found result missing the arrays rather than applying a partial', () => {
    expect(toBloomOverlayPayload({ found: true, summary: 'x' })).toBeNull()
    expect(
      toBloomOverlayPayload({ found: true, nodes: [{ id: 'a' }] })
    ).toBeNull()
  })

  it('fails closed on a found result with zero nodes (never switches to a blank canvas)', () => {
    expect(
      toBloomOverlayPayload({ found: true, nodes: [], relationships: [] })
    ).toBeNull()
  })

  it('defaults a missing summary to an empty string', () => {
    const payload = toBloomOverlayPayload({
      found: true,
      nodes: [{ id: 'a', caption: 'A', color: '#fff', size: 20, labels: ['Person'] }],
      relationships: [],
    })
    expect(payload).not.toBeNull()
    expect(payload!.summary).toBe('')
  })
})
