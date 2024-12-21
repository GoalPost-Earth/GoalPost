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
  const { label, name, control, errors, options } = props

  return (
    <Fieldset.Root invalid={!!errors.value}>
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
                const isActive = fieldValue === item.value

                return (
                  <ChakraRadio
                    key={item.value}
                    value={item.value}
                    inputProps={{ onBlur: field.onBlur }}
                    width={'50%'}
                    padding={4}
                    border="1px solid #CBD5E1"
                    borderRadius="10px"
                    {...(isActive && { bg: 'gray.subtle' })}
                    alignContent={'center'}
                    _after={{
                      content: isActive ? '"✔"' : '""',
                      color: 'white',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'absolute',
                      width: '1.5rem',
                      height: '1.5rem',
                      paddingTop: '1px',
                      top: '14px',
                      left: '15px',
                      borderRadius: 'full',
                      border: isActive ? 'none' : '1px solid',
                      borderColor: isActive ? 'transparent' : 'blue.focusRing',
                      background: isActive ? 'blue.500' : 'blue.100',
                    }}
                  >
                    {item.label}
                  </ChakraRadio>
                )
              })}
            </HStack>
          </RadioGroup>
        )}
      />
      {errors.value && (
        <Fieldset.ErrorText>
          {errors.value.message as string}
        </Fieldset.ErrorText>
      )}
    </Fieldset.Root>
  )
}

export default Radio

// background:
// 'linear-gradient(180deg, #F4F7FF 0%, #FFFFFF 100%)',
