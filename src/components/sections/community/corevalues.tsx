'use client'

import { GET_ALL_COREVALUES, UPDATE_COMMUNITY_MUTATION } from '@/app/graphql'
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
import { CoreValue, Community } from '@/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import { Grid, GridItem, HStack, Spacer, VStack } from '@chakra-ui/react'
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

export default function CommunityCoreValues({
  community,
}: {
  community: Community
}) {
  const [coreValues, setCoreValues] = useState<CoreValue[]>(
    community.coreValues ?? []
  )
  const [open, setOpen] = useState(false)
  const { data, loading, error } = useQuery(GET_ALL_COREVALUES)
  const [UpdateCommunity] = useMutation(UPDATE_COMMUNITY_MUTATION)
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
      coreValues: coreValues.map((coreValue) => coreValue.id),
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // Find corevalues to delete and connect
      const initialCoreValues = coreValues.map((coreValue) => coreValue.id)

      const toConnect = data.coreValues.filter(
        (coreValue) => !initialCoreValues.includes(coreValue)
      )
      const toDisconnect = initialCoreValues.filter(
        (coreValue) => !data.coreValues.includes(coreValue)
      )

      const response = await UpdateCommunity({
        variables: {
          id: community.id,
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
        response.data.updateCommunities.communities[0].coreValues as CoreValue[]
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
                <DialogTitle>{`${community.name}'s Core Values`}</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <MultiSelect
                  name="coreValues"
                  label="Choose core values which this community embraces"
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
        <Grid
          key="coreValues"
          templateColumns="repeat(auto-fill, minmax(250px, 1fr))"
          gap={6}
          width="100%"
        >
          {coreValues.map((corevalue) => (
            <GridItem key={corevalue.id}>
              <CoreValueCard coreValue={corevalue} />
            </GridItem>
          ))}
        </Grid>
        {coreValues.length === 0 && (
          <EmptyState
            title="No Core Values"
            description="Click here to add some"
          >
            <Button variant="surface" onClick={() => setOpen(true)}>
              Choose Core Values
            </Button>
          </EmptyState>
        )}
      </VStack>
    </ApolloWrapper>
  )
}
