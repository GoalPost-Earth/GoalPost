import { cn } from '@/lib/utils'

export interface SpaIconProps {
  className?: string
}

export function SpaIcon({ className }: SpaIconProps) {
  return <span className={cn('material-symbols-outlined', className)}>spa</span>
}
