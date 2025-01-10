import { Box, Center, Grid, GridItem, Heading } from '@chakra-ui/react'
import React from 'react'
import { ImageUpload, Input } from '../../react-hook-form'
import { Button } from '../../ui'
import { Control, FieldErrors, FieldValues } from 'react-hook-form'
import { CloudinaryPresets } from '@/constants'

export interface PersonFormProps {
  formMode: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: any
  errors: FieldErrors<FieldValues>
  isSubmitting: boolean
  onSubmit: () => void
}

const PersonForm = ({
  formMode,
  control,
  errors,
  setValue,
  isSubmitting,
  onSubmit,
}: PersonFormProps) => {
  return (
    <>
      <Heading>{formMode} Person</Heading>
      <form onSubmit={onSubmit} noValidate>
        <Center pt={2}>
          <ImageUpload
            name="photo"
            control={control}
            errors={errors}
            uploadPreset={CloudinaryPresets.MemberPhotos}
            setValue={setValue}
          />
        </Center>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
          <GridItem>
            <Input
              label="First Name"
              name="firstName"
              control={control}
              errors={errors}
              required
            />
          </GridItem>
          <GridItem>
            <Input
              label="Last Name"
              name="lastName"
              control={control}
              errors={errors}
              required
            />
          </GridItem>
          <GridItem>
            <Input
              label="Email"
              name="email"
              control={control}
              errors={errors}
              required
            />
          </GridItem>

          <GridItem>
            <Input
              label="Phone Number"
              name="phone"
              control={control}
              errors={errors}
            />
          </GridItem>
          <GridItem>
            <Input
              label="Pronouns"
              name="pronouns"
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
        </Grid>
        <Box my={5}>
          <hr />
        </Box>
        <Center>
          <Button type="submit" loading={isSubmitting}>
            {formMode} Person
          </Button>
        </Center>
      </form>
    </>
  )
}

export default PersonForm
