'use client'

import { GET_ALL_RESOURCES, UPDATE_RESOURCE_MUTATION } from '@/app/graphql'
import { ApolloWrapper } from '@/components/layout'
import { MultiSelect } from '@/components/react-hook-form'
import {
  Button,
  CancelButton,
  ConfirmButton,
  DialogActionTrigger,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  EmptyState,
  ResourceCard,
  toaster,
} from '@/components/ui'
import { Resource } from '@/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import { Grid, GridItem, HStack, Spacer, VStack } from '@chakra-ui/react'
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

export default function ResourceRelatedResources({
  resource,
}: {
  resource: Resource
}) {
  const [open, setOpen] = useState(false)
  const { data, loading, error } = useQuery(GET_ALL_RESOURCES)
  const [relatedResources, setRelatedResources] = useState<Resource[]>(
    resource.resources ?? []
  )
  const [UpdateResource] = useMutation(UPDATE_RESOURCE_MUTATION)
  const contentRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  const valueOptions =
    data?.resources.map((resource) => ({
      label: resource.name,
      value: resource.id,
    })) ?? []

  type FormData = {
    relatedResources: string[]
  }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: {
      relatedResources: relatedResources.map((resource) => resource.id),
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // find connections to disconnect and connect
      const initialRelatedResources = relatedResources.map(
        (resource) => resource.id
      )

      const toDisconnect = initialRelatedResources.filter(
        (resource) => !data.relatedResources.includes(resource)
      )
      const toConnect = data.relatedResources.filter(
        (resource) => !initialRelatedResources.includes(resource)
      )

      const response = await UpdateResource({
        variables: {
          id: resource.id,
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

      setRelatedResources(
        response.data.updateResources.resources[0].resources as Resource[]
      )
      setOpen(false)

      toaster.success({
        title: 'Updated related resources',
        description: 'The resources for resource have been updated',
      })
    } catch (error) {
      console.error(error)
      toaster.error({
        title: 'Error',
        description: 'An error occurred while adding resources',
      })
    }
  }

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <VStack
        key="resources"
        p={4}
        gap={4}
        bg={'gray.contrast'}
        borderRadius={'2xl'}
        boxShadow={'xs'}
        alignItems={'flex-start'}
      >
        <DialogRoot
          placement="center"
          open={open}
          onOpenChange={(e) => setOpen(e.open)}
        >
          <DialogBackdrop />
          {/* <DialogTrigger asChild> */}
          {relatedResources.length > 0 && (
            <HStack width="100%" justifyContent="space-between">
              <Spacer />
              <Button size="sm" variant="surface" onClick={() => setOpen(true)}>
                Update resources
              </Button>
            </HStack>
          )}
          {/* </DialogTrigger> */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent ref={contentRef}>
              <DialogHeader>
                <DialogTitle>{`${resource.name}'s related resources`}</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <MultiSelect
                  name="relatedResources"
                  label="Add resources to resource"
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

        {relatedResources.length === 0 && (
          <EmptyState title="No resources" description="Click here to add some">
            <Button variant="surface" onClick={() => setOpen(true)}>
              Add Resource
            </Button>
          </EmptyState>
        )}

        <Grid
          key="resources"
          templateColumns="repeat(auto-fill, minmax(360px, 1fr))"
          gap={6}
          width="100%"
        >
          {relatedResources.map((resource) => (
            <GridItem key={resource.id}>
              <ResourceCard resource={resource} />
            </GridItem>
          ))}
        </Grid>
      </VStack>
    </ApolloWrapper>
  )
}
