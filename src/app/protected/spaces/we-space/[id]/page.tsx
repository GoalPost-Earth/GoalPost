'use client'

import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { useCreateField } from '@/hooks'
import { useApp, usePageContext } from '@/contexts'
import { NvlCanvas } from '@/components/canvas/nvl-canvas'
import { FieldBubble } from '@/components/ui/field-bubble'
import { CreateFieldModal } from '@/components/canvas/create-field-modal'
import { SpacePermissionsModal } from '@/components/spaces'
import { GET_WE_SPACE_DETAILS_QUERY } from '@/app/graphql/queries'
import { LOG_FIELD_ACTIVITY } from '@/app/graphql/mutations'
import { createNvlNode, renderReactComponentToContainer } from '@/lib/nvl-utils'
import type { FieldBubbleProps } from '@/components/ui/field-bubble'
import type { Node } from '@neo4j-nvl/base'

// Icon mapping for fields - can be customized per field
const fieldIcons: Record<string, string> = {
  default: 'psychology',
  'deep-work': 'psychology',
  growth: 'self_improvement',
  community: 'hub',
  inbox: 'inbox',
  vitality: 'monitor_heart',
}

// Map bubble sizes to transparent hitbox sizes for NVL drag interaction
type FieldSize = 'sm' | 'md' | 'lg' | 'xl'
const sizeToHitboxMap: Record<FieldSize, number> = {
  sm: 110, // 180px bubble → 110px hitbox
  md: 140, // 220px bubble → 140px hitbox
  lg: 170, // 280px bubble → 170px hitbox
  xl: 250, // 440px bubble → 250px hitbox
}

// Size variations for visual interest
const sizeVariations = ['xl', 'lg', 'md', 'md', 'sm', 'lg', 'md', 'md'] as const

// Transform database field data to FieldBubble props
function transformFieldsToProps(
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: any[]
): (Omit<FieldBubbleProps, 'position' | 'animationType'> & {
  id?: string
  pulseCount?: number
  size: FieldSize
  shape: 'circle' | 'organic-1' | 'organic-2' | 'organic-3'
})[] {
  return fields.map((field, idx) => ({
    id: field.id,
    icon:
      fieldIcons[field.title.toLowerCase().replace(/\s+/g, '-')] ||
      fieldIcons.default,
    title: field.title,
    description: field.emergentName || '',
    pulseCount: field.pulses?.length || 0,
    size: (sizeVariations[idx % sizeVariations.length] as FieldSize) || 'md',
    shape: (['circle', 'organic-1', 'organic-2', 'organic-3'] as const)[
      idx % 4
    ],
  }))
}

