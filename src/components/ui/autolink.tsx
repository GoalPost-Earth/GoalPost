'use client'

import { Link, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import React, { RefObject } from 'react'

export const AutoLink = ({ text }: { text: string }) => {
  const router = useRouter()
  const delimiter =
    /((?:https?:\/\/)?(?:(?:[a-z0-9]?(?:[a-z0-9\-]{1,61}[a-z0-9])?\.[^\.|\s])+[a-z\.]*[a-z]+|(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3})(?::\d{1,5})?[a-z0-9.,_\/~#&=;%+?\-\\(\)@$!*'[\]{}]*)/gi

  return (
    <>
      {text?.split(delimiter).map((word, index) => {
        const match = word.match(delimiter)
        if (match) {
          const url = match[0]
          return (
            <Text
              key={`url-${index}`}
              as="span"
              textDecoration="underline"
              fontWeight="bold"
              color="blue.400"
              fontStyle="italic"
              cursor="pointer"
              onClick={() =>
                router.push(url.startsWith('http') ? url : `http://${url}`)
              }
            >
              {url}
            </Text>
          )
        }

        return word
      })}
    </>
  )
}
