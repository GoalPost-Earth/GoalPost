'use client'

import { CREATE_GOAL_MUTATION } from '@/app/graphql/mutations'
import { useRouter } from 'next/navigation'
import { Input, Select, Textarea, ImageUpload } from '@/components/form'
import { Button } from '@/components/ui'
import { useMutation } from '@apollo/client'
import { Box, Center, Container, Grid, GridItem } from '@chakra-ui/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useUser } from '@auth0/nextjs-auth0/client'
import { CloudinaryPresets, STATUS_SELECT_OPTIONS } from '@/app/types'

function CreateGoal() {
  const { user } = useUser()
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm()
  const router = useRouter()

  const [CreateGoal] = useMutation(CREATE_GOAL_MUTATION)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      const res = await CreateGoal({
        variables: {
          input: {
            ...data,
            createdBy: {
              connect: { where: { node: { authId_EQ: user?.sub } } },
            },
          },
        },
      })

      router.push('/goal/' + res.data?.createGoals.goals[0].id)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Container>
      <form onSubmit={handleSubmit(onSubmit)}>
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
              label="Name"
              name="name"
              control={control}
              errors={errors}
              required
            />
          </GridItem>
          <GridItem>
            <Textarea
              label="Description"
              name="description"
              control={control}
              errors={errors}
            />
          </GridItem>

          <GridItem>
            <Input
              label="Success Measures"
              name="successMeasures"
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
            Create Goal
          </Button>
        </Center>
      </form>
    </Container>
  )
}

export default CreateGoal
