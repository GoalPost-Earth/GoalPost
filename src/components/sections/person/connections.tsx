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
} from '@/components'
import { Person } from '@/gql/graphql'
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

export default function PersonConnections({ person }: { person: Person }) {
  const [connections, setConnections] = useState<Person[]>(person.connectedTo)
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

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: {
      connections: person.connectedTo?.map((connection) => connection.id) ?? [],
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // find connections to disconnect and connect
      const initialConnections = person.connectedTo.map(
        (connection) => connection.id
      )
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

      setConnections(
        response.data.updatePeople.people[0].connectedTo as Person[]
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
          {person.connectedTo.length > 0 && (
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

        {person.connectedTo.length === 0 && (
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
          {connections.map((person) => (
            <GridItem key={person.id}>
              <PersonCard
                id={person.id}
                photo={person.photo ?? null}
                name={person.name}
              />
            </GridItem>
          ))}
        </Grid>
      </VStack>
    </ApolloWrapper>
  )
}
