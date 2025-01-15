'use client'
import { GET_ALL_PEOPLE, UPDATE_COMMUNITY_MUTATION } from '@/app/graphql'

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
  PersonCard,
} from '@/components'
import { Community } from '@/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import { DialogBackdrop, Grid, HStack, Spacer, VStack } from '@chakra-ui/react'
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

export default function CommunityMembers({
  community,
}: {
  community: Community
}) {
  const [open, setOpen] = useState(false)

  const { data } = useQuery(GET_ALL_PEOPLE)
  const [UpdateCommunity] = useMutation(UPDATE_COMMUNITY_MUTATION)
  const contentRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  const valueOptions =
    data?.people.map((person) => ({
      label: person.name,
      value: person.id,
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
      communities: community.members?.map((members) => members.id) ?? [],
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      const newMembersIds = data.communities.filter(
        (memberId) =>
          !community.members?.map((member) => member.id).includes(memberId)
      )

      const response = await UpdateCommunity({
        variables: {
          id: community.id,
          update: {
            members: [
              {
                connect: [{ where: { node: { id_IN: newMembersIds } } }],
              },
            ],
          },
        },
      })

      if (!response.data) {
        throw new Error('No data returned')
      }

      setOpen(false)
      toaster.success({
        title: 'Updated Members',
        description: `The members of ${community.name} have been updated`,
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
          {community.members.length > 0 && (
            <Button size="sm" variant="surface" onClick={() => setOpen(true)}>
              Update Members
            </Button>
          )}
        </HStack>
        {/* </DialogTrigger> */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent ref={contentRef}>
            <DialogHeader>
              <DialogTitle>{`${community.name}'s Members`}</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <MultiSelect
                name="communities"
                label="Add some members"
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
      {community.members.length === 0 ? (
        <EmptyState title="No Members" description="Click here to add some">
          <Button variant="surface" onClick={() => setOpen(true)}>
            Add A Member
          </Button>
        </EmptyState>
      ) : (
        <Grid
          key="members"
          templateColumns="repeat(auto-fill, minmax(200px, 1fr))"
          gap={6}
          width="100%"
        >
          {community.members.map((member) => (
            <PersonCard
              key={member.id}
              id={member.id}
              name={member.name}
              photo={member.photo}
            />
          ))}
        </Grid>
      )}
    </VStack>
  )
}
