'use client'
import { useState, useRef, useEffect } from 'react'
import { HamburgerIcon } from '@/components/icons'
import { Portal, VStack, Box } from '@chakra-ui/react'
import { InputAccordion, NavItemLinks } from './navItems'
import { Button } from '../button'

export default function ExtendedSideNav() {
  const [isExtended, setExtended] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isExtended) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isExtended])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setExtended(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <Portal>
      {isExtended && (
        <Box
          position="fixed"
          top={0}
          left={0}
          width="100vw"
          height="100vh"
          bg="rgba(0, 0, 0, 0.5)"
          zIndex={999}
          onClick={() => setExtended(false)}
        />
      )}
      <VStack
        ref={navRef}
        display={{ base: 'none', lg: 'flex' }}
        width={isExtended ? '300px' : '50px'}
        height="100vh"
        position="fixed"
        top={0}
        left={0}
        flexDirection="column"
        zIndex={1000}
        bg="contrastWhite"
        alignItems="flex-start"
        overflowX="hidden"
        transition="all 0.3s ease-in-out"
        padding={0}
        paddingTop={1}
        scrollbarWidth="none"
        WebkitOverflowScrolling="touch"
      >
        <Button
          cursor="pointer"
          onClick={() => setExtended(!isExtended)}
          background="none"
          padding={4}
        >
          <HamburgerIcon />
        </Button>
        <NavItemLinks
          setOpen={setExtended}
          isExtended={isExtended}
          extendable
        />
        <InputAccordion
          setOpen={setExtended}
          isExtended={isExtended}
          extendable
        />
      </VStack>
    </Portal>
  )
}
