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
  control: Control<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue?: UseFormSetValue<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resetDefaults?: () => void
  register: UseFormRegister<any>
  errors: FieldErrors<FieldValues>
  isSubmitting: boolean
  onSubmit: () => void
}
