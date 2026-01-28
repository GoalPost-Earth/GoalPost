'use client'

type SectionHeaderProps = {
  icon: string
  title: string
}

export function SectionHeader({ icon, title }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-2 mb-4">
      <span className="material-symbols-outlined text-gp-primary text-[20px]">
        {icon}
      </span>
      <h3 className="text-xs font-bold uppercase tracking-widest text-gp-ink-muted dark:text-gp-ink-soft">
        {title}
      </h3>
    </div>
  )
}
