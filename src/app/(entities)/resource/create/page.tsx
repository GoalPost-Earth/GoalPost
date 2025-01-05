'use client'

import { CREATE_RESOURCE_MUTATION } from '@/app/graphql/mutations/RESOURCE_MUTATIONS'
import { useRouter } from 'next/navigation'
import { useMutation } from '@apollo/client'
import { Container } from '@chakra-ui/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { FormMode } from '@/types'
import { useUser } from '@auth0/nextjs-auth0/client'
import { ResourceForm } from '@/components'

function CreateResource() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm()
  const router = useRouter()
  const [CreateResources] = useMutation(CREATE_RESOURCE_MUTATION)
  const { user } = useUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      const res = await CreateResources({
        variables: {
          input: {
            ...data,
            providedByPerson: {
              connect: {
                where: { node: { authId_EQ: user?.sub ?? null } },
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
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit(onSubmit)}
      />
    </Container>
  )
}

export default CreateResource
