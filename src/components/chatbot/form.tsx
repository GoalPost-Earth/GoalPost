import {
  FormEvent,
  KeyboardEventHandler,
  RefObject,
  useRef,
  useState,
} from 'react'
import { Box, Button, Flex, Textarea } from '@chakra-ui/react'
import { Message } from '@/hooks/useChat'

export default function Form({
  onSubmit,
  messages,
  thinking,
  container,
}: {
  onSubmit: (message: string) => void
  messages: Message[]
  thinking: boolean
  container: RefObject<HTMLDivElement>
}) {
  const input = useRef<HTMLTextAreaElement>(null)
  const [message, setMessage] = useState<string>('')

  const handleSubmit = (event?: FormEvent<HTMLDivElement> | SubmitEvent) => {
    event?.preventDefault()

    if (message.trim().length > 0) {
      onSubmit(message)
      setTimeout(() => setMessage(''), 100)

      container.current?.scrollBy(0, 100)
    }
  }

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (thinking) {
      return
    }
    if (e.key === 'ArrowUp') {
      const lastHuman = messages.reverse().find((m) => m.role === 'human')

      if (lastHuman) {
        setMessage(lastHuman.content as string)
      }
      setTimeout(() => {
        if (input.current) {
          input.current.selectionStart = input.current.value.length
          input.current.selectionEnd = input.current.value.length
        }
      }, 20)
    } else if (!e.shiftKey && e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <Box
      as="form"
      borderTop="1px"
      borderColor={'gray.200'}
      p={4}
      bg={'gray.100'}
      onSubmit={(e) => handleSubmit(e)}
    >
      <Flex
        bg={'white'}
        border="1px"
        borderColor={'gray.600'}
        borderRadius="md"
        w="full"
      >
        <Textarea
          ref={input}
          value={message}
          rows={1}
          p={4}
          borderColor="blue.600"
          borderRadius="md"
          w="full"
          outline="none"
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          px={4}
          py={4}
          borderColor="primary.800"
          color="blue.700"
          fontWeight="bold"
          borderRadius="md"
          h="full"
          bg="white"
          onClick={() => handleSubmit()}
        >
          Send
        </Button>
      </Flex>
    </Box>
  )
}
