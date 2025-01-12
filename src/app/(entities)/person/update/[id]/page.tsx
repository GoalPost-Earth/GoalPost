'use client'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@apollo/client'
import { Container } from '@chakra-ui/react'
import React, { use, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormMode } from '@/constants'
import { GET_PERSON, UPDATE_PERSON_MUTATION } from '@/app/graphql'
import { ApolloWrapper, PersonForm } from '@/components'
import { PersonFormData, personSchema } from '@/app/schema'

export default function UpdatePerson({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const { data, loading, error } = useQuery(GET_PERSON, {
    variables: { id },
  })
  const [UpdatePerson] = useMutation(UPDATE_PERSON_MUTATION)

  const person = data?.people[0]

  const defaultValues: PersonFormData = useMemo(
    () => ({
      firstName: person?.firstName || '',
      lastName: person?.lastName || '',
      email: person?.email || '',
      photo: person?.photo || '',
      phone: person?.phone || '',
      pronouns: person?.pronouns || '',
      location: person?.location || '',
      community: person?.communities[0]?.id || [],

      status: person?.status || '',
      avatar: person?.avatar || '',
      careManual: person?.careManual || '',
      favorites: person?.favorites || '',
      passions: person?.passions || '',
      traits: person?.traits || '',
      fieldsOfCare: person?.fieldsOfCare || '',
      interests: person?.interests || '',
    }),
    [person]
  )

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    register,
    formState: { isSubmitting, errors },
  } = useForm<PersonFormData>({
    defaultValues,
    resolver: zodResolver(personSchema),
  })

  useEffect(() => {
    if (person) {
      reset(defaultValues)
    }
  }, [person, defaultValues, reset])

  const onSubmit = async (formData: PersonFormData) => {
    try {
      const res = await UpdatePerson({
        variables: {
          where: { id_EQ: id },
          update: {
            firstName_SET: formData.firstName,
            lastName_SET: formData.lastName,
            email_SET: formData.email,
            photo_SET: formData.photo,
            phone_SET: formData.phone,
            pronouns_SET: formData.pronoun,
          },
        },
      })

      router.push('/person/' + res.data?.updatePeople.people[0].id)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Container>
        <PersonForm
          formMode={FormMode.Update}
          control={control}
          errors={errors}
          register={register}
          setValue={setValue}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit(onSubmit)}
        />
      </Container>
    </ApolloWrapper>
  )
}
