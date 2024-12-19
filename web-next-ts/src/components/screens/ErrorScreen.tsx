import {
  Card,
  CardFooter,
  CardHeader,
  Center,
  Container,
  Heading,
  Text,
} from '@chakra-ui/react'
import React from 'react'
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { ApolloError } from '@apollo/client'
import { Button } from '../ui/button'

interface ErrorScreenProps {
  error: ApolloError | Error | undefined
}

const ErrorScreen = ({ error }: ErrorScreenProps) => {
  let errorMessage: string
  let stackLines: string[] = []

  const formatStackTrace = (stack: string) => {
    return stack.split('\n').map((line) => line.trim())
  }

  if (Array.isArray(error)) {
    errorMessage = error.map((err) => err.message).join(', ')
    stackLines = error.flatMap((err) => formatStackTrace(err.stack || ''))
  } else {
    errorMessage = error?.message ?? 'An error occurred while loading data'
    stackLines = formatStackTrace(error?.stack ?? '')
  }

  return (
    <Center height="100vh">
      <Container textAlign="center">
        <Text marginBottom={6}>There seems to be an error loading data</Text>
        <Card.Root>
          <CardHeader paddingY={4}>
            <Heading size="md">{error?.name ?? 'Unknown Error'}</Heading>
          </CardHeader>
          <Card.Body padding={2}>
            {errorMessage && (
              <Text color="red" maxLines={3}>
                {errorMessage}
              </Text>
            )}
          </Card.Body>

          <CardFooter>
            <Container>
              <Text fontSize="small" fontWeight="bold" paddingBottom={5}>
                Click the{' '}
                <Text as="span" color="red">
                  Show Details
                </Text>{' '}
                Button and send a screenshot to provide more details to the
                support team
              </Text>
              <DialogRoot
                placement="center"
                motionPreset="slide-in-bottom"
                scrollBehavior="inside"
              >
                <DialogTrigger asChild>
                  <Button colorPalette="red" variant="subtle">
                    Show Details
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{error?.name}</DialogTitle>
                  </DialogHeader>
                  <DialogBody>
                    <Text fontSize="small" color="blue">
                      {stackLines}
                    </Text>
                  </DialogBody>
                  <DialogFooter>
                    <DialogActionTrigger asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogActionTrigger>
                    <Button>Done</Button>
                  </DialogFooter>
                  <DialogCloseTrigger />
                </DialogContent>
              </DialogRoot>
            </Container>
          </CardFooter>
        </Card.Root>

        <Button
          size="lg"
          marginTop={10}
          colorPalette="blue"
          variant="subtle"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </Button>
      </Container>
    </Center>
  )
}

export default ErrorScreen
