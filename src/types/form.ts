/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Control,
  FieldErrors,
  FieldValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
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
  register: UseFormRegister<any>
  resetDefaults?: () => void
  errors: FieldErrors<FieldValues>
  isSubmitting: boolean
  onSubmit: () => void
}

export type EntityFormPropsWithLinkTo = EntityFormProps & {
  setValue: UseFormSetValue<any>
  watch: UseFormWatch<any>
  register: UseFormRegister<any>
}
