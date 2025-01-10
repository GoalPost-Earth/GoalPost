import React from 'react'
import { SelectRootProps } from '@chakra-ui/react'
import { ReactHookFormComponentProps, SelectOptions } from '../../types/form'
import { Field } from '../ui/field'
import { NativeSelectField, NativeSelectRoot } from '../ui/native-select'
import { UseFormRegister } from 'react-hook-form'
interface RHFSelectProps extends ReactHookFormComponentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>
  options: SelectOptions
}

type SelectPropsType = Omit<RHFSelectProps, 'control'> &
  Omit<SelectRootProps, 'collection'>

const Select = (props: SelectPropsType) => {
  const {
    label,
    name,
    placeholder,
    errors,
    required,
    register,
    options,
    ...rest
  } = props

  return (
    <Field
      label={label}
      invalid={!!errors[name]}
      errorText={errors[name]?.message as string}
      required={required}
    >
      <NativeSelectRoot
        border="1px solid #000"
        id={name}
        variant="subtle"
        {...rest}
      >
        <NativeSelectField
          {...register(name)}
          placeholder={placeholder}
          items={options}
        />
      </NativeSelectRoot>
    </Field>
  )
}

export default Select
