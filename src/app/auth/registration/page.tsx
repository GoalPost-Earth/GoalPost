// Registration page for collecting additional user info after signup
'use client'
import React from 'react'
import { Box, Button, Container, Heading, Spinner } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { ImageUpload, Input } from '@/components/react-hook-form'
import { useRouter } from 'next/navigation'
import { CloudinaryPresets } from '@/constants'

// Basic info fields matching person mutation (excluding entity info)
const fields = [
  { name: 'firstName', label: 'First Name', required: true },
  { name: 'lastName', label: 'Last Name', required: true },
  { name: 'phone', label: 'Phone', required: false },
  { name: 'location', label: 'Location', required: false },
  { name: 'pronouns', label: 'Pronouns', required: false },
]

export default function RegistrationPage() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm()
  const router = useRouter()

  const onSubmit = async (values: Record<string, string>) => {
    // TODO: Call mutation to update person with these values
    // For now, just route to dashboard or profile
    console.log('Submitting registration with values:', values)
    router.push('/')
  }

  return (
    <Container maxW="md" py={10}>
      <Heading as="h2" size="lg" mb={6} textAlign="center">
        Complete Your Profile
      </Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box mb={4}>
          <ImageUpload
            label=""
            name="photo"
            control={control}
            errors={errors}
            setValue={setValue}
            uploadPreset={CloudinaryPresets.MemberPhotos}
          />
        </Box>
        {fields.map((field) => (
          <Box mb={4} key={field.name}>
            <Input
              label={field.label}
              name={field.name}
              control={control}
              errors={errors}
              required={field.required}
            />
          </Box>
        ))}
        <Button colorScheme="brand" type="submit" w="full">
          {isSubmitting ? <Spinner /> : 'Continue'}
        </Button>
      </form>
    </Container>
  )
}
