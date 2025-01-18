'use client'

import { GET_ALL_GOALS, UPDATE_CAREPOINT_MUTATION } from '@/app/graphql'
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
import { CarePoint, Goal } from '@/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import { Grid, GridItem, HStack, Spacer, VStack } from '@chakra-ui/react'
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

export default function CarePointCaresForGoals({
  carePoint,
}: {
  carePoint: CarePoint
}) {
  const [open, setOpen] = useState(false)
  const { data, loading, error } = useQuery(GET_ALL_GOALS)
  const [caresForGoals, setCaresForGoals] = useState<Goal[]>(
    carePoint.caresForGoals ?? []
  )
  const [UpdateCarePoint] = useMutation(UPDATE_CAREPOINT_MUTATION)
  const contentRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  const valueOptions =
    data?.goals.map((goal) => ({
      label: goal.name,
      value: goal.id,
    })) ?? []

  type FormData = {
    caresForGoals: string[]
  }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: {
      caresForGoals: caresForGoals.map((goal) => goal.id),
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // find connections to disconnect and connect
      const initialCaresForGoals = caresForGoals.map((goal) => goal.id)
      const toDisconnect = initialCaresForGoals.filter(
        (goal) => !data.caresForGoals.includes(goal)
      )
      const toConnect = data.caresForGoals.filter(
        (goal) => !initialCaresForGoals.includes(goal)
      )

      const response = await UpdateCarePoint({
        variables: {
          id: carePoint.id,
          update: {
            caresForGoals: [
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

      setCaresForGoals(
        response.data.updateCarePoints.carePoints[0].caresForGoals as Goal[]
      )
      setOpen(false)

      toaster.success({
        title: 'Updated Enabling Goals',
        description:
          'The goals that are cared for by this carepoint have been updated',
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
          {caresForGoals.length > 0 && (
            <HStack width="100%" justifyContent="space-between">
              <Spacer />
              <Button size="sm" variant="surface" onClick={() => setOpen(true)}>
                Update Goals Cared For
              </Button>
            </HStack>
          )}
          {/* </DialogTrigger> */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent ref={contentRef}>
              <DialogHeader>
                <DialogTitle>{`${carePoint.name}'s Goals Cared For`}</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <MultiSelect
                  name="caresForGoals"
                  label={`Choose goals that ${carePoint.name} cares for`}
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

        {caresForGoals.length === 0 && (
          <EmptyState title="No Goals" description="Click here to add some">
            <Button variant="surface" onClick={() => setOpen(true)}>
              Choose Goals Cared For
            </Button>
          </EmptyState>
        )}

        <Grid
          key="goals"
          templateColumns={{
            base: '1fr',
            lg: 'repeat(auto-fill, minmax(250px, 1fr))',
            xl: 'repeat(auto-fill, minmax(360px, 1fr)))',
          }}
          gap={6}
          width="100%"
        >
          {caresForGoals.map((goal) => (
            <GridItem key={goal.id}>
              <GoalCard goal={goal} />
            </GridItem>
          ))}
        </Grid>
      </VStack>
    </ApolloWrapper>
  )
}
