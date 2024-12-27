import { Card, Text } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'

const MemberGuideDetailCard = ({
  title,
  detail,
  link,
}: {
  title: string
  detail?: string | null
  link?: boolean
}) => {
  if (!detail) {
    return null
  }
  return (
    <Card.Root width="100%">
      <Card.Header p={2} bgColor="gray.100">
        <Text fontWeight="semibold" color="gray">
          {title}
        </Text>
      </Card.Header>
      <Card.Body p={2}>
        {link ? (
          <Link href={detail}>
            <Text color={link ? 'brand.500' : ''}>{detail}</Text>
          </Link>
        ) : (
          <Text>{detail}</Text>
        )}
      </Card.Body>
    </Card.Root>
  )
}

export default MemberGuideDetailCard
