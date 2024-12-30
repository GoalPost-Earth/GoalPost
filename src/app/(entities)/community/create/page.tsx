'use client'

import { CREATE_COMMUNITY_MUTATION } from '@/app/graphql/mutations/COMMUNITY_MUTATIONS'
import { useRouter } from 'next/navigation'
import { Input, Select } from '@/components/form'
import { Button } from '@/components/ui'
import { useMutation } from '@apollo/client'
import {
  Box,
  Center,
  Container,
  Grid,
  GridItem,
  Heading,
} from '@chakra-ui/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { STATUS_SELECT_OPTIONS } from '@/app/types'
import { useUser } from '@auth0/nextjs-auth0/client'

function CreateCommunity() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm()
  const router = useRouter()
  const { user } = useUser()
  const [CreateCommunities] = useMutation(CREATE_COMMUNITY_MUTATION)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      const res = await CreateCommunities({
        variables: {
          input: {
            ...data,
            createdBy: {
              connect: { where: { node: { authId_EQ: user?.sub } } },
            },
          },
        },
      })

      router.push('/community/' + res.data?.createCommunities.communities[0].id)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Container>
      <Heading>Create A Community</Heading>
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
            Create Community
          </Button>
        </Center>
      </form>
    </Container>
  )
}

export default CreateCommunity
