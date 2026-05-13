/**
 * Tiny localStorage cache for entity display labels. Detail pages write
 * `space_<id>` and `field_<id>` keys when their query resolves; chrome
 * surfaces (FocalContextBadge breadcrumb) read the cached label to avoid
 * fetching just to render the path.
 *
 * Returns null on SSR, missing keys, or storage-access errors.
 */

export type LabelPrefix = 'space' | 'field'

export function getCachedLabel(
  prefix: LabelPrefix,
  id: string | null | undefined
): string | null {
  if (!id || typeof window === 'undefined') return null
  try {
    const value = window.localStorage.getItem(`${prefix}_${id}`)
    return value && value.trim() ? value : null
  } catch {
    return null
  }
}
