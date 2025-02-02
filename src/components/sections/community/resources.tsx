'use client'

import { GET_ALL_RESOURCES, UPDATE_COMMUNITY_MUTATION } from '@/app/graphql'
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
  ApolloWrapper,
  toaster,
  ConfirmButton,
  CancelButton,
  ResourceCard,
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

export default function CommunityResources({
  community,
}: {
  community: Community
}) {
  const [resources, setResources] = useState<Resource[]>(
    community.resources ?? []
  )
  const [open, setOpen] = useState(false)
  const { data, loading, error } = useQuery(GET_ALL_RESOURCES)
  const [UpdateCommunity] = useMutation(UPDATE_COMMUNITY_MUTATION)
  const contentRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  const valueOptions =
    data?.resources.map((resource) => ({
      label: resource.name,
      value: resource.id,
    })) ?? []

  type FormData = {
    resources: string[]
  }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: {
      resources: resources.map((resource) => resource.id) ?? [],
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // find resources to disconnect and connect
      const initialResources = resources.map((resource) => resource.id)
      const toDisconnect = initialResources.filter(
        (resource) => !data.resources.includes(resource)
      )
      const toConnect = data.resources.filter(
        (resource) => !initialResources.map((p) => p).includes(resource)
      )

      const response = await UpdateCommunity({
        variables: {
          id: community.id,
          update: {
            resources: [
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

      setResources(
        response.data.updateCommunities.communities[0].resources as Resource[]
      )
      setOpen(false)

      toaster.success({
        title: 'Updated Resources',
        description: 'The resources for this community have been updated',
      })
    } catch (error) {
      console.error(error)
      toaster.error({
        title: 'Error',
        description: 'An error occurred while updating the resources',
      })
    }
  }

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <VStack bg={'bg'} p={4} borderRadius={'2xl'} boxShadow={'xs'}>
        <DialogRoot
          placement="center"
          open={open}
          onOpenChange={(e) => setOpen(e.open)}
        >
          <DialogBackdrop />
          {/* <DialogTrigger asChild> */}
          {resources.length > 0 && (
            <HStack width="100%" justifyContent="space-between">
              <Spacer />
              <Button size="sm" variant="surface" onClick={() => setOpen(true)}>
                Update Resources
              </Button>
            </HStack>
          )}
          {/* </DialogTrigger> */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent ref={contentRef}>
              <DialogHeader>
                <DialogTitle>{`${community.name}'s Resources`}</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <MultiSelect
                  name="resources"
                  label="Choose resources to add to community"
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

        {resources.length === 0 && (
          <EmptyState title="No resources" description="Click here to add some">
            <Button variant="surface" onClick={() => setOpen(true)}>
              Add A Resource
            </Button>
          </EmptyState>
        )}
        <Grid
          key="resources"
          templateColumns={{
            base: '1fr',
            lg: 'repeat(auto-fill, minmax(350px, 1fr))',
          }}
          gap={6}
          width="100%"
        >
          {resources.map((resource) => (
            <GridItem key={resource.id}>
              <ResourceCard resource={resource} />
            </GridItem>
          ))}
        </Grid>
      </VStack>
    </ApolloWrapper>
  )
}
