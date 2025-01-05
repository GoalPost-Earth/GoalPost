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
import { FormMode } from '@/types'

function CreatePerson() {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm()
  const router = useRouter()

  const [CreatePeople] = useMutation(CREATE_PEOPLE_MUTATION)
  const [GenerateEmbeddings] = useMutation(GENERATE_PERSON_EMBEDDINGS_MUTATION)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      const res = await CreatePeople({
        variables: {
          input: {
            ...data,
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
        setValue={setValue}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit(onSubmit)}
      />
    </Container>
  )
}

export default CreatePerson
