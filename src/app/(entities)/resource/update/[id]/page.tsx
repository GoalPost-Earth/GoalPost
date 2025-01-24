'use client'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@apollo/client'
import { Container } from '@chakra-ui/react'
import React, { use, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormMode } from '@/constants'
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
      description: resource?.description || undefined,
      status: resource?.status || 'Active',
      why: resource?.why || undefined,
      location: resource?.location || undefined,
      time: resource?.time || undefined,
      linkTo: !!resource?.providedByPerson.length
        ? 'personLink'
        : 'communityLink',
      personLink: resource?.providedByPerson.length
        ? resource.providedByPerson[0].id
        : undefined,
      communityLink: resource?.providedByCommunity.length
        ? resource.providedByCommunity[0].id
        : undefined,
    }),
    [resource]
  )

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    register,
    formState: { isSubmitting, errors },
  } = useForm<ResourceFormData>({
    defaultValues,
    resolver: zodResolver(resourceSchema),
  })
  useEffect(() => {
    if (resource) {
      reset(defaultValues)
    }
  }, [resource, defaultValues, reset, resource?.providedByPerson.length])

  const onSubmit = async (formData: ResourceFormData) => {
    const toConnectPeople = []
    const toConnectCommunity = []

    if (
      formData.linkTo === 'personLink' &&
      formData.personLink &&
      formData.personLink !== resource?.providedByPerson[0].id
    ) {
      toConnectPeople.push({
        connect: [{ where: { node: { id_EQ: formData.personLink } } }],
      })
      toConnectPeople.push({
        disconnect: [
          { where: { node: { id_EQ: resource?.providedByPerson[0].id } } },
        ],
      })
    }

    if (
      formData.linkTo === 'communityLink' &&
      formData.communityLink &&
      formData.communityLink !== resource?.providedByCommunity[0].id
    ) {
      toConnectCommunity.push({
        connect: [{ where: { node: { id_EQ: formData.communityLink } } }],
      })
      toConnectCommunity.push({
        disconnect: [
          { where: { node: { id_EQ: resource?.providedByCommunity[0].id } } },
        ],
      })
    }

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

            providedByPerson: toConnectPeople,
            providedByCommunity: toConnectCommunity,
          },
        },
      })

      router.push('/resource/' + res.data?.updateResources.resources[0].id)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <ApolloWrapper data={data} loading={loading || !resource} error={error}>
      <Container>
        <ResourceForm
          formMode={FormMode.Update}
          control={control}
          errors={errors}
          resetDefaults={reset}
          setValue={setValue}
          register={register}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit(onSubmit)}
        />
      </Container>
    </ApolloWrapper>
  )
}
