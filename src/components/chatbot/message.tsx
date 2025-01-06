import { parse } from 'marked'
import { Box, Flex, Text } from '@chakra-ui/react'
import { Message } from '@/hooks/useChat'

async function fixMarkdown(message: Message): Promise<string> {
  const parsedContent = await parse(message.content)
  return parsedContent.replace('<a href="', '<a target="_blank" href="')
}

export default async function MessageComponent({
  message,
}: {
  message: Message
}) {
  const align = message.role == 'ai' ? 'flex-start' : 'flex-end'
  const no_rounding =
    message.role == 'ai'
      ? { borderBottomLeftRadius: 0 }
      : { borderBottomRightRadius: 0 }
  const background = message.role == 'ai' ? 'orange.100' : 'gray.100'

  return (
    <Flex w="full" flexDirection="row" justifyContent={align}>
      <Box bg="blue.100"></Box>
      <Flex
        flexDirection="column"
        spaceY={2}
        textStyle="sm"
        mx={2}
        maxW="60%"
        order={2}
        alignItems="flex-start"
      >
        <Box bg={background} p={4} borderRadius="xl" {...no_rounding}>
          {/* Render the parsed and fixed markdown content */}
          <Text
            dangerouslySetInnerHTML={{ __html: await fixMarkdown(message) }}
          />
        </Box>
      </Flex>
    </Flex>
  )
}
