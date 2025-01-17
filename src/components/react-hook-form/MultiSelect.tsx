'use client'

import React from 'react'
import { createListCollection, SelectRootProps } from '@chakra-ui/react'
import { Controller } from 'react-hook-form'
import { Field } from '../ui/field'
import {
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectRoot,
  MultiSelectTrigger,
  MultiSelectValueText,
} from '../ui/multi-select'
import { RHFSelectProps } from './Select'

type SelectPropsType = RHFSelectProps & Omit<SelectRootProps, 'collection'>

const MultiSelect = (props: SelectPropsType) => {
  const {
    label,
    name,
    control,
    errors,
    required,
    options,
    portalRef,
    multiple,
    placeholder,
    ...rest
  } = props

  const chakraOptions = createListCollection({
    items: options,
  })

  return (
    <Field
      label={label}
      invalid={!!errors[name]}
      errorText={errors[name]?.message as string}
      required={required}
    >
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <MultiSelectRoot
            id={field.name}
            defaultValue={props.defaultValue}
            border="1px solid #000"
            value={field.value}
            onValueChange={({ value }) => field.onChange(value)}
            onInteractOutside={() => field.onBlur()}
            multiple={multiple}
            collection={chakraOptions}
            variant="subtle"
            {...rest}
          >
            <MultiSelectTrigger>
              <MultiSelectValueText placeholder={placeholder} />
            </MultiSelectTrigger>
            <MultiSelectContent
              portalRef={portalRef}
              height="200px"
              overflow="auto"
              scrollbarWidth="thin"
            >
              {chakraOptions.items.map((option) => (
                <MultiSelectItem item={option} key={option.value}>
                  {option.label}
                </MultiSelectItem>
              ))}
            </MultiSelectContent>
          </MultiSelectRoot>
        )}
      />
    </Field>
  )
}

export default MultiSelect
