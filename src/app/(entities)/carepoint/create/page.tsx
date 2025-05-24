'use client'

import { CREATE_CAREPOINT_MUTATION } from '@/app/graphql/mutations'
import { useRouter } from 'next/navigation'
import { useMutation } from '@apollo/client'
import { Container } from '@chakra-ui/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { CarePointForm } from '@/components'
import { FormMode } from '@/constants'
import { CarePointFormData, carePointSchema } from '@/app/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useApp } from '@/app/contexts'

function CreateCarePoint() {
  const {
    control,
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<CarePointFormData>({
    resolver: zodResolver(carePointSchema),
    defaultValues: {
      status: 'Active',
      enabledByGoals: [],
      caresForGoals: [],
      resources: [],
    },
  })
  const router = useRouter()
  const { user } = useApp()

  const [CreateCarePoint] = useMutation(CREATE_CAREPOINT_MUTATION)

  const onSubmit = async (data: CarePointFormData) => {
    const { enabledByGoals, caresForGoals, resources, ...rest } = data

    try {
      const res = await CreateCarePoint({
        variables: {
          input: {
            ...rest,
            createdBy: {
              connect: [{ where: { node: { authId_EQ: user?.sub } } }],
            },

            enabledByGoals: {
              connect: [{ where: { node: { id_IN: enabledByGoals } } }],
            },
            caresForGoals: {
              connect: [{ where: { node: { id_IN: caresForGoals } } }],
            },
            resources: {
              connect: [{ where: { node: { id_IN: resources } } }],
            },
          },
        },
      })

      router.push('/carepoint/' + res.data?.createCarePoints.carePoints[0].id)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Container>
      <CarePointForm
        formMode={FormMode.Create}
        control={control}
        register={register}
        errors={errors}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit(onSubmit)}
      />
    </Container>
  )
}

export default CreateCarePoint
