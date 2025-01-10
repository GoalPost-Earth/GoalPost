'use client'
import { Container } from '@chakra-ui/react'
import React from 'react'

export default function UpdateCommunity({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // const { id } = use(params)

  console.log(params)

  return (
    <Container>
      {/* <CarePointForm
          formMode={FormMode.Update}
          control={control}
          errors={errors}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit(onSubmit)}
        /> */}
    </Container>
  )
}
