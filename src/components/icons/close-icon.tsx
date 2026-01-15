import { cn } from '@/lib/utils'

export interface CloseIconProps {
  className?: string
}

export function CloseIcon({ className }: CloseIconProps) {
  return (
    <svg
      className={cn('size-6', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}
