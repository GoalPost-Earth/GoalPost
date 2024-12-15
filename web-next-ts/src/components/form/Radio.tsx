import React from 'react'
import { HStack, Fieldset } from '@chakra-ui/react'
import { Controller } from 'react-hook-form'
import { ReactHookFormComponentProps, SelectOptions } from './types'
import { Radio as ChakraRadio, RadioGroup, RadioProps } from '../ui/radio'

export interface CustomRadioProps extends ReactHookFormComponentProps {
  options: SelectOptions
}
type RadioPropsType = CustomRadioProps & RadioProps

const Radio = (props: RadioPropsType) => {
  const { label, name, control, errors, required, options, ...rest } = props

  return (
    <Fieldset.Root invalid={!!errors.value} required={required}>
      <Fieldset.Legend>{label}</Fieldset.Legend>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <RadioGroup
            id={name}
            name={field.name}
            value={field.value}
            onValueChange={({ value }) => {
              field.onChange(value)
            }}
          >
            <HStack gap="6">
              {options.map((item) => (
                <ChakraRadio
                  key={item.value}
                  value={item.value}
                  inputProps={{ onBlur: field.onBlur }}
                  {...rest}
                >
                  {item.label}
                </ChakraRadio>
              ))}
            </HStack>
          </RadioGroup>
        )}
      />
      {errors.value && (
        <Fieldset.ErrorText>{errors.value?.message}</Fieldset.ErrorText>
      )}
    </Fieldset.Root>
  )
}

export default Radio
