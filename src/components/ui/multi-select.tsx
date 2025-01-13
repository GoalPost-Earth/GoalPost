'use client'

import type { CollectionItem } from '@chakra-ui/react'
import { Select as ChakraMultiSelect, Portal } from '@chakra-ui/react'
import { CloseButton } from './buttons/close-button'
import * as React from 'react'

interface SelectTriggerProps extends ChakraMultiSelect.ControlProps {
  clearable?: boolean
}

export const MultiSelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectTriggerProps
>(function SelectTrigger(props, ref) {
  const { children, clearable, ...rest } = props
  return (
    <ChakraMultiSelect.Control {...rest}>
      <ChakraMultiSelect.Trigger ref={ref}>
        {children}
      </ChakraMultiSelect.Trigger>
      <ChakraMultiSelect.IndicatorGroup>
        {clearable && <SelectClearTrigger />}
        <ChakraMultiSelect.Indicator />
      </ChakraMultiSelect.IndicatorGroup>
    </ChakraMultiSelect.Control>
  )
})

const SelectClearTrigger = React.forwardRef<
  HTMLButtonElement,
  ChakraMultiSelect.ClearTriggerProps
>(function SelectClearTrigger(props, ref) {
  return (
    <ChakraMultiSelect.ClearTrigger asChild {...props} ref={ref}>
      <CloseButton
        size="xs"
        variant="plain"
        focusVisibleRing="inside"
        focusRingWidth="2px"
        pointerEvents="auto"
      />
    </ChakraMultiSelect.ClearTrigger>
  )
})

interface SelectContentProps extends ChakraMultiSelect.ContentProps {
  portalled?: boolean
  portalRef?: React.RefObject<HTMLElement>
}

export const MultiSelectContent = React.forwardRef<
  HTMLDivElement,
  SelectContentProps
>(function SelectContent(props, ref) {
  const { portalled = true, portalRef, ...rest } = props
  return (
    <Portal disabled={!portalled} container={portalRef}>
      <ChakraMultiSelect.Positioner>
        <ChakraMultiSelect.Content {...rest} ref={ref} />
      </ChakraMultiSelect.Positioner>
    </Portal>
  )
})

export const MultiSelectItem = React.forwardRef<
  HTMLDivElement,
  ChakraMultiSelect.ItemProps
>(function SelectItem(props, ref) {
  const { item, children, ...rest } = props
  return (
    <ChakraMultiSelect.Item key={item.value} item={item} {...rest} ref={ref}>
      {children}
      <ChakraMultiSelect.ItemIndicator />
    </ChakraMultiSelect.Item>
  )
})

interface SelectValueTextProps
  extends Omit<ChakraMultiSelect.ValueTextProps, 'children'> {
  children?(items: CollectionItem[]): React.ReactNode
}

export const MultiSelectValueText = React.forwardRef<
  HTMLSpanElement,
  SelectValueTextProps
>(function SelectValueText(props, ref) {
  const { children, ...rest } = props
  return (
    <ChakraMultiSelect.ValueText {...rest} ref={ref}>
      <ChakraMultiSelect.Context>
        {(select) => {
          const items = select.selectedItems
          if (items.length === 0) return props.placeholder
          if (children) return children(items)
          if (items.length === 1)
            return select.collection.stringifyItem(items[0])
          return `${items.length} selected`
        }}
      </ChakraMultiSelect.Context>
    </ChakraMultiSelect.ValueText>
  )
})

export const MultiSelectRoot = React.forwardRef<
  HTMLDivElement,
  ChakraMultiSelect.RootProps
>(function MultiSelectRoot(props, ref) {
  return (
    <ChakraMultiSelect.Root
      {...props}
      ref={ref}
      positioning={{ sameWidth: true, ...props.positioning }}
    >
      {props.asChild ? (
        props.children
      ) : (
        <>
          <ChakraMultiSelect.HiddenSelect />
          {props.children}
        </>
      )}
    </ChakraMultiSelect.Root>
  )
}) as ChakraMultiSelect.RootComponent

interface SelectItemGroupProps extends ChakraMultiSelect.ItemGroupProps {
  label: React.ReactNode
}

export const MultiSelectItemGroup = React.forwardRef<
  HTMLDivElement,
  SelectItemGroupProps
>(function SelectItemGroup(props, ref) {
  const { children, label, ...rest } = props
  return (
    <ChakraMultiSelect.ItemGroup {...rest} ref={ref}>
      <ChakraMultiSelect.ItemGroupLabel>
        {label}
      </ChakraMultiSelect.ItemGroupLabel>
      {children}
    </ChakraMultiSelect.ItemGroup>
  )
})

export const MultiSelectLabel = ChakraMultiSelect.Label
export const MultiSelectItemText = ChakraMultiSelect.ItemText
