import { query } from '@/app/lib/apollo-client'
import { GET_PERSON } from '@/app/graphql/queries'
import { Box, Container, Flex, Image, Text, VStack } from '@chakra-ui/react'
import React from 'react'
import ApolloWrapper from '@/components/ApolloWrapper'
import { LoadingScreen } from '@/components/screens'
import { Avatar } from '@/components/ui'
import UserInfo from './components/user-info'
import {
  ActivityIcon,
  AlbumIcon,
  CalendarIcon,
  ChatBotIcon,
  CommunityIcon,
  FavouriteIcon,
  FigureIcon,
  IdeaIcon,
  IdIcon,
  LocationIcon,
  MailIcon,
  ManualIcon,
  PhoneIcon,
  ToggleIcon,
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
  console.log('🚀 ~ file: page.tsx:22 ~ person:', person)

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
      title: 'Status',
      description: 'Active',
      icon: <ToggleIcon />,
    },
    {
      title: 'Community',
      description: 2,
      icon: <CommunityIcon />,
    },
    {
      title: 'Id',
      description: person.id,
      icon: <IdIcon />,
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
      description: ' ',
      icon: <ManualIcon />,
    },
    {
      title: 'Favourites',
      description: 'Music, Hobby: Gaming',
      icon: <FavouriteIcon />,
    },
    {
      title: 'Passions',
      description: 'Musical Instruments',
      icon: <IdeaIcon />,
    },
    {
      title: 'Traits',
      description: 'INTJ',
      icon: <ManualIcon />,
    },
    {
      title: 'Fields of Care',
      description:
        'IT Strategy, Planning, Architecture Organizational Strategy, Out-of-the-box thinking',
      icon: <ActivityIcon />,
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
      description: '+ 233 553017367',
      icon: <PhoneIcon />,
    },
    {
      title: 'Location',
      description: 'Ghana',
      icon: <LocationIcon />,
    },
  ]

  const triggers = ['Bio', 'Edit Profile', 'Contacts', 'Insights']

  const contents = [
    <UserInfo data={bioData} key="bio" />,
    <UserInfo key={'edit-profile'} />,
    <UserInfo data={contactsData} key="contacts" />,
    <UserInfo key={'insights'} />,
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
            <Box
              position="absolute"
              inset={0}
              background={`radial-gradient(circle at bottom left, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%)`}
            ></Box>
            <Image
              src="/assets/images/profile-bg.jpeg"
              alt="Profile background"
              objectFit="cover"
              transform={'translateY(-15%)'}
            />
            <Flex
              gap={3}
              alignItems="center"
              position={'absolute'}
              left={8}
              bottom={8}
            >
              <Avatar
                name={person?.name}
                src="/assets/images/avatar.png"
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
        <Flex
          width="60px"
          height="60px"
          position="fixed"
          bottom={5}
          bg={'#E19E48'}
          borderRadius={'full'}
          justifyContent={'center'}
          alignItems={'center'}
          transform={'translate(-50%, -50%)'}
          left="50%"
        >
          <ChatBotIcon color="white" />
        </Flex>
      </Container>
    </ApolloWrapper>
  )
}
