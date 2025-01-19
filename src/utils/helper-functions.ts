export const help = () => console.log('help')

export const getHumanReadableDate = (date: string, short?: boolean) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: short ? '2-digit' : 'numeric',
    month: short ? 'short' : 'long',
    day: 'numeric',
  })
}

export const getHumanReadableDateTime = (date: string) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  })
}

export const parsePhoneNumber = (phoneNumber?: string | number | null) => {
  if (!phoneNumber) return ''
  // Remove all non-numeric characters
  const cleaned = phoneNumber.toString().replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3]
  }
  return cleaned
}

// TODO: Move this out and use Chakra default Avatar component
export function getInitials(name: string) {
  if (!name) return ''

  const names = name.trim().split(' ')
  const firstName = names[0] != null ? names[0] : ''
  const lastName = names.length > 1 ? names[names.length - 1] : ''
  return firstName && lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`
    : firstName.charAt(0)
}
