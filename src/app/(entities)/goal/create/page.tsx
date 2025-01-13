'use client'

import { CREATE_GOAL_MUTATION } from '@/app/graphql/mutations'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation } from '@apollo/client'
import { Container } from '@chakra-ui/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { GoalForm } from '@/components'
import { useApp } from '@/app/contexts'
import { FormMode } from '@/constants'
import { zodResolver } from '@hookform/resolvers/zod'
import { GoalFormData, goalSchema } from '@/app/schema'

function CreateGoal() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const personId = searchParams?.get('personId')
  const [CreateGoal] = useMutation(CREATE_GOAL_MUTATION)
  const { user } = useApp()
  const {
    control,
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      personLink: personId ?? undefined,
    },
  })

  const onSubmit = async (data: GoalFormData) => {
    try {
      const { personLink, linkTo, communityLink, ...rest } = data

      const res = await CreateGoal({
        variables: {
          input: {
            ...rest,
            createdBy: {
              connect: [{ where: { node: { authId_EQ: user?.sub } } }],
            },
            motivatesPeople:
              linkTo === 'personLink'
                ? {
                    connect: [{ where: { node: { id_EQ: personLink } } }],
                  }
                : undefined,
            motivatesCommunities:
              linkTo === 'communityLink'
                ? {
                    connect: [{ where: { node: { id_EQ: communityLink } } }],
                  }
                : undefined,
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
      <GoalForm
        formMode={FormMode.Create}
        control={control}
        errors={errors}
        register={register}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit(onSubmit)}
      />
    </Container>
  )
}

export default CreateGoal
