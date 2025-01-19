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
      email: person?.email || undefined,
      photo: person?.photo || undefined,
      phone: person?.phone || undefined,
      pronouns: person?.pronouns || undefined,
      location: person?.location || undefined,
      community: person?.communitiesConnection.edges[0]?.node.id || [],

      status: person?.status || 'Active',
      avatar: person?.avatar || undefined,
      careManual: person?.careManual || undefined,
      favorites: person?.favorites || undefined,
      passions: person?.passions || undefined,
      traits: person?.traits || undefined,
      fieldsOfCare: person?.fieldsOfCare || undefined,
      interests: person?.interests || undefined,
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
            location_SET: formData.location,

            status_SET: formData.status,
            avatar_SET: formData.avatar,
            careManual_SET: formData.careManual,
            favorites_SET: formData.favorites,
            passions_SET: formData.passions,
            traits_SET: formData.traits,
            fieldsOfCare_SET: formData.fieldsOfCare,
            interests_SET: formData.interests,
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
