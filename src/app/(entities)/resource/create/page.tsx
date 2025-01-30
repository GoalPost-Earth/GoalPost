'use client'

import { CREATE_RESOURCE_MUTATION } from '@/app/graphql/mutations/RESOURCE_MUTATIONS'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation } from '@apollo/client'
import { Container } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FormMode } from '@/constants'
import { ResourceForm } from '@/components'
import { useApp } from '@/app/contexts'
import { ResourceFormData, resourceSchema } from '@/app/schema'
import { zodResolver } from '@hookform/resolvers/zod'

function CreateResource() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const personId = searchParams?.get('personId')
  const communityId = searchParams?.get('communityId')
  const [CreateResources] = useMutation(CREATE_RESOURCE_MUTATION)
  const { user } = useApp()

  console.log('personId', personId)

  const defaultValues = React.useMemo(
    () =>
      ({
        status: 'Active',
        linkTo: personId ? 'personLink' : 'communityLink',
        personLink: personId,
        communityLink: communityId,
      }) as ResourceFormData,
    [personId, communityId]
  )

  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues,
  })
  useEffect(() => {
    const timeout = setTimeout(() => {
      reset(defaultValues)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [defaultValues, reset])

  const onSubmit = async (data: ResourceFormData) => {
    const { personLink, linkTo, communityLink, ...rest } = data
    try {
      const res = await CreateResources({
        variables: {
          input: {
            ...rest,
            createdBy: {
              connect: [{ where: { node: { authId_EQ: user?.sub } } }],
            },
            providedByPerson:
              linkTo === 'personLink'
                ? {
                    connect: [{ where: { node: { id_EQ: personLink } } }],
                  }
                : undefined,
            providedByCommunity:
              linkTo === 'communityLink'
                ? {
                    connect: [{ where: { node: { id_EQ: communityLink } } }],
                  }
                : undefined,
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
        setValue={setValue}
        watch={watch}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit(onSubmit)}
      />
    </Container>
  )
}

export default CreateResource
