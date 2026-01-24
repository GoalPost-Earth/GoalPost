import { cn } from '@/lib/utils'
import Image from 'next/image'

export interface GoalPostLogoProps {
  className?: string
}

export function GoalPostLogo({ className }: GoalPostLogoProps) {
  return (
    <div className={cn('w-full h-full relative p-0 m-0', className)}>
      <Image
        src="/goalpost-logo.png"
        alt="GoalPost Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  )
}
