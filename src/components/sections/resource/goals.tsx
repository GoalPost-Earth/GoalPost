'use client'

import { GET_ALL_GOALS, UPDATE_RESOURCE_MUTATION } from '@/app/graphql'
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
  GoalCard,
  toaster,
} from '@/components/ui'
import { Resource, Goal } from '@/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import { Grid, GridItem, HStack, Spacer, VStack } from '@chakra-ui/react'
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

export default function ResourceRelatedGoals({
  resource,
}: {
  resource: Resource
}) {
  const [open, setOpen] = useState(false)
  const { data, loading, error } = useQuery(GET_ALL_GOALS)
  const [relatedGoals, setRelatedGoals] = useState<Goal[]>(resource.goals ?? [])
  const [UpdateResource] = useMutation(UPDATE_RESOURCE_MUTATION)
  const contentRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  const valueOptions =
    data?.goals.map((goal) => ({
      label: goal.name,
      value: goal.id,
    })) ?? []

  type FormData = {
    relatedGoals: string[]
  }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: {
      relatedGoals: relatedGoals.map((goal) => goal.id),
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // find connections to disconnect and connect
      const initialRelatedGoals = relatedGoals.map((goal) => goal.id)

      const toDisconnect = initialRelatedGoals.filter(
        (goal) => !data.relatedGoals.includes(goal)
      )
      const toConnect = data.relatedGoals.filter(
        (goal) => !initialRelatedGoals.includes(goal)
      )

      const response = await UpdateResource({
        variables: {
          id: resource.id,
          update: {
            goals: [
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

      setRelatedGoals(
        response.data.updateResources.resources[0].goals as Goal[]
      )
      setOpen(false)

      toaster.success({
        title: 'Updated Aligned Goals',
        description: 'The goals for resource have been updated',
      })
    } catch (error) {
      console.error(error)
      toaster.error({
        title: 'Error',
        description: 'An error occurred while adding goals',
      })
    }
  }

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <VStack
        key="Goals"
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
          {relatedGoals.length > 0 && (
            <HStack width="100%" justifyContent="space-between">
              <Spacer />
              <Button size="sm" variant="surface" onClick={() => setOpen(true)}>
                Update Goals
              </Button>
            </HStack>
          )}
          {/* </DialogTrigger> */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent ref={contentRef}>
              <DialogHeader>
                <DialogTitle>{`${resource.name}'s Related Goals`}</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <MultiSelect
                  name="relatedGoals"
                  label="Add goals to resource"
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

        {relatedGoals.length === 0 && (
          <EmptyState title="No Goals" description="Click here to add some">
            <Button variant="surface" onClick={() => setOpen(true)}>
              Add Goal
            </Button>
          </EmptyState>
        )}

        <Grid
          key="goals"
          templateColumns="repeat(auto-fill, minmax(360px, 1fr))"
          gap={6}
          width="100%"
        >
          {relatedGoals.map((goal) => (
            <GridItem key={goal.id}>
              <GoalCard goal={goal} />
            </GridItem>
          ))}
        </Grid>
      </VStack>
    </ApolloWrapper>
  )
}
