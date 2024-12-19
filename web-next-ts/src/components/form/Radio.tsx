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
  const { label, name, control, errors, options  } = props

  return (
    <Fieldset.Root invalid={!!errors.value} >
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
              <HStack gap={4} justifyContent={'space-between'}>
              {options.map((item) => { 
                const fieldValue = field.value
                return (
                    <ChakraRadio
                    key={item.value}
                    value={item.value}
                    inputProps={{ onBlur: field.onBlur }}
                    width={'50%'}
                    padding={4}
                    border="1px solid #CBD5E1"
                    borderRadius="10px"
                    {...fieldValue === item.value && { bg: 'gray.subtle' }}
                  
                  >
                    {item.label}
                  </ChakraRadio>
                )
              })}
              </HStack>
            </RadioGroup>
          )
        }
      />
      {errors.value && (
        <Fieldset.ErrorText>{(errors.value.message as string)}</Fieldset.ErrorText>
      )}
    </Fieldset.Root>
  )
}

export default Radio
