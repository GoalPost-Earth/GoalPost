'use client'

import React, { useState } from 'react'
import { Box, Spacer, Tabs } from '@chakra-ui/react'
import DefaultTabContent from './default-tab-content'
import Link from 'next/link'
import { EditButton } from './edit-button'
import { DeleteButton } from './delete-button'
import { EntityType } from '@/types'

interface GenericTabsProps {
  triggers: string[]
  content: React.ReactNode[]
  editLink: string
  onDeleteEntity: EntityType
  props?: any
}

export const GenericTabs = ({
  triggers,
  content,
  editLink,
  onDeleteEntity,
  ...props
}: GenericTabsProps) => {
  const [activeTab, setActiveTab] = useState(triggers[0])

  return (
    <Tabs.Root
      variant="subtle"
      value={activeTab}
      onValueChange={(details) => {
        const newValue = details.value
        if (['edit', 'delete'].includes(newValue)) {
          return
        }
        setActiveTab(newValue)
      }}
      colorPalette="brand"
      width={{ base: '100%', lg: '90%', xl: '100%' }}
      mt={2}
    >
      <>
        <Tabs.List mt={2} display="flex" gap={2} overflowX="auto" {...props}>
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
          <Spacer />
          <Tabs.Trigger
            display={{ base: 'none', lg: 'block' }}
            value="edit"
            asChild
          >
            <Link href={editLink}>
              <EditButton />
            </Link>
          </Tabs.Trigger>
          <Tabs.Trigger
            display={{ base: 'none', lg: 'block' }}
            value="delete"
            asChild
          >
            <Box>
              <DeleteButton onDeleteEntity={onDeleteEntity} />
            </Box>
          </Tabs.Trigger>
        </Tabs.List>
      </>

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
