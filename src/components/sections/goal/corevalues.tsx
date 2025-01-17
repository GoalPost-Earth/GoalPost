'use client'

import { GET_ALL_COREVALUES, UPDATE_GOAL_MUTATION } from '@/app/graphql'
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
  CoreValueCard,
} from '@/components'
import { CoreValue, Goal } from '@/gql/graphql'
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

export default function GoalRelatedCorevalues({ goal }: { goal: Goal }) {
  const [relatedCorevalues, setRelatedCorevalues] = useState<CoreValue[]>(
    goal.coreValues
  )
  const [open, setOpen] = useState(false)
  const { data, loading, error } = useQuery(GET_ALL_COREVALUES)
  const [UpdateGoal] = useMutation(UPDATE_GOAL_MUTATION)
  const contentRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  const valueOptions =
    data?.coreValues.map((corevalue) => ({
      label: corevalue.name,
      value: corevalue.id,
    })) ?? []

  type FormData = {
    relatedCorevalues: string[]
  }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: {
      relatedCorevalues:
        relatedCorevalues.map((corevalue) => corevalue.id) ?? [],
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // find corevalues to disconnect and connect
      const initialPeople = relatedCorevalues.map((corevalue) => corevalue.id)
      const toDisconnect = initialPeople.filter(
        (corevalue) => !data.relatedCorevalues.includes(corevalue)
      )
      const toConnect = data.relatedCorevalues.filter(
        (corevalue) => !initialPeople.map((p) => p).includes(corevalue)
      )

      const response = await UpdateGoal({
        variables: {
          id: goal.id,
          update: {
            coreValues: [
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

      setRelatedCorevalues(
        response.data.updateGoals.goals[0].coreValues as CoreValue[]
      )
      setOpen(false)

      toaster.success({
        title: 'Updated Related corevalues',
        description: 'The corevalues related to goal have been updated',
      })
    } catch (error) {
      console.error(error)
      toaster.error({
        title: 'Error',
        description: 'An error occurred while updating the corevalues',
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
          {relatedCorevalues.length > 0 && (
            <HStack width="100%" justifyContent="space-between">
              <Spacer />
              <Button size="sm" variant="surface" onClick={() => setOpen(true)}>
                Update Core Values
              </Button>
            </HStack>
          )}
          {/* </DialogTrigger> */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent ref={contentRef}>
              <DialogHeader>
                <DialogTitle>{`People motivated by ${goal.name}`}</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <MultiSelect
                  name="relatedCorevalues"
                  label="Choose core values to which this goal is aligned"
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

        {relatedCorevalues.length === 0 && (
          <EmptyState
            title="No Core Values"
            description="Click here to add some"
          >
            <Button variant="surface" onClick={() => setOpen(true)}>
              Add A Core Value
            </Button>
          </EmptyState>
        )}
        <Grid
          key="corevalues"
          templateColumns={{
            base: '1fr',
            lg: 'repeat(3, 1fr)',
          }}
          gap={6}
          width="100%"
        >
          {relatedCorevalues.map((corevalue) => (
            <GridItem key={corevalue.id}>
              <CoreValueCard coreValue={corevalue} />
            </GridItem>
          ))}
        </Grid>
      </VStack>
    </ApolloWrapper>
  )
}
