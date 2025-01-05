'use client'

import Input from '@/components/react-hook-form/Input'
import { Container, Grid, GridItem } from '@chakra-ui/react'
import React from 'react'
import { useForm } from 'react-hook-form'

function Forms() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm()

  return (
    <Container>
      <form onSubmit={handleSubmit((data) => console.log(data))}>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
          <GridItem>
            <Input
              label="First Name"
              name="firstName"
              control={control}
              errors={errors}
              required
            />
          </GridItem>
          <GridItem>
            <Input
              label="Last Name"
              name="lastName"
              control={control}
              errors={errors}
              required
            />
          </GridItem>
          <GridItem>
            <Input
              label="Phone Number"
              name="phoneNumber"
              control={control}
              errors={errors}
              required
            />
          </GridItem>
        </Grid>
      </form>
    </Container>
  )
}

export default Forms
