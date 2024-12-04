/* eslint-disable @typescript-eslint/no-explicit-any */
import { Control, FieldErrors } from 'react-hook-form'

export type SelectOptions = {
  key: string
  value: string
}[]

export interface ReactHookFormComponentProps {
  label?: string
  name: string
  placeholder?: string
  options?: { key: string; value: string }[]
  control: Control<any>
  errors: FieldErrors<any>
}
