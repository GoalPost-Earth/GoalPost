/**
 * Resolve the current user's relationship note (`CONNECTED_TO.why`) to a person
 * from that person's connection edges. The edge's `connectedPersonId` is the
 * OTHER end of the relationship, so we match the edge whose other end is the
 * current user.
 *
 * Shared by the three field pages (dashboard / me-space / we-space) so the
 * lookup can't drift between them.
 */
export function resolveRelationshipWhy(
  connectionEdges:
    | Array<{ connectedPersonId?: string | null; why?: string | null }>
    | null
    | undefined,
  currentUserId: string | null | undefined
): string | null {
  if (!currentUserId || !connectionEdges) return null
  return (
    connectionEdges.find((e) => e.connectedPersonId === currentUserId)?.why ||
    null
  )
}
