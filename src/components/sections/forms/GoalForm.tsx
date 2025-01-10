import {
  Box,
  Center,
  Grid,
  GridItem,
  Heading,
  Separator,
} from '@chakra-ui/react'
import React from 'react'
import { Input, NativeSelect } from '../../react-hook-form'
import { STATUS_SELECT_OPTIONS } from '@/constants'
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

export interface GoalFormProps {
  formMode: string
  control: Control<never>
  register: UseFormRegister<never>
  errors: FieldErrors<FieldValues>
  isSubmitting: boolean
  onSubmit: () => void
}

const GoalForm = ({
  formMode,
  control,
  errors,
  register,
  isSubmitting,
  onSubmit,
}: GoalFormProps) => {
  const { data, loading, error } = useQuery(GET_ALL_PEOPLE)
  const [linkType, setLinkType] = React.useState('personLink')
  const {
    data: communityData,
    loading: communityLoading,
    error: communityError,
  } = useQuery(GET_ALL_COMMUNITIES)

  const peopleOptions: SelectOptions =
    data?.people.map((person: any) => ({
      value: person.id,
      label: `${person.firstName} ${person.lastName}`,
    })) || []
  const communityOptions: SelectOptions =
    communityData?.communities.map((community: any) => ({
      value: community.id,
      label: community.name,
    })) || []

  return (
    <ApolloWrapper
      loading={loading || communityLoading}
      error={error || communityError}
      data={data || communityData}
    >
      <Heading>{formMode} Goal</Heading>
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
            <Input
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
            {formMode} Goal
          </Button>
        </Center>
      </form>
    </ApolloWrapper>
  )
}

export default GoalForm
