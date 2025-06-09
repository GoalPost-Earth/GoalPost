'use client'

import { CREATE_COMMUNITY_MUTATION } from '@/app/graphql/mutations/COMMUNITY_MUTATIONS'
import { useRouter } from 'next/navigation'
import { useMutation } from '@apollo/client'
import { Container } from '@chakra-ui/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { CommunityForm } from '@/components'
import { CommunityFormData, communitySchema } from '@/app/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormMode } from '@/constants'
import { useApp } from '@/app/contexts'

function CreateCommunity() {
  const {
    control,
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = useForm<CommunityFormData>({
    resolver: zodResolver(communitySchema),
  })
  const router = useRouter()
  const { user } = useApp()
  const [CreateCommunities] = useMutation(CREATE_COMMUNITY_MUTATION)

  const onSubmit = async (data: CommunityFormData) => {
    try {
      const res = await CreateCommunities({
        variables: {
          input: {
            ...data,
            createdBy: {
              connect: [
                {
                  where: { node: { id_EQ: user?.id } },
                },
              ],
            },
          },
        },
      })

      router.push('/community/' + res.data?.createCommunities.communities[0].id)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Container>
      <CommunityForm
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

export default CreateCommunity
