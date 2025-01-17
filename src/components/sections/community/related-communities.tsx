'use client'

import { GET_ALL_COMMUNITIES, UPDATE_COMMUNITY_MUTATION } from '@/app/graphql'
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
import { Community } from '@/gql/graphql'
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

export default function RelatedCommunities({
  community,
}: {
  community: Community
}) {
  const [open, setOpen] = useState(false)

  const { data: allCommunities } = useQuery(GET_ALL_COMMUNITIES)
  const [relatedCommunities, setRelatedCommunities] = useState<Community[]>(
    community.relatedCommunities
  )
  const [UpdateCommunity] = useMutation(UPDATE_COMMUNITY_MUTATION)
  const contentRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  const valueOptions =
    allCommunities?.communities.map((community) => ({
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
      communities:
        community.relatedCommunities?.map((community) => community.id) ?? [],
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      const initialRelatedCommunities = relatedCommunities.map(
        (community) => community.id
      )

      const toDisconnect = initialRelatedCommunities.filter(
        (community) => !data.communities.includes(community)
      )

      const toConnect = data.communities.filter(
        (community) =>
          !initialRelatedCommunities.map((p) => p).includes(community)
      )

      const response = await UpdateCommunity({
        variables: {
          id: community.id,
          update: {
            relatedCommunities: [
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

      setRelatedCommunities(
        response.data.updateCommunities.communities[0]
          .relatedCommunities as Community[]
      )

      setOpen(false)
      toaster.success({
        title: 'Updated Communities',
        description: `The related communities for ${community.name} have been updated`,
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
          {relatedCommunities?.length > 0 && (
            <Button size="sm" variant="surface" onClick={() => setOpen(true)}>
              Update Communities
            </Button>
          )}
        </HStack>
        {/* </DialogTrigger> */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent ref={contentRef}>
            <DialogHeader>
              <DialogTitle>{`${community.name}'s Related Communities`}</DialogTitle>
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
      {relatedCommunities.length === 0 ? (
        <EmptyState title="No Communities" description="Click here to add some">
          <Button variant="surface" onClick={() => setOpen(true)}>
            Choose Some Communities
          </Button>
        </EmptyState>
      ) : (
        <Grid
          key="relatedCommunities"
          templateColumns="repeat(auto-fill, minmax(360px, 1fr))"
          gap={6}
        >
          {relatedCommunities.map((community) => (
            <GridItem key={community.id}>
              <CommunityCard community={community as Community} />
            </GridItem>
          ))}
        </Grid>
      )}
    </VStack>
  )
}
