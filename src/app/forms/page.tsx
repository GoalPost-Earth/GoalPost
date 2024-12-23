import React from 'react'
import { Box, Button, Container, Heading } from '@chakra-ui/react'
import Link from 'next/link'

const createButtons = [
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

const viewAllButtons = [
  // {
  //   name: 'View All Member Guides',
  //   to: '/member-guide',
  // },
  {
    name: 'View All People',
    to: '/person',
  },
  {
    name: 'View All Goals',
    to: '/goal',
  },
  {
    name: 'View All Core Values',
    to: '/corevalue',
  },
  {
    name: 'View All Resources',
    to: '/resource',
  },
]

function ShowForms() {
  return (
    <Container>
      <Heading size="md" marginBottom={5}>
        Input Data By Clicking Any of These Buttons
      </Heading>

      {createButtons.map((button) => (
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
      <Box my={5}>
        <hr />
      </Box>
      {viewAllButtons.map((button) => (
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

export default ShowForms
