'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { useCreateField } from '@/hooks'
import { CreateFieldModal } from '@/components/canvas/create-field-modal'
import { SpacePermissionsModal } from '@/components/spaces/space-permissions-modal'
import { LOG_FIELD_ACTIVITY } from '@/app/graphql/mutations'

interface SpaceFieldModalsProps {
  spaceId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  space: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contexts: any[]
  canManageMembers: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  permissionMembers: any[]
  showCreateFieldModal: boolean
  showEditFieldModal: boolean
  editingFieldId: string | null
  showPermissionsModal: boolean
  onCloseCreate: () => void
  onCloseEdit: () => void
  onClosePermissions: () => void
  onRefetch: () => Promise<unknown>
}

export function SpaceFieldModals({
  spaceId,
  space,
  contexts,
  canManageMembers,
  permissionMembers,
  showCreateFieldModal,
  showEditFieldModal,
  editingFieldId,
  showPermissionsModal,
  onCloseCreate,
  onCloseEdit,
  onClosePermissions,
  onRefetch,
}: SpaceFieldModalsProps) {
  const { createField, loading: isCreatingField } = useCreateField()
  const [logFieldActivity] = useMutation(LOG_FIELD_ACTIVITY)
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateField = async (description: string, name?: string) => {
    if (!spaceId || !space?.__typename) return
    const spaceType =
      space.__typename === 'MeSpace'
        ? 'meSpace'
        : space.__typename === 'WeSpace'
          ? 'weSpace'
          : null
    if (!spaceType) return

    try {
      setIsCreating(true)
      const title = name || description
      const createdField = await createField(
        title,
        spaceId,
        spaceType,
        description
      )
      if (createdField?.id) {
        await logFieldActivity({
          variables: {
            input: {
              action: 'created',
              fieldId: createdField.id,
              fieldName: title,
              contextId: createdField.id,
              spaceName: space.name,
            },
          },
        })
          .then(() => toast.info('Field creation logged'))
          .catch((err) => {
            console.error('Failed to log field creation:', err)
            toast.error('Failed to log field creation')
          })
      }
      onCloseCreate()
      await onRefetch()
    } catch (err) {
      console.error('Error creating field:', err)
      toast.error('Failed to create field context')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      {showCreateFieldModal && (
        <CreateFieldModal
          isOpen={showCreateFieldModal}
          onClose={onCloseCreate}
          onCreateField={handleCreateField}
          isLoading={isCreatingField || isCreating}
        />
      )}

      {showEditFieldModal && editingFieldId && (
        <CreateFieldModal
          isOpen={showEditFieldModal}
          onClose={onCloseEdit}
          isEditing={true}
          fieldId={editingFieldId}
          initialName={
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            contexts.find((ctx: any) => ctx.id === editingFieldId)?.title || ''
          }
          initialDescription={
            contexts.find(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (ctx: any) => ctx.id === editingFieldId
            )?.emergentName || ''
          }
          onEditSuccess={async () => {
            const editingField = contexts.find(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (ctx: any) => ctx.id === editingFieldId
            )
            if (editingField?.title && editingFieldId) {
              await logFieldActivity({
                variables: {
                  input: {
                    action: 'updated',
                    fieldId: editingFieldId,
                    fieldName: editingField.title,
                    contextId: editingFieldId,
                    spaceName: space.name,
                  },
                },
              })
                .then(() => toast.info('Field update logged'))
                .catch((err) => {
                  console.error('Failed to log field update:', err)
                  toast.error('Failed to log field update')
                })
            }
            onCloseEdit()
            await onRefetch()
          }}
          onDeleteSuccess={async () => {
            const editingField = contexts.find(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (ctx: any) => ctx.id === editingFieldId
            )
            if (editingField?.title && editingFieldId) {
              await logFieldActivity({
                variables: {
                  input: {
                    action: 'deleted',
                    fieldId: editingFieldId,
                    fieldName: editingField.title,
                    contextId: editingFieldId,
                    spaceName: space.name,
                  },
                },
              })
                .then(() => toast.info('Field deletion logged'))
                .catch((err) => {
                  console.error('Failed to log field deletion:', err)
                  toast.error('Failed to log field deletion')
                })
            }
            onCloseEdit()
            await onRefetch()
          }}
        />
      )}

      {space.__typename === 'WeSpace' && canManageMembers && (
        <SpacePermissionsModal
          isOpen={showPermissionsModal}
          onClose={onClosePermissions}
          spaceId={spaceId}
          spaceName={space.name}
          members={permissionMembers}
          onRefetch={async () => {
            await onRefetch()
          }}
        />
      )}
    </>
  )
}
