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

export default function CarePointEnablingGoals({
  carePoint,
}: {
  carePoint: CarePoint
}) {
  const [open, setOpen] = useState(false)
  const { data, loading, error } = useQuery(GET_ALL_GOALS)
  const [enablingGoals, setEnablingGoals] = useState<Goal[]>(
    carePoint.enabledByGoals ?? []
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
    enablingGoals: string[]
  }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: {
      enablingGoals: enablingGoals.map((goal) => goal.id),
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // find connections to disconnect and connect
      const initialEnablingGoals = enablingGoals.map((goal) => goal.id)
      const toDisconnect = initialEnablingGoals.filter(
        (goal) => !data.enablingGoals.includes(goal)
      )
      const toConnect = data.enablingGoals.filter(
        (goal) => !initialEnablingGoals.includes(goal)
      )

      const response = await UpdateCarePoint({
        variables: {
          id: carePoint.id,
          update: {
            enabledByGoals: [
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

      setEnablingGoals(
        response.data.updateCarePoints.carePoints[0].enabledByGoals as Goal[]
      )
      setOpen(false)

      toaster.success({
        title: 'Updated Enabling Goals',
        description: 'The goals that enable this carepoint have been updated',
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
          {enablingGoals.length > 0 && (
            <HStack width="100%" justifyContent="space-between">
              <Spacer />
              <Button size="sm" variant="surface" onClick={() => setOpen(true)}>
                Update Enabling Goals
              </Button>
            </HStack>
          )}
          {/* </DialogTrigger> */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent ref={contentRef}>
              <DialogHeader>
                <DialogTitle>{`${carePoint.name}'s Enabling Goals`}</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <MultiSelect
                  name="enablingGoals"
                  label={`Choose goals that enable ${carePoint.name}`}
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

        {enablingGoals.length === 0 && (
          <EmptyState title="No Goals" description="Click here to add some">
            <Button variant="surface" onClick={() => setOpen(true)}>
              Choose Enabling Goals
            </Button>
          </EmptyState>
        )}

        <Grid
          key="goals"
          templateColumns={{
            base: '1fr',
            lg: 'repeat(auto-fill, minmax(350px, 1fr))',
          }}
          gap={6}
          width="100%"
        >
          {enablingGoals.map((goal) => (
            <GridItem key={goal.id}>
              <GoalCard goal={goal} />
            </GridItem>
          ))}
        </Grid>
      </VStack>
    </ApolloWrapper>
  )
}
