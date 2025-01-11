import { Box, Center, Grid, GridItem, Heading } from '@chakra-ui/react'
import React from 'react'
import { Input, Textarea } from '../../react-hook-form'
import { Button } from '../../ui'
import { Control, FieldErrors, FieldValues } from 'react-hook-form'

export interface CoreValueFormProps {
  formMode: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  errors: FieldErrors<FieldValues>
  isSubmitting: boolean
  onSubmit: () => void
}

const CoreValueForm = ({
  formMode,
  control,
  errors,
  isSubmitting,
  onSubmit,
}: CoreValueFormProps) => {
  return (
    <>
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
            <Input
              label="Who Supports"
              name="whoSupports"
              control={control}
              errors={errors}
            />
          </GridItem>
          <GridItem>
            <Input label="Why" name="why" control={control} errors={errors} />
          </GridItem>
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
    </>
  )
}

export default CoreValueForm
