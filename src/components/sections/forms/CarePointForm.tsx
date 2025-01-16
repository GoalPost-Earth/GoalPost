import {
  Box,
  Center,
  Grid,
  GridItem,
  Heading,
  Separator,
} from '@chakra-ui/react'
import React from 'react'
import { Input, NativeSelect, Textarea } from '../../react-hook-form'
import { Button } from '../../ui'
import {
  Control,
  FieldErrors,
  FieldValues,
  UseFormRegister,
} from 'react-hook-form'
import { STATUS_SELECT_OPTIONS } from '@/constants'
import { useQuery } from '@apollo/client'
import { GET_ALL_GOALS } from '@/app/graphql'
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

  const goalOptions =
    data?.goals.map((goal) => ({
      value: goal.id,
      label: goal.motivatesPeople[0]?.name + ' - ' + goal.name,
    })) || []

  return (
    <ApolloWrapper loading={loading} error={error} data={data}>
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
            <NativeSelect
              label="What goals enable this care point?"
              name="enabledByGoals"
              register={register}
              errors={errors}
              options={goalOptions}
              defaultMessage="Choose from the list of goals"
            />
          </GridItem>
          <GridItem>
            <NativeSelect
              label="What goals does this care point care for?"
              name="caresForGoals"
              register={register}
              errors={errors}
              options={goalOptions}
              defaultMessage="Choose from the list of goals"
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
