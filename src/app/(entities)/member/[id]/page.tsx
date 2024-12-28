import { query } from '@/app/lib/apollo-client'
import { GET_MEMBER } from '@/app/graphql/queries'
import { Box, Container, Flex, Image, Text, VStack } from '@chakra-ui/react'
import React from 'react'
import ApolloWrapper from '@/components/ApolloWrapper'
import { LoadingScreen } from '@/components/screens'
import { Avatar } from '@/components/ui'
import UserInfo from '@/components/ui/user-info'
import {
  AvatarIcon,
  CalendarIcon,
  FigureIcon,
  IdeaIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
} from '@/icons'
import GenericTabs from '@/components/ui/generic-tabs'
import { RANDOM_IMAGE_URL_400 } from '@/types'
import { getHumanReadableDateTime } from '@/app/utils'

export default async function ViewMemberPage({
  params,
}: {
  readonly params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data, loading, error } = await query({
    query: GET_MEMBER,
    variables: { id },
  })

  const member = data?.members[0]

  if (!member) {
    return <LoadingScreen />
  }

  const bioData = [
    {
      title: 'First Name',
      description: member.firstName,
      icon: <UserIcon />,
    },
    {
      title: 'Last Name',
      description: member.lastName,
      icon: <UserIcon />,
    },
    {
      title: 'Email',
      description: member.email,
      icon: <MailIcon />,
    },
    {
      title: 'Phone Number',
      description: member.phone ?? '',
      icon: <PhoneIcon />,
    },
    {
      title: 'Pronouns',
      description: member.pronouns ?? '',
      icon: <FigureIcon />,
    },
    {
      title: 'Gender',
      description: member.gender ?? '',
      icon: <FigureIcon />,
    },
    {
      title: 'Sign Up Date',
      description: getHumanReadableDateTime(member.createdAt),
      icon: <CalendarIcon />,
    },
    {
      title: 'Interests',
      description: member.interests ?? '',
      icon: <IdeaIcon />,
    },
    {
      title: 'Location',
      description: member.location ?? '',
      icon: <AvatarIcon />,
    },
  ]

  const triggers = ['Bio', 'Contact']

  const content = [<UserInfo data={bioData} key="bio" />]

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
              src={RANDOM_IMAGE_URL_400}
              alt="Member Guide background"
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
                name={member?.name}
                src={member.photo ?? undefined}
                width={'58px'}
                height={'58px'}
                border={'3px solid white'}
              />
              <Text color={'white'} fontWeight={'semibold'}>
                {member?.name}
              </Text>
            </Flex>
          </Box>
          <GenericTabs triggers={triggers} content={content} />
        </VStack>
      </Container>
    </ApolloWrapper>
  )
}
