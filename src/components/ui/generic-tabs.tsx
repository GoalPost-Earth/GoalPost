import React from 'react'
import { Tabs } from '@chakra-ui/react'

interface GenericTabsProps {
  triggers: string[]
  contents: React.ReactNode[]
}
const GenericTabs = ({ triggers, contents }: GenericTabsProps) => {
  return (
    <Tabs.Root
      variant="subtle"
      defaultValue={triggers[0]}
      colorPalette={'brand'}
      width={'100%'}
      mt={10}
    >
      <Tabs.List mt={2} w={'full'} bg={'gray.subtle'}>
        {triggers.map((trigger, index) => (
          <Tabs.Trigger
            key={`${trigger}-${index}`}
            value={trigger}
            fontSize={'xs'}
            fontWeight="bold"
            w="full"
            justifyContent={'center'}
            p={0}
          >
            {trigger}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {contents.map((content, index) => (
        <Tabs.Content
          key={`${triggers[index]}-${index}`}
          value={triggers[index]}
          width={'100%'}
        >
          {content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  )
}

export default GenericTabs
