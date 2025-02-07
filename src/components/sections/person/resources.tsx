'use client'

import { GET_ALL_RESOURCES, UPDATE_PERSON_MUTATION } from '@/app/graphql'
import { ApolloWrapper } from '@/components/layout'
import { MultiSelect } from '@/components/react-hook-form'
import {
  Button,
  CancelButton,
  ConfirmButton,
  DialogActionTrigger,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  EmptyState,
  ResourceCard,
  toaster,
} from '@/components/ui'
import { Person, Resource } from '@/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import { Grid, GridItem, HStack, Spacer, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

export default function PersonResources({ person }: { person: Person }) {
  const { data, loading, error, refetch } = useQuery(GET_ALL_RESOURCES, {
    fetchPolicy: 'network-only',
  })
  const [resources, setResources] = useState<Resource[]>(
    person.providesResources ?? []
  )
  const [UpdatePerson] = useMutation(UPDATE_PERSON_MUTATION)
  const [open, setOpen] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  const router = useRouter()

  const valueOptions =
    data?.resources.map((resource) => ({
      label: resource.name,
      value: resource.id,
    })) ?? []

  type FormData = {
    resources: string[]
  }

  useEffect(() => {
    refetch()
  }, [refetch])

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: {
      resources: resources.map((resource) => resource.id) ?? [],
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // find resources to disconnect and connect
      const initialResources = resources.map((resource) => resource.id)
      const toDisconnect = initialResources.filter(
        (resource) => !data.resources.includes(resource)
      )
      const toConnect = data.resources.filter(
        (resource) => !initialResources.map((p) => p).includes(resource)
      )

      const response = await UpdatePerson({
        variables: {
          where: {
            id_EQ: person.id,
          },
          update: {
            providesResources: [
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

      setResources(
        response.data.updatePeople.people[0].providesResources as Resource[]
      )
      setOpen(false)

      toaster.success({
        title: 'Updated Resources',
        description: 'The resources for this person have been updated',
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
      <VStack
        key="Resources"
        p={4}
        gap={4}
        bg={'gray.contrast'}
        borderRadius={'2xl'}
        boxShadow={'xs'}
        alignItems={'flex-start'}
        width="100%"
      >
        <DialogRoot
          placement="center"
          open={open}
          onOpenChange={(e) => setOpen(e.open)}
        >
          <DialogBackdrop />
          {/* <DialogTrigger asChild> */}

          {resources.length > 0 && (
            <HStack width="100%" justifyContent="space-between">
              <Spacer />
              <Button
                size="sm"
                variant="surface"
                onClick={() =>
                  router.push('/resource/create?personId=' + person.id)
                }
              >
                Create a New Resource
              </Button>
              <Button size="sm" variant="surface" onClick={() => setOpen(true)}>
                Connect Resources
              </Button>
            </HStack>
          )}

          {/* </DialogTrigger> */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent ref={contentRef}>
              <DialogHeader>
                <DialogTitle>{`${person.name}'s Resources`}</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <MultiSelect
                  name="resources"
                  label="Choose resources to link to Person"
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
        {resources.length === 0 && (
          <EmptyState title="No Resources" description="Click here to add some">
            <Button
              size="sm"
              variant="surface"
              onClick={() =>
                router.push('/resource/create?personId=' + person.id)
              }
            >
              Create a New Resource
            </Button>
            <Button size="sm" variant="surface" onClick={() => setOpen(true)}>
              Connect Resources
            </Button>
          </EmptyState>
        )}

        <Grid
          key="resources"
          templateColumns={{
            base: '1fr',
            lg: 'repeat(auto-fill, minmax(250px, 1fr))',
            xl: 'repeat(auto-fill, minmax(360px, 1fr)))',
          }}
          gap={6}
          width="100%"
        >
          {resources.map((resource) => (
            <GridItem key={resource.id}>
              <ResourceCard
                resource={
                  { ...resource, providedByPerson: [person] } as Resource
                }
              />
            </GridItem>
          ))}
        </Grid>
      </VStack>
    </ApolloWrapper>
  )
}
