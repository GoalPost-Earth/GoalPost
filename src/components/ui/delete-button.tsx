'use client'

import { DialogRoot, Text, useDisclosure } from '@chakra-ui/react'
import { DeleteIcon } from '../icons'
import { Button } from './button'
import { EntityType } from '@/types'
import { useMutation } from '@apollo/client'
import {
  DELETE_CAREPOINT_MUTATION,
  DELETE_COMMUNITY_MUTATION,
  DELETE_COREVALUE_MUTATION,
  DELETE_GOAL_MUTATION,
  DELETE_PERSON_MUTATION,
  DELETE_RESOURCE_MUTATION,
  GET_ALL_CAREPOINTS,
  GET_ALL_COMMUNITIES,
  GET_ALL_COREVALUES,
  GET_ALL_GOALS,
  GET_ALL_PEOPLE,
  GET_ALL_RESOURCES,
  GET_PEOPLE_AND_THEIR_RESOURCES,
} from '@/app/graphql'
import { toaster } from './toaster'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from './dialog'

export function DeleteButton({
  entityId,
  entityType,
}: {
  entityId: string
  entityType: EntityType
}) {
  const router = useRouter()
  const { open, onOpen, onClose } = useDisclosure()
  const [submitting, setSubmitting] = useState(false)
  const [DeleteGoal] = useMutation(DELETE_GOAL_MUTATION, {
    refetchQueries: ['GET_ALL_GOALS'],
  })
  const [DeleteResource] = useMutation(DELETE_RESOURCE_MUTATION, {
    refetchQueries: ['GET_PEOPLE_AND_THEIR_RESOURCES', 'GET_ALL_RESOURCES'],
  })
  const [DeleteCommunity] = useMutation(DELETE_COMMUNITY_MUTATION, {
    refetchQueries: [GET_ALL_COMMUNITIES],
  })
  const [DeleteCoreValue] = useMutation(DELETE_COREVALUE_MUTATION, {
    refetchQueries: [GET_ALL_COREVALUES],
  })
  const [DeletePerson] = useMutation(DELETE_PERSON_MUTATION, {
    refetchQueries: [GET_ALL_PEOPLE],
  })
  const [DeleteCarePoint] = useMutation(DELETE_CAREPOINT_MUTATION, {
    refetchQueries: [GET_ALL_CAREPOINTS],
  })

  const handleConfirmDelete = async () => {
    setSubmitting(true)
    let deleteMutation = ({ variables }: { variables: { id: string } }) => {
      console.log('No delete mutation found', variables.toString())
    }

    const deleteMutations: { [key in EntityType]: any } = {
      Resource: DeleteResource,
      Goal: DeleteGoal,
      Community: DeleteCommunity,
      CoreValue: DeleteCoreValue,
      Person: DeletePerson,
      CarePoint: DeleteCarePoint,
    }

    deleteMutation = deleteMutations[entityType] || deleteMutation

    try {
      await deleteMutation({
        variables: {
          id: entityId,
        },
      })
      router.push('/' + entityType.toLowerCase())

      toaster.create({
        title: 'Entity deleted',
        description: 'The entity',
        type: 'success',
      })
      onClose()
    } catch (error) {
      console.error(error)
      toaster.create({
        title: 'Error',
        description: 'An error occurred while deleting the entity',
        type: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button
        paddingX={2}
        height="fit-content"
        colorPalette="red"
        variant="ghost"
        onClick={onOpen}
      >
        <DeleteIcon m={1} />
        <Text fontSize={'sm'} display={{ lg: 'none', xl: 'block' }}>
          Delete
        </Text>
      </Button>

      <DialogRoot
        motionPreset="slide-in-bottom"
        onOpenChange={onClose}
        open={open}
      >
        <DialogBackdrop />

        <DialogContent>
          <DialogHeader>Delete this {entityType}</DialogHeader>
          <DialogCloseTrigger />
          <DialogBody>
            Are you sure you want to continue? This cannot be undone
          </DialogBody>
          <DialogFooter>
            <Button onClick={onClose} variant="subtle">
              No
            </Button>
            <Button
              loading={submitting}
              colorPalette="red"
              variant="subtle"
              ml={3}
              onClick={handleConfirmDelete}
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  )
}
