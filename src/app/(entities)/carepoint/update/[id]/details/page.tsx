'use client'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@apollo/client'
import { Container } from '@chakra-ui/react'
import React, { use, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { GET_CAREPOINT, UPDATE_CAREPOINT_MUTATION } from '@/app/graphql'
import { ApolloWrapper } from '@/components'
import { CarePointFormData, carePointSchema } from '@/app/schema'
import { FormMode } from '@/constants'

export default function UpdateCommunity({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const { data, loading, error } = useQuery(GET_CAREPOINT, {
    variables: { id },
  })
  const [UpdateCarePoint] = useMutation(UPDATE_CAREPOINT_MUTATION)

  const carePoint = data?.carePoints[0]
  console.log('🚀 ~ file: page.tsx:27 ~ carePoint:', carePoint)

  const defaultValues: CarePointFormData = useMemo(
    () => ({
      name: carePoint?.name || '',
      description: carePoint?.description || '',
      whoSupports: carePoint?.whoSupports || '',
      why: carePoint?.why || '',
      alignmentChallenges: carePoint?.alignmentChallenges || '',
      alignmentExamples: carePoint?.alignmentExamples || '',
    }),
    [carePoint]
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<CarePointFormData>({
    defaultValues,
    resolver: zodResolver(carePointSchema),
  })
  useEffect(() => {
    if (carePoint) {
      reset(defaultValues)
    }
  }, [carePoint, defaultValues, reset])

  const onSubmit = async (formData: CarePointFormData) => {
    try {
      const res = await UpdateCarePoint({
        variables: {
          id: id,
          update: {
            description_SET: formData.description,
            whoSupports_SET: formData.whoSupports,
            alignmentChallenges_SET: formData.alignmentChallenges,
            alignmentExamples_SET: formData.alignmentExamples,
            why_SET: formData.why,
          },
        },
      })

      router.push('/carepoint/' + res.data?.updateCarePoints.carePoints[0].id)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Container>
        <CarePointForm
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
