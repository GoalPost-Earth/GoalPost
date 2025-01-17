'use client'

import React from 'react'
import {
  Textarea as ChakraTextarea,
  TextareaProps as ChakraTextareaProps,
} from '@chakra-ui/react'
import { ReactHookFormComponentProps } from '../../types/form'
import { Field } from '../ui/field'
import { Controller } from 'react-hook-form'

type TextareaPropsType = ReactHookFormComponentProps &
  Omit<ChakraTextareaProps, 'type'>

const Textarea = (props: TextareaPropsType) => {
  const { label, name, control, errors, required, ...rest } = props

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
          <ChakraTextarea id={name} {...field} {...rest} />
        )}
      />
    </Field>
  )
}

export default Textarea
