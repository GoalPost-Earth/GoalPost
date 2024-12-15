import React from 'react'
import { createListCollection, SelectRootProps } from '@chakra-ui/react'
import { Controller } from 'react-hook-form'
import { ReactHookFormComponentProps, SelectOptions } from './types'
import { Field } from '../ui/field'
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '../ui/select'

export interface RHFSelectProps extends ReactHookFormComponentProps {
  defaultOption?: string
  options: SelectOptions
}

type SelectPropsType = RHFSelectProps & SelectRootProps

const Select = (props: SelectPropsType) => {
  const {
    label,
    name,
    control,
    errors,
    required,
    options,
    // defaultOption,
    placeholder,
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
            id={name}
            borderRadius="16px"
            {...field}
            {...rest}
            collection={chakraOptions}
          >
            <SelectLabel>{label}</SelectLabel>
            <SelectTrigger>
              <SelectValueText placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
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
