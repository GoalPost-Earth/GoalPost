import { Person } from '@/gql/graphql'
import { Avatar, AvatarGroup } from './avatar'

export const GroupAvatars = ({
  people,
  fallback,
}: {
  people: Person[]
  fallback: number
}) => {
  if (people.length === 0) return null
  return (
    <AvatarGroup size="sm">
      {people.map((person) => (
        <Avatar src={person.photo ?? undefined} name={person.name} />
      ))}
      {fallback > 0 && <Avatar variant="solid" fallback={fallback} />}
    </AvatarGroup>
  )
}
