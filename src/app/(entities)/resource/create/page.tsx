'use client'

import { CREATE_RESOURCE_MUTATION } from '@/app/graphql/mutations/RESOURCE_MUTATIONS'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation } from '@apollo/client'
import { Container } from '@chakra-ui/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { FormMode } from '@/constants'
import { ResourceForm } from '@/components'
import { useApp } from '@/app/contexts'

function CreateResource() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const personId = searchParams?.get('providedByPerson')
  const [CreateResources] = useMutation(CREATE_RESOURCE_MUTATION)
  const { user } = useApp()

  const {
    control,
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      name: '',
      providedByPerson: personId ?? '',
      description: '',
      status: '',
      why: '',
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    const { providedByPerson } = data
    try {
      const res = await CreateResources({
        variables: {
          input: {
            ...data,
            createdBy: {
              connect: [{ where: { node: { authId_EQ: user?.sub } } }],
            },
            providedByPerson: {
              connect: {
                where: {
                  node: { id_EQ: providedByPerson ?? (user?.id || '') },
                },
              },
            },
          },
        },
      })

      router.push('/resource/' + res.data?.createResources.resources[0].id)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Container>
      <ResourceForm
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

export default CreateResource
