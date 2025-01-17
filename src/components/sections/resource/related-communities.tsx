'use client'

import { GET_ALL_COMMUNITIES, UPDATE_RESOURCE_MUTATION } from '@/app/graphql'
import {
  Button,
  EmptyState,
  DialogRoot,
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  MultiSelect,
  toaster,
  ConfirmButton,
  CancelButton,
  CommunityCard,
} from '@/components'
import { Community, Resource } from '@/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import {
  DialogBackdrop,
  Grid,
  GridItem,
  HStack,
  Spacer,
  VStack,
} from '@chakra-ui/react'
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

export default function ResourceRelatedCommunities({
  resource,
}: {
  resource: Resource
}) {
  const [open, setOpen] = useState(false)

  const { data: allCommunities } = useQuery(GET_ALL_COMMUNITIES)
  const [relatedCommunities, setRelatedCommunities] = useState<Community[]>(
    resource.provededByCommunity
  )
  const [UpdateResource] = useMutation(UPDATE_RESOURCE_MUTATION)
  const contentRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  const valueOptions =
    allCommunities?.communities.map((resource) => ({
      label: resource.name,
      value: resource.id,
    })) ?? []

  type FormData = {
    communities: string[]
  }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: {
      communities: relatedCommunities?.map((resource) => resource.id) ?? [],
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      const initialRelatedCommunities = relatedCommunities.map(
        (resource) => resource.id
      )

      const toDisconnect = initialRelatedCommunities.filter(
        (resource) => !data.communities.includes(resource)
      )

      const toConnect = data.communities.filter(
        (resource) =>
          !initialRelatedCommunities.map((p) => p).includes(resource)
      )

      const response = await UpdateResource({
        variables: {
          id: resource.id,
          update: {
            provededByCommunity: [
              {
                connect: [{ where: { node: { id_IN: toConnect } } }],
                disconnect: [{ where: { node: { id_IN: toDisconnect } } }],
              },
            ],
          },
        },
      })

      if (!response.data) {
        throw new Error('No data returned')
      }

      setRelatedCommunities(
        response.data.updateResources.resources[0]
          .provededByCommunity as Community[]
      )

      setOpen(false)
      toaster.success({
        title: 'Updated Communities',
        description: `The related communities for ${resource.name} have been updated`,
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <VStack bg={'bg'} p={4} borderRadius={'2xl'} boxShadow={'xs'}>
      <DialogRoot
        placement="center"
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
      >
        <DialogBackdrop />
        {/* <DialogTrigger asChild> */}
        <HStack width="100%" justifyContent="space-between">
          <Spacer />
          {relatedCommunities?.length > 0 && (
            <Button size="sm" variant="surface" onClick={() => setOpen(true)}>
              Update Communities
            </Button>
          )}
        </HStack>
        {/* </DialogTrigger> */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent ref={contentRef}>
            <DialogHeader>
              <DialogTitle>{`${resource.name}'s Related Communities`}</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <MultiSelect
                name="communities"
                label="Choose some communities"
                control={control}
                errors={errors}
                options={valueOptions}
                portalRef={contentRef}
                multiple
              />
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <CancelButton ref={cancelButtonRef} />
              </DialogActionTrigger>
              <ConfirmButton
                loading={isSubmitting}
                onClick={handleSubmit(onSubmit)}
              />
            </DialogFooter>
            <DialogCloseTrigger />
          </DialogContent>
        </form>
      </DialogRoot>
      {relatedCommunities.length === 0 ? (
        <EmptyState title="No Communities" description="Click here to add some">
          <Button variant="surface" onClick={() => setOpen(true)}>
            Add A resource
          </Button>
        </EmptyState>
      ) : (
        <Grid
          key="relatedCommunities"
          templateColumns="repeat(auto-fill, minmax(360px, 1fr))"
          gap={6}
        >
          {relatedCommunities.map((community) => (
            <GridItem key={community.id}>
              <CommunityCard community={community} />
            </GridItem>
          ))}
        </Grid>
      )}
    </VStack>
  )
}
