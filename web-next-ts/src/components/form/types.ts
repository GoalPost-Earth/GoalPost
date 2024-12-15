/* eslint-disable @typescript-eslint/no-explicit-any */
import { Control, FieldErrors } from 'react-hook-form'

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
