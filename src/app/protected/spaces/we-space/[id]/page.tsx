'use client'

import { useRouter, useParams } from 'next/navigation'
import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { useCreateField } from '@/hooks'
import { usePageContext } from '@/app/contexts'
import { FieldsCanvas } from '@/components/layout/fields-canvas'
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
  const members = weSpace?.members || []
  const owner = weSpace?.owner?.[0]

  // Check if current user is the owner by comparing with owner returned from query
  // In a real app, you'd get the current user ID from auth context
  // For now, assume current user is owner if they see the space (since query is authenticated)
  const isOwner = !!owner

  // Set page title when space loads
  useEffect(() => {
    if (weSpace?.name) {
      setPageTitle(weSpace.name)
      localStorage.setItem(`space_${weSpaceId}`, weSpace.name)
    }
  }, [weSpace?.name, weSpaceId, setPageTitle])

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
      await createField(title, weSpaceId)
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
        spaceId={weSpaceId}
        spaceName={weSpace?.name || ''}
        onFieldClick={handleFieldClick}
        onCreateField={handleCreateField}
        isCreating={isCreating}
        isLoading={loading}
        isWeSpace={true}
        isOwner={isOwner}
        spaceMembers={members.map((m) => {
          const memberData = m.member[0]
          return {
            id: m.id,
            role: m.role as 'ADMIN' | 'MEMBER' | 'GUEST',
            member: {
              __typename: memberData.__typename || 'Unknown',
              id: memberData.id,
              name: memberData.name,
              email:
                memberData.__typename === 'Person'
                  ? (memberData.email ?? undefined)
                  : undefined,
            },
          }
        })}
        onRefetch={async () => {
          await refetch()
        }}
      />
    </div>
  )
}
