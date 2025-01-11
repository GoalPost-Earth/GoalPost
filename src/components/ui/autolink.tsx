import Link from 'next/link'
import React from 'react'

export const AutoLink = ({ text }: { text: string }) => {
  const delimiter =
    /((?:https?:\/\/)?(?:(?:[a-z0-9]?(?:[a-z0-9\-]{1,61}[a-z0-9])?\.[^\.|\s])+[a-z\.]*[a-z]+|(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3})(?::\d{1,5})*[a-z0-9.,_\/~#&=;%+?\-\\(\\)]*)/gi

  return (
    <>
      {text?.split(delimiter).map((word, index) => {
        const match = word.match(delimiter)
        if (match) {
          const url = match[0]
          return (
            <Link
              key={`url-${index}`}
              href={url.startsWith('http') ? url : `http://${url}`}
              style={{
                fontWeight: 'bold',
                fontStyle: 'italic',
                textDecoration: 'underline',
                color: 'blue',
              }}
            >
              {url}
            </Link>
          )
        }
        return word
      })}
    </>
  )
}
