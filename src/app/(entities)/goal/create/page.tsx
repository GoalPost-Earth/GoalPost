'use client'

import { CREATE_GOAL_MUTATION } from '@/app/graphql/mutations'
import { useRouter } from 'next/navigation'
import { useMutation } from '@apollo/client'
import { Container } from '@chakra-ui/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { FormMode } from '@/types'
import { GoalForm } from '@/components'
import { useApp } from '@/app/contexts'

function CreateGoal() {
  const { user } = useApp()
  const {
    control,
    handleSubmit,
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
              connect: [{ where: { node: { authId_EQ: user?.sub } } }],
            },
            motivatesPeople: {
              connect: [{ where: { node: { authId_EQ: user?.sub } } }],
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
      <GoalForm
        formMode={FormMode.Create}
        control={control}
        errors={errors}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit(onSubmit)}
      />
    </Container>
  )
}

export default CreateGoal
