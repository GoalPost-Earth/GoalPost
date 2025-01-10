import { Box, Center, Grid, GridItem, Heading } from '@chakra-ui/react'
import React from 'react'
import { Input, Select } from '../react-hook-form'
import { STATUS_SELECT_OPTIONS } from '@/constants'
import { Button } from '../ui'
import { Control, FieldErrors, FieldValues } from 'react-hook-form'

export interface GoalFormProps {
  formMode: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  errors: FieldErrors<FieldValues>
  isSubmitting: boolean
  onSubmit: () => void
}

const GoalForm = ({
  formMode,
  control,
  errors,
  isSubmitting,
  onSubmit,
}: GoalFormProps) => {
  return (
    <>
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
            <Select
              label="Status"
              name="status"
              control={control}
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

        <Box my={5}>
          <hr />
        </Box>
        <Center>
          <Button type="submit" loading={isSubmitting}>
            {formMode} Goal
          </Button>
        </Center>
      </form>
    </>
  )
}

export default GoalForm
