import React from 'react'
import { Switch as ChakraSwitch, SwitchProps } from '../ui/switch'
import { Controller } from 'react-hook-form'
import { ReactHookFormComponentProps } from '../../app/types/form'
import { Field } from '../ui/field'

export type CustomSwitchProps = ReactHookFormComponentProps

type SwitchPropsType = CustomSwitchProps & SwitchProps

const Switch = (props: SwitchPropsType) => {
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
          <ChakraSwitch
            id={name}
            checked={field.value}
            onCheckedChange={({ checked }) => field.onChange(checked)}
            {...rest}
          >
            {label}
          </ChakraSwitch>
        </Field>
      )}
    />
  )
}

export default Switch
