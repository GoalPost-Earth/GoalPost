import React from 'react'
import { Checkbox as ChakraCheckbox, CheckboxProps } from '../ui/checkbox'
import { Controller } from 'react-hook-form'
import { ReactHookFormComponentProps } from '../../types/form'
import { Field } from '../ui/field'

export type CustomCheckboxProps = ReactHookFormComponentProps

type CheckboxPropsType = CustomCheckboxProps & CheckboxProps

const Checkbox = (props: CheckboxPropsType) => {
  const { label, name, control, errors, required, ...rest } = props

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Field
          invalid={!!errors[name]}
          errorText={errors[name]?.message as string}
          disabled={field.disabled}
          required={required}
        >
          <ChakraCheckbox
            id={name}
            checked={field.value}
            onCheckedChange={({ checked }) => field.onChange(checked)}
            {...rest}
          >
            {label}
          </ChakraCheckbox>
        </Field>
      )}
    />
  )
}

export default Checkbox
