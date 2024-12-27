'use client'

import { CREATE_PEOPLE_MUTATION } from '@/app/graphql/mutations/PERSON_MUTATIONS'
import { useRouter } from 'next/navigation'
import { Input, Select, Radio } from '@/components/form'
import { Button } from '@/components/ui'
import { useMutation } from '@apollo/client'
import { Center, Container, Grid, GridItem, Heading } from '@chakra-ui/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { ImageUpload } from '@/components/form'
import {
  CloudinaryPresets,
  GENDER_SELECT_OPTIONS,
  PRONOUN_SELECT_OPTIONS,
} from '@/types'

function CreatePerson() {
  const {
    control,
    getValues,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm()
  const router = useRouter()

  const [CreatePeople] = useMutation(CREATE_PEOPLE_MUTATION)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      const res = await CreatePeople({
        variables: {
          input: {
            ...data,
          },
        },
      })
      router.push('/person/' + res.data?.createPeople.people[0].id)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Container position={'relative'} pt={2} pb={10} width={{ md: '50%' }}>
      <Heading position={'absolute'} top={0} left={0} ml={'1rem'}>
        Create a Member Guide
      </Heading>
      <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: '2rem' }}>
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
            <Radio
              name="gender"
              label="Gender"
              value={getValues('gender')}
              control={control}
              errors={errors}
              options={GENDER_SELECT_OPTIONS}
            />
          </GridItem>
          <GridItem>
            <Select
              label="Pronouns"
              name="pronouns"
              control={control}
              errors={errors}
              options={PRONOUN_SELECT_OPTIONS}
            />
          </GridItem>

          <GridItem>
            <Input
              label="Interests"
              name="interests"
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

        <Center my={5}>
          <Button type="submit" loading={isSubmitting}>
            Create Person
          </Button>
        </Center>
      </form>
    </Container>
  )
}

export default CreatePerson
