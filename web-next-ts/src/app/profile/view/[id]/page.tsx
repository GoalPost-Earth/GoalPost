'use client'

import React, { useState, useEffect } from 'react'
import { Container, Text, Box } from '@chakra-ui/react'
import { Avatar } from '@/components/ui'
import { GET_MEMBER } from '@/app/queries/PROFILE_QUERIES'
import { useQuery } from '@apollo/client'
import { useRouter } from 'next/navigation'

const Dashboard = () => {
  const path = window.location.pathname
  const id = path.split('/').pop()
  console.log('🚀 ~ file: page.tsx:13 ~ id:', id)

  const { data } = useQuery(GET_MEMBER, {
    variables: {
      id: id,
    },
  })

  const member = data?.members[0]

  if (!member) {
    return <div>Loading...</div>
  }

  return (
    <Container centerContent>
      <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" size="2xl" />
      <Text marginTop={5}>
        {member.firstName} {member.lastName}
      </Text>
      <Box marginTop={5}>
        <Text>Email: {member.email}</Text>
        <Text>Address: {member.address}</Text>
        <Text>City: {member.city}</Text>
        <Text>Country: {member.country}</Text>
        <Text>County: {member.county}</Text>
        <Text>Gender: {member.gender}</Text>
        <Text>Phone: {member.phone}</Text>
        <Text>State: {member.state}</Text>
        <Text>Zip/Postal Code: {member.zipPostal}</Text>
      </Box>
    </Container>
  )
}

export default Dashboard
