'use client'

import { GET_ALL_COREVALUES } from '@/app/graphql'
import { ApolloWrapper } from '@/components/layout'
import {
  Button,
  CarePointCard,
  DialogRoot,
  DialogTrigger,
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBackdrop,
  Select,
} from '@/components'
import { Goal } from '@/gql/graphql'
import { useQuery } from '@apollo/client'
import { Grid, GridItem } from '@chakra-ui/react'
import React, { useRef } from 'react'
import { useForm } from 'react-hook-form'

export default function ViewGoalPage({
  key,
  goal,
}: {
  key: string
  goal: Goal
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const { data, loading, error } = useQuery(GET_ALL_COREVALUES)

  const corevalues = data?.coreValues ?? []
  const valueOptions = corevalues.map((corevalue) => ({
    label: corevalue.name,
    value: corevalue.id,
  }))

  type FormData = {
    corevalues: string[]
  }
  const {
    handleSubmit,
    control,
    getValues,
    formState: { isSubmitting, errors },
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    try {
      console.log('submitting', data)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <ApolloWrapper data={data} loading={loading} error={error} key={key}>
      <DialogRoot>
        <DialogBackdrop />
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Open Dialog
          </Button>
        </DialogTrigger>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent ref={contentRef}>
            <DialogHeader>
              <DialogTitle>{goal.name} Core Values</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Select
                name="corevalues"
                label="What core values are aligned to this goal?"
                control={control}
                errors={errors}
                options={valueOptions}
                portalRef={contentRef}
                multiple
              />
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </DialogActionTrigger>
              <Button
                colorPalette="green"
                type="submit"
                loading={isSubmitting}
                onClick={async () => {
                  const values = getValues()
                  await onSubmit(values)
                }}
              >
                Save
              </Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </DialogContent>
        </form>
      </DialogRoot>

      <Grid templateColumns="repeat(auto-fill, minmax(360px, 1fr))" gap={6}>
        {goal.enablesCarePoints.map((carePoint) => (
          <GridItem key={carePoint.id}>
            <CarePointCard
              id={carePoint.id}
              description={carePoint.description}
              status={carePoint.status}
            />
          </GridItem>
        ))}
      </Grid>
    </ApolloWrapper>
  )
}
