'use client'

import { CREATE_COREVALUE_MUTATION } from '@/app/graphql/mutations'
import { useRouter } from 'next/navigation'
import { Input, Select, Textarea, Checkbox } from '@/components/form'
import { Button } from '@/components/ui'
import { useMutation } from '@apollo/client'
import { Box, Center, Container, Grid, GridItem } from '@chakra-ui/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useUser } from '@auth0/nextjs-auth0/client'

function CreateCoreValue() {
  const { user } = useUser()
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm()
  const router = useRouter()

  const [CreateCoreValue] = useMutation(CREATE_COREVALUE_MUTATION)

  const onSubmit = async (data) => {
    try {
      const res = await CreateCoreValue({
        variables: {
          input: {
            ...data,
            // createdBy: { connect: { where: { node: { authId: user?.sub } } } },
          },
        },
      })

      router.push('/corevalue/' + res.data?.createCoreValues.coreValues[0].id)
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
              label="Name"
              name="name"
              control={control}
              errors={errors}
              required
            />
          </GridItem>
          <GridItem>
            <Input
              label="Cares For"
              name="caresFor"
              control={control}
              errors={errors}
              required
            />
          </GridItem>
          <GridItem>
            <Input
              label="Who Supports"
              name="whoSupports"
              control={control}
              errors={errors}
              required
            />
          </GridItem>
          <GridItem>
            <Input
              label="Alignment Challenges"
              name="alignmentChallenges"
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
              required
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
            Create Core Value
          </Button>
        </Center>
      </form>
    </Container>
  )
}

export default CreateCoreValue
