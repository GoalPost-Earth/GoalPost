'use client'
import React, { useState, useEffect } from 'react'
import { Tabs } from '@chakra-ui/react'
import DefaultTabContent from './default-tab-content'

interface GenericTabsProps {
  triggers: string[]
  content: React.ReactNode[]
  onTabChange?: (tab: string) => void
  selectedTab?: string
  tabsDisplay: { base: string; lg: string }
  props?: any
}

export const GenericTabs = ({
  triggers,
  content,
  onTabChange,
  selectedTab,
  tabsDisplay,
  ...props
}: GenericTabsProps) => {
  const [activeTab, setActiveTab] = useState(selectedTab || triggers[0])
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    if (selectedTab && selectedTab !== activeTab) {
      setActiveTab(selectedTab)
    }
  }, [selectedTab])

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      if (window.innerWidth <= 1024 && activeTab !== triggers[0]) {
        setActiveTab(triggers[0])
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [activeTab, triggers])

  return (
    <Tabs.Root
      variant="subtle"
      value={activeTab}
      onValueChange={(details) => {
        const newValue = details.value
        setActiveTab(newValue)
        onTabChange && onTabChange(newValue)
      }}
      display={tabsDisplay}
      colorPalette="brand"
      width="100%"
      mt={2}
    >
      <Tabs.List
        mt={2}
        display="flex"
        gap={2}
        overflowX="auto"
        whiteSpace="nowrap"
        scrollbarWidth="none"
        WebkitOverflowScrolling="touch"
        {...props}
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
          width="100%"
          minHeight="315px"
          borderRadius="lg"
        >
          {content[index] || <DefaultTabContent />}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  )
}
