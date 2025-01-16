'use client'

import { GET_ALL_COMMUNITIES, UPDATE_GOAL_MUTATION } from '@/app/graphql'
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
  toaster,
  ConfirmButton,
  CancelButton,
  CommunityCard,
} from '@/components'
import { Community, Goal } from '@/gql/graphql'
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

export default function GoalMotivatesCommunities({ goal }: { goal: Goal }) {
  const [open, setOpen] = useState(false)

  const { data } = useQuery(GET_ALL_COMMUNITIES)
  const [motivatesCommunities, setMotivatesCommunities] = useState<Community[]>(
    goal.motivatesCommunities
  )
  const [UpdateGoal] = useMutation(UPDATE_GOAL_MUTATION)
  const contentRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  console.log('Motivates communities', motivatesCommunities)

  const valueOptions =
    data?.communities.map((goal) => ({
      label: goal.name,
      value: goal.id,
    })) ?? []

  type FormData = {
    motivatesCommunities: string[]
  }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: {
      motivatesCommunities:
        motivatesCommunities.map((community) => community.id) ?? [],
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      const initialCommunities = motivatesCommunities.map(
        (community) => community.id
      )
      const toDisconnect = initialCommunities.filter(
        (community) => !data.motivatesCommunities.includes(community)
      )
      const toConnect = data.motivatesCommunities.filter(
        (community) => !initialCommunities.map((p) => p).includes(community)
      )

      const response = await UpdateGoal({
        variables: {
          id: goal.id,
          update: {
            motivatesCommunities: [
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

      setMotivatesCommunities(
        response.data.updateGoals.goals[0].motivatesCommunities as Community[]
      )

      console.log(response.data.updateGoals.goals[0].motivatesCommunities)

      setOpen(false)
      toaster.success({
        title: 'Updated Communities',
        description: `The communities motivated by ${goal.name} have been updated`,
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <VStack bg={'bg'} p={4} borderRadius={'2xl'} boxShadow={'xs'}>
      <DialogRoot
        placement="center"
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
      >
        <DialogBackdrop />
        {/* <DialogTrigger asChild> */}
        <HStack width="100%" justifyContent="space-between">
          <Spacer />
          {motivatesCommunities.length > 0 && (
            <Button size="sm" variant="surface" onClick={() => setOpen(true)}>
              Update Communities
            </Button>
          )}
        </HStack>
        {/* </DialogTrigger> */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent ref={contentRef}>
            <DialogHeader>
              <DialogTitle>{`${goal.name}'s Related Communities`}</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <MultiSelect
                name="motivatesCommunities"
                label="Choose some communities"
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
      {motivatesCommunities.length === 0 ? (
        <EmptyState title="No Communities" description="Click here to add some">
          <Button variant="surface" onClick={() => setOpen(true)}>
            Add A Community
          </Button>
        </EmptyState>
      ) : (
        <Grid
          key="motivatesCommunities"
          templateColumns="repeat(auto-fill, minmax(360px, 1fr))"
          gap={6}
        >
          {motivatesCommunities.map((community) => (
            <GridItem key={community.id}>
              <CommunityCard community={community} />
            </GridItem>
          ))}
        </Grid>
      )}
    </VStack>
  )
}
