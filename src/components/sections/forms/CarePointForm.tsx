import {
  Box,
  Center,
  Grid,
  GridItem,
  Heading,
  Separator,
} from '@chakra-ui/react'
import React from 'react'
import {
  Input,
  MultiSelect,
  NativeSelect,
  Textarea,
} from '../../react-hook-form'
import { Button } from '../../ui'
import {
  Control,
  FieldErrors,
  FieldValues,
  UseFormRegister,
} from 'react-hook-form'
import { STATUS_SELECT_OPTIONS } from '@/constants'
import { useQuery } from '@apollo/client'
import { GET_ALL_GOALS, GET_ALL_RESOURCES } from '@/app/graphql'
import { ApolloWrapper } from '@/components/layout'

export interface CarePointFormProps {
  formMode: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>
  errors: FieldErrors<FieldValues>
  isSubmitting: boolean
  onSubmit: () => void
}

const CarePointForm = ({
  formMode,
  control,
  errors,
  register,
  isSubmitting,
  onSubmit,
}: CarePointFormProps) => {
  const { data, loading, error } = useQuery(GET_ALL_GOALS)
  const {
    data: resourceData,
    loading: resourceLoading,
    error: resourceError,
  } = useQuery(GET_ALL_RESOURCES)

  const goalOptions =
    data?.goals.map((goal) => ({
      value: goal.id,
      label: goal.motivatesPeople[0]?.name + ' - ' + goal.name,
    })) || []

  const resourceOptions =
    resourceData?.resources.map((resource) => ({
      value: resource.id,
      label: resource.name,
    })) || []

  return (
    <ApolloWrapper
      loading={loading || resourceLoading}
      error={error || resourceError}
      data={data || resourceData}
    >
      <Heading>{formMode} CarePoint</Heading>
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
              defaultValue={['Active']}
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

          <GridItem>
            <Input
              label="Level Fulfilled"
              name="levelFulfilled"
              control={control}
              errors={errors}
            />
          </GridItem>

          <GridItem>
            <Input
              label="Fulfillment Date"
              name="fulfillmentDate"
              type="date"
              control={control}
              errors={errors}
            />
          </GridItem>
          <GridItem>
            <Textarea
              label="Success Measures"
              name="successMeasures"
              control={control}
              errors={errors}
            />
          </GridItem>

          <GridItem>
            <Textarea
              label="Issues Identified"
              name="issuesIdentified"
              control={control}
              errors={errors}
            />
          </GridItem>

          <GridItem>
            <Textarea
              label="Issues Resolved"
              name="issuesResolved"
              control={control}
              errors={errors}
            />
          </GridItem>
        </Grid>

        <Separator my={5} />

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
          <GridItem>
            <MultiSelect
              label="What goals enable this care point?"
              name="enabledByGoals"
              placeholder="Select Goals"
              errors={errors}
              control={control}
              options={goalOptions}
              multiple
            />
          </GridItem>
          <GridItem>
            <MultiSelect
              label="What goals does this care point care for?"
              name="caresForGoals"
              placeholder="Select Goals"
              errors={errors}
              control={control}
              options={goalOptions}
              multiple
            />
          </GridItem>
          <GridItem>
            <MultiSelect
              label="Which resources are needed for this care point?"
              name="resources"
              placeholder="Select Resources"
              errors={errors}
              control={control}
              options={resourceOptions}
              multiple
            />
          </GridItem>
        </Grid>
        <Box my={5}>
          <hr />
        </Box>
        <Center>
          <Button type="submit" loading={isSubmitting}>
            {formMode} CarePoint
          </Button>
        </Center>
      </form>
    </ApolloWrapper>
  )
}

export default CarePointForm
