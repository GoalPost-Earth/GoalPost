'use client'

import { GET_ALL_CAREPOINTS, UPDATE_RESOURCE_MUTATION } from '@/app/graphql'
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
  CarePointCard,
  toaster,
} from '@/components/ui'
import { CarePoint, Resource } from '@/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import { Grid, GridItem, HStack, Spacer, VStack } from '@chakra-ui/react'
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

export default function ResourceCarePoints({
  resource,
}: {
  resource: Resource
}) {
  const [open, setOpen] = useState(false)
  const { data, loading, error } = useQuery(GET_ALL_CAREPOINTS)
  const [relatedCarePoints, setRelatedCarePoints] = useState<CarePoint[]>(
    resource.carePoints ?? []
  )
  const [UpdateResource] = useMutation(UPDATE_RESOURCE_MUTATION)
  const contentRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  const valueOptions =
    data?.carePoints.map((carePoint) => ({
      label: carePoint.name,
      value: carePoint.id,
    })) ?? []

  type FormData = {
    relatedCarePoints: string[]
  }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: {
      relatedCarePoints: relatedCarePoints.map((carePoint) => carePoint.id),
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // find connections to disconnect and connect
      const initialRelatedCarePoints = relatedCarePoints.map(
        (carePoint) => carePoint.id
      )

      const toDisconnect = initialRelatedCarePoints.filter(
        (carePoint) => !data.relatedCarePoints.includes(carePoint)
      )
      const toConnect = data.relatedCarePoints.filter(
        (carePoint) => !initialRelatedCarePoints.includes(carePoint)
      )

      const response = await UpdateResource({
        variables: {
          id: resource.id,
          update: {
            carePoints: [
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

      setRelatedCarePoints(
        response.data.updateResources.resources[0].carePoints as CarePoint[]
      )
      setOpen(false)

      toaster.success({
        title: 'Updated Care Points',
        description: 'The care points for resource have been updated',
      })
    } catch (error) {
      console.error(error)
      toaster.error({
        title: 'Error',
        description: 'An error occurred while adding care points',
      })
    }
  }

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <VStack
        key="CarePoint"
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
          {relatedCarePoints.length > 0 && (
            <HStack width="100%" justifyContent="space-between">
              <Spacer />
              <Button size="sm" variant="surface" onClick={() => setOpen(true)}>
                Update Care Points
              </Button>
            </HStack>
          )}
          {/* </DialogTrigger> */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent ref={contentRef}>
              <DialogHeader>
                <DialogTitle>{`${resource.name}'s Related Care Points`}</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <MultiSelect
                  name="relatedCarePoints"
                  label="Add care points to resource"
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

        {relatedCarePoints.length === 0 && (
          <EmptyState
            title="No Care Points"
            description="Click here to add some"
          >
            <Button variant="surface" onClick={() => setOpen(true)}>
              Add Care Point
            </Button>
          </EmptyState>
        )}

        <Grid
          key="carePoints"
          templateColumns="repeat(auto-fill, minmax(360px, 1fr))"
          gap={6}
          width="100%"
        >
          {relatedCarePoints.map((carePoint) => (
            <GridItem key={carePoint.id}>
              <CarePointCard carePoint={carePoint} />
            </GridItem>
          ))}
        </Grid>
      </VStack>
    </ApolloWrapper>
  )
}
