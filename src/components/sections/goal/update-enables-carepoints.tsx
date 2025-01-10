'use client'

import { GET_ALL_COREVALUES, UPDATE_GOAL_MUTATION } from '@/app/graphql'
import { ApolloWrapper } from '@/components/layout'
import {
  Button,
  DialogRoot,
  DialogTrigger,
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBackdrop,
  Select,
  CoreValueCard,
  toaster,
  EditButton,
} from '@/components'
import { Goal } from '@/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import { Grid, GridItem } from '@chakra-ui/react'
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { EntityEnum } from '@/constants'

export default function GoalEnablesCarePointsUpdate({
  key,
  goal: fromParent,
}: {
  key: string
  goal: Goal
}) {
  const [open, setOpen] = useState(false)
  const [goal, setGoal] = useState<Goal>(fromParent)
  const contentRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const { data, loading, error } = useQuery(GET_ALL_COREVALUES)
  const [UpdateGoal] = useMutation(UPDATE_GOAL_MUTATION)
  const corevalues = data?.coreValues ?? []
  const valueOptions = corevalues.map((corevalue) => ({
    label: corevalue.name,
    value: corevalue.id,
  }))

  type FormData = {
    corevalues: string[]
  }
  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: {
      corevalues: goal.coreValues?.map((coreValue) => coreValue.id) ?? [],
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // Find coreValues to delete and connect
      const coreValues = goal.coreValues?.map((coreValue) => coreValue.id) ?? []
      const toDelete = coreValues.filter(
        (coreValue) => !data.corevalues.includes(coreValue)
      )
      const toConnect = data.corevalues.filter(
        (coreValue) => !coreValues.includes(coreValue)
      )

      const response = await UpdateGoal({
        variables: {
          id: goal.id,
          update: {
            coreValues: [
              {
                connect: [{ where: { node: { id_IN: toConnect } } }],
                disconnect: [{ where: { node: { id_IN: toDelete } } }],
              },
            ],
          },
        },
      })

      if (!response.data) {
        throw new Error('No data returned')
      }

      setGoal(response.data.updateGoals.goals[0] as Goal)

      if (cancelButtonRef.current) {
        cancelButtonRef.current.click()
      }

      toaster.create({
        title: 'Updated Goal Core Values',
        description: 'The core values for the goal have been updated',
        type: 'success',
      })
    } catch (error) {
      console.error(error)
      toaster.create({
        title: 'Error',
        description: 'An error occurred while updating the goal core values',
        type: 'error',
      })
    }
  }

  return (
    <ApolloWrapper data={data} loading={loading} error={error} key={key}>
      <DialogRoot
        placement="center"
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
      >
        <DialogBackdrop />
        <DialogTrigger asChild>
          <EditButton
            colorPalette={EntityEnum.Goal.toLowerCase()}
            text="Edit Core Values"
            mb={5}
          />
        </DialogTrigger>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent ref={contentRef}>
            <DialogHeader>
              <DialogTitle>{goal.name} Core Values</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Select
                name="corevalues"
                label="What core values are aligned to this goal?"
                control={control}
                errors={errors}
                options={valueOptions}
                portalRef={contentRef}
                multiple
              />
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline" ref={cancelButtonRef}>
                  Cancel
                </Button>
              </DialogActionTrigger>
              <Button
                colorPalette="green"
                type="submit"
                loading={isSubmitting}
                onClick={handleSubmit(onSubmit)}
              >
                Save
              </Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </DialogContent>
        </form>
      </DialogRoot>

      <Grid templateColumns="repeat(auto-fill, minmax(360px, 1fr))" gap={6}>
        {goal.coreValues.map((coreValue) => (
          <GridItem key={coreValue.id}>
            <CoreValueCard coreValue={coreValue} />
          </GridItem>
        ))}
      </Grid>
    </ApolloWrapper>
  )
}
