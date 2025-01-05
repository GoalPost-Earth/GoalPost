'use client'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@apollo/client'
import { Container } from '@chakra-ui/react'
import React, { use, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormMode } from '@/types'
import { GET_RESOURCE, UPDATE_RESOURCE_MUTATION } from '@/app/graphql'
import { ApolloWrapper, ResourceForm } from '@/components'
import { ResourceFormData, resourceSchema } from '@/app/schema'

export default function UpdateResource({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const { data, loading, error } = useQuery(GET_RESOURCE, {
    variables: { id },
  })
  const [UpdateResource] = useMutation(UPDATE_RESOURCE_MUTATION)

  const resource = data?.resources[0]

  const defaultValues: ResourceFormData = useMemo(
    () => ({
      name: resource?.name || '',
      description: resource?.description || '',
      status: resource?.status || '',
      why: resource?.why || '',
      location: resource?.location || '',
      time: resource?.time || '',
    }),
    [resource]
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<ResourceFormData>({
    defaultValues,
    resolver: zodResolver(resourceSchema),
  })
  useEffect(() => {
    if (resource) {
      reset(defaultValues)
    }
  }, [resource, defaultValues, reset])

  const onSubmit = async (formData: ResourceFormData) => {
    try {
      const res = await UpdateResource({
        variables: {
          id: id,
          update: {
            name_SET: formData.name,
            description_SET: formData.description,
            why_SET: formData.why,
            status_SET: formData.status,
            location_SET: formData.location,
            time_SET: formData.time,
          },
        },
      })

      router.push('/resource/' + res.data?.updateResources.resources[0].id)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Container>
        <ResourceForm
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
