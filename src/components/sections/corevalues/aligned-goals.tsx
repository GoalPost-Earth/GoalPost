'use client'

import { GET_ALL_GOALS, UPDATE_COREVALUE_MUTATION } from '@/app/graphql'
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
import { CoreValue, Goal } from '@/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import { Grid, GridItem, HStack, Spacer, VStack } from '@chakra-ui/react'
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

export default function CoreValueAlignedGoals({
  corevalue,
}: {
  corevalue: CoreValue
}) {
  const [open, setOpen] = useState(false)
  const { data, loading, error } = useQuery(GET_ALL_GOALS)
  const [alignedGoals, setAlignedGoals] = useState<Goal[]>(
    corevalue.goals ?? []
  )
  const [UpdateCoreValue] = useMutation(UPDATE_COREVALUE_MUTATION)
  const contentRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  const valueOptions =
    data?.goals.map((goal) => ({
      label: goal.name,
      value: goal.id,
    })) ?? []

  type FormData = {
    alignedGoals: string[]
  }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: {
      alignedGoals: alignedGoals.map((goal) => goal.id),
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // find connections to disconnect and connect
      const initialAlignedGoals = corevalue.goals.map((goal) => goal.id)
      const toDisconnect = initialAlignedGoals.filter(
        (goal) => !data.alignedGoals.includes(goal)
      )
      const toConnect = data.alignedGoals.filter(
        (goal) => !initialAlignedGoals.includes(goal)
      )

      const response = await UpdateCoreValue({
        variables: {
          id: corevalue.id,
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

      setAlignedGoals(
        response.data.updateCoreValues.coreValues[0].goals as Goal[]
      )
      setOpen(false)

      toaster.success({
        title: 'Updated Aligned Goals',
        description: 'The aligned goals for the corevalue have been updated',
      })
    } catch (error) {
      console.error(error)
      toaster.error({
        title: 'Error',
        description: 'An error occurred while aligning goals',
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
          {alignedGoals.length > 0 && (
            <HStack width="100%" justifyContent="space-between">
              <Spacer />
              <Button size="sm" variant="surface" onClick={() => setOpen(true)}>
                Update Aligned Goals
              </Button>
            </HStack>
          )}
          {/* </DialogTrigger> */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent ref={contentRef}>
              <DialogHeader>
                <DialogTitle>{`${corevalue.name}'s Aligned Goals`}</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <MultiSelect
                  name="alignedGoals"
                  label={`Choose goals aligned with ${corevalue.name}`}
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

        {alignedGoals.length === 0 && (
          <EmptyState title="No Goals" description="Click here to add some">
            <Button variant="surface" onClick={() => setOpen(true)}>
              Align with Goal
            </Button>
          </EmptyState>
        )}

        <Grid
          key="goals"
          templateColumns="repeat(auto-fill, minmax(360px, 1fr))"
          gap={6}
          width="100%"
        >
          {alignedGoals.map((goal) => (
            <GridItem key={goal.id}>
              <GoalCard goal={goal} />
            </GridItem>
          ))}
        </Grid>
      </VStack>
    </ApolloWrapper>
  )
}
