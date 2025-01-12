'use client'

import { GET_ALL_COMMUNITIES, UPDATE_PERSON_MUTATION } from '@/app/graphql'
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
  CommunityCard,
  ConfirmButton,
  CancelButton,
} from '@/components'
import { Community, Person } from '@/gql/graphql'
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
export default function PersonCommunities({ person }: { person: Person }) {
  const [communities, setCommunities] = useState<Community[]>(
    person.communities as Community[]
  )
  const [open, setOpen] = useState(false)
  const { data, loading, error } = useQuery(GET_ALL_COMMUNITIES)
  const [UpdatePerson] = useMutation(UPDATE_PERSON_MUTATION)
  const contentRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  const valueOptions =
    data?.communities.map((community) => ({
      label: community.name,
      value: community.id,
    })) ?? []

  type FormData = {
    communities: string[]
  }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: {
      communities: person.communities?.map((community) => community.id) ?? [],
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // Find communities to delete and connect
      const communityIds = communities.map((community) => community.id)
      const toDisconnect = communityIds.filter(
        (communityId) => !data.communities.includes(communityId)
      )
      const toConnect = data.communities.filter(
        (communityId) => !communityIds.includes(communityId)
      )

      const response = await UpdatePerson({
        variables: {
          where: {
            id_EQ: person.id,
          },
          update: {
            communities: [
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

      setCommunities(
        response.data.updatePeople.people[0].communities as Community[]
      )
      setOpen(false)
      toaster.success({
        title: 'Updated Communities',
        description: 'The communities for the person have been updated',
      })
    } catch (error) {
      console.error(error)
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
          <HStack width="100%" justifyContent="space-between">
            <Spacer />
            {person.communities.length > 0 && (
              <Button size="sm" variant="surface" onClick={() => setOpen(true)}>
                Update Communities
              </Button>
            )}
          </HStack>
          {/* </DialogTrigger> */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent ref={contentRef}>
              <DialogHeader>
                <DialogTitle>{`${person.name}'s Communities`}</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <MultiSelect
                  name="communities"
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

        {person.communities.length === 0 && (
          <EmptyState
            title="No Communities"
            description="Click here to add some"
          >
            <Button variant="surface" onClick={() => setOpen(true)}>
              Add A Community
            </Button>
          </EmptyState>
        )}
        <Grid
          key="communities"
          templateColumns={{
            base: '1fr',
            lg: 'repeat(2, 1fr)',
          }}
          gap={6}
          width="100%"
        >
          {communities.map((community) => (
            <GridItem key={community.id}>
              <CommunityCard height="100%" community={community} />
            </GridItem>
          ))}
        </Grid>
      </VStack>
    </ApolloWrapper>
  )
}
