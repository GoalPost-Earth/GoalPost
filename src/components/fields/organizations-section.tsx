'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { SectionHeader } from '@/components/persons/section-header'
import { ContactDetails } from '@/components/ui/contact-details'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { dispatchOpenInfoDrawer } from '@/components/dashboard/entity-info-drawer/types'
import { ORGANIZATION_CONFIG } from '@/lib/pulse-type-config'
import {
  DELETE_ORGANIZATION_FROM_FIELD_CONTEXT_MUTATION,
  REMOVE_ORGANIZATION_FROM_FIELD_CONTEXT_MUTATION,
} from '@/app/graphql/mutations/ORGANIZATION_MUTATIONS'
import { EmptySection } from './field-section-primitives'
import { SectionList } from './section-list'
import { DeleteOrganizationDialog } from './delete-organization-dialog'

export interface FieldOrganization {
  id: string
  name: string
  description?: string | null
  email?: string | null
  phone?: string | null
  website?: string | null
  location?: string | null
}

interface OrganizationsSectionProps {
  contextId: string
  organizations: FieldOrganization[]
  /** canEditContent on the field — gates Remove / Delete (never GUESTs). */
  canEdit: boolean
  onChanged: () => Promise<unknown> | void
}

/**
 * GOAL-387 — the field's organizations in the Dashboard view, alongside
 * People. Until now they only appeared on the Bloom canvas (GOAL-386), so a
 * member had no way to take one out of a field.
 *
 * Each row opens the organization drawer. Editors also get a menu with
 * "Remove from field" (this field only — and if no other field holds it, it
 * is deleted, since nothing could reach it any more) and "Delete
 * organization" (confirmed in-app first). The server re-checks edit rights on
 * both; hiding the menu from GUESTs is only "don't show a control they can't
 * use".
 */
export function OrganizationsSection({
  contextId,
  organizations,
  canEdit,
  onChanged,
}: OrganizationsSectionProps) {
  const [pendingDelete, setPendingDelete] = useState<FieldOrganization | null>(
    null
  )
  // Set on open and never cleared, so the title survives the close animation.
  const [deleteDialogName, setDeleteDialogName] = useState('')
  const [removeOrganization] = useMutation(
    REMOVE_ORGANIZATION_FROM_FIELD_CONTEXT_MUTATION
  )
  const [deleteOrganization, { loading: isDeleting }] = useMutation(
    DELETE_ORGANIZATION_FROM_FIELD_CONTEXT_MUTATION
  )

  const handleRemove = async (org: FieldOrganization) => {
    try {
      const { data } = await removeOrganization({
        variables: { contextId, organizationId: org.id },
      })
      const result = data?.removeOrganizationFromFieldContext
      if (!result?.success) {
        toast.error(result?.message || 'Could not remove the organization.')
        return
      }
      // Refetch first so the row is gone by the time the toast says so.
      await onChanged()
      toast.success(`Removed ${org.name} from this field.`)
    } catch {
      toast.error('Could not remove the organization.')
    }
  }

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return
    try {
      const { data } = await deleteOrganization({
        variables: { contextId, organizationId: pendingDelete.id },
      })
      const result = data?.deleteOrganizationFromFieldContext
      if (!result?.success) {
        toast.error(result?.message || 'Could not delete the organization.')
        return
      }
      await onChanged()
      setPendingDelete(null)
      toast.success(result.message)
    } catch {
      toast.error('Could not delete the organization.')
    }
  }

  return (
    <section className="flex flex-col gap-4 min-w-0">
      <SectionHeader
        icon={ORGANIZATION_CONFIG.icon}
        title={`Organizations${organizations.length > 0 ? ` (${organizations.length})` : ''}`}
      />

      {organizations.length === 0 ? (
        <EmptySection
          icon={ORGANIZATION_CONFIG.icon}
          title="No organizations yet"
          body="Organizations named in an uploaded document, or imported from a contacts file, show up here."
        />
      ) : (
        <SectionList
          items={organizations}
          getKey={(org) => org.id}
          getSearchText={(org) =>
            [org.name, org.description, org.location].filter(Boolean).join(' ')
          }
          title="Organizations"
          icon={ORGANIZATION_CONFIG.icon}
          noun="organizations"
          as="ul"
          listClassName="space-y-2"
          renderItem={(org) => (
            <li className="flex items-start gap-2 min-w-0 rounded-xl border border-gp-glass-border bg-gp-glass-bg/40 p-3">
              <button
                type="button"
                onClick={() =>
                  dispatchOpenInfoDrawer({
                    type: 'Organization',
                    id: org.id,
                    label: org.name,
                  })
                }
                className="flex-1 min-w-0 flex items-start gap-3 text-left cursor-pointer rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gp-primary"
              >
                <span
                  className="shrink-0 size-9 rounded-xl border flex items-center justify-center bg-gp-org/15 border-gp-org/40 text-gp-org"
                  aria-hidden="true"
                >
                  <span className="material-symbols-outlined text-[20px] leading-none">
                    {ORGANIZATION_CONFIG.icon}
                  </span>
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-gp-ink-strong dark:text-white truncate">
                    {org.name}
                  </span>
                  {org.description && (
                    <span className="block text-[11px] text-gp-ink-muted dark:text-gp-ink-soft truncate">
                      {org.description}
                    </span>
                  )}
                  <ContactDetails
                    align="start"
                    phone={org.phone}
                    email={org.email}
                    website={org.website}
                    location={org.location}
                  />
                </span>
              </button>

              {canEdit && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label={`Actions for ${org.name}`}
                      className="shrink-0 size-8 rounded-full flex items-center justify-center text-gp-ink-muted hover:text-gp-ink-strong hover:bg-gp-glass-bg transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        more_vert
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="gp-glass w-56 rounded-xl border-gp-glass-border p-1.5"
                  >
                    <DropdownMenuItem
                      onSelect={() => void handleRemove(org)}
                      className="gp-menu-item cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 focus:bg-transparent focus:text-gp-primary"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        link_off
                      </span>
                      <span className="text-sm font-medium">
                        Remove from field
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        setDeleteDialogName(org.name)
                        setPendingDelete(org)
                      }}
                      className="gp-menu-item-destructive cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 focus:bg-transparent"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                      <span className="text-sm font-medium">
                        Delete organization
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </li>
          )}
        />
      )}

      <DeleteOrganizationDialog
        open={pendingDelete !== null}
        organizationName={deleteDialogName}
        isDeleting={isDeleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </section>
  )
}
