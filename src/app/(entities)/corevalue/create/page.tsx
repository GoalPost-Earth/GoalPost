'use client'

import { CREATE_COREVALUE_MUTATION } from '@/app/graphql/mutations'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation } from '@apollo/client'
import { Container } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { CoreValueForm } from '@/components'
import { FormMode } from '@/constants'
import { CoreValueFormData, coreValueSchema } from '@/app/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useApp } from '@/app/contexts'

function CreateCoreValue() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const personId = searchParams?.get('personId')
  const { user } = useApp()

  const defaultValues = React.useMemo(
    () => ({
      status: 'Active',
      linkTo: 'personLink',
      personLink: personId ?? undefined,
      communityLink: undefined,
    }),
    [personId]
  )

  const {
    control,
    handleSubmit,
    reset,
    register,
    formState: { isSubmitting, errors },
  } = useForm<CoreValueFormData>({
    resolver: zodResolver(coreValueSchema),
    defaultValues,
  })
  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const [CreateCoreValue] = useMutation(CREATE_COREVALUE_MUTATION)

  const onSubmit = async (data: CoreValueFormData) => {
    const { personLink, linkTo, communityLink, ...rest } = data

    try {
      const res = await CreateCoreValue({
        variables: {
          input: {
            ...rest,
            createdBy: {
              connect: [{ where: { node: { authId_EQ: user?.sub } } }],
            },
            people:
              linkTo === 'personLink'
                ? {
                    connect: [{ where: { node: { id_EQ: personLink } } }],
                  }
                : undefined,
            communities:
              linkTo === 'communityLink'
                ? {
                    connect: [{ where: { node: { id_EQ: communityLink } } }],
                  }
                : undefined,
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
        register={register}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit(onSubmit)}
      />
    </Container>
  )
}

export default CreateCoreValue
