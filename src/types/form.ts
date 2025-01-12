/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Control,
  FieldErrors,
  FieldValues,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form'

export type SelectOptions = {
  label: string
  value: string
}[]

export interface ReactHookFormComponentProps {
  label?: string
  name: string
  required?: boolean
  placeholder?: string
  options?: SelectOptions
  control: Control<any>
  errors: FieldErrors<any>
}

export interface EntityFormProps {
  formMode: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<FieldValues, any>
  setValue?: UseFormSetValue<FieldValues>
  register: UseFormRegister<FieldValues>
  errors: FieldErrors<FieldValues>
  isSubmitting: boolean
  onSubmit: () => void
}
