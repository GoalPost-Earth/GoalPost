'use client'
import React, { useState, useEffect } from 'react'
import { Tabs } from '@chakra-ui/react'
import DefaultTabContent from './default-tab-content'

interface GenericTabsProps {
  triggers: string[]
  content: React.ReactNode[]
  props?: any
}
export const GenericTabs = ({ triggers, content, props }: GenericTabsProps) => {
  const [activeTab, setActiveTab] = useState(triggers[0])
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      if (window.innerWidth <= 1024) {
        setActiveTab(triggers[0])
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [triggers])
  return (
    <Tabs.Root
      variant="subtle"
      defaultValue={triggers[0]}
      value={activeTab}
      onValueChange={(details) => setActiveTab(details.value)}
      colorPalette={'brand'}
      width={{ base: '100%', lg: '80%', xl: '100%' }}
      mt={2}
    >
      <Tabs.List
        mt={2}
        display="flex"
        gap={2}
        {...props}
        overflowX="auto"
        whiteSpace="nowrap"
        scrollbarWidth="none"
        WebkitOverflowScrolling="touch"
      >
        {triggers.map((trigger, index) => (
          <Tabs.Trigger
            key={`${trigger}-${index}`}
            value={trigger}
            fontSize="xs"
            fontWeight="bold"
            justifyContent="center"
            borderRadius="full"
            minWidth="fit-content"
            bg={activeTab !== trigger ? 'gray.100' : 'brand.200'}
          >
            {trigger}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {triggers.map((trigger, index) => (
        <Tabs.Content
          key={`${trigger}-${index}`}
          value={trigger}
          width={{ base: '100%', lg: '80%', xl: '100%' }}
          minHeight={'315px'}
          borderRadius="lg"
        >
          {content[index] || <DefaultTabContent />}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  )
}
