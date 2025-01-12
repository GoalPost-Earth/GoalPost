'use client'

import { Container, Text, VStack } from '@chakra-ui/react'
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
} from './dialog'
import { Button } from './button'
import { useEffect, useRef, useState } from 'react'
import { AutoLink } from './autolink'

export function EntityDetail({
  title,
  entityName,
  details,
}: {
  title: string
  entityName?: string
  details?: string | null
}) {
  const textRef = useRef<HTMLParagraphElement>(null)
  const [isClamped, setIsClamped] = useState(false)

  useEffect(() => {
    // Add a small delay to ensure DOM is ready
    const checkClamping = () => {
      const textElement = textRef.current
      if (textElement) {
        const lineHeight = parseFloat(getComputedStyle(textElement).lineHeight)
        const maxHeight = lineHeight * 2
        setIsClamped(textElement.scrollHeight > maxHeight)
      }
    }

    // Run initial check
    checkClamping()

    // Add resize listener to handle window size changes
    window.addEventListener('resize', checkClamping)

    // Cleanup
    return () => window.removeEventListener('resize', checkClamping)
  }, [details]) // Only depend on details

  if (!details) {
    return <></>
  }

  return (
    <Container width="100%">
      <Text fontSize="sm" fontWeight="light">
        {title}
      </Text>
      <Text as="span" ref={textRef} lineClamp={2}>
        <AutoLink text={details} />
      </Text>
      {isClamped && (
        <DialogRoot placement="center" motionPreset="slide-in-bottom">
          <DialogTrigger asChild>
            <Button p={0} size="xs" as="span" fontSize="xs" variant="plain">
              Read More
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{entityName}</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <AutoLink text={details} />
            </DialogBody>
            <DialogCloseTrigger />
          </DialogContent>
        </DialogRoot>
      )}
    </Container>
  )
}
