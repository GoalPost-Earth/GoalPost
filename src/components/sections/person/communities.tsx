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
  Input,
  EditButton,
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  PopoverTitle,
  CalenderIcon,
} from '@/components'
import { Community, Person, PersonCommunitiesRelationship } from '@/gql/graphql'
import { getHumanReadableDate } from '@/utils'
import { useMutation, useQuery } from '@apollo/client'
import {
  DialogBackdrop,
  Grid,
  GridItem,
  HStack,
  Spacer,
  Text,
  VStack,
} from '@chakra-ui/react'
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { IoMdCloudyNight } from 'react-icons/io'

export default function PersonCommunities({ person }: { person: Person }) {
  const [edges, setEdges] = useState(person.communitiesConnection.edges)

  const [open, setOpen] = useState(false)
  const [openCommunityProps, setOpenCommunityProps] = useState(false)
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null
  )
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
  type CommunityPropsData = {
    totem: string
    signupDate: string
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

  const {
    handleSubmit: handleSubmitCommunityProps,
    control: controlCommunityProps,
    setValue,
    formState: {
      isSubmitting: isSubmittingCommunityProps,
      errors: errorsCommunityProps,
    },
  } = useForm<CommunityPropsData>({
    defaultValues: {
      totem: '',
      signupDate: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // Find communities to delete and connect
      const communityIds = edges.map((edge) => edge.node.id)
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

      setEdges(
        response.data.updatePeople.people[0].communitiesConnection
          .edges as PersonCommunitiesRelationship[]
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

  const onSubmitCommunityProps = async (data: CommunityPropsData) => {
    try {
      // Find communities to delete and connect

      const response = await UpdatePerson({
        variables: {
          where: {
            id_EQ: person.id,
          },
          update: {
            communities: [
              {
                where: {
                  node: {
                    id_EQ: selectedCommunity?.id,
                  },
                },
                update: {
                  edge: {
                    totem_SET: data.totem,
                    signupDate_SET: data.signupDate,
                  },
                },
              },
            ],
          },
        },
      })

      if (!response.data) {
        throw new Error('No data returned')
      }

      setEdges(
        response.data.updatePeople.people[0].communitiesConnection
          .edges as PersonCommunitiesRelationship[]
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
            {edges.length > 0 && (
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

        {edges.length === 0 && (
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
          {edges.map((edge) => (
            <>
              <GridItem key={edge.node.id}>
                <VStack height="100%">
                  <CommunityCard height="100%" community={edge.node} />

                  <HStack alignItems="center" mt="auto" width="100%">
                    <VStack>
                      <PopoverRoot
                        portalled
                        positioning={{ placement: 'bottom-end' }}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            fontSize="x-small"
                            size="xs"
                            variant="ghost"
                            _hover={{
                              bgColor: 'transparent',
                            }}
                          >
                            <IoMdCloudyNight /> {`${person.firstName}'s Totem`}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <PopoverArrow />
                          <PopoverBody>
                            <PopoverTitle fontWeight="medium">
                              {person.firstName +
                                "'s Totem for " +
                                edge.node.name +
                                ' is '}
                              <Text mt={5} fontWeight="bold" fontSize="lg">
                                {edge.properties.totem}
                              </Text>
                            </PopoverTitle>
                          </PopoverBody>
                        </PopoverContent>
                      </PopoverRoot>
                      {edge.properties.signupDate && (
                        <Button
                          fontSize="x-small"
                          size="xs"
                          variant="ghost"
                          _hover={{
                            bgColor: 'transparent',
                          }}
                        >
                          <CalenderIcon color="brandIcons.500" />{' '}
                          {`Since ${getHumanReadableDate(edge.properties.signupDate, true)}`}
                        </Button>
                      )}
                    </VStack>
                    <Spacer />
                    <EditButton
                      variant="ghost"
                      size="2xs"
                      iconOnly
                      onClick={() => {
                        setValue('totem', edge.properties.totem ?? '')
                        setValue('signupDate', edge.properties.signupDate ?? '')
                        setSelectedCommunity(edge.node)
                        setOpenCommunityProps(true)
                      }}
                    />
                  </HStack>
                </VStack>
              </GridItem>
            </>
          ))}
        </Grid>

        <DialogRoot
          placement="center"
          open={openCommunityProps}
          onOpenChange={(e) => setOpenCommunityProps(e.open)}
        >
          <DialogBackdrop />
          {/* <DialogTrigger asChild> */}
          <HStack width="100%" justifyContent="space-between">
            <Spacer />
            <Text></Text>
          </HStack>
          {/* </DialogTrigger> */}
          <form onSubmit={handleSubmitCommunityProps(onSubmitCommunityProps)}>
            <DialogContent ref={contentRef}>
              <DialogHeader>
                <DialogTitle>{`${person.name} ${selectedCommunity?.name} Details`}</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <Input
                  name="totem"
                  label="Totem"
                  control={controlCommunityProps}
                  errors={errorsCommunityProps}
                />

                <Input
                  name="signupDate"
                  label="Signup Date"
                  control={controlCommunityProps}
                  errors={errorsCommunityProps}
                  type="date"
                />
              </DialogBody>
              <DialogFooter>
                <DialogActionTrigger asChild>
                  <CancelButton ref={cancelButtonRef} />
                </DialogActionTrigger>
                <ConfirmButton
                  loading={isSubmittingCommunityProps}
                  onClick={handleSubmitCommunityProps(onSubmitCommunityProps)}
                />
              </DialogFooter>
              <DialogCloseTrigger />
            </DialogContent>
          </form>
        </DialogRoot>
      </VStack>
    </ApolloWrapper>
  )
}
