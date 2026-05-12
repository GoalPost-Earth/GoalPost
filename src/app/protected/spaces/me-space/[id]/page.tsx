'use client'

import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { useCreateField } from '@/hooks'
import { useFocalEntity, usePageContext } from '@/contexts'
import { NvlCanvas } from '@/components/canvas/nvl-canvas'
import { FieldBubble } from '@/components/ui/field-bubble'
import { CreateFieldModal } from '@/components/canvas/create-field-modal'
import { SpaceViewToggle, SpaceDetailsView } from '@/components/spaces'
import type { SpaceViewMode } from '@/components/spaces'
import { ProfileBackground } from '@/components/persons/profile-background'
import { ProfileLayout } from '@/components/persons/profile-layout'
import { GET_ME_SPACE_DETAILS_QUERY } from '@/app/graphql/queries'
import { LOG_FIELD_ACTIVITY } from '@/app/graphql/mutations'
import {
  createClusteredFieldNodePositions,
  fieldBubbleHitboxSizeMap,
} from '@/lib/field-cluster-layout'
import {
  createNvlNodeElement,
  renderReactComponentToContainer,
} from '@/lib/nvl-utils'
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

type FieldSize = 'sm' | 'md' | 'lg' | 'xl'

// Size variations for visual interest
const sizeVariations = ['xl', 'lg', 'md', 'md', 'sm', 'lg', 'md', 'md'] as const
const meSpaceNodeContainerCaches = new Map<string, Map<string, HTMLElement>>()

function getMeSpaceNodeContainerCache(spaceId: string) {
  let cache = meSpaceNodeContainerCaches.get(spaceId)
  if (!cache) {
    cache = new Map<string, HTMLElement>()
    meSpaceNodeContainerCaches.set(spaceId, cache)
  }
  return cache
}

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

