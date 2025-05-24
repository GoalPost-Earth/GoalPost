'use client'

import {
  CREATE_PEOPLE_MUTATION,
  GENERATE_PERSON_EMBEDDINGS_MUTATION,
} from '@/app/graphql/mutations/PERSON_MUTATIONS'
import { useRouter } from 'next/navigation'
import { useMutation } from '@apollo/client'
import { Container } from '@chakra-ui/react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { PersonForm } from '@/components'
import { FormMode } from '@/constants'
import { PersonFormData, personSchema } from '@/app/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useApp } from '@/app/contexts'

function CreatePerson() {
  const {
    control,
    handleSubmit,
    register,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      status: 'Active',
    },
  })

  const { user } = useApp()
  const router = useRouter()

  const [CreatePeople] = useMutation(CREATE_PEOPLE_MUTATION)
  const [GenerateEmbeddings] = useMutation(GENERATE_PERSON_EMBEDDINGS_MUTATION)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    const { signupDate, community, ...rest } = data
    console.log('🚀 ~ file: page.tsx:41 ~ community:', community)
    try {
      const res = await CreatePeople({
        variables: {
          input: {
            ...rest,
            communities: !community
              ? undefined
              : {
                  connect: [
                    {
                      where: { node: { id_EQ: community } },
                      edge: { signupDate },
                    },
                  ],
                },
            createdBy: {
              connect: [{ where: { node: { authId_EQ: user?.sub } } }],
            },
          },
        },
      })

      const personId = res.data?.createPeople.people[0].id
      if (!personId) {
        return
      }
      GenerateEmbeddings({
        variables: {
          personId,
        },
      })

      router.push('/person/' + personId)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Container>
      <PersonForm
        formMode={FormMode.Create}
        control={control}
        errors={errors}
        register={register}
        setValue={setValue}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit(onSubmit)}
      />
    </Container>
  )
}

export default CreatePerson
