'use client'

import type { FC } from 'react'
import Image from 'next/image'
import { SectionHeader } from './section-header'
import { ProfileCard } from './profile-card'
import { LinkifiedText } from '@/components/ui/linkified-text'

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * The read-only sections of the person profile page, split out of
 * `persons/[id]/page.tsx` to keep every file under the 400-line rule. Pure
 * presentation — the page owns the queries, the page owns the connection
 * mutations (see `usePersonConnections`).
 */

const bodyTextClass =
  'text-sm text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed'

const emptyTextClass = 'text-[11px] text-gp-ink-muted dark:text-gp-ink-soft'

export const ProfileHeader: FC<{
  name: string
  photo?: string | null
  email?: string | null
  onOpenInDashboard: () => void
}> = ({ name, photo, email, onOpenInDashboard }) => (
  <div className="flex flex-col items-center text-center mb-12">
    <div className="size-24 rounded-full bg-linear-to-br from-gp-primary/20 to-gp-accent-glow/20 flex items-center justify-center mb-6 border-4 border-white/50 dark:border-white/10 shadow-lg">
      {photo ? (
        <Image
          src={photo}
          alt={name}
          width={96}
          height={96}
          className="size-24 rounded-full object-cover"
        />
      ) : (
        <span className="material-symbols-outlined text-gp-primary text-5xl">
          person
        </span>
      )}
    </div>

    <h1 className="text-4xl font-light tracking-tight text-gp-ink-strong dark:text-gp-ink-strong mb-2">
      {name}
    </h1>
    {email && (
      <p className="text-gp-ink-muted dark:text-gp-ink-soft text-xs">{email}</p>
    )}

    <button
      onClick={onOpenInDashboard}
      className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border border-gp-primary/30 text-gp-primary hover:bg-gp-primary/5 transition-all dark:border-gp-primary/40 dark:hover:bg-gp-primary/10 cursor-pointer"
      aria-label={`View ${name} in the dashboard`}
    >
      <span className="material-symbols-outlined text-[16px]">dashboard</span>
      View in dashboard
    </button>
  </div>
)

const AttributeCard: FC<{ icon: string; title: string; text: string }> = ({
  icon,
  title,
  text,
}) => (
  <div className="flex flex-col gap-4 h-full">
    <SectionHeader icon={icon} title={title} />
    <ProfileCard className="flex-1">
      <LinkifiedText text={text} className={bodyTextClass} />
    </ProfileCard>
  </div>
)

/**
 * Description plus the free-text attribute grid. `description` is often the
 * only rich field an upload-created PersonPulse carries (GOAL-314), so it gets
 * its own full-width block above the grid.
 */
export const ProfileAttributes: FC<{ pii: any }> = ({ pii }) => {
  const attributes: Array<{ icon: string; title: string; text?: string }> = [
    { icon: 'volunteer_activism', title: 'Fields of Care', text: pii?.fieldsOfCare },
    { icon: 'favorite', title: 'Passions', text: pii?.passions },
    { icon: 'psychology', title: 'Traits', text: pii?.traits },
    { icon: 'interests', title: 'Interests', text: pii?.interests },
    { icon: 'menu_book', title: 'Care Manual', text: pii?.careManual },
    { icon: 'star', title: 'Favorites', text: pii?.favorites },
  ]
  const present = attributes.filter((a) => a.text)

  return (
    <>
      {pii?.description && (
        <div className="mb-12 flex flex-col gap-4">
          <SectionHeader icon="notes" title="Description" />
          <ProfileCard>
            <LinkifiedText text={pii.description} className={bodyTextClass} />
          </ProfileCard>
        </div>
      )}

      {present.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {present.map((a) => (
            <AttributeCard
              key={a.title}
              icon={a.icon}
              title={a.title}
              text={a.text as string}
            />
          ))}
        </div>
      )}
    </>
  )
}

export const ProfileConnections: FC<{
  connections: any[]
  connectionEdges?: any[] | null
  onOpenPerson: (id: string) => void
  onAdd: () => void
  onEdit: (id: string, why: string, interests: string) => void
  onDelete: (id: string) => void
  updating: boolean
  deleting: boolean
}> = ({
  connections,
  connectionEdges,
  onOpenPerson,
  onAdd,
  onEdit,
  onDelete,
  updating,
  deleting,
}) => (
  <div className="mb-12">
    <div className="flex items-center justify-between gap-3 mb-4">
      <SectionHeader icon="group_work" title="Connections" />
      <button
        onClick={onAdd}
        className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gp-primary/30 text-gp-primary hover:bg-gp-primary/5 transition-all dark:border-gp-primary/40 dark:hover:bg-gp-primary/10 cursor-pointer"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
        Add Connection
      </button>
    </div>

    {connections.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {connections.map((connection: any, idx: number) => {
          const edge = connectionEdges?.find(
            (e: any) => e.connectedPersonId === connection.id
          )
          return (
            <ProfileCard
              key={idx}
              onClick={() => connection.id && onOpenPerson(connection.id)}
            >
              <div className="flex flex-col gap-3 cursor-pointer">
                <div className="flex items-center gap-3 hover:bg-gp-glass-bg/50 dark:hover:bg-white/5 transition-colors rounded px-2 -mx-2">
                  <div className="size-10 rounded-full bg-linear-to-br from-gp-primary/20 to-gp-primary/10 flex items-center justify-center">
                    {connection.photo ? (
                      <Image
                        src={connection.photo}
                        alt={connection.name}
                        width={40}
                        height={40}
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-gp-primary text-xl">
                        person
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gp-ink-strong dark:text-white truncate">
                      {connection.name}
                    </h4>
                  </div>
                  <button
                    className="cursor-pointer text-[8px] text-gp-ink-muted dark:text-gp-ink-soft hover:text-gp-primary transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(
                        connection.id,
                        edge?.why || '',
                        edge?.interests || ''
                      )
                    }}
                    disabled={updating}
                    aria-label="Edit connection"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      edit
                    </span>
                  </button>
                  <button
                    className="cursor-pointer text-[8px] text-red-400 hover:text-red-800 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(connection.id)
                    }}
                    disabled={deleting}
                    aria-label="Delete connection"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      delete
                    </span>
                  </button>
                </div>
                {edge && (
                  <div className="space-y-2 border-t border-gp-glass-border pt-3">
                    {edge.why && (
                      <div>
                        <p className="text-[10px] font-semibold text-gp-ink mb-1 uppercase">
                          Why
                        </p>
                        <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed">
                          {edge.why}
                        </p>
                      </div>
                    )}
                    {edge.interests && (
                      <div>
                        <p className="text-[10px] font-semibold text-gp-ink mb-1 uppercase">
                          Interests
                        </p>
                        <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft leading-relaxed">
                          {edge.interests}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ProfileCard>
          )
        })}
      </div>
    ) : (
      <ProfileCard>
        <p className={emptyTextClass}>
          No connections yet. Use Add Connection to create one.
        </p>
      </ProfileCard>
    )}
  </div>
)
