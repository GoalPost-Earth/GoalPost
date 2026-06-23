import { redirect } from 'next/navigation'

/**
 * `/protected/spaces` legacy redirect.
 *
 * The standalone "Where shall we begin?" MeSpace/WeSpace chooser that used
 * to live here was retired once the studio shell became the only protected
 * surface: the canvas Dashboard is now the first page after signup and the
 * home of the spaces-first landing. The legacy `me-space/*` and `we-space/*`
 * graph + field sub-routes have since been removed too — spaces now live at
 * /protected/dashboard/space/[id] and fields at
 * /protected/dashboard/field-context/[id]. This stub forwards any lingering
 * links/bookmarks to the dashboard instead of 404ing.
 */
export default function SpacesRedirectPage() {
  redirect('/protected/dashboard')
}
