import React from 'react'
import {
  Textarea as ChakraTextarea,
  TextareaProps as ChakraTextareaProps,
} from '@chakra-ui/react'
import { Controller } from 'react-hook-form'
import { ReactHookFormComponentProps } from '../../app/types/form'
import { Field } from '../ui/field'

type TextareaPropsType = ReactHookFormComponentProps &
  Omit<ChakraTextareaProps, 'type'>

const Textarea = (props: TextareaPropsType) => {
  const { label, name, control, errors, required, ...rest } = props

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
          <ChakraTextarea id={name} {...field} {...rest} />
        </Field>
      )}
    />
  )
}

export default Textarea
