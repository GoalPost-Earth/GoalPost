'use client'
import { GET_ALL_PEOPLE, UPDATE_COREVALUE_MUTATION } from '@/app/graphql'
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
  ConfirmButton,
  CancelButton,
  PersonCard,
} from '@/components'
import { CoreValue, Person } from '@/gql/graphql'
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

export default function CoreValueRelatedMembers({
  corevalue,
}: {
  corevalue: CoreValue
}) {
  const [relatedMembers, setRelatedMembers] = useState<Person[]>(
    corevalue.isEmbracedBy
  )
  const [open, setOpen] = useState(false)
  const { data, loading, error } = useQuery(GET_ALL_PEOPLE)
  const [UpdateCoreValue] = useMutation(UPDATE_COREVALUE_MUTATION)
  const contentRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  const valueOptions =
    data?.people.map((person) => ({
      label: person.name,
      value: person.id,
    })) ?? []

  type FormData = {
    relatedMembers: string[]
  }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: {
      relatedMembers:
        relatedMembers.map((relatedMember) => relatedMember.id) ?? [],
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // find connections to disconnect and connect
      const initialRelatedMembers = corevalue.isEmbracedBy.map(
        (relatedMember) => relatedMember.id
      )
      const toDisconnect = initialRelatedMembers.filter(
        (relatedMember) => !data.relatedMembers.includes(relatedMember)
      )
      const toConnect = data.relatedMembers.filter(
        (relatedMember) => !initialRelatedMembers.includes(relatedMember)
      )

      const response = await UpdateCoreValue({
        variables: {
          id: corevalue.id,
          update: {
            isEmbracedBy: [
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

      setRelatedMembers(
        response.data.updateCoreValues.coreValues[0].isEmbracedBy as Person[]
      )
      setOpen(false)

      toaster.success({
        title: 'Updated Connections',
        description: 'The connections for the corevalue have been updated',
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
          {relatedMembers.length > 0 && (
            <HStack width="100%" justifyContent="space-between">
              <Spacer />
              <Button size="sm" variant="surface" onClick={() => setOpen(true)}>
                Update Related Members
              </Button>
            </HStack>
          )}
          {/* </DialogTrigger> */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent ref={contentRef}>
              <DialogHeader>
                <DialogTitle>{`${corevalue.name}'s Related Members`}</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <MultiSelect
                  name="relatedMembers"
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

        {relatedMembers.length === 0 && (
          <EmptyState title="No Members" description="Click here to add some">
            <Button variant="surface" onClick={() => setOpen(true)}>
              Add A Member
            </Button>
          </EmptyState>
        )}
        <Grid
          key="relatedMembers"
          templateColumns={{
            base: '1fr',
            lg: 'repeat(3, 1fr)',
          }}
          gap={6}
          width="100%"
        >
          {relatedMembers.map((member) => (
            <GridItem key={corevalue.id}>
              <PersonCard id={member.id} name={member.name} person={member} />
            </GridItem>
          ))}
        </Grid>
      </VStack>
    </ApolloWrapper>
  )
}
