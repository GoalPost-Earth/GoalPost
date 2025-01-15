'use client'

import React, { useState, useEffect } from 'react'
import { Spacer, Tabs } from '@chakra-ui/react'
import DefaultTabContent from './default-tab-content'
import Link from 'next/link'
import { EditButton } from './buttons/edit-button'
import { EntityEnum, TRIGGER_TO_ROUTE_MAP, TriggerValues } from '@/constants'
import { Button } from './button'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface GenericTabsProps {
  triggers: TriggerValues[]
  removeTriggers?: boolean
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
  removeTriggers = false,
  content,
  entityId,
  entityType,
  entityName,
  ...props
}: GenericTabsProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TriggerValues>(
    removeTriggers
      ? triggers[0]
      : (searchParams?.get('tab') as TriggerValues) || triggers[0]
  )

  useEffect(() => {
    router.replace(`${pathname}?tab=${activeTab}`, { scroll: false })
  }, [activeTab, router])

  useEffect(() => {
    function handleSetTab() {
      if (removeTriggers && window.innerWidth > 1023) {
        setActiveTab(triggers[0])
      } else if (removeTriggers) {
        setActiveTab((searchParams?.get('tab') as TriggerValues) || triggers[0])
      }
    }

    handleSetTab()
    window.addEventListener('resize', handleSetTab)

    return () => window.removeEventListener('resize', handleSetTab)
  }, [])

  return (
    <Tabs.Root
      variant="subtle"
      value={activeTab}
      width="100%"
      onValueChange={(details) => {
        const newValue = details.value as TriggerValues
        if (['edit', 'delete'].includes(newValue)) {
          return
        }
        setActiveTab(newValue)
      }}
      colorPalette="brand"
      mt={2}
    >
      <>
        <Tabs.List
          mt={2}
          display={removeTriggers ? { base: 'flex', lg: 'none' } : 'flex'}
          gap={2}
          overflowX="auto"
          {...props}
        >
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
          {/* {parseEditLink(trigger, entityId) === '' ? (
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
          )} */}
          <>{content[index] || <DefaultTabContent />}</>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  )
}
