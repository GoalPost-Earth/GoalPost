'use client'

import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { useCreateField } from '@/hooks'
import { useApp, usePageContext } from '@/contexts'
import { FieldsCanvas } from '@/components/layout/fields-canvas'
import { SpacePermissionsModal } from '@/components/spaces'
import { GET_WE_SPACE_DETAILS_QUERY } from '@/app/graphql/queries'
import type { FieldBubbleProps } from '@/components/ui/field-bubble'

// Icon mapping for fields - can be customized per field
const fieldIcons: Record<string, string> = {
  default: 'psychology',
  'deep-work': 'psychology',
  growth: 'self_improvement',
  community: 'hub',
  inbox: 'inbox',
  vitality: 'monitor_heart',
}

// Transform database field data to FieldBubble props
function transformFieldsToProps(
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: any[]
): Omit<FieldBubbleProps, 'position' | 'size' | 'shape' | 'animationType'>[] {
  return fields.map((field) => ({
    id: field.id,
    icon:
      fieldIcons[field.title.toLowerCase().replace(/\s+/g, '-')] ||
      fieldIcons.default,
    title: field.title,
    description: field.emergentName || '',
  }))
}

export default function WeSpaceFieldsPage() {
  const router = useRouter()
  const params = useParams()
  const weSpaceId = params?.id as string
  const { setPageTitle } = usePageContext()
  const { user } = useApp()

  const { createField, loading: isCreating } = useCreateField()

  // Fetch WeSpace details and field contexts using GraphQL
  const { data, loading, error, refetch } = useQuery(
    GET_WE_SPACE_DETAILS_QUERY,
    {
      variables: { spaceId: weSpaceId },
      skip: !weSpaceId,
    }
  )

  const weSpace = data?.weSpaces?.[0]
  const fields = weSpace?.contexts || []

  // Check if user is the owner of this WeSpace
  const isOwner = weSpace?.owner?.[0]?.id === user?.id

  // Transform members data for toolbar
  const members =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    weSpace?.members?.map((membership: any) => {
      const memberData = membership.member?.[0] // Extract first element from array
      return {
        id: membership.id,
        role: membership.role,
        member: {
          __typename: memberData?.__typename || 'Person',
          id: memberData?.id || '',
          name:
            memberData?.name ||
            `${memberData?.firstName || ''} ${memberData?.lastName || ''}`.trim(),
          email: memberData?.email ?? null,
        },
      }
    }) || []

  const [showPermissionsModal, setShowPermissionsModal] = useState(false)

  // Set page title when space loads with field count
  useEffect(() => {
    if (weSpace?.name) {
      const fieldCount = fields.length
      setPageTitle(
        `${weSpace.name} - ${fieldCount} Field${fieldCount !== 1 ? 's' : ''}`
      )
      localStorage.setItem(`space_${weSpaceId}`, weSpace.name)
    }
  }, [weSpace?.name, fields.length, weSpaceId, setPageTitle])

  const handleFieldClick = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId)
    if (field) {
      setPageTitle(field.title)
      // Persist field name in localStorage to avoid API call on page reload
      localStorage.setItem(`field_${fieldId}`, field.title)
    }
    router.push(`/protected/spaces/we-space/${weSpaceId}/fields/${fieldId}`)
  }

  const handleCreateField = async (description: string, name?: string) => {
    if (!weSpaceId) {
      console.error('WeSpace ID not available')
      return
    }
    try {
      // Use name as the title, fallback to description if name not provided
      const title = name || description
      const createdField = await createField(
        title,
        weSpaceId,
        'weSpace',
        description
      )

      // Store the created field ID for onboarding navigation
      if (createdField?.id) {
        localStorage.setItem('lastCreatedFieldId', createdField.id)
        // Store weSpaceId for onboarding
        localStorage.setItem('weSpaceId', weSpaceId)
      }

      await refetch()
    } catch (err) {
      console.error('Error creating field:', err)
    }
  }

  const transformedFields = transformFieldsToProps(fields)

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-400">
            Error: {error.message}
          </p>
        </div>
      )}
      <FieldsCanvas
        fields={transformedFields}
        onFieldClick={handleFieldClick}
        onCreateField={handleCreateField}
        isCreating={isCreating}
        isLoading={loading}
        onRefetch={async () => {
          await refetch()
        }}
        memberButton={
          isOwner ? (
            <button
              onClick={() => setShowPermissionsModal(true)}
              className="cursor-pointer flex items-center gap-2 md:gap-3 px-4 md:px-6 h-10 md:h-14.5 rounded-full gp-glass dark:gp-glass border border-white/10 dark:border-white/10 hover:scale-105 hover:border-white/20 dark:hover:border-white/20 hover:bg-white/10 dark:hover:bg-white/20 transition-all duration-300 group"
              style={{
                boxShadow: 'none',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                  `0 0 50px color-mix(in srgb, var(--gp-primary) 50%, transparent)`
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
              }}
            >
              <div className="absolute inset-0 rounded-full bg-linear-to-tr from-gp-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="material-symbols-outlined text-gp-ink-muted dark:text-gp-ink-soft group-hover:text-gp-primary dark:group-hover:text-gp-primary text-[20px] md:text-[24px] transition-colors relative z-10">
                person_add
              </span>
              <span className="hidden lg:inline text-sm md:text-base font-semibold text-gp-ink-strong dark:text-gp-ink-strong group-hover:text-gp-primary dark:group-hover:text-gp-primary transition-colors relative z-10">
                Add Member
              </span>
            </button>
          ) : null
        }
      />

      {/* Permissions Modal */}
      {isOwner && weSpace && (
        <SpacePermissionsModal
          isOpen={showPermissionsModal}
          onClose={() => setShowPermissionsModal(false)}
          spaceId={weSpaceId}
          spaceName={weSpace.name}
          members={members}
          onRefetch={async () => {
            await refetch()
          }}
        />
      )}
    </div>
  )
}
