'use client'

import React, { useState } from 'react'
import { Spacer, Tabs } from '@chakra-ui/react'
import DefaultTabContent from './default-tab-content'
import Link from 'next/link'
import { EditButton } from './edit-button'
import { EntityEnum, TRIGGER_TO_ROUTE_MAP, TriggerValues } from '@/constants'
import { Button } from './button'

interface GenericTabsProps {
  triggers: TriggerValues[]
  content: React.ReactNode[]
  entityId: string
  entityType: EntityEnum
  entityName: string
  props?: any
}

const parseEditLink = (trigger: TriggerValues, entityId: string) => {
  const baseURL = `update/${entityId}`
  const parsedTrigger = TRIGGER_TO_ROUTE_MAP[trigger]

  if (!parsedTrigger) {
    return ''
  }
  return baseURL + parsedTrigger
}

export const GenericTabs = ({
  triggers,
  content,
  entityId,
  entityType,
  entityName,
  ...props
}: GenericTabsProps) => {
  const [activeTab, setActiveTab] = useState(triggers[0])

  return (
    <Tabs.Root
      variant="subtle"
      value={activeTab}
      onValueChange={(details) => {
        const newValue = details.value as TriggerValues
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
              asChild
              key={`${trigger}-${index}`}
              value={trigger}
              fontSize="xs"
              fontWeight="bold"
              justifyContent="center"
              borderRadius="full"
              minWidth="fit-content"
            >
              <Button
                colorPalette={activeTab !== trigger ? 'gray' : 'brandIcons'}
                color={activeTab !== trigger ? 'gray.fg' : 'brand.fg'}
                variant="surface"
              >
                {trigger}
              </Button>
            </Tabs.Trigger>
          ))}
          <Spacer />
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
          {parseEditLink(trigger, entityId) === '' ? (
            <></>
          ) : (
            <Link href={parseEditLink(trigger, entityId)}>
              <EditButton
                colorPalette={entityType.toLowerCase()}
                text={`Edit ${trigger}`}
                size="xl"
                mb={5}
              />
            </Link>
          )}
          {content[index] || <DefaultTabContent />}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  )
}
