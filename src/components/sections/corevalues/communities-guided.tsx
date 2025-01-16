'use client'

import { GET_ALL_COMMUNITIES, UPDATE_COREVALUE_MUTATION } from '@/app/graphql'
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
import { Community, CoreValue } from '@/gql/graphql'
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

export default function CoreValueCommunitiesGuided({
  corevalue,
}: {
  corevalue: CoreValue
}) {
  const [open, setOpen] = useState(false)
  const [communities, setCommunities] = useState<Community[]>(
    corevalue.communities ?? []
  )
  const { data, loading, error } = useQuery(GET_ALL_COMMUNITIES)
  const [UpdateCoreValue] = useMutation(UPDATE_COREVALUE_MUTATION)
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
      communities: communities?.map((community) => community.id) ?? [],
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // Find communities to delete and connect
      const initialCommunities = communities.map((community) => community.id)

      const toDisconnect = initialCommunities.filter(
        (community) => !data.communities.includes(community)
      )

      const toConnect = data.communities.filter(
        (community) => !initialCommunities.map((p) => p).includes(community)
      )

      const response = await UpdateCoreValue({
        variables: {
          id: corevalue.id,
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
        response.data.updateCoreValues.coreValues[0].communities as Community[]
      )

      setOpen(false)
      toaster.success({
        title: 'Updated Communities',
        description: `The communities for ${corevalue.name} have been updated`,
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
            {communities.length > 0 && (
              <Button size="sm" variant="surface" onClick={() => setOpen(true)}>
                Update Communities
              </Button>
            )}
          </HStack>
          {/* </DialogTrigger> */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent ref={contentRef}>
              <DialogHeader>
                <DialogTitle>{`${corevalue.name}'s Communities`}</DialogTitle>
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

        {communities.length === 0 && (
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
            lg: 'repeat(auto-fill, minmax(250px, 1fr))',
            xl: 'repeat(auto-fill, minmax(360px, 1fr)))',
          }}
          gap={6}
          width="100%"
        >
          {communities.map((community) => (
            <GridItem key={community.id}>
              <CommunityCard community={community} />
            </GridItem>
          ))}
        </Grid>
      </VStack>
    </ApolloWrapper>
  )
}
