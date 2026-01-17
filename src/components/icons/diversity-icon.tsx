import { cn } from '@/lib/utils'

export interface DiversityIconProps {
  className?: string
}

export function DiversityIcon({ className }: DiversityIconProps) {
  return (
    <span className={cn('material-symbols-outlined', className)}>
      diversity_2
    </span>
  )
}
