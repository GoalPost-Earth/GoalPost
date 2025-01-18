'use client'

import { GET_ALL_RESOURCES, UPDATE_CAREPOINT_MUTATION } from '@/app/graphql'
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
import { CarePoint, Resource } from '@/gql/graphql'
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

export default function CarePointLinkedResources({
  carePoint,
}: {
  carePoint: CarePoint
}) {
  const [linkedResources, setLinkedResources] = useState<Resource[]>(
    carePoint.resources ?? []
  )
  const [open, setOpen] = useState(false)
  const { data, loading, error } = useQuery(GET_ALL_RESOURCES)
  const [UpdateCarePoint] = useMutation(UPDATE_CAREPOINT_MUTATION)
  const contentRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  const valueOptions =
    data?.resources.map((resource) => ({
      label: resource.name,
      value: resource.id,
    })) ?? []

  type FormData = {
    linkedResources: string[]
  }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: {
      linkedResources: linkedResources.map((resource) => resource.id) ?? [],
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // find resources to disconnect and connect
      const initialPeople = linkedResources.map((resource) => resource.id)
      const toDisconnect = initialPeople.filter(
        (resource) => !data.linkedResources.includes(resource)
      )
      const toConnect = data.linkedResources.filter(
        (resource) => !initialPeople.map((p) => p).includes(resource)
      )

      const response = await UpdateCarePoint({
        variables: {
          id: carePoint.id,
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

      setLinkedResources(
        response.data.updateCarePoints.carePoints[0].resources as Resource[]
      )
      setOpen(false)

      toaster.success({
        title: 'Updated Linked Resources',
        description: 'The resources linked to carePoint have been updated',
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
          {linkedResources.length > 0 && (
            <HStack width="100%" justifyContent="space-between">
              <Spacer />
              <Button size="sm" variant="surface" onClick={() => setOpen(true)}>
                Update Linked Resources
              </Button>
            </HStack>
          )}
          {/* </DialogTrigger> */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent ref={contentRef}>
              <DialogHeader>
                <DialogTitle>{`${carePoint.name}'s Linked Resources`}</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <MultiSelect
                  name="linkedResources"
                  label="Choose resources linked to carePoint"
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

        {linkedResources.length === 0 && (
          <EmptyState title="No resources" description="Click here to add some">
            <Button variant="surface" onClick={() => setOpen(true)}>
              Link A Resource
            </Button>
          </EmptyState>
        )}
        <Grid
          key="resources"
          templateColumns={{
            base: '1fr',
            lg: 'repeat(auto-fill, minmax(250px, 1fr))',
            xl: 'repeat(auto-fill, minmax(360px, 1fr)))',
          }}
          gap={6}
          width="100%"
        >
          {linkedResources.map((resource) => (
            <GridItem key={resource.id}>
              <ResourceCard resource={resource} />
            </GridItem>
          ))}
        </Grid>
      </VStack>
    </ApolloWrapper>
  )
}
