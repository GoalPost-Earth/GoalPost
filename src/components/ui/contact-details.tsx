'use client'

import type { FC, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Contact details as compact chips — organization + role, phone, email,
 * website, location (GOAL-382: what the contact importer writes, so a member
 * can check an import landed).
 *
 * Shared by the person drawer, the full person profile and the field's person
 * panel (which read it from `privateProfile`, so it only renders for a caller
 * allowed to see the person's PII), and by the organization drawer (an org's
 * own published details). Chips wrap rather than overflow on a phone, and
 * nothing renders when there is nothing to show.
 */

export interface AffiliationView {
  organizationId: string
  name: string
  role?: string | null
}

/** Only http(s) is ever linked — anything else renders as plain text. */
const SAFE_WEB_URL = /^https?:\/\//i

function Chip({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <span className="inline-flex max-w-full min-w-0 items-center gap-1 rounded-full border border-gp-glass-border bg-gp-glass-bg/60 px-2.5 py-1 text-[11px] text-gp-ink-strong dark:text-white/85">
      <span
        className="material-symbols-outlined text-[13px] text-gp-ink-muted shrink-0"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="truncate">{children}</span>
    </span>
  )
}

const linkClass =
  'block max-w-full rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gp-primary'

export const ContactDetails: FC<{
  phone?: string | null
  email?: string | null
  website?: string | null
  location?: string | null
  affiliations?: AffiliationView[] | null
  /** Centred under a centred name (people), or left-aligned (organizations). */
  align?: 'center' | 'start'
}> = ({ phone, email, website, location, affiliations, align = 'center' }) => {
  const organizations = affiliations ?? []
  if (!phone && !email && !website && !location && organizations.length === 0)
    return null

  return (
    <ul
      className={cn(
        // w-full: inside an items-center column the list would otherwise
        // size to its unwrapped chips and overflow rather than truncate.
        'mt-3 flex w-full flex-wrap gap-1.5 min-w-0',
        align === 'center' ? 'justify-center' : 'justify-start'
      )}
      aria-label="Contact details"
    >
      {organizations.map((affiliation) => (
        <li key={affiliation.organizationId} className="min-w-0 max-w-full">
          <Chip icon="apartment">
            {affiliation.role ? (
              <>
                {affiliation.role}
                <span className="text-gp-ink-muted"> · </span>
                {affiliation.name}
              </>
            ) : (
              affiliation.name
            )}
          </Chip>
        </li>
      ))}
      {phone && (
        <li className="min-w-0 max-w-full">
          <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className={linkClass}>
            <Chip icon="call">{phone}</Chip>
          </a>
        </li>
      )}
      {email && (
        <li className="min-w-0 max-w-full">
          <a href={`mailto:${email}`} className={linkClass}>
            <Chip icon="mail">{email}</Chip>
          </a>
        </li>
      )}
      {website && (
        <li className="min-w-0 max-w-full">
          {SAFE_WEB_URL.test(website) ? (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              <Chip icon="language">
                {website.replace(SAFE_WEB_URL, '').replace(/\/$/, '')}
              </Chip>
            </a>
          ) : (
            <Chip icon="language">{website}</Chip>
          )}
        </li>
      )}
      {location && (
        <li className="min-w-0 max-w-full">
          <Chip icon="location_on">{location}</Chip>
        </li>
      )}
    </ul>
  )
}
