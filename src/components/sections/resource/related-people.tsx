'use client'

import { GET_ALL_PEOPLE, UPDATE_RESOURCE_MUTATION } from '@/app/graphql'
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
import { Resource, Person } from '@/gql/graphql'
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

export default function ResourceProvidedBy({
  resource,
}: {
  resource: Resource
}) {
  const [providedByPerson, setProvidedByPerson] = useState<Person[]>(
    resource.providedByPerson
  )
  const [open, setOpen] = useState(false)
  const { data, loading, error } = useQuery(GET_ALL_PEOPLE)
  const [UpdateResource] = useMutation(UPDATE_RESOURCE_MUTATION)
  const contentRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  const valueOptions =
    data?.people.map((person) => ({
      label: person.name,
      value: person.id,
    })) ?? []

  type FormData = {
    providedByPerson: string[]
  }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: {
      providedByPerson:
        resource.providedByPerson?.map((person) => person.id) ?? [],
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // find providedByPerson to disconnect and connect
      const initialProvidedByPerson = providedByPerson.map(
        (person) => person.id
      )
      const toDisconnect = initialProvidedByPerson.filter(
        (person) => !data.providedByPerson.includes(person)
      )
      const toConnect = data.providedByPerson.filter(
        (person) => !initialProvidedByPerson.map((p) => p).includes(person)
      )

      const response = await UpdateResource({
        variables: {
          id: resource.id,
          update: {
            providedByPerson: [
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

      setProvidedByPerson(
        response.data.updateResources.resources[0].providedByPerson as Person[]
      )
      setOpen(false)

      toaster.success({
        title: 'Updated resource',
        description: 'The related persons for the resource have been updated',
      })
    } catch (error) {
      console.error(error)
      toaster.error({
        title: 'Error',
        description: 'An error occurred while updating the resource',
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
          {resource.providedByPerson.length > 0 && (
            <HStack width="100%" justifyContent="space-between">
              <Spacer />
              <Button size="sm" variant="surface" onClick={() => setOpen(true)}>
                Update Related Persons
              </Button>
            </HStack>
          )}
          {/* </DialogTrigger> */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent ref={contentRef}>
              <DialogHeader>
                <DialogTitle>{`${resource.name}'s Related People`}</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <MultiSelect
                  name="providedByPerson"
                  label="Choose some providedByPerson"
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

        {resource.providedByPerson.length === 0 && (
          <EmptyState
            title="No Related People"
            description="Click here to add some"
          >
            <Button variant="surface" onClick={() => setOpen(true)}>
              Add A person
            </Button>
          </EmptyState>
        )}
        <Grid
          key="related-people"
          templateColumns={{
            base: '1fr',
            lg: 'repeat(3, 1fr)',
          }}
          gap={6}
          width="100%"
        >
          {providedByPerson.map((resource) => (
            <GridItem key={resource.id}>
              <PersonCard
                id={resource.id}
                photo={resource.photo ?? null}
                name={resource.name}
              />
            </GridItem>
          ))}
        </Grid>
      </VStack>
    </ApolloWrapper>
  )
}
