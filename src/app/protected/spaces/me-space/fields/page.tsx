'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts'
import { useMeSpaceFields, useCreateField } from '@/hooks'
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

export default function MeSpaceFieldsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { fields, meSpaceId, loading, refetch } = useMeSpaceFields(user?.id)
  const { createField, loading: isCreating } = useCreateField()

  // Debug logging
  console.log('Auth user:', user)
  console.log('MeSpace ID:', meSpaceId)
  console.log('Fields:', fields)

  const handleFieldClick = (fieldId: string) => {
    router.push(`/protected/spaces/me-space/fields/${fieldId}`)
  }

  const handleCreateField = async (description: string) => {
    if (!meSpaceId) {
      console.error('MeSpace ID not available')
      console.error('User ID:', user?.id)
      console.error('Query data:', { meSpaceId, fields, loading })
      alert(
        'Your personal MeSpace has not been created yet. Please contact support or check if your account setup is complete.'
      )
      return
    }
    try {
      await createField(description, meSpaceId)
      refetch() // Refresh fields list after creation
    } catch (err) {
      console.error('Error creating field:', err)
    }
  }

  const transformedFields = transformFieldsToProps(fields)

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col h-screen w-full overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors items-center justify-center">
        <p className="text-gp-ink-muted dark:text-gp-ink-soft">
          Loading your MeSpace...
        </p>
      </div>
    )
  }

  // Show error if no MeSpace found
  if (!loading && !meSpaceId) {
    return (
      <div className="flex flex-col h-screen w-full overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors items-center justify-center">
        <div className="text-center max-w-md p-8">
          <span className="material-symbols-outlined text-6xl text-gp-ink-muted dark:text-gp-ink-soft mb-4">
            error_outline
          </span>
          <h2 className="text-2xl font-light text-gp-ink-strong dark:text-white mb-2">
            MeSpace Not Found
          </h2>
          <p className="text-gp-ink-muted dark:text-gp-ink-soft mb-4">
            Your personal MeSpace hasn&apos;t been created yet. This happens
            automatically when your account is set up.
          </p>
          <p className="text-sm text-gp-ink-soft dark:text-gp-ink-soft/50">
            User ID: {user?.id}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors">
      <FieldsCanvas
        fields={transformedFields}
        spaceId={meSpaceId}
        onFieldClick={handleFieldClick}
        onCreateField={handleCreateField}
        isCreating={isCreating}
        isLoading={loading}
      />
    </div>
  )
}
