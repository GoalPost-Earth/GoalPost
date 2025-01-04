'use client'
import { UPDATE_COMMUNITY_MUTATION } from '@/app/graphql/mutations/COMMUNITY_MUTATIONS'
import { useRouter } from 'next/navigation'
import { Input, Select } from '@/components/form'
import { Button } from '@/components/ui'
import { useMutation, useQuery } from '@apollo/client'
import {
  Box,
  Center,
  Container,
  Grid,
  GridItem,
  Heading,
} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { STATUS_SELECT_OPTIONS } from '@/app/types'
import { GET_COMMUNITY } from '@/app/graphql'
import ApolloWrapper from '@/components/ApolloWrapper'

export default function UpdateCommunity({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [id, setId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const getId = async () => {
      const { id } = await params
      setId(id)
    }
    getId()
  }, [params])

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm()

  const [UpdateCommunities] = useMutation(UPDATE_COMMUNITY_MUTATION)

  const { data, loading, error } = useQuery(GET_COMMUNITY, {
    variables: { id: id as string },
  })

  const community = data?.communities[0]

  console.log(community)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (formData: any) => {
    try {
      const res = await UpdateCommunities({
        variables: {
          id: id as string,
          update: {
            name_SET: formData.name,
            description_SET: formData.description,
            status_SET: formData.status,
            why_SET: formData.why,
            location_SET: formData.location,
            time_SET: formData.time,
          },
        },
      })

      router.push('/community/' + res.data?.updateCommunities.communities[0].id)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Container>
        <Heading>Update Community</Heading>
        <form onSubmit={handleSubmit(onSubmit)}>
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
      </Container>
    </ApolloWrapper>
  )
}
