'use client'
import { useState, useRef, useEffect } from 'react'
import { HamburgerIcon } from '@/components/icons'
import { Portal, VStack, Box, HStack } from '@chakra-ui/react'
import { InputAccordion, NavItemLinks } from './navItems'
import { Button } from '../button'
import { LogoutSection } from '../logout-section'
import { BrandedGoalPostText } from '../branded-goalpost-text'

export default function ExtendedSideNav() {
  const [isExtended, setExtended] = useState(false)
  const [disableHover, setDisableHover] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

  const handleNavItemClick = () => {
    setDisableHover(true)
    setExtended(false)
    setTimeout(() => setDisableHover(false), 300)
  }

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
      <Box
        position="fixed"
        top={0}
        left={0}
        width="100dvw"
        height="100%"
        maxHeight="100dvh"
        bg={'rgba(0, 0, 0, 0.5)'}
        zIndex={999}
        onClick={() => setExtended(false)}
        opacity={isExtended ? 1 : 0}
        visibility={isExtended ? 'visible' : 'hidden'}
        transition="all 0.3s ease-in-out"
      />

      <VStack
        onMouseEnter={() => !disableHover && setExtended(true)}
        onMouseLeave={() => !disableHover && setExtended(false)}
        ref={navRef}
        display={{ base: 'none', lg: 'flex' }}
        width={isExtended ? '300px' : '50px'}
        height="100%"
        maxHeight="100dvh"
        position="fixed"
        top={0}
        left={0}
        flexDirection="column"
        zIndex={1000}
        bg="bg"
        boxShadow="xs"
        alignItems="flex-start"
        overflowX="hidden"
        transition="all 0.3s ease-in-out"
        padding={0}
        paddingTop={1}
        scrollbarWidth="none"
        WebkitOverflowScrolling="touch"
      >
        <HStack gap={1} alignItems="center">
          <Button
            cursor="pointer"
            // onClick={() => setExtended(!isExtended)}
            background="none"
            padding={4}
            paddingLeft={3}
            paddingBottom={3}
          >
            <HamburgerIcon />
          </Button>
          <BrandedGoalPostText fontSize="lg" mt={1} />
        </HStack>
        <NavItemLinks
          setOpen={handleNavItemClick}
          isExtended={isExtended}
          extendable
        />
        <InputAccordion
          setOpen={handleNavItemClick}
          isExtended={isExtended}
          extendable
        />
        <LogoutSection extendable isExtended={isExtended} />
      </VStack>
    </Portal>
  )
}
