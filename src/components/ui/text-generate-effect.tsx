'use client'
import { useEffect } from 'react'
import { Text, Box } from '@chakra-ui/react'
import { motion, stagger, useAnimate } from 'framer-motion'

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}: {
  words: string
  className?: string
  filter?: boolean
  duration?: number
}) => {
  const [scope, animate] = useAnimate()
  let wordsArray = words.split(' ')
  useEffect(() => {
    animate(
      'span',
      {
        opacity: 1,
        filter: filter ? 'blur(0px)' : 'none',
      },
      {
        duration: duration ? duration : 1,
        delay: stagger(0.2),
      }
    )
  }, [scope.current])

  const renderWords = () => {
    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              style={{
                color: 'black',
                opacity: 0,
                filter: filter ? 'blur(10px)' : 'none',
              }}
            >
              {word}{' '}
            </motion.span>
          )
        })}
      </motion.div>
    )
  }

  return (
    <Box
      fontWeight="bold"
      marginTop={4}
      fontSize="2xl"
      lineHeight="snug"
      letterSpacing="wide"
    >
      {renderWords()}
    </Box>
  )
}
