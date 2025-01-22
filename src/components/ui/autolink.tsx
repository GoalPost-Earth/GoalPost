'use client'

import { Text } from '@chakra-ui/react'
import React from 'react'

export const AutoLink = ({ text }: { text: string }) => {
  const delimiter =
    /((?:https?:\/\/)?(?:(?:[a-z0-9]?(?:[a-z0-9\-]{1,61}[a-z0-9])?\.[^\.|\s])+[a-z\.]*[a-z]+|(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3})(?::\d{1,5})?[a-z0-9.,_\/~#&=;%+?\-\\(\)@$!*'[\]{}]*)/gi

  return (
    <>
      {text?.split(delimiter).map((word, index) => {
        const match = word.match(delimiter)

        if (match) {
          const url = match[0]
            .replace(/[,]/g, '')
            .replace(/[^a-zA-Z0-9-._~:/?#@!$&'()*+,;=%]/g, '')

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
                window.open(
                  url.startsWith('http') ? url : `http://${url}`,
                  '_blank'
                )
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