export default function WeSpaceFieldsPage() {
  const router = useRouter()
  const params = useParams()
  const weSpaceId = params?.id as string
  const { setPageTitle } = usePageContext()
  const { user } = useApp()

  const { createField, loading: isCreating } = useCreateField()
  const [logFieldActivity] = useMutation(LOG_FIELD_ACTIVITY)

  // Fetch WeSpace details and field contexts using GraphQL
  const {
    data,
    loading,
    error: queryError,
    refetch,
  } = useQuery(GET_WE_SPACE_DETAILS_QUERY, {
    variables: { spaceId: weSpaceId },
    skip: !weSpaceId,
  })

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
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)

  // Transform fields to component props early so it's available for callbacks
  const transformedFields = transformFieldsToProps(fields)

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

  const handleFieldClick = useCallback(
    (fieldId: string) => {
      const field = transformedFields.find((f) => f.id === fieldId)
      if (field) {
        setPageTitle(field.title)
        // Persist field name in localStorage to avoid API call on page reload
        localStorage.setItem(`field_${fieldId}`, field.title)
      }
      router.push(`/protected/spaces/we-space/${weSpaceId}/fields/${fieldId}`)
    },
    [transformedFields, setPageTitle, weSpaceId, router]
  )

  const handleEditField = useCallback(
    (e: React.MouseEvent, fieldId: string) => {
      e.stopPropagation()
      setEditingFieldId(fieldId)
      setShowEditModal(true)
    },
    []
  )

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

      // Log field creation activity
      if (createdField?.id) {
        await logFieldActivity({
          variables: {
            input: {
              action: 'created',
              fieldId: createdField.id,
              fieldName: title,
              contextId: createdField.id,
              spaceName: weSpace?.name,
            },
          },
        })
          .then(() => toast.info('Field creation logged'))
          .catch((err) => {
            console.error('Failed to log field creation:', err)
            toast.error('Failed to log field creation')
          })

        // Store the created field ID for onboarding navigation
        localStorage.setItem('lastCreatedFieldId', createdField.id)
        // Store weSpaceId for onboarding
        localStorage.setItem('weSpaceId', weSpaceId)
      }

      setShowCreateModal(false)
      await refetch()
    } catch (err) {
      console.error('Error creating field:', err)
    }
  }

  // Convert fields to NVL nodes with transparent hitboxes for drag
  const nvlFieldNodes: Node[] = useMemo(() => {
    return transformedFields
      .filter((field) => field.id) // Only include fields with valid IDs
      .map((field) => {
        const hitboxSize = sizeToHitboxMap[field.size] || 140
        return createNvlNode(
          {
            ...field,
            id: field.id as string, // Ensure id is string after filter
          },
          hitboxSize
        )
      })
  }, [transformedFields])

  // Render FieldBubble components into NVL containers
  useEffect(() => {
    transformedFields.forEach((field, idx) => {
      const container = document.getElementById(`node-${field.id}`)
      if (container) {
        renderReactComponentToContainer(
          <FieldBubble
            icon={field.icon}
            title={field.title}
            description={field.description}
            badge={
              field.pulseCount && field.pulseCount > 0
                ? {
                    text: `${field.pulseCount} Pulse${field.pulseCount !== 1 ? 's' : ''}`,
                    variant: 'primary',
                  }
                : undefined
            }
            size={field.size}
            shape={field.shape}
            animationType="float"
            animationDelay={idx * 0.15}
            onClick={() => handleFieldClick(field.id || '')}
            onEditClick={(e) => handleEditField(e, field.id || '')}
          />,
          container
        )
      }
    })
  }, [transformedFields, handleFieldClick, handleEditField])

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors">
      {queryError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-400">
            Error: {queryError.message}
          </p>
        </div>
      )}
      <NvlCanvas
        nodes={nvlFieldNodes}
        relationships={[]}
        layout="forceDirected"
        enableZoomControls={true}
        showBackgroundDecor={true}
        isLoading={loading}
        onNodeClick={(node) => handleFieldClick(node.id)}
        actionButton={
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              data-tour="create-field-button"
              className="relative cursor-pointer flex items-center gap-2 md:gap-3 px-4 md:px-6 h-10 md:h-14.5 rounded-full gp-glass dark:gp-glass border border-white/10 dark:border-white/10 hover:scale-105 hover:border-white/20 dark:hover:border-white/20 hover:bg-white/10 dark:hover:bg-white/20 transition-all duration-300 group overflow-hidden"
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                  `0 0 50px color-mix(in srgb, var(--gp-primary) 35%, transparent)`
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
              }}
            >
              <div className="absolute inset-0 rounded-full bg-linear-to-r from-gp-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="material-symbols-outlined text-gp-ink-muted dark:text-gp-ink-soft group-hover:text-gp-primary dark:group-hover:text-gp-primary text-[20px] md:text-[24px] transition-colors relative z-10">
                add
              </span>
              <span className="hidden lg:inline text-sm md:text-base font-semibold text-gp-ink-strong dark:text-gp-ink-strong group-hover:text-gp-primary dark:group-hover:text-gp-primary transition-colors relative z-10">
                Create Field
              </span>
            </button>

            {isOwner && (
              <button
                onClick={() => setShowPermissionsModal(true)}
                data-tour="add-member-button"
                className="relative cursor-pointer flex items-center gap-2 md:gap-3 px-4 md:px-6 h-10 md:h-14.5 rounded-full gp-glass dark:gp-glass border border-white/10 dark:border-white/10 hover:scale-105 hover:border-white/20 dark:hover:border-white/20 hover:bg-white/10 dark:hover:bg-white/20 transition-all duration-300 group overflow-hidden"
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                    `0 0 50px color-mix(in srgb, var(--gp-primary) 35%, transparent)`
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                    'none'
                }}
              >
                <div className="absolute inset-0 rounded-full bg-linear-to-r from-gp-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="material-symbols-outlined text-gp-ink-muted dark:text-gp-ink-soft group-hover:text-gp-primary dark:group-hover:text-gp-primary text-[20px] md:text-[24px] transition-colors relative z-10">
                  person_add
                </span>
                <span className="hidden lg:inline text-sm md:text-base font-semibold text-gp-ink-strong dark:text-gp-ink-strong group-hover:text-gp-primary dark:group-hover:text-gp-primary transition-colors relative z-10">
                  Add Member
                </span>
              </button>
            )}
          </div>
        }
      />

      {/* Create/Edit Field Modal */}
      {showCreateModal && (
        <CreateFieldModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false)
          }}
          onCreateField={handleCreateField}
          isLoading={isCreating}
        />
      )}
      {/* Edit Modal */}
      {showEditModal && editingFieldId && (
        <CreateFieldModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setEditingFieldId(null)
          }}
          isEditing={true}
          fieldId={editingFieldId}
          initialName={
            transformedFields.find((f) => f.id === editingFieldId)?.title || ''
          }
          initialDescription={
            transformedFields.find((f) => f.id === editingFieldId)
              ?.description || ''
          }
          onEditSuccess={async () => {
            const editingField = transformedFields.find(
              (f) => f.id === editingFieldId
            )
            if (editingField?.title && editingFieldId) {
              await logFieldActivity({
                variables: {
                  input: {
                    action: 'updated',
                    fieldId: editingFieldId,
                    fieldName: editingField.title,
                    contextId: editingFieldId,
                    spaceName: weSpace?.name,
                  },
                },
              })
                .then(() => toast.info('Field update logged'))
                .catch((err) => {
                  console.error('Failed to log field update:', err)
                  toast.error('Failed to log field update')
                })
            }
            setShowEditModal(false)
            setEditingFieldId(null)
            await refetch()
          }}
          onDeleteSuccess={async () => {
            const editingField = transformedFields.find(
              (f) => f.id === editingFieldId
            )
            if (editingField?.title && editingFieldId) {
              await logFieldActivity({
                variables: {
                  input: {
                    action: 'deleted',
                    fieldId: editingFieldId,
                    fieldName: editingField.title,
                    contextId: editingFieldId,
                    spaceName: weSpace?.name,
                  },
                },
              })
                .then(() => toast.info('Field deletion logged'))
                .catch((err) => {
                  console.error('Failed to log field deletion:', err)
                  toast.error('Failed to log field deletion')
                })
            }
            setShowEditModal(false)
            setEditingFieldId(null)
            await refetch()
          }}
        />
      )}

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