export default function MeSpaceFieldsPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const meSpaceId = params?.id as string
  const { setPageTitle } = usePageContext()
  const { setFocalLabel } = useFocalEntity()

  // View toggle state from URL search params
  const viewParam = searchParams.get('view') as SpaceViewMode | null
  const [viewMode, setViewMode] = useState<SpaceViewMode>(
    viewParam === 'details' ? 'details' : 'graph'
  )

  const handleViewChange = useCallback(
    (view: SpaceViewMode) => {
      setViewMode(view)
      const url = new URL(window.location.href)
      if (view === 'graph') {
        url.searchParams.delete('view')
      } else {
        url.searchParams.set('view', view)
      }
      router.replace(url.pathname + url.search, { scroll: false })
    },
    [router]
  )

  const withCurrentView = useCallback(
    (path: string) => {
      if (viewMode !== 'details') return path
      return `${path}?view=details`
    },
    [viewMode]
  )

  const { createField, loading: isCreating } = useCreateField()
  const [logFieldActivity] = useMutation(LOG_FIELD_ACTIVITY)

  // Fetch MeSpace details and field contexts using GraphQL
  const {
    data,
    loading,
    error: queryError,
    refetch,
  } = useQuery(GET_ME_SPACE_DETAILS_QUERY, {
    variables: { spaceId: meSpaceId },
    skip: !meSpaceId,
  })

  const meSpace = data?.meSpaces?.[0]
  const fields = meSpace?.contexts || []

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)

  // Transform fields to component props early so it's available for callbacks
  const transformedFields = transformFieldsToProps(fields)
  const filteredFields = useMemo(
    () => transformedFields.filter((field) => field.id),
    [transformedFields]
  )

  // Set page title when space loads with field count
  useEffect(() => {
    if (meSpace?.name) {
      const fieldCount = fields.length
      setPageTitle(
        `${meSpace.name} - ${fieldCount} Field${fieldCount !== 1 ? 's' : ''}`
      )
      localStorage.setItem(`space_${meSpaceId}`, meSpace.name)
    }
  }, [meSpace?.name, fields.length, meSpaceId, setPageTitle])

  useEffect(() => {
    if (meSpaceId && meSpace?.name) {
      setFocalLabel(meSpaceId, meSpace.name, 'MeSpace')
    }
  }, [meSpaceId, meSpace?.name, setFocalLabel])

  const handleFieldClick = useCallback(
    (fieldId: string) => {
      const field = transformedFields.find((f) => f.id === fieldId)
      if (field) {
        setPageTitle(field.title)
        // Persist field name in localStorage to avoid API call on page reload
        localStorage.setItem(`field_${fieldId}`, field.title)
      }
      router.push(
        withCurrentView(
          `/protected/spaces/me-space/${meSpaceId}/fields/${fieldId}`
        )
      )
    },
    [transformedFields, setPageTitle, meSpaceId, router, withCurrentView]
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
    if (!meSpaceId) {
      console.error('MeSpace ID not available')
      return
    }
    try {
      // Use name as the title, fallback to description if name not provided
      const title = name || description
      const createdField = await createField(
        title,
        meSpaceId,
        'meSpace',
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
              spaceName: meSpace?.name,
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
        // Store meSpaceId for onboarding
        localStorage.setItem('meSpaceId', meSpaceId)
      }

      setShowCreateModal(false)
      await refetch()
    } catch (err) {
      console.error('Error creating field:', err)
    }
  }

  const nvlFieldNodes: Node[] = useMemo(() => {
    const nodeContainerCache = getMeSpaceNodeContainerCache(meSpaceId)
    const clusteredPositions = createClusteredFieldNodePositions(
      filteredFields,
      150
    )

    const activeIds = new Set(filteredFields.map((field) => field.id!))
    for (const id of Array.from(nodeContainerCache.keys())) {
      if (!activeIds.has(id)) nodeContainerCache.delete(id)
    }

    return clusteredPositions
      .map((position, index) => {
        const field = filteredFields[index]
        let container = nodeContainerCache.get(position.fieldId)
        if (!container) {
          container = createNvlNodeElement(`node-${position.fieldId}`)
          nodeContainerCache.set(position.fieldId, container)
        }

        return {
          ...field,
          id: position.fieldId,
          x: position.x,
          y: position.y,
          html: container,
          size: fieldBubbleHitboxSizeMap[position.size],
          color: 'rgba(0, 0, 0, 0)',
          stroke: 'rgba(0, 0, 0, 0)',
          strokeWidth: 0,
          caption: '', // Empty caption to prevent text rendering
          hideLabel: true, // If this property exists
        } as Node
      })
      .filter((node): node is Node => node !== null)
  }, [filteredFields, meSpaceId])

  // Render FieldBubble components into NVL containers
  useEffect(() => {
    const nodeContainerCache = getMeSpaceNodeContainerCache(meSpaceId)
    filteredFields.forEach((field, idx) => {
      // Use the cached container directly instead of a DOM lookup so rendering
      // works even before NVL has attached the element to the document.
      const container = nodeContainerCache.get(field.id!)
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
            onClick={() => handleFieldClick(field.id!)}
            onEditClick={(e) => handleEditField(e, field.id!)}
          />,
          container
        )
      }
    })
  }, [filteredFields, handleFieldClick, handleEditField, meSpaceId])

  // Details view
  if (viewMode === 'details') {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-gp-surface dark:bg-gp-surface-dark transition-colors pt-20">
        <ProfileBackground />
        <main className="relative">
          <ProfileLayout>
            {/* View Toggle at top */}
            <div className="flex justify-end mb-6">
              <SpaceViewToggle
                activeView={viewMode}
                onViewChange={handleViewChange}
              />
            </div>
            <SpaceDetailsView
              spaceId={meSpaceId}
              spaceData={
                meSpace ? { ...meSpace, __typename: 'MeSpace' } : undefined
              }
              onRefetch={refetch}
              getContextHref={(contextId) =>
                withCurrentView(
                  `/protected/spaces/me-space/${meSpaceId}/fields/${contextId}`
                )
              }
            />
          </ProfileLayout>
        </main>
      </div>
    )
  }

  // Graph view (default)
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
        layout="free"
        enableZoomControls={true}
        showBackgroundDecor={true}
        isLoading={loading}
        onNodeClick={(node) => handleFieldClick(node.id)}
        emptyState={
          <div className="flex flex-col items-center gap-6 max-w-md px-6 text-center">
            <div className="size-20 md:size-24 rounded-full flex items-center justify-center bg-gp-primary/10 dark:bg-gp-primary/20">
              <span className="material-symbols-outlined text-gp-primary dark:text-gp-primary text-5xl md:text-6xl">
                psychology
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-bold text-gp-ink-strong dark:text-gp-ink-strong">
                No Fields Yet
              </h3>
              <p className="text-sm md:text-base text-gp-ink-muted dark:text-gp-ink-soft">
                Fields are containers for organizing related pulses and
                exploring resonances. Create your first field to get started.
              </p>
            </div>
          </div>
        }
        actionButton={
          <div className="flex items-center gap-2 md:gap-3">
            <SpaceViewToggle
              activeView={viewMode}
              onViewChange={handleViewChange}
            />
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
                    spaceName: meSpace?.name,
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
                    spaceName: meSpace?.name,
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
    </div>
  )
}
