'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

function Switch({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: 'sm' | 'default'
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        'peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none cursor-pointer focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6',
        'focus-visible:border-[color-mix(in_srgb,var(--gp-primary)_60%,transparent)] focus-visible:ring-[color-mix(in_srgb,var(--gp-primary)_20%,transparent)]/50',
        'data-[state=checked]:bg-[color-mix(in_srgb,var(--gp-primary)_88%,white_12%)] data-[state=unchecked]:bg-gp-glass-border dark:data-[state=unchecked]:bg-gp-glass-border',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block rounded-full ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0',
          'bg-white dark:bg-black'
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
