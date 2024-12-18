import React from 'react'
import { Button, Container, Heading } from '@chakra-ui/react'
import Link from 'next/link'

function page() {
  const buttons = [
    // {
    //   name: 'Create A Member Guide',
    //   to: '/member-guide/create',
    // },
    {
      name: 'Create A Person',
      to: '/person/create',
    },
    {
      name: 'Create A Goal',
      to: '/goal/create',
    },
    {
      name: 'Input A Core Value',
      to: '/core-value/create',
    },
    {
      name: 'Input A Resource',
      to: '/resource/create',
    },
  ]

  return (
    <Container>
      <Heading size="md" marginBottom={5}>
        Input Data By Clicking Any of These Buttons
      </Heading>

      {buttons.map((button) => (
        <Link key={button.name} href={button.to}>
          <Button
            colorPalette="brand"
            variant="solid"
            width="100%"
            paddingY={6}
            marginBottom={5}
          >
            {button.name}
          </Button>
        </Link>
      ))}
    </Container>
  )
}

export default page
