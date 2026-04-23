'use client'

interface SpaceDetailsHeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  space: any
}

export function SpaceDetailsHeader({ space }: SpaceDetailsHeaderProps) {
  const createdDate = new Date(space.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="flex flex-col items-center text-center mb-12">
      <span className="text-[9px] uppercase font-semibold text-gp-primary mb-2">
        {space.__typename}
      </span>
      <h1 className="text-4xl font-light tracking-tight text-gp-ink-strong dark:text-gp-ink-strong mb-2">
        {space.name}
      </h1>
      <p className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
        Created {createdDate}
      </p>
    </div>
  )
}
