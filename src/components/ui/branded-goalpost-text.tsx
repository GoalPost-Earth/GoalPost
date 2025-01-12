import { Text } from '@chakra-ui/react'

export function BrandedGoalPostText({ ...rest }) {
  return (
    <Text
      {...rest}
      style={{
        WebkitBackgroundClip: 'text',
        backgroundImage:
          'linear-gradient(to right, #CD723A 1%, #E29D5E 48%, #CD723A)',
      }}
      bgClip="text"
      fontWeight="extrabold"
    >
      GoalPost
    </Text>
  )
}
