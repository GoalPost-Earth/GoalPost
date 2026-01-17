'use client'

import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { useCreateField } from '@/hooks'
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fields, setFields] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { createField, loading: isCreating } = useCreateField()

  const fetchFields = useCallback(async () => {
    if (!weSpaceId) return
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/field/get-fields-by-space', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spaceId: weSpaceId }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch fields')
      }
      setFields(data.fields || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setFields([])
    } finally {
      setLoading(false)
    }
  }, [weSpaceId])

  useEffect(() => {
    fetchFields()
  }, [fetchFields])

  const handleFieldClick = (fieldId: string) => {
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
      await fetchFields()
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
            Error: {error}
          </p>
        </div>
      )}
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
