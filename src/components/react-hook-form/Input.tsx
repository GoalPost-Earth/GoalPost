import React from 'react'
import { Controller, Control, FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface InputProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  autoComplete?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  errors: FieldErrors
  required?: boolean
  minLength?: number
  className?: string
}

const InputField: React.FC<InputProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  autoComplete,
  control,
  errors,
  required,
  minLength,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={name}>{label}</Label>
      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `${label} is required` : false,
          minLength: minLength
            ? {
                value: minLength,
                message: `${label} must be at least ${minLength} characters`,
              }
            : undefined,
        }}
        render={({ field }) => (
          <Input
            id={name}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            {...field}
            className={cn(errors[name] && 'border-red-500')}
          />
        )}
      />
      {errors[name] && (
        <p className="text-sm text-red-500">{String(errors[name]?.message)}</p>
      )}
    </div>
  )
}

export default InputField
