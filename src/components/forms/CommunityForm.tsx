import { Box, Center, Grid, GridItem, Heading } from '@chakra-ui/react'
import React from 'react'
import { Input, Select } from '../react-hook-form'
import { STATUS_SELECT_OPTIONS } from '@/types'
import { Button } from '../ui'
import { Control, FieldErrors, FieldValues } from 'react-hook-form'
import { Community } from '@/gql/graphql'

export interface CommunityFormProps {
  formMode: string
  data: Community | undefined
  control: Control<FieldValues>
  errors: FieldErrors<FieldValues>
  isSubmitting: boolean
  onSubmit: () => void
}

const CommunityForm = ({
  formMode,
  data,
  control,
  errors,
  isSubmitting,
  onSubmit,
}: CommunityFormProps) => {
  const community = data

  return (
    <>
      <Heading>{formMode} Community</Heading>
      <form onSubmit={onSubmit}>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
          <GridItem>
            <Input
              label="Name"
              name="name"
              defaultValue={community?.name}
              control={control}
              errors={errors}
              required
            />
          </GridItem>
          <GridItem>
            <Input
              label="Description"
              name="description"
              defaultValue={community?.description ?? ''}
              control={control}
              errors={errors}
            />
          </GridItem>
          <GridItem>
            <Select
              label="Status"
              name="status"
              defaultValue={
                community?.status
                  ? [
                      STATUS_SELECT_OPTIONS.find(
                        (option) => option.value === community?.status
                      )?.value ?? '',
                    ]
                  : []
              }
              control={control}
              errors={errors}
              options={STATUS_SELECT_OPTIONS}
            />
          </GridItem>
          <GridItem>
            <Input
              label="Why"
              name="why"
              defaultValue={community?.why ?? ''}
              control={control}
              errors={errors}
            />
          </GridItem>
          <GridItem>
            <Input
              label="Location"
              name="location"
              defaultValue={community?.location ?? ''}
              control={control}
              errors={errors}
            />
          </GridItem>
          <GridItem>
            <Input
              label="Time"
              name="time"
              defaultValue={community?.time ?? ''}
              control={control}
              errors={errors}
            />
          </GridItem>
        </Grid>

        <Box my={5}>
          <hr />
        </Box>
        <Center>
          <Button type="submit" loading={isSubmitting}>
            Update Community
          </Button>
        </Center>
      </form>
    </>
  )
}

export default CommunityForm
