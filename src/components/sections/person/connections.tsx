'use client'

import { GET_ALL_PEOPLE, UPDATE_PERSON_MUTATION } from '@/app/graphql'
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
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  EditButton,
  Input,
  Textarea,
  EntityDetail,
} from '@/components'
import { Person, PersonConnectionsRelationship } from '@/gql/graphql'
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
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

export default function PersonConnections({ person }: { person: Person }) {
  const [edges, setEdges] = useState(person.connectionsConnection.edges)
  const [openConnectionProps, setOpenConnectionProps] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState<Person | null>(
    null
  )
  const [open, setOpen] = useState(false)
  const { data, loading, error } = useQuery(GET_ALL_PEOPLE)
  const [UpdatePerson] = useMutation(UPDATE_PERSON_MUTATION)
  const contentRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  const valueOptions =
    data?.people.map((connection) => ({
      label: connection.name,
      value: connection.id,
    })) ?? []

  type FormData = {
    connections: string[]
  }

  const defaultValues = useMemo(
    () => ({
      connections:
        person.connectionsConnection.edges?.map((edge) => edge.node.id) ?? [],
    }),
    [person.connectionsConnection.edges]
  )

  const {
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues,
  })

  useEffect(() => {
    if (person) {
      reset(defaultValues)
    }
  }, [reset, person, data, defaultValues])

  const {
    handleSubmit: handleSubmitConnectionProps,
    control: controlConnectionProps,
    setValue,
    formState: {
      isSubmitting: isSubmittingConnectionProps,
      errors: errorsConnectionProps,
    },
  } = useForm({
    defaultValues: {
      why: '',
      interests: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // find connections to disconnect and connect
      const initialConnections = edges.map((edge) => edge.node.id)
      const toDisconnect = initialConnections.filter(
        (connection) => !data.connections.includes(connection)
      )
      const toConnect = data.connections.filter(
        (connection) => !initialConnections.map((p) => p).includes(connection)
      )

      const response = await UpdatePerson({
        variables: {
          where: {
            id_EQ: person.id,
          },
          update: {
            connections: [
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
        response.data.updatePeople.people[0].connectionsConnection
          .edges as PersonConnectionsRelationship[]
      )
      setOpen(false)

      toaster.success({
        title: 'Updated Connections',
        description: 'The connections for the person have been updated',
      })
    } catch (error) {
      console.error(error)
      toaster.error({
        title: 'Error',
        description: 'An error occurred while updating the connections',
      })
    }
  }

  type ConnectionPropsData = {
    why: string
    interests: string
  }

  const onSubmitConnectionProps = async (data: ConnectionPropsData) => {
    try {
      const response = await UpdatePerson({
        variables: {
          where: {
            id_EQ: person.id,
          },
          update: {
            connections: [
              {
                where: {
                  node: {
                    id_EQ: selectedConnection?.id,
                  },
                },
                update: {
                  edge: {
                    why_SET: data.why,
                    interests_SET: data.interests,
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
        response.data.updatePeople.people[0].connectionsConnection
          .edges as PersonConnectionsRelationship[]
      )
      setOpenConnectionProps(false)

      toaster.success({
        title: 'Updated Connection Properties',
        description: 'The connection properties have been updated',
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
          {edges.length > 0 && (
            <HStack width="100%" justifyContent="space-between">
              <Spacer />
              <Button size="sm" variant="surface" onClick={() => setOpen(true)}>
                Update Connections
              </Button>
            </HStack>
          )}
          {/* </DialogTrigger> */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent ref={contentRef}>
              <DialogHeader>
                <DialogTitle>{`${person.name}'s Connections`}</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <MultiSelect
                  name="connections"
                  label="Choose some connections"
                  control={control}
                  errors={errors}
                  options={valueOptions}
                  portalRef={contentRef}
                  defaultValue={defaultValues.connections}
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
            lg: 'repeat(auto-fill, minmax(250px, 1fr))',
            xl: 'repeat(auto-fill, minmax(360px, 1fr)))',
          }}
          gap={6}
          width="100%"
        >
          {edges.map((edge) => (
            <GridItem key={edge.node.id} pb={5}>
              <PersonCard
                id={edge.node.id}
                photo={edge.node.photo ?? null}
                name={edge.node.name}
              />{' '}
              <HStack>
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
                        {`Connection Details`}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverArrow />
                      <PopoverBody>
                        <EntityDetail
                          title="Why"
                          details={edge.properties.why ?? ''}
                        />
                        <EntityDetail
                          title="Interests"
                          details={edge.properties.interests ?? ''}
                        />
                      </PopoverBody>
                    </PopoverContent>
                  </PopoverRoot>
                </VStack>

                <Spacer />
                <EditButton
                  variant="ghost"
                  size="2xs"
                  iconOnly
                  onClick={() => {
                    setValue('why', edge.properties.why ?? '')
                    setValue('interests', edge.properties.interests ?? '')
                    setSelectedConnection(edge.node)
                    setOpenConnectionProps(true)
                  }}
                />
              </HStack>
            </GridItem>
          ))}
        </Grid>
        <DialogRoot
          placement="center"
          open={openConnectionProps}
          onOpenChange={(e) => setOpenConnectionProps(e.open)}
        >
          <DialogBackdrop />
          {/* <DialogTrigger asChild> */}
          <HStack width="100%" justifyContent="space-between">
            <Spacer />
            <Text></Text>
          </HStack>
          {/* </DialogTrigger> */}
          <form onSubmit={handleSubmitConnectionProps(onSubmitConnectionProps)}>
            <DialogContent ref={contentRef}>
              <DialogHeader>
                <DialogTitle>{`${person.name} ${selectedConnection?.name} Details`}</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <Input
                  name="why"
                  label="Why"
                  control={controlConnectionProps}
                  errors={errorsConnectionProps}
                />

                <Textarea
                  name="interests"
                  label="Interests"
                  control={controlConnectionProps}
                  errors={errorsConnectionProps}
                />
              </DialogBody>
              <DialogFooter>
                <DialogActionTrigger asChild>
                  <CancelButton ref={cancelButtonRef} />
                </DialogActionTrigger>
                <ConfirmButton
                  loading={isSubmittingConnectionProps}
                  onClick={handleSubmitConnectionProps(onSubmitConnectionProps)}
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
