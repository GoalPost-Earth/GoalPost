export const getRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffInMs = date.getTime() - now.getTime()
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24))

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  return rtf.format(diffInDays, 'day')
}
