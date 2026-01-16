'use client'

import { useRouter, useParams } from 'next/navigation'
import { useFieldsForSpace, useCreateField } from '@/hooks'
import { FieldsCanvas } from '@/components/layout/fields-canvas'
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

// Transform GraphQL field data to FieldBubble props
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

  // Access the [id] param from the route
  const weSpaceId = params?.id as string
  const { fields, loading, refetch } = useFieldsForSpace(weSpaceId)
  const { createField, loading: isCreating } = useCreateField()

  const handleFieldClick = (fieldTitle: string) => {
    const fieldId = fieldTitle.toLowerCase().replace(/\s+/g, '-')
    // Navigate to the field detail page
    router.push(`/protected/spaces/we-space/${weSpaceId}/fields/${fieldId}`)
  }

  const handleCreateField = async (description: string) => {
    if (!weSpaceId) {
      console.error('WeSpace ID not available')
      return
    }
    try {
      await createField(description, weSpaceId)
      refetch() // Refresh fields list after creation
    } catch (err) {
      console.error('Error creating field:', err)
    }
  }

  const transformedFields = transformFieldsToProps(fields)

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors">
      <FieldsCanvas
        fields={transformedFields}
        spaceId={weSpaceId}
        onFieldClick={handleFieldClick}
        onCreateField={handleCreateField}
        isCreating={isCreating}
        isLoading={loading}
      />
    </div>
  )
}
