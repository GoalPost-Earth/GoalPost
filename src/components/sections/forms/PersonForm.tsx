'use client'

import { Box, Center, Grid, GridItem, Heading } from '@chakra-ui/react'
import React, { useState } from 'react'
import {
  ImageUpload,
  Input,
  NativeSelect,
  Textarea,
} from '../../react-hook-form'
import { Button } from '../../ui'
import { CloudinaryPresets, FormMode } from '@/constants'
import { useQuery } from '@apollo/client'
import { GET_ALL_COMMUNITIES } from '@/app/graphql'
import { ApolloWrapper } from '@/components/layout'
import { EntityFormProps } from '@/types'
import { FieldValues, UseFormSetValue } from 'react-hook-form'

const PersonForm = ({
  formMode,
  control,
  errors,
  setValue,
  register,
  isSubmitting,
  onSubmit,
}: EntityFormProps & { setValue: UseFormSetValue<FieldValues> }) => {
  const [isMember, setIsMember] = useState(control._formValues.community !== '')
  const { data, loading, error } = useQuery(GET_ALL_COMMUNITIES)

  const communities = data?.communities

  const communityOptions =
    communities?.map((community) => ({
      value: community.id,
      label: community.name,
    })) ?? []
  communityOptions?.unshift({ value: '', label: 'None' })
  communityOptions?.unshift({ value: '', label: 'Select a Community' })

  const formFields = [
    { name: 'firstName', label: 'First Name', required: true, type: Input },
    { name: 'lastName', label: 'Last Name', required: true, type: Input },
    { name: 'email', label: 'Email', required: true, type: Input },
    { name: 'phone', label: 'Phone Number', type: Input },
    { name: 'pronouns', label: 'Pronouns', type: Input },
    { name: 'location', label: 'Location', type: Input },
  ]

  const memberFormFields = [
    {
      name: 'status',
      label: 'Status',
      type: NativeSelect,
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
      ],
    },
    {
      name: 'avatar',
      label: 'Avatar',
      type: Input,
    },
    {
      name: 'signupDate',
      label: 'Signup Date',
      type: Input,
      inputType: 'date',
    } as const,
    {
      name: 'careManual',
      label: 'Care Manual (Paste a link here)',
      type: Input,
    },
    {
      name: 'favorites',
      label: 'Favorites',
      type: Textarea,
    },
    {
      name: 'passions',
      label: 'Passions',
      type: Textarea,
    },
    {
      name: 'traits',
      label: 'Traits',
      type: Textarea,
    },
    {
      name: 'fieldsOfCare',
      label: 'Fields of Care',
      type: Textarea,
    },
    {
      name: 'interests',
      label: 'Interests',
      type: Textarea,
    },
  ]

  // Remove the form field named signupDate if FormMode is not Create
  if (formMode === FormMode.Update) {
    memberFormFields.splice(
      memberFormFields.findIndex((field) => field.name === 'signupDate'),
      1
    )
  }

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
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
          {formFields.map((field) => (
            <GridItem key={field.name}>
              <field.type
                label={field.label}
                name={field.name}
                control={control}
                errors={errors}
                required={field.required}
              />
            </GridItem>
          ))}

          {formMode === FormMode.Create && (
            <GridItem>
              <NativeSelect
                label="Community"
                name="community"
                errors={errors}
                register={register}
                onChange={(e) => {
                  if ((e.target as HTMLSelectElement).value === '') {
                    setIsMember(false)
                  } else setIsMember(true)
                }}
                options={communityOptions}
              />
            </GridItem>
          )}

          {isMember && (
            <>
              {memberFormFields.map((field) => (
                <GridItem key={field.name}>
                  <field.type
                    label={field.label}
                    name={field.name}
                    control={control}
                    errors={errors}
                    register={register}
                    options={field.options ?? []}
                    type={field.inputType}
                  />
                </GridItem>
              ))}
            </>
          )}
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
    </ApolloWrapper>
  )
}

export default PersonForm
