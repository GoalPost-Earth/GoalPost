'use client'

import { Box, Center, Container, Heading, Stack } from '@chakra-ui/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CreateProfileFormData,
  createProfileSchema,
} from '../../../schema/profileSchema'
import Input from '@/components/form/Input'
import { Button } from '@/components/ui'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useMutation } from '@apollo/client'
import { CREATE_PROFILE_MUTATION } from '@/app/graphql/mutations'
import { useRouter } from 'next/navigation'
import { Select, Checkbox, Switch } from '@/components/form'

export default function CreateProfilePage() {
  const { user } = useUser()
  const router = useRouter()

  const defaultValues: CreateProfileFormData = {
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    country: '',
    county: '',
    gender: '',
    phone: '',
    state: '',
    zipPostal: '',
  }

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createProfileSchema),
    defaultValues,
  })

  const [CreateProfileMutation] = useMutation(CREATE_PROFILE_MUTATION)

  const onSubmit = async (data: CreateProfileFormData) => {
    try {
      const response = await CreateProfileMutation({
        variables: {
          input: [
            {
              firstName: data.firstName,
              lastName: data.lastName,
              authId: user?.sub ?? '',
              email: data?.email ?? '',
              gender: data.gender,
              phone: data.phone,
              signupDate: new Date().toISOString(),
            },
          ],
        },
      })

      router.push(`/profile/${response.data?.createMembers.members[0].id}`)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Container>
      <Center>
        <Box width="100%" paddingY={10}>
          <Heading>Set Up Your Profile</Heading>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack gap="8" maxW="sm" css={{ '--field-label-width': '96px' }}>
              <Input
                label="First Name"
                name="firstName"
                control={control}
                errors={errors}
                required
              />

              <Input
                label="Last Name"
                name="lastName"
                control={control}
                errors={errors}
                required
              />

              <Input
                label="Email"
                name="email"
                control={control}
                errors={errors}
                required
              />
              <Select
                label="Role"
                name="role"
                control={control}
                errors={errors}
                options={[
                  { label: 'Admin', value: 'admin' },
                  { label: 'User', value: 'user' },
                ]}
                required
              />

              <Checkbox
                label="Enabled"
                name="enabled"
                control={control}
                errors={errors}
                // options={[
                //   { label: 'Admin', value: 'admin' },
                //   { label: 'User', value: 'user' },
                // ]}
                required
              />
              <Switch
                label="Enabled"
                name="enableds"
                control={control}
                errors={errors}
                // options={[
                //   { label: 'Admin', value: 'admin' },
                //   { label: 'User', value: 'user' },
                // ]}
                required
              />

              {/* <Radio
                label="Role"
                name="roleeg"
                control={control}
                errors={errors}
                options={[
                  { label: 'Admin', value: 'admin' },
                  { label: 'User', value: 'user' },
                ]}
                value={getValues('roleeg')}
                required
              /> */}

              <Input
                label="Phone"
                name="phone"
                control={control}
                errors={errors}
                required
              />

              <Input
                label="Address"
                name="address"
                control={control}
                errors={errors}
                required
              />

              <Input
                label="City"
                name="city"
                control={control}
                errors={errors}
                required
              />

              <Input
                label="Country"
                name="country"
                control={control}
                errors={errors}
                required
              />

              <Input
                label="County"
                name="county"
                control={control}
                errors={errors}
                required
              />

              <Input
                label="Gender"
                name="gender"
                control={control}
                errors={errors}
                required
              />

              <Input
                label="State"
                name="state"
                control={control}
                errors={errors}
              />

              <Input
                label="Zip/Postal"
                name="zipPostal"
                control={control}
                errors={errors}
              />

              <Button type="submit" colorPalette="green" loading={isSubmitting}>
                Create Profile
              </Button>
            </Stack>
          </form>
        </Box>
      </Center>
    </Container>
  )
}
