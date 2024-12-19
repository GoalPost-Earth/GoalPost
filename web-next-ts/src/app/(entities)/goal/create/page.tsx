'use client'

import { CREATE_COREVALUE_MUTATION } from '@/app/graphql/mutations'
import { useRouter } from 'next/navigation'
import { Input, Select, Textarea, Checkbox } from '@/components/form'
import { Button } from '@/components/ui'
import { useMutation } from '@apollo/client'
import { Box, Center, Container, Grid, GridItem } from '@chakra-ui/react'
import React from 'react'
import { useForm } from 'react-hook-form'

function CreateGoal() {
  // const { user } = useUser()
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm()
  const router = useRouter()

  const [CreateCoreValues] = useMutation(CREATE_COREVALUE_MUTATION)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      const res = await CreateCoreValues({
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
            <Select
              label="Type"
              name="type"
              control={control}
              errors={errors}
              required
              options={[
                { label: 'Need', value: 'need' },
                { label: 'Offer', value: 'offer' },
                { label: 'Wish', value: 'wish' },
              ]}
            />
          </GridItem>
          <GridItem>
            <Textarea
              label="Description"
              name="description"
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
              label="Success Measures"
              name="successMeasures"
              control={control}
              errors={errors}
              required
            />
          </GridItem>
          <GridItem>
            <Input
              label="Photo"
              name="photo"
              control={control}
              errors={errors}
              // required
              disabled
            />
          </GridItem>

          <GridItem>
            <Checkbox
              label="Status"
              name="status"
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
              required
            />
          </GridItem>
          <GridItem>
            <Input
              label="Time"
              name="time"
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
            Create Goal
          </Button>
        </Center>
      </form>
    </Container>
  )
}

export default CreateGoal
