'use client'

import {
  Box,
  Center,
  Grid,
  GridItem,
  Heading,
  Separator,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { Input, NativeSelect, Textarea } from '../../react-hook-form'
import { Button } from '../../ui'
import {
  Control,
  FieldErrors,
  FieldValues,
  UseFormRegister,
} from 'react-hook-form'
import { useQuery } from '@apollo/client'
import { GET_ALL_COMMUNITIES, GET_ALL_PEOPLE } from '@/app/graphql'
import { SelectOptions } from '@/types'
import { ApolloWrapper } from '@/components/layout'

export interface CoreValueFormProps {
  formMode: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>
  errors: FieldErrors<FieldValues>
  isSubmitting: boolean
  onSubmit: () => void
}

const CoreValueForm = ({
  formMode,
  control,
  errors,
  register,
  isSubmitting,
  onSubmit,
}: CoreValueFormProps) => {
  const { data, loading, error } = useQuery(GET_ALL_PEOPLE)

  const [linkType, setLinkType] = useState(control._defaultValues['linkTo'])
  const {
    data: communityData,
    loading: communityLoading,
    error: communityError,
  } = useQuery(GET_ALL_COMMUNITIES)

  const peopleOptions: SelectOptions =
    data?.people.map((person) => ({
      value: person.id,
      label: `${person.name}`,
    })) || []
  const communityOptions: SelectOptions =
    communityData?.communities.map((community) => ({
      value: community.id,
      label: community.name,
    })) || []

  return (
    <ApolloWrapper
      loading={loading || communityLoading}
      error={error || communityError}
      data={data || communityData}
    >
      <Heading>{formMode} CoreValue</Heading>
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
            <Input
              label="Alignment Examples"
              name="alignmentExamples"
              control={control}
              errors={errors}
            />
          </GridItem>
          <GridItem>
            <Input
              label="Alignment Challenges"
              name="alignmentChallenges"
              control={control}
              errors={errors}
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
        </Grid>

        <Separator my={5} />

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
          <GridItem>
            <NativeSelect
              label="Link To"
              name="linkTo"
              register={register}
              errors={errors}
              onChange={(e) =>
                setLinkType((e.target as HTMLSelectElement).value)
              }
              options={[
                { value: 'personLink', label: 'Link to a Person' },
                { value: 'communityLink', label: 'Link to a Community' },
              ]}
            />
          </GridItem>

          {linkType === 'personLink' && (
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
          {linkType === 'communityLink' && (
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
            {formMode} CoreValue
          </Button>
        </Center>
      </form>
    </ApolloWrapper>
  )
}

export default CoreValueForm
