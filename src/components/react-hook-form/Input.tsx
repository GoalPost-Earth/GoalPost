'use client'

import React from 'react'
import {
  Input as ChakraInput,
  InputProps as ChakraInputProps,
} from '@chakra-ui/react'
import { Controller } from 'react-hook-form'
import { ReactHookFormComponentProps } from '../../types/form'
import { Field } from '../ui/field'

export interface InputProps extends ReactHookFormComponentProps {
  type?:
    | 'date'
    | 'time'
    | 'datetime-local'
    | 'password'
    | 'color'
    | 'email'
    | 'number'
    | 'search'
    | 'tel'
    | 'text'
    | 'url'
}
type InputPropsType = InputProps & Omit<ChakraInputProps, 'type'>

const Input = (props: InputPropsType) => {
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
          <ChakraInput
            id={name}
            border="1px solid #CBD5E1"
            borderRadius="10px"
            variant="subtle"
            {...field}
            {...rest}
          />
        </Field>
      )}
    />
  )
}

export default Input
