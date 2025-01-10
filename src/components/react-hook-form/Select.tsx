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
  defaultOption?: string
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
    portalRef,
    multiple,
    // defaultOption,
    placeholder,
    ...rest
  } = props

  const chakraOptions = createListCollection({
    items: options,
    // itemToString: (item) => item.name,
    // itemToValue: (item) => item.name,
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
            border="1px solid #CBD5E1"
            variant="subtle"
            onValueChange={({ value }) => field.onChange(value)}
            onInteractOutside={() => field.onBlur()}
            multiple={multiple}
            collection={chakraOptions}
            // {...field}
            {...rest}
          >
            {/* <SelectLabel>{label}</SelectLabel> */}
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
