'use client'
import { GET_CAREPOINT, UPDATE_CAREPOINT_MUTATION } from '@/app/graphql'
import { CarePointFormData, carePointSchema } from '@/app/schema'
import { ApolloWrapper, CarePointForm } from '@/components'
import { FormMode } from '@/constants'
import { useMutation, useQuery } from '@apollo/client'
import { Container } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import React, { use, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

export default function UpdateCarePoint({
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

  const defaultValues: CarePointFormData = useMemo(
    () => ({
      name: carePoint?.name || '',
      description: carePoint?.description || undefined,
      status: carePoint?.status || 'Active',
      why: carePoint?.why || undefined,
      location: carePoint?.location || undefined,
      time: carePoint?.time || undefined,
      levelFulfilled: carePoint?.levelFulfilled || undefined,
      fulfillmentDate: carePoint?.fulfillmentDate || undefined,
      successMeasures: carePoint?.successMeasures || undefined,
      issuesIdentified: carePoint?.issuesIdentified || undefined,
      issuesResolved: carePoint?.issuesResolved || undefined,

      enabledByGoals: carePoint?.enabledByGoals.map((goal) => goal.id) || [],
      caresForGoals: carePoint?.caresForGoals.map((goal) => goal.id) || [],
      resources: carePoint?.resources.map((resource) => resource.id) || [],
    }),
    [carePoint]
  )

  const {
    control,
    handleSubmit,
    reset,
    register,
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

  const onSubmit = async (data: CarePointFormData) => {
    const { enabledByGoals, caresForGoals, resources, ...rest } = data

    try {
      const toConnectEnableGoals = enabledByGoals.filter(
        (coreValue) => !defaultValues.enabledByGoals.includes(coreValue)
      )

      const toDisconnectEnableGoals = defaultValues.enabledByGoals.filter(
        (coreValue) => !enabledByGoals.includes(coreValue)
      )
      const toConnectCaresForGoals = caresForGoals.filter(
        (coreValue) => !defaultValues.caresForGoals.includes(coreValue)
      )
      const toDisconnectCaresForGoals = defaultValues.caresForGoals.filter(
        (coreValue) => !caresForGoals.includes(coreValue)
      )

      const toConnectResources = resources.filter(
        (resource) => !defaultValues.resources.includes(resource)
      )
      const toDisconnectResources = defaultValues.resources.filter(
        (resource) => !resources.includes(resource)
      )

      const res = await UpdateCarePoint({
        variables: {
          id,
          update: {
            name_SET: rest.name,
            description_SET: rest.description,
            status_SET: rest.status,
            why_SET: rest.why,
            location_SET: rest.location,
            time_SET: rest.time,
            levelFulfilled_SET: rest.levelFulfilled,
            fulfillmentDate_SET: rest.fulfillmentDate,
            successMeasures_SET: rest.successMeasures,
            issuesIdentified_SET: rest.issuesIdentified,
            issuesResolved_SET: rest.issuesResolved,

            enabledByGoals: [
              {
                connect: [{ where: { node: { id_IN: toConnectEnableGoals } } }],
                disconnect: [
                  { where: { node: { id_IN: toDisconnectEnableGoals } } },
                ],
              },
            ],
            caresForGoals: [
              {
                connect: [
                  { where: { node: { id_IN: toConnectCaresForGoals } } },
                ],
                disconnect: [
                  { where: { node: { id_IN: toDisconnectCaresForGoals } } },
                ],
              },
            ],
            resources: [
              {
                connect: [{ where: { node: { id_IN: toConnectResources } } }],
                disconnect: [
                  { where: { node: { id_IN: toDisconnectResources } } },
                ],
              },
            ],
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
          register={register}
          errors={errors}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit(onSubmit)}
        />
      </Container>
    </ApolloWrapper>
  )
}
