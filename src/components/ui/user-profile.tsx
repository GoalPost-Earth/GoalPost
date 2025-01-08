import { HStack, Stack, Text, VStack } from '@chakra-ui/react'
import { Avatar } from './avatar'
import { GenericTabs } from './generic-tabs'
import { EditButton } from './edit-button'
import { DeleteButton } from './delete-button'
import { Person } from '@/gql/graphql'

interface UserProfileProps {
  user: Person
  tabTriggers: string[]
  tabContent: React.ReactNode[]
  tabProps?: Record<string, any>
}

export function UserProfile({
  user,
  tabTriggers,
  tabContent,
}: UserProfileProps) {
  return (
    <VStack
      border={{ base: 'none', lg: '2px solid #E19E48' }}
      borderRadius={{ base: 0, lg: '2xl' }}
      position={{ lg: 'absolute' }}
      top={{ lg: '40px' }}
      left={{ lg: '70px' }}
      zIndex={1}
      maxWidth={'380px'}
      width={'100%'}
      mb={{ lg: '40px' }}
      paddingY={{ md: '45px' }}
      px={{ lg: 8 }}
      background={{ base: 'inherit', lg: 'gray.contrast' }}
    >
      <Stack align={'center'} justify={'center'}>
        <Avatar
          name={user?.name}
          src={user.photo ?? undefined}
          width={'200px'}
          height={'200px'}
          border={'3px solid white'}
        />
        <Text>Hi, I'm</Text>
        <Text fontSize={'xl'} fontWeight={'bold'} py={0}>
          {user?.name}
        </Text>
        {user?.email && <Text>{user?.email}</Text>}
      </Stack>
      <GenericTabs
        editLink={`/person/update/${user.id}`}
        onDeleteEntity="Person"
        triggers={tabTriggers}
        content={tabContent}
        props={{
          display: { base: 'flex', lg: 'none' },
        }}
      />
    </VStack>
  )
}
