import type { ContactRecord } from './contact-import'

/**
 * GOAL-382 — a small vCard reader for contact import.
 *
 * Handles the three versions real address books export: 2.1 (older Outlook
 * and Android, with QUOTED-PRINTABLE values), 3.0 (Apple Contacts, iCloud,
 * Google) and 4.0. A file may hold any number of cards. Only the properties
 * the import maps are interpreted; everything else (PHOTO, BDAY, X-* fields
 * other than X-ABShowAs) is ignored rather than rejected.
 */

interface VCardProperty {
  name: string
  params: Record<string, string>
  value: string
}

/**
 * Join folded lines. vCard 3.0/4.0 fold by starting the continuation with a
 * space or tab; 2.1 QUOTED-PRINTABLE values instead end a line with a soft
 * break (`=`) and continue on the next line with no leading whitespace.
 */
function unfoldLines(text: string): string[] {
  const raw = text.replace(/\r\n?/g, '\n').split('\n')
  const lines: string[] = []
  for (const line of raw) {
    const previous = lines.length - 1
    if (previous >= 0 && /^[ \t]/.test(line)) {
      lines[previous] += line.slice(1)
    } else if (
      previous >= 0 &&
      /QUOTED-PRINTABLE/i.test(lines[previous]) &&
      lines[previous].endsWith('=')
    ) {
      lines[previous] = lines[previous].slice(0, -1) + line
    } else {
      lines.push(line)
    }
  }
  return lines
}

/** Index of the first `:` that is not inside a double-quoted parameter value. */
function findValueSeparator(line: string): number {
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (char === '"') quoted = !quoted
    else if (char === ':' && !quoted) return index
  }
  return -1
}

function decodeQuotedPrintable(value: string): string {
  const bytes: number[] = []
  for (let index = 0; index < value.length; index += 1) {
    const hex = value.slice(index + 1, index + 3)
    if (value[index] === '=' && /^[0-9A-Fa-f]{2}$/.test(hex)) {
      bytes.push(parseInt(hex, 16))
      index += 2
    } else {
      bytes.push(value.charCodeAt(index))
    }
  }
  return new TextDecoder().decode(new Uint8Array(bytes))
}

function parseProperty(line: string): VCardProperty | null {
  const separator = findValueSeparator(line)
  if (separator <= 0) return null
  const [rawName, ...rawParams] = line.slice(0, separator).split(';')
  // Apple exports group-prefix properties (`item1.EMAIL`); the group is noise.
  const name = rawName.split('.').pop()!.toUpperCase()
  const params: Record<string, string> = {}
  for (const param of rawParams) {
    const [key, paramValue] = param.split('=')
    // 2.1 allows bare parameter values (`TEL;CELL:`), which mean TYPE=CELL.
    if (paramValue === undefined) params.TYPE = `${params.TYPE ?? ''},${key}`
    else if (key.toUpperCase() === 'TYPE') {
      // TYPE may repeat (`type=pref;type=INTERNET`); keep every value, so a
      // PREF that is not the last TYPE parameter is still seen.
      params.TYPE = `${params.TYPE ?? ''},${paramValue.replace(/"/g, '')}`
    } else params[key.toUpperCase()] = paramValue.replace(/"/g, '')
  }
  let value = line.slice(separator + 1)
  // 2.1 also allows the bare form (`NOTE;QUOTED-PRINTABLE:`), read as TYPE.
  if (
    /QUOTED-PRINTABLE/i.test(`${params.ENCODING ?? ''},${params.TYPE ?? ''}`)
  ) {
    value = decodeQuotedPrintable(value)
  }
  return { name, params, value }
}

/** Split a structured value (N, ORG, ADR) on its unescaped `;` separators. */
function splitComponents(value: string): string[] {
  const parts: string[] = []
  let current = ''
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]
    if (char === '\\' && index + 1 < value.length) {
      current += char + value[index + 1]
      index += 1
    } else if (char === ';') {
      parts.push(current)
      current = ''
    } else {
      current += char
    }
  }
  parts.push(current)
  return parts.map(unescapeText)
}

function unescapeText(value: string): string {
  return value.replace(/\\([nN,;\\])/g, (_, char: string) =>
    char === 'n' || char === 'N' ? '\n' : char
  )
}

/** The PREF-marked value when there is one, otherwise the first. */
function preferred(properties: VCardProperty[]): string | undefined {
  const isPreferred = (property: VCardProperty) =>
    /\bpref\b/i.test(property.params.TYPE ?? '') || property.params.PREF === '1'
  const chosen = properties.find(isPreferred) ?? properties[0]
  return chosen ? unescapeText(chosen.value).trim() || undefined : undefined
}

function cardToContact(
  properties: VCardProperty[],
  row: number
): ContactRecord {
  const all = (name: string) => properties.filter((p) => p.name === name)
  const first = (name: string) => all(name)[0]

  const [family, given] = first('N') ? splitComponents(first('N')!.value) : []
  const [organization] = first('ORG')
    ? splitComponents(first('ORG')!.value)
    : []
  const fullName = first('FN') ? unescapeText(first('FN')!.value) : undefined
  // ADR = PO box; extended; street; locality; region; postal code; country.
  const address = first('ADR') ? splitComponents(first('ADR')!.value) : []
  const location = [address[3], address[4], address[6]]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ')

  // Explicit (vCard 4 KIND, Apple's X-ABShowAs), or implied: a card with no
  // personal name whose display name, if any, is just the organization —
  // the same rule the CSV profiles apply to a Company-only row.
  const isOrganization =
    /^org/i.test(first('KIND')?.value.trim() ?? '') ||
    /^company$/i.test(first('X-ABSHOWAS')?.value.trim() ?? '') ||
    (!given?.trim() &&
      !family?.trim() &&
      Boolean(organization?.trim()) &&
      (!fullName?.trim() || fullName.trim() === organization.trim()))

  const shared = {
    row,
    email: preferred(all('EMAIL')),
    // vCard 4 may give TEL as a URI (`tel:+1…`).
    phone: preferred(all('TEL'))?.replace(/^tel:/i, ''),
    location: location || undefined,
    description: first('NOTE') ? unescapeText(first('NOTE')!.value) : undefined,
  }

  if (isOrganization) {
    return {
      ...shared,
      kind: 'organization',
      name: organization || fullName,
      website: preferred(all('URL')),
    }
  }
  return {
    ...shared,
    kind: 'person',
    firstName: given,
    lastName: family,
    name: fullName,
    organization,
    jobTitle: first('TITLE') ? unescapeText(first('TITLE')!.value) : undefined,
  }
}

/** Every card in a .vcf file, mapped onto the canonical contact shape. */
export function parseVCardContacts(text: string): ContactRecord[] {
  const contacts: ContactRecord[] = []
  let current: VCardProperty[] | null = null
  for (const line of unfoldLines(text)) {
    const trimmed = line.trim()
    if (/^BEGIN:VCARD$/i.test(trimmed)) {
      current = []
    } else if (/^END:VCARD$/i.test(trimmed)) {
      if (current) contacts.push(cardToContact(current, contacts.length + 1))
      current = null
    } else if (current && trimmed) {
      const property = parseProperty(trimmed)
      if (property) current.push(property)
    }
  }
  return contacts
}
