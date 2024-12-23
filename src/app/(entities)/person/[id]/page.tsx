import { query } from '@/app/lib/apollo-client'
import { GET_PERSON } from '@/app/graphql/queries'
import { Box, Container, Flex, Image, Text, VStack } from '@chakra-ui/react'
import React from 'react'
import ApolloWrapper from '@/components/ApolloWrapper'
import { LoadingScreen } from '@/components/screens'
import { Avatar } from '@/components/ui'
import UserInfo from './components/user-info'
import {
  AlbumIcon,
  CalendarIcon,
  FigureIcon,
  IdeaIcon,
  LocationIcon,
  MailIcon,
  ManualIcon,
  PhoneIcon,
  UserIcon,
} from '@/components/icons'
import AvatarIcon from '@/components/icons/AvatarIcon'
import GenericTabs from '@/components/ui/generic-tabs'

export default async function ViewPersonPage({
  params,
}: {
  readonly params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data, loading, error } = await query({
    query: GET_PERSON,
    variables: { id },
  })

  const person = data?.people[0]

  if (!person) {
    return <LoadingScreen />
  }

  const bioData = [
    {
      title: 'First Name',
      description: person.firstName,
      icon: <UserIcon />,
    },
    {
      title: 'Last Name',
      description: person.lastName,
      icon: <UserIcon />,
    },
    {
      title: 'Pronouns',
      description: person.pronouns ?? '',
      icon: <FigureIcon />,
    },
    {
      title: 'Gender',
      description: person.gender ?? '',
      icon: <FigureIcon />,
    },
    {
      title: 'Avatar',
      description: 'Owl',
      icon: <AvatarIcon />,
    },
    {
      title: 'Photo',
      description: ' ',
      icon: <AlbumIcon />,
    },
    {
      title: 'Sign Up Date',
      description: '19/12/24',
      icon: <CalendarIcon />,
    },
    {
      title: 'Manual',
      description: person.manual ?? '',
      icon: <ManualIcon />,
    },
    {
      title: 'Interests',
      description: person.interests ?? '',
      icon: <IdeaIcon />,
    },
  ]

  const contactsData = [
    {
      title: 'Sign Up Date',
      description: '19/12/24',
      icon: <CalendarIcon />,
    },
    {
      title: 'Email',
      description: person.email,
      icon: <MailIcon />,
    },
    {
      title: 'Phone Number',
      description: person.phone ?? '',
      icon: <PhoneIcon />,
    },
    {
      title: 'Location',
      description: 'Ghana',
      icon: <LocationIcon />,
    },
  ]

  const triggers = ['Bio', 'Edit Profile', 'Contacts']

  const contents = [
    <UserInfo data={bioData} key="bio" />,
    <UserInfo key={'edit-profile'} />,
    <UserInfo data={contactsData} key="contacts" />,
  ]

  return (
    <ApolloWrapper data={data} loading={loading} error={error}>
      <Container px={8} position="relative">
        <VStack>
          <Box
            position="relative"
            marginX={-8}
            overflow={'hidden'}
            height={'160px'}
          >
            <Image
              src="https://images.unsplash.com/photo-1566679056462-2075774c8c07?q=80&w=2075&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Profile background"
              objectFit="cover"
              transform={'translateY(-15%)'}
            />
            <Box
              position="absolute"
              inset={0}
              background={`radial-gradient(circle at left center, rgba(0, 0, 0, 0.6) 20%, rgba(0, 0, 0, 0) 100%)`}
            ></Box>
            <Flex
              gap={3}
              alignItems="center"
              position={'absolute'}
              left={8}
              bottom={8}
            >
              <Avatar
                name={person?.name}
                src={undefined}
                width={'58px'}
                height={'58px'}
                border={'3px solid white'}
              />
              <Text color={'white'} fontWeight={'semibold'}>
                {person?.name}
              </Text>
            </Flex>
          </Box>
          <GenericTabs triggers={triggers} contents={contents} />
        </VStack>
      </Container>
    </ApolloWrapper>
  )
}
