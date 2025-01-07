'use client'
import { Text } from '@chakra-ui/react'
import { EditIcon } from '../icons'
import { Button } from './button'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export function EditButton() {
  const pathname = usePathname()

  const splitPathname = pathname?.split('/')
  const entityName = splitPathname && splitPathname[1]
  const entityId = splitPathname && splitPathname[2]

  return (
    <Link href={`/${entityName}/update/${entityId}`}>
      <Button
        paddingX={2}
        paddingY={0}
        height="fit-content"
        gap={2}
        alignItems="center"
        bg="brand.50"
        color="#6F7175"
        cursor="pointer"
      >
        <EditIcon m={1} />
        <Text fontSize={'sm'} display={{ lg: 'none', xl: 'block' }}>
          Edit
        </Text>
      </Button>
    </Link>
  )
}
