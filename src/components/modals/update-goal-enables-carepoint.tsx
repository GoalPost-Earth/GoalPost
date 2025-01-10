'use client'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@apollo/client'
import { Container } from '@chakra-ui/react'
import React, { use, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { GET_GOAL, UPDATE_GOAL_MUTATION } from '@/app/graphql'
import { ApolloWrapper, GoalForm } from '@/components'
import { GoalFormData, goalSchema } from '@/app/schema'
import { FormMode } from '@/constants'

export default function UpdateGoalEnablesCarePoints({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const { data, loading, error } = useQuery(GET_GOAL, {
    variables: { id },
  })
  const [UpdateGoal] = useMutation(UPDATE_GOAL_MUTATION)

  const goal = data?.goals[0]

  const defaultValues: GoalFormData = useMemo(
    () => ({
      name: goal?.name || '',
      description: goal?.description || '',
      successMeasures: goal?.successMeasures || '',
      photo: goal?.photo || '',
      status: goal?.status || '',
      location: goal?.location || '',
      time: goal?.time || '',
    }),
    [goal]
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<GoalFormData>({
    defaultValues,
    resolver: zodResolver(goalSchema),
  })
  useEffect(() => {
    if (goal) {
      reset(defaultValues)
    }
  }, [goal, defaultValues, reset])

  const onSubmit = async (formData: GoalFormData) => {
    try {
      const res = await UpdateGoal({
        variables: {
          id: id,
          update: {
            name_SET: formData.name,
            description_SET: formData.description,
            successMeasures_SET: formData.successMeasures,
            photo_SET: formData.photo,
            status_SET: formData.status,
            location_SET: formData.location,
            time_SET: formData.time,
          },
        },
      })

      router.push('/goal/' + res.data?.updateGoals.goals[0].id)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Container>
        <GoalForm
          formMode={FormMode.Update}
          control={control}
          errors={errors}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit(onSubmit)}
        />
      </Container>
    </ApolloWrapper>
  )
}
