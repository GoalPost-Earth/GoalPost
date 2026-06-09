import { redirect } from 'next/navigation'

/**
 * `/protected/spaces` legacy redirect.
 *
 * The standalone "Where shall we begin?" MeSpace/WeSpace chooser that used
 * to live here was retired once the studio shell became the only protected
 * surface: the canvas Dashboard is now the first page after signup and the
 * home of the spaces-first landing. This stub forwards any lingering
 * links/bookmarks to that canvas surface instead of 404ing. The `me-space/*`
 * and `we-space/*` sub-routes still live under this segment.
 */
export default function SpacesRedirectPage() {
  redirect('/protected/dashboard')
}
