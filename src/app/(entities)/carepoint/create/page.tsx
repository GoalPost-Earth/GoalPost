'use client'

import { CREATE_COREVALUE_MUTATION } from '@/app/graphql/mutations'
import { useRouter } from 'next/navigation'
import { useMutation } from '@apollo/client'
import { Container } from '@chakra-ui/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useUser } from '@auth0/nextjs-auth0/client'
import { CoreValueForm } from '@/components'
import { FormMode } from '@/constants'

function CreateCoreValue() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm()
  const router = useRouter()
  const { user } = useUser()

  const [CreateCoreValue] = useMutation(CREATE_COREVALUE_MUTATION)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      const res = await CreateCoreValue({
        variables: {
          input: {
            ...data,
            createdBy: {
              connect: [{ where: { node: { authId_EQ: user?.sub } } }],
            },
            isEmbracedBy: {
              connect: { where: { node: { authId_EQ: user?.sub } } },
            },
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
      <CoreValueForm
        formMode={FormMode.Create}
        control={control}
        errors={errors}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit(onSubmit)}
      />
    </Container>
  )
}

export default CreateCoreValue
