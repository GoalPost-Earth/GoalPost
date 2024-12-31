'use client'
import { useState } from 'react'
import { HamburgerIcon } from '@/components/icons'
import { VStack } from '@chakra-ui/react'
import { InputAccordion, NavItemLinks } from './navItems'
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
  DrawerRoot,
  DrawerTrigger,
} from '@/components/ui/drawer'

function ExtendedSidenav() {
  const [isExtended, setExtended] = useState(false)
  return (
    <DrawerRoot placement={'start'}>
      <DrawerBackdrop />
      <VStack
        display={{ base: 'none', lg: 'flex' }}
        width={'65px'}
        height={'100vh'}
        position={'fixed'}
        top={0}
        left={0}
        flexDirection={'column'}
        zIndex={1000}
        bg={'bg'}
        alignItems={'flex-start'}
        overflowX={'hidden'}
        transition={'all 0.3s ease-in-out'}
        padding={0}
        paddingTop={2}
        scrollbarWidth={'none'}
        WebkitOverflowScrolling={'touch'}
      >
        <DrawerTrigger
          cursor={'pointer'}
          onClick={() => setExtended(!isExtended)}
          background={'none'}
          padding={4}
          pl={5}
        >
          <HamburgerIcon />
        </DrawerTrigger>
        <NavItemLinks setOpen={setExtended} isExtended={false} extendable />
        <InputAccordion setOpen={setExtended} isExtended={false} extendable />
      </VStack>
      <DrawerContent>
        <DrawerBody padding={0} paddingTop={2}>
          <DrawerTrigger
            onClick={() => setExtended(!isExtended)}
            background={'none'}
            padding={4}
            pl={5}
          >
            <HamburgerIcon />
          </DrawerTrigger>
          <NavItemLinks setOpen={setExtended} isExtended={true} extendable />
          <InputAccordion setOpen={setExtended} isExtended={true} extendable />
        </DrawerBody>
      </DrawerContent>
    </DrawerRoot>
  )
}

export default ExtendedSidenav
