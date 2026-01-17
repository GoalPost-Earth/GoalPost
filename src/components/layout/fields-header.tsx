'use client'

import { cn } from '@/lib/utils'

export interface FieldsHeaderProps {
  spaceName?: string
  spaceIcon?: string
  onSearch?: (query: string) => void
  className?: string
}

export function FieldsHeader({
  spaceName = 'MeSpace',
  spaceIcon = 'hub',
  onSearch,
  className,
}: FieldsHeaderProps) {
  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 flex items-center justify-between whitespace-nowrap',
        'border-b border-gp-glass-border bg-gp-glass dark:bg-gp-glass dark:border-gp-glass-border',
        'backdrop-blur-md px-8 md:px-10 py-3 transition-colors',
        className
      )}
    >
      <div className="flex items-center gap-6 md:gap-8">
        {/* Logo and Space Name */}
        <div className="flex items-center gap-3 md:gap-4 text-gp-ink-strong dark:text-white">
          <div className="size-7 md:size-8 text-gp-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[28px] md:text-[32px]">
              {spaceIcon}
            </span>
          </div>
          <h2 className="text-gp-ink-strong dark:text-white text-base md:text-lg font-bold leading-tight tracking-[-0.015em]">
            {spaceName}
          </h2>
        </div>

        {/* Navigation Menu */}
        <nav className="hidden md:flex items-center gap-6 md:gap-9">
          <a
            href="#"
            className="text-gp-ink-strong dark:text-white hover:text-gp-primary dark:hover:text-gp-primary transition-colors text-sm font-medium leading-normal"
          >
            Explore Field
          </a>
          <a
            href="#"
            className="text-gp-ink-muted dark:text-gp-ink-muted hover:text-gp-primary dark:hover:text-gp-primary transition-colors text-sm font-medium leading-normal"
          >
            Patterns
          </a>
          <a
            href="#"
            className="text-gp-ink-muted dark:text-gp-ink-muted hover:text-gp-primary dark:hover:text-gp-primary transition-colors text-sm font-medium leading-normal"
          >
            Knowledge Graph
          </a>
        </nav>
      </div>

      {/* Right Section */}
      <div className="flex flex-1 justify-end gap-4 md:gap-6 items-center">
        {/* Search Bar */}
        <div className="hidden lg:flex w-full max-w-xs items-center rounded-xl bg-white/5 dark:bg-white/10 border border-gp-glass-border dark:border-gp-glass-border px-3 h-10 transition-colors">
          <span className="material-symbols-outlined text-gp-ink-muted dark:text-gp-ink-soft text-[18px] md:text-[20px]">
            search
          </span>
          <input
            className="w-full bg-transparent border-none text-sm text-gp-ink-strong dark:text-gp-ink-strong placeholder-gp-ink-soft dark:placeholder-gp-ink-soft focus:ring-0 ml-2 transition-colors"
            placeholder="Search fields..."
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>

        {/* Notifications Button */}
        <button className="cursor-pointer flex items-center justify-center rounded-full bg-gp-primary/20 hover:bg-gp-primary/30 dark:bg-gp-primary/20 dark:hover:bg-gp-primary/30 text-gp-primary dark:text-gp-primary size-9 md:size-10 transition-all hover:scale-110">
          <span className="material-symbols-outlined text-[20px] md:text-[24px]">
            notifications
          </span>
        </button>

        {/* User Profile Avatar */}
        <div
          className="bg-center bg-no-repeat bg-cover rounded-full size-9 md:size-10 border border-gp-glass-border dark:border-gp-glass-border hover:scale-110 transition-transform cursor-pointer shrink-0"
          style={{
            backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAJA6FsGkQJQDXAeeBjGcz1t8TDIvwLmaJTasvIMWu5G4tZkfY60wSyTWbPSMH5U2MGJJUDpOfM0gwgBNiA7FYJZVzGYOxDqXmuDmNfprNXmd73JYJ984Q723HoF0pNvBgAIB7gx5KoXLaQ6lP_OJq299kswaK8Dcay6d7xSydYxFFT40BpMn73G_3Vjv0RJuAKJeSrPB2hHQhfJJtztOtJJjNisIMY3EjGzzHRfIBPITOUO1woKtlf-TPAgkPQvUz3ukC1iu9cBtUg")`,
          }}
        />
      </div>
    </header>
  )
}
