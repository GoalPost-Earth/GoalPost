'use client'

import { CREATE_PEOPLE_MUTATION } from '@/app/mutations/PERSON_MUTATIONS'
import { useRouter } from 'next/navigation'
import { Input, Select } from '@/components/form'
import { Button } from '@/components/ui'
import { useMutation } from '@apollo/client'
import { Box, Center, Container, Grid, GridItem } from '@chakra-ui/react'
import React from 'react'
import { useForm } from 'react-hook-form'

function CreatePerson() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm()
  const router = useRouter()

  const [CreatePeople] = useMutation(CREATE_PEOPLE_MUTATION)

  const onSubmit = async (data) => {
    try {
      const res = await CreatePeople({
        variables: {
          input: {
            ...data,
          },
        },
      })

      router.push('/person/view/' + res.data?.createPeople.people[0].id)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Container>
      <form onSubmit={handleSubmit(onSubmit)}>
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
              name="phoneNumber"
              control={control}
              errors={errors}
              required
            />
          </GridItem>

          <GridItem>
            <Input
              label="Manual (paste a url here)"
              name="manual"
              control={control}
              errors={errors}
              required
            />
          </GridItem>
          <GridItem>
            <Input
              label="Interests"
              name="interests"
              control={control}
              errors={errors}
              required
            />
          </GridItem>

          <GridItem>
            <Select
              label="Pronouns"
              name="pronouns"
              control={control}
              errors={errors}
              options={[
                { label: 'He/Him', value: 'he/him' },
                { label: 'She/Her', value: 'she/her' },
                { label: 'They/Them', value: 'they/them' },
              ]}
              required
            />
          </GridItem>
          <GridItem>
            <Input
              label="Location"
              name="location"
              control={control}
              errors={errors}
              required
            />
          </GridItem>
        </Grid>
        <Box my={5}>
          <hr />
        </Box>
        <Center>
          <Button type="submit" loading={isSubmitting}>
            Create Person
          </Button>
        </Center>
      </form>
    </Container>
  )
}

export default CreatePerson
