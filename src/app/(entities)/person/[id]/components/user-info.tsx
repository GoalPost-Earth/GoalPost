import { Box, Container, Flex, Tabs, Text } from '@chakra-ui/react'
import React from 'react'

const UserInfo = ({
  data,
}: {
  data?: {
    title: string
    description?: string | number | null
    icon: JSX.Element
  }[]
}) => {
  return (
    <Container bg="gray.subtle" padding={0} borderRadius={'md'}>
      {data && data?.length > 8 ? (
        <Tabs.Root
          defaultValue="first"
          minHeight={'430px !important'}
          position={'relative'}
          variant={'subtle'}
        >
          <Tabs.Content
            value="first"
            key={'first'}
            paddingY={1}
            colorPalette={'brand'}
          >
            {data.slice(0, 8).map((info) => (
              <Flex
                key={info.title}
                gap={6}
                alignItems="center"
                paddingY={2}
                paddingX={4}
                fontSize="sm"
                _last={{
                  paddingBottom: 0,
                }}
              >
                <Flex
                  p={
                    info.title === 'Community' ||
                    info.title === 'Gender' ||
                    info.title === 'Pronouns'
                      ? 0
                      : 2
                  }
                  borderRadius="full"
                  bg="#9EBEC9"
                  width="35px"
                  height="35px"
                  alignItems={'center'}
                  justifyContent={'center'}
                >
                  {info.icon}
                </Flex>
                <Box>
                  <span style={{ fontWeight: 'bold' }}>{info.title}</span>:{' '}
                  {info.description}
                </Box>
              </Flex>
            ))}
          </Tabs.Content>
          <Tabs.Content value="second" key={'second'} paddingY={1}>
            {data.slice(8).map((info) => (
              <Flex
                key={info.title}
                gap={6}
                alignItems="center"
                paddingY={2}
                paddingX={4}
                fontSize="sm"
                _last={{
                  alignItems: 'flex-start',
                  paddingBottom: 0,
                }}
              >
                <Flex
                  p={
                    info.title === 'Community' ||
                    info.title === 'Gender' ||
                    info.title === 'Pronouns'
                      ? 0
                      : 2
                  }
                  borderRadius="full"
                  bg="#9EBEC9"
                  width="35px"
                  height="35px"
                  alignItems={'center'}
                  justifyContent={'center'}
                >
                  {info.icon}
                </Flex>
                <Box>
                  <span style={{ fontWeight: 'bold' }}>{info.title}</span>:{' '}
                  {info.description}
                </Box>
              </Flex>
            ))}
          </Tabs.Content>
          <Tabs.List
            justifyContent={'center'}
            minHeight={'0px'}
            border={'none'}
            borderRadius={'4px'}
            position={'absolute'}
            bottom={1}
            transform={'translate(-50%, -50%)'}
            left="50%"
            bg={'gray.solid'}
          >
            <Tabs.Trigger
              value="first"
              key={'first'}
              minWidth={'10px'}
              width={'16px'}
              height={'5px'}
              padding={0}
              // paddingY={1}
            ></Tabs.Trigger>
            <Box
              minWidth={'4px'}
              width={'4px'}
              height={'10px'}
              bg={'gray.subtle'}
              zIndex={2}
              position={'absolute'}
              left={'50%'}
              transform={'translateX(-50%)'}
              bottom={'-1px'}
            ></Box>
            <Tabs.Trigger
              value="second"
              key={'second'}
              minWidth={'10px'}
              width={'16px'}
              height={'5px'}
              padding={0}
              // paddingY={1}
            ></Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      ) : (
        data?.map((info) => (
          <Flex
            key={info.title}
            gap={6}
            alignItems="center"
            paddingY={2}
            paddingX={4}
            fontSize="sm"
            _first={{
              paddingTop: 3,
            }}
          >
            <Flex
              p={
                info.title === 'Community' ||
                info.title === 'Gender' ||
                info.title === 'Pronouns'
                  ? 0
                  : 2
              }
              borderRadius="full"
              bg="#9EBEC9"
              width="35px"
              height="35px"
              alignItems={'center'}
              justifyContent={'center'}
            >
              {info.icon}
            </Flex>
            <Box>
              <Text as="span" fontWeight="bold">
                {info.title}
              </Text>
              : {info.description}
            </Box>
          </Flex>
        ))
      )}
    </Container>
  )
}

export default UserInfo
