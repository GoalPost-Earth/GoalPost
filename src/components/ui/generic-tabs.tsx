import React from 'react'
import { Tabs } from '@chakra-ui/react'
import DefaultTabContent from './default-tab-content'

interface GenericTabsProps {
  triggers: string[]
  content: React.ReactNode[]
  props?: any
}
const GenericTabs = ({ triggers, content, props }: GenericTabsProps) => {
  return (
    <Tabs.Root
      variant="subtle"
      defaultValue={triggers[0]}
      colorPalette={'brand'}
      width={'100%'}
      mt={2}
    >
      <Tabs.List
        mt={2}
        w={'full'}
        display="flex"
        gap={2}
        justifyContent={'center'}
        {...props}
      >
        {triggers.map((trigger, index) => (
          <Tabs.Trigger
            key={`${trigger}-${index}`}
            value={trigger}
            fontSize={'xs'}
            fontWeight="bold"
            justifyContent={'center'}
            borderRadius={'full'}
          >
            {trigger}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {triggers.map((trigger, index) => (
        <Tabs.Content
          key={`${trigger}-${index}`}
          value={trigger}
          width={'100%'}
        >
          {content[index] || <DefaultTabContent />}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  )
}

export default GenericTabs
