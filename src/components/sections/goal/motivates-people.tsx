'use client'

import { GET_ALL_PEOPLE, UPDATE_GOAL_MUTATION } from '@/app/graphql'
import {
  Button,
  PersonCard,
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
} from '@/components'
import { Goal, Person } from '@/gql/graphql'
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

export default function GoalMotivatesPeople({ goal }: { goal: Goal }) {
  const [motivatesPeople, setMotivatesPeople] = useState<Person[]>(
    goal.motivatesPeople
  )
  const [open, setOpen] = useState(false)
  const { data, loading, error } = useQuery(GET_ALL_PEOPLE)
  const [UpdateGoal] = useMutation(UPDATE_GOAL_MUTATION)
  const contentRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  const valueOptions =
    data?.people.map((connection) => ({
      label: connection.name,
      value: connection.id,
    })) ?? []

  type FormData = {
    motivatesPeople: string[]
  }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: {
      motivatesPeople: motivatesPeople.map((person) => person.id) ?? [],
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // find connections to disconnect and connect
      const initialPeople = motivatesPeople.map((person) => person.id)
      const toDisconnect = initialPeople.filter(
        (person) => !data.motivatesPeople.includes(person)
      )
      const toConnect = data.motivatesPeople.filter(
        (person) => !initialPeople.map((p) => p).includes(person)
      )

      const response = await UpdateGoal({
        variables: {
          id: goal.id,
          update: {
            motivatesPeople: [
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

      setMotivatesPeople(
        response.data.updateGoals.goals[0].motivatesPeople as Person[]
      )
      setOpen(false)

      toaster.success({
        title: 'Updated People Motivated',
        description: 'The people motivated by goal have been updated',
      })
    } catch (error) {
      console.error(error)
      toaster.error({
        title: 'Error',
        description: 'An error occurred while updating the connections',
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
          {motivatesPeople.length > 0 && (
            <HStack width="100%" justifyContent="space-between">
              <Spacer />
              <Button size="sm" variant="surface" onClick={() => setOpen(true)}>
                Update Motivated People
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
                  name="motivatesPeople"
                  label="Choose people motivated by goal"
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

        {motivatesPeople.length === 0 && (
          <EmptyState
            title="No Connections"
            description="Click here to add some"
          >
            <Button variant="surface" onClick={() => setOpen(true)}>
              Add A Connection
            </Button>
          </EmptyState>
        )}
        <Grid
          key="connections"
          templateColumns={{
            base: '1fr',
            lg: 'repeat(3, 1fr)',
          }}
          gap={6}
          width="100%"
        >
          {motivatesPeople.map((person) => (
            <GridItem key={person.id}>
              <PersonCard
                id={person.id}
                name={person.name}
                person={person as Person}
              />
            </GridItem>
          ))}
        </Grid>
      </VStack>
    </ApolloWrapper>
  )
}
