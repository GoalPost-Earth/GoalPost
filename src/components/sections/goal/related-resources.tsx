'use client'

import { useApp } from '@/app/contexts'
import {
  CREATE_LOG_MUTATION,
  GET_ALL_RESOURCES,
  UPDATE_GOAL_MUTATION,
} from '@/app/graphql'
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
import { Goal, Resource } from '@/gql/graphql'
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

export default function GoalRelatedResources({ goal }: { goal: Goal }) {
  const [relatedResources, setRelatedResources] = useState<Resource[]>(
    goal.resources
  )
  const { user } = useApp()
  const [open, setOpen] = useState(false)
  const [CreateLog] = useMutation(CREATE_LOG_MUTATION)
  const { data, loading, error } = useQuery(GET_ALL_RESOURCES)
  const [UpdateGoal] = useMutation(UPDATE_GOAL_MUTATION)
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
      relatedResources: relatedResources.map((resource) => resource.id) ?? [],
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // find resources to disconnect and connect
      const initialPeople = relatedResources.map((resource) => resource.id)
      const toDisconnect = initialPeople.filter(
        (resource) => !data.relatedResources.includes(resource)
      )
      const toConnect = data.relatedResources.filter(
        (resource) => !initialPeople.map((p) => p).includes(resource)
      )

      const toConnectNames = toConnect.map(
        (id) => valueOptions.find((option) => option.value === id)?.label
      )

      const response = await UpdateGoal({
        variables: {
          id: goal.id,
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

      if (toConnectNames.length > 0) {
        await CreateLog({
          variables: {
            input: [
              {
                description: `${user?.name} linked resource(s) \n${toConnectNames.join('\n')})\n\n to goal ${goal.name}`,
                resources: {
                  connect: [{ where: { node: { id_IN: toConnect } } }],
                },
                goals: {
                  connect: [{ where: { node: { id_EQ: goal.id } } }],
                },
                createdBy: {
                  connect: [{ where: { node: { authId_EQ: user?.sub } } }],
                },
              },
            ],
          },
        })
      }

      setRelatedResources(
        response.data.updateGoals.goals[0].resources as Resource[]
      )
      setOpen(false)

      toaster.success({
        title: 'Updated Related Resources',
        description: 'The resources related to goal have been updated',
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
          {relatedResources.length > 0 && (
            <HStack width="100%" justifyContent="space-between">
              <Spacer />
              <Button size="sm" variant="surface" onClick={() => setOpen(true)}>
                Update Resources
              </Button>
            </HStack>
          )}
          {/* </DialogTrigger> */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent ref={contentRef}>
              <DialogHeader>
                <DialogTitle>{`${goal.name}'s related resources`}</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <MultiSelect
                  name="relatedResources"
                  label="Choose resources related to goal"
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
              Add A resource
            </Button>
          </EmptyState>
        )}
        <Grid
          key="resources"
          templateColumns={{
            base: '1fr',
            lg: 'repeat(3, 1fr)',
          }}
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
