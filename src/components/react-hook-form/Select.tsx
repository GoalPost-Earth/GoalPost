'use client'

import React from 'react'
import { createListCollection, SelectRootProps } from '@chakra-ui/react'
import { Controller } from 'react-hook-form'
import { ReactHookFormComponentProps, SelectOptions } from '../../types/form'
import { Field } from '../ui/field'
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '../ui/select'

export interface RHFSelectProps extends ReactHookFormComponentProps {
  portalRef?: React.RefObject<HTMLDivElement>
  options: SelectOptions
}

type SelectPropsType = RHFSelectProps & Omit<SelectRootProps, 'collection'>

const Select = (props: SelectPropsType) => {
  const {
    label,
    name,
    control,
    errors,
    required,
    options,
    placeholder,
    portalRef,
    ...rest
  } = props

  const chakraOptions = createListCollection({
    items: options,
  })

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Field
          label={label}
          invalid={!!errors[name]}
          errorText={errors[name]?.message as string}
          required={required}
        >
          <SelectRoot
            id={field.name}
            defaultValue={props.defaultValue}
            border="1px solid #000"
            value={field.value}
            onValueChange={({ value }) => field.onChange(value)}
            onInteractOutside={() => field.onBlur()}
            multiple={false}
            collection={chakraOptions}
            variant="subtle"
            {...rest}
          >
            <SelectTrigger>
              <SelectValueText placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent portalRef={portalRef}>
              {chakraOptions.items.map((option) => (
                <SelectItem item={option} key={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </Field>
      )}
    />
  )
}

export default Select
