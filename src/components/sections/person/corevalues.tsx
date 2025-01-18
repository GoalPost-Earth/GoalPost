'use client'

import { GET_ALL_COREVALUES, UPDATE_PERSON_MUTATION } from '@/app/graphql'
import { ApolloWrapper } from '@/components/layout'
import { MultiSelect } from '@/components/react-hook-form'
import {
  Button,
  CancelButton,
  ConfirmButton,
  CoreValueCard,
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
  toaster,
} from '@/components/ui'
import { CoreValue, Person } from '@/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import { Grid, GridItem, HStack, Spacer, VStack } from '@chakra-ui/react'
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

export default function PersonCoreValues({ person }: { person: Person }) {
  const [coreValues, setCoreValues] = useState<CoreValue[]>(
    person.coreValues as CoreValue[]
  )
  const [open, setOpen] = useState(false)
  const { data, loading, error } = useQuery(GET_ALL_COREVALUES)
  const [UpdatePerson] = useMutation(UPDATE_PERSON_MUTATION)
  const contentRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  const valueOptions =
    data?.coreValues.map((coreValue) => ({
      label: coreValue.name,
      value: coreValue.id,
    })) ?? []

  type FormData = {
    coreValues: string[]
  }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: {
      coreValues: person.coreValues?.map((coreValue) => coreValue.id) ?? [],
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // Find corevalues to delete and connect
      const coreValueIds = coreValues.map((coreValue) => coreValue.id)
      const toDisconnect = coreValueIds.filter(
        (coreValue) => !data.coreValues.includes(coreValue)
      )
      const toConnect = data.coreValues.filter(
        (coreValue) => !coreValueIds.includes(coreValue)
      )

      const response = await UpdatePerson({
        variables: {
          where: {
            id_EQ: person.id,
          },
          update: {
            coreValues: [
              {
                connect: [{ where: { node: { id_IN: toConnect } } }],
                disconnect: [{ where: { node: { id_IN: toDisconnect } } }],
              },
            ],
          },
        },
      })

      if (!response.data) {
        throw new Error('Failed to update core values')
      }

      setCoreValues(
        response.data.updatePeople.people[0].coreValues as CoreValue[]
      )
      setOpen(false)
      toaster.success({
        title: 'Core Values Updated',
        description: 'Core Values have been updated successfully',
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
          <HStack width="100%" justifyContent="space-between">
            <Spacer />
            {coreValues.length > 0 && (
              <Button size="sm" variant="surface" onClick={() => setOpen(true)}>
                Update Core Values
              </Button>
            )}
          </HStack>
          {/* </DialogTrigger> */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent ref={contentRef}>
              <DialogHeader>
                <DialogTitle>{`${person.name}'s Core Values`}</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <MultiSelect
                  name="coreValues"
                  label="Choose core values which you embrace"
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

        {coreValues.length === 0 && (
          <EmptyState
            title="No Core Values"
            description="Click here to add some"
          >
            <Button variant="surface" onClick={() => setOpen(true)}>
              Choose Your Core Values
            </Button>
          </EmptyState>
        )}
        <Grid
          key="coreValues"
          templateColumns={{
            base: '1fr',
            lg: 'repeat(auto-fill, minmax(250px, 1fr))',
            xl: 'repeat(auto-fill, minmax(360px, 1fr)))',
          }}
          gap={6}
          width="100%"
        >
          {coreValues.map((corevalue) => (
            <GridItem key={corevalue.id}>
              <CoreValueCard coreValue={corevalue} />
            </GridItem>
          ))}
        </Grid>
      </VStack>
    </ApolloWrapper>
  )
}
