'use client'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@apollo/client'
import { Container } from '@chakra-ui/react'
import React, { use, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormMode } from '@/constants'
import { GET_COREVALUE, UPDATE_COREVALUE_MUTATION } from '@/app/graphql'
import { ApolloWrapper, CoreValueForm } from '@/components'
import { CoreValueFormData, coreValueSchema } from '@/app/schema'

export default function UpdateCommunity({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const { data, loading, error } = useQuery(GET_COREVALUE, {
    variables: { id },
  })
  const [UpdateCoreValue] = useMutation(UPDATE_COREVALUE_MUTATION)

  const coreValue = data?.coreValues[0]

  const defaultValues: CoreValueFormData = useMemo(
    () => ({
      name: coreValue?.name || '',
      linkTo: 'personLink',
      description: coreValue?.description || '',
      why: coreValue?.why || undefined,
      alignmentChallenges: coreValue?.alignmentChallenges || undefined,
      alignmentExamples: coreValue?.alignmentExamples || undefined,
    }),
    [coreValue]
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<CoreValueFormData>({
    defaultValues,
    resolver: zodResolver(coreValueSchema),
  })
  useEffect(() => {
    if (coreValue) {
      reset(defaultValues)
    }
  }, [coreValue, defaultValues, reset])

  const onSubmit = async (formData: CoreValueFormData) => {
    try {
      const res = await UpdateCoreValue({
        variables: {
          id: id,
          update: {
            name_SET: formData.name,
            description_SET: formData.description,
            whoSupports_SET: formData.whoSupports,
            alignmentChallenges_SET: formData.alignmentChallenges,
            alignmentExamples_SET: formData.alignmentExamples,
            why_SET: formData.why,
          },
        },
      })

      router.push('/corevalue/' + res.data?.updateCoreValues.coreValues[0].id)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Container>
        <CoreValueForm
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
