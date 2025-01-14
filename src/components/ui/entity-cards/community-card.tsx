import { Card, CardHeaderProps, Heading, Text } from '@chakra-ui/react'
import Link from 'next/link'
import { Community } from '@/gql/graphql'
import { GroupAvatars } from '../group-avatars'
import { AutoLink } from '../autolink'

export function CommunityCard({
  community,
  ...rest
}: {
  community: Pick<Community, 'id' | 'name' | 'description' | 'members'>
} & CardHeaderProps) {
  const { id, name, description, members } = community
  const displayedMembers = members?.slice(0, 3) ?? []

  return (
    <Link href={`/community/${id}`} style={{ width: '100%', height: '100%' }}>
      <Card.Root
        width="100%"
        p={3}
        boxShadow="lg"
        borderRadius="md"
        bgColor="community.subtle"
        variant="subtle"
        height="100%"
        {...rest}
      >
        <Card.Header p={2}>
          <Heading size="md">{name}</Heading>
        </Card.Header>
        <Card.Body p={2}>
          <Text fontWeight={300} lineClamp={{ base: 2, lg: 3 }}>
            <AutoLink text={description as string} />
          </Text>
        </Card.Body>
        <Card.Footer
          justifyContent="flex-start"
          position="relative"
          mt="auto"
          p={2}
        >
          {
            <GroupAvatars
              people={displayedMembers}
              fallback={members?.length - displayedMembers.length}
            />
          }
        </Card.Footer>
      </Card.Root>
    </Link>
  )
}
