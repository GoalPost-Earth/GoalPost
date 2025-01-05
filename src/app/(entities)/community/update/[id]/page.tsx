'use client'
import { UPDATE_COMMUNITY_MUTATION } from '@/app/graphql/mutations/COMMUNITY_MUTATIONS'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@apollo/client'
import { Container } from '@chakra-ui/react'
import React, { use, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormMode } from '@/types'
import { GET_COMMUNITY } from '@/app/graphql'
import { ApolloWrapper, CommunityForm } from '@/components'
import { CommunityFormData, communitySchema } from '@/app/schema'

export default function UpdateCommunity({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const { data, loading, error } = useQuery(GET_COMMUNITY, {
    variables: { id },
  })
  const [UpdateCommunities] = useMutation(UPDATE_COMMUNITY_MUTATION)

  const community = data?.communities[0]

  const defaultValues: CommunityFormData = useMemo(
    () => ({
      name: community?.name || '',
      description: community?.description || '',
      status: community?.status || '',
      why: community?.why || '',
      location: community?.location || '',
      time: community?.time || '',
    }),
    [community]
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<CommunityFormData>({
    defaultValues,
    resolver: zodResolver(communitySchema),
  })
  useEffect(() => {
    if (community) {
      reset(defaultValues)
    }
  }, [community, defaultValues, reset])

  const onSubmit = async (formData: CommunityFormData) => {
    try {
      const res = await UpdateCommunities({
        variables: {
          id: id,
          update: {
            name_SET: formData.name,
            description_SET: formData.description,
            status_SET: formData.status,
            why_SET: formData.why,
            location_SET: formData.location,
            time_SET: formData.time,
          },
        },
      })

      router.push('/community/' + res.data?.updateCommunities.communities[0].id)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Container>
        <CommunityForm
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
