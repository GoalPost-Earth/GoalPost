'use client'

import { Box, Center, Grid, GridItem, Heading } from '@chakra-ui/react'
import React from 'react'
import { Input, NativeSelect, Textarea } from '../../react-hook-form'
import { Button } from '../../ui'
import { STATUS_SELECT_OPTIONS } from '@/constants'
import { GET_ALL_PEOPLE } from '@/app/graphql'
import { useQuery } from '@apollo/client'
import { ApolloWrapper } from '@/components/layout'
import { EntityFormProps } from '@/types'

const ResourceForm = ({
  formMode,
  control,
  errors,
  isSubmitting,
  register,
  onSubmit,
}: EntityFormProps) => {
  const { data, loading, error } = useQuery(GET_ALL_PEOPLE)
  const people = data?.people

  const peopleOptions =
    people?.map((person) => ({
      value: person.id,
      label: person.name,
    })) ?? []

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Heading>{formMode} Resource</Heading>
      <form onSubmit={onSubmit} noValidate>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
          <GridItem>
            <Input
              label="Name"
              name="name"
              control={control}
              errors={errors}
              required
            />
          </GridItem>
          <GridItem>
            <Textarea
              label="Description"
              name="description"
              control={control}
              errors={errors}
            />
          </GridItem>
          <GridItem>
            <NativeSelect
              label="Status"
              name="status"
              register={register}
              errors={errors}
              options={STATUS_SELECT_OPTIONS}
            />
          </GridItem>
          <GridItem>
            <Input label="Why" name="why" control={control} errors={errors} />
          </GridItem>
          <GridItem>
            <Input
              label="Location"
              name="location"
              control={control}
              errors={errors}
            />
          </GridItem>
          <GridItem>
            <Input label="Time" name="time" control={control} errors={errors} />
          </GridItem>
          <GridItem>
            <NativeSelect
              register={register}
              errors={errors}
              label="Provided By"
              name="providedByPerson"
              options={peopleOptions}
            />
          </GridItem>
        </Grid>

        <Box my={5}>
          <hr />
        </Box>
        <Center>
          <Button type="submit" loading={isSubmitting}>
            {formMode} Resource
          </Button>
        </Center>
      </form>
    </ApolloWrapper>
  )
}

export default ResourceForm
