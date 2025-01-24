'use client'

import {
  Box,
  Center,
  Grid,
  GridItem,
  Heading,
  Separator,
} from '@chakra-ui/react'
import React, { useEffect, useMemo } from 'react'
import { Input, NativeSelect, Textarea } from '../../react-hook-form'
import { Button } from '../../ui'
import { STATUS_SELECT_OPTIONS } from '@/constants'
import { GET_ALL_COMMUNITIES, GET_ALL_PEOPLE } from '@/app/graphql'
import { useQuery } from '@apollo/client'
import { ApolloWrapper } from '@/components/layout'
import { EntityFormPropsWithLinkTo, SelectOptions } from '@/types'

const ResourceForm = ({
  formMode,
  control,
  errors,
  isSubmitting,
  register,
  resetDefaults,
  setValue,
  watch,
  onSubmit,
}: EntityFormPropsWithLinkTo) => {
  const { data, loading, error } = useQuery(GET_ALL_PEOPLE)
  const {
    data: communityData,
    loading: communityLoading,
    error: communityError,
  } = useQuery(GET_ALL_COMMUNITIES)
  const people = data?.people

  const peopleOptions = useMemo(
    () =>
      people?.map((person) => ({
        value: person.id,
        label: person.name,
      })) ?? [],
    [people]
  )

  const communityOptions: SelectOptions = useMemo(
    () =>
      communityData?.communities.map((community) => ({
        value: community.id,
        label: community.name,
      })) || [],
    [communityData]
  )

  useEffect(() => {
    if (resetDefaults) {
      resetDefaults()
    }
  }, [peopleOptions, communityOptions, resetDefaults])

  return (
    <ApolloWrapper
      loading={loading || communityLoading}
      error={error || communityError}
      data={data || communityData}
    >
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
            <Textarea
              label="Why"
              name="why"
              control={control}
              errors={errors}
            />
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
        </Grid>

        <Separator my={5} />

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
          <GridItem>
            <NativeSelect
              label="Link To"
              name="linkTo"
              register={register}
              errors={errors}
              onChange={(e) => {
                if (setValue) {
                  setValue('linkTo', (e.target as HTMLSelectElement).value)
                  setValue('personLink', undefined)
                  setValue('communityLink', undefined)
                }
              }}
              options={[
                { value: 'personLink', label: 'Link to a Person' },
                { value: 'communityLink', label: 'Link to a Community' },
              ]}
            />
          </GridItem>

          {watch('linkTo') === 'personLink' && (
            <GridItem>
              <NativeSelect
                label="Link to a Person"
                name="personLink"
                placeholder="Select a Person"
                register={register}
                errors={errors}
                options={peopleOptions}
              />
            </GridItem>
          )}
          {watch('linkTo') === 'communityLink' && (
            <GridItem>
              <NativeSelect
                label="Link to a Community"
                name="communityLink"
                placeholder="Select a Community"
                register={register}
                errors={errors}
                options={communityOptions}
              />
            </GridItem>
          )}
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
