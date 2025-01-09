'use client'
import React, { useState, useEffect } from 'react'
import { Flex, Tabs, TabsContent, TabsContentGroup } from '@chakra-ui/react'
import DefaultTabContent from './default-tab-content'
import { CommunityCard } from './community-card'
import { GoalCard } from './goal-card'
import { PersonCard } from './person-card'

interface SearchTabsProps {
  content: any[]
}

const TRIGGERS = [
  'All',
  'Care Points',
  'Communities',
  'Core Values',
  'People',
  'Resources',
  'Goals',
]
export const SearchTabs = ({ content }: SearchTabsProps) => {
  const [activeTab, setActiveTab] = useState(TRIGGERS[0])
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      if (window.innerWidth <= 1024 && activeTab !== TRIGGERS[0]) {
        setActiveTab(TRIGGERS[0])
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [activeTab, TRIGGERS])

  return (
    <Tabs.Root
      variant="subtle"
      value={activeTab}
      onValueChange={(details) => {
        const newValue = details.value
        setActiveTab(newValue)
      }}
      colorPalette="brand"
      width="100%"
      mt={2}
    >
      <Tabs.List
        mt={2}
        display="flex"
        gap={2}
        justifyContent={{ md: 'center' }}
        overflowX="auto"
        whiteSpace="nowrap"
        scrollbarWidth="none"
        WebkitOverflowScrolling="touch"
      >
        {TRIGGERS.map((trigger, index) => (
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
      {TRIGGERS.map((trigger, index) => (
        <TabsContent key={index} value={trigger} mb={3}>
          {content.map((entity) => {
            console.log('🚀 ~ file: search-tabs.tsx:77 ~ trigger:', trigger)
            console.log('🚀 ~ file: search-tabs.tsx:78 ~ entity:', entity)

            return entity.map((entity: any) => (
              <Flex key={entity.id}>{entity.description}</Flex>
            ))
          })}
        </TabsContent>
      ))}
      <TabsContent value={TRIGGERS[0]} mb={3}>
        {!!content[0] && content[0].length > 0 ? (
          content[0].map((entity: any) => (
            <Flex key={entity.id}>{entity.description}</Flex>
          ))
        ) : (
          <DefaultTabContent />
        )}
      </TabsContent>
      <TabsContent value={TRIGGERS[1]} mb={3}>
        {!!content[1] && content[1].length > 0 ? (
          content[1].map((entity: any) => (
            <CommunityCard key={entity.id} community={entity} />
          ))
        ) : (
          <DefaultTabContent />
        )}
      </TabsContent>
      <TabsContent value={TRIGGERS[2]} mb={3}>
        {!!content[2] && content[2].length > 0 ? (
          content[2].map((entity: any) => (
            <Flex key={entity.id}>{entity.name}</Flex>
          ))
        ) : (
          <DefaultTabContent />
        )}
      </TabsContent>
      <TabsContent value={TRIGGERS[3]} mb={3}>
        {!!content[3] && content[3].length > 0 ? (
          content[3].map((entity: any) => (
            <PersonCard
              key={entity.id}
              id={entity.id}
              name={entity.name}
              photo={entity.photo}
            />
          ))
        ) : (
          <DefaultTabContent />
        )}
      </TabsContent>
      <TabsContent value={TRIGGERS[4]} mb={3}>
        {!!content[4] && content[4].length > 0 ? (
          content[4].map((entity: any) => (
            <Flex key={entity.id}>{entity.name}</Flex>
          ))
        ) : (
          <DefaultTabContent />
        )}
      </TabsContent>
      <TabsContent width="100%" value={TRIGGERS[5]}>
        {!!content[5] && content[5].length > 0 ? (
          content[5].map((entity: any) => (
            <GoalCard
              key={entity.id}
              id={entity.id}
              description={entity.description}
              name={entity.name}
              status={entity.status}
              photo={entity.photo}
              createdAt={entity.createdAt}
            />
          ))
        ) : (
          <DefaultTabContent />
        )}
      </TabsContent>
    </Tabs.Root>
  )
}
