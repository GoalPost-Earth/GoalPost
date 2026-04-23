'use client'

import { useRouter } from 'next/navigation'
import { SectionHeader } from '@/components/persons/section-header'
import { ProfileCard } from '@/components/persons/profile-card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface SpaceDetailsSectionsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  space: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  owner: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  members: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contexts: any[]
  totalPulses: number
  canManageMembers: boolean
  isMemberActionLoading: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  permissionMembers: any[]
  onCreateField: () => void
  onEditField: (e: React.MouseEvent, fieldId: string) => void
  onShowPermissions: () => void
  onChangeMemberRole: (
    memberId: string,
    role: 'ADMIN' | 'MEMBER' | 'GUEST'
  ) => void
  onRemoveMember: (memberId: string, memberName: string) => void
  getContextHref?: (contextId: string) => string
}

export function SpaceDetailsSections({
  space,
  owner,
  members,
  contexts,
  totalPulses,
  canManageMembers,
  isMemberActionLoading,
  onCreateField,
  onEditField,
  onShowPermissions,
  onChangeMemberRole,
  onRemoveMember,
  getContextHref,
}: SpaceDetailsSectionsProps) {
  const router = useRouter()

  const createdDate = new Date(space.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      {/* Space Info */}
      <div className="flex flex-col gap-4">
        <SectionHeader icon="info" title="Space Info" />
        <ProfileCard>
          <div className="space-y-3">
            <div>
              <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                Type
              </span>
              <p className="text-xs font-semibold text-gp-ink-strong dark:text-white">
                {space.__typename}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                Visibility
              </span>
              <p className="text-xs text-gp-ink-strong dark:text-white capitalize">
                {space.visibility}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                Created
              </span>
              <p className="text-xs text-gp-ink-strong dark:text-white">
                {createdDate}
              </p>
            </div>
          </div>
        </ProfileCard>
      </div>

      {/* Owner Info */}
      <div className="flex flex-col gap-4">
        <SectionHeader icon="person" title="Owner" />
        <ProfileCard>
          <div className="space-y-2">
            <div>
              <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                Type
              </span>
              <p className="text-xs text-gp-ink-strong dark:text-white">
                {owner?.__typename}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                Name
              </span>
              <p className="text-xs font-semibold text-gp-ink-strong dark:text-white">
                {owner?.name}
              </p>
            </div>
            {owner?.__typename === 'Person' && owner?.email && (
              <div>
                <span className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                  Email
                </span>
                <p className="text-xs text-gp-ink-soft dark:text-gp-ink-soft truncate">
                  {owner.email}
                </p>
              </div>
            )}
          </div>
        </ProfileCard>
      </div>

      {/* Members (WeSpace only) */}
      {space.__typename === 'WeSpace' && (
        <div className="flex flex-col gap-4 md:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <SectionHeader icon="group" title="Members" />
            {canManageMembers && (
              <button
                onClick={onShowPermissions}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 text-gp-ink-strong dark:text-gp-ink-strong hover:bg-white/80 dark:hover:bg-white/10 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  person_add
                </span>
                Add Member
              </button>
            )}
          </div>
          <ProfileCard>
            <div className="space-y-3">
              {members.length > 0 ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                members.map((membership: any, idx: number) => {
                  const memberData = membership.member?.[0]
                  if (!memberData) return null
                  return (
                    <div
                      key={membership.id}
                      onClick={() =>
                        memberData.id &&
                        router.push(
                          `/protected/dashboard/persons/${memberData.id}`
                        )
                      }
                      className={
                        idx > 0
                          ? 'border-t border-gp-glass-border p-4 cursor-pointer hover:bg-gp-glass-bg/50 dark:hover:bg-white/5 transition-colors rounded-2xl px-2 -mx-2'
                          : 'cursor-pointer hover:bg-gp-glass-bg/50 dark:hover:bg-white/5 transition-colors rounded p-4 -mx-2'
                      }
                    >
                      <div className="flex justify-between items-start mb-1 gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] uppercase font-semibold text-gp-accent-glow">
                              {memberData.__typename}
                            </span>
                            {!canManageMembers && (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] text-slate-600 font-semibold dark:bg-white/10 dark:border-white/10 dark:text-white/60">
                                {membership.role}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white">
                            {memberData.name}
                          </h4>
                          {memberData.__typename === 'Person' &&
                            memberData.email && (
                              <p className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                                {memberData.email}
                              </p>
                            )}
                        </div>
                        {canManageMembers && (
                          <div
                            className="flex min-w-36 flex-col items-stretch gap-2 sm:items-end"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Select
                              value={membership.role}
                              onValueChange={(value) =>
                                onChangeMemberRole(
                                  memberData.id,
                                  value as 'ADMIN' | 'MEMBER' | 'GUEST'
                                )
                              }
                              disabled={isMemberActionLoading}
                            >
                              <SelectTrigger
                                className={cn(
                                  'w-full text-xs sm:text-sm',
                                  membership.role === 'ADMIN'
                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400'
                                    : membership.role === 'MEMBER'
                                      ? 'bg-gp-goal/10 border-gp-goal text-gp-goal'
                                      : 'bg-gp-primary/10 border-gp-primary text-gp-primary'
                                )}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="z-100">
                                <SelectItem value="GUEST">
                                  Guest (View)
                                </SelectItem>
                                <SelectItem value="MEMBER">
                                  Member (Edit)
                                </SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <button
                              onClick={() =>
                                onRemoveMember(memberData.id, memberData.name)
                              }
                              disabled={isMemberActionLoading}
                              className="px-2 sm:px-3 py-1 sm:py-2 rounded text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
                  No members yet
                </p>
              )}
            </div>
          </ProfileCard>
        </div>
      )}

      {/* Contexts */}
      <div className="flex flex-col gap-4 md:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <SectionHeader icon="category" title="Field Contexts" />
          <button
            onClick={onCreateField}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 text-gp-ink-strong dark:text-gp-ink-strong hover:bg-white/80 dark:hover:bg-white/10 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add Field Context
          </button>
        </div>
        <ProfileCard>
          <div className="space-y-3">
            {contexts.length > 0 ? (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              contexts.map((context: any, idx: number) => (
                <div
                  key={context.id}
                  onClick={() =>
                    context.id &&
                    router.push(
                      getContextHref
                        ? getContextHref(context.id)
                        : `/protected/dashboard/field-context/${context.id}`
                    )
                  }
                  className={
                    idx > 0
                      ? 'border-t border-gp-glass-border pt-3 cursor-pointer hover:bg-gp-glass-bg/50 dark:hover:bg-white/5 transition-colors rounded px-2 -mx-2'
                      : 'cursor-pointer hover:bg-gp-glass-bg/50 dark:hover:bg-white/5 transition-colors rounded px-2 -mx-2'
                  }
                >
                  <div className="flex justify-between items-start mb-1 p-4 rounded-2xl">
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-gp-ink-strong dark:text-white">
                        {context.title}
                      </h4>
                      {context.emergentName && (
                        <p className="text-[10px] text-gp-ink-muted dark:text-gp-ink-soft italic">
                          &quot;{context.emergentName}&quot;
                        </p>
                      )}
                    </div>
                    <div
                      className="flex items-start gap-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="pt-2 text-[10px] text-gp-ink-muted dark:text-gp-ink-soft">
                        {context.pulses?.length || 0} pulses
                      </span>
                      <button
                        onClick={(e) => onEditField(e, context.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/50 text-gp-ink-strong transition-all hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-gp-ink-strong dark:hover:bg-white/10"
                        aria-label={`Edit ${context.title}`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          edit
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-gp-ink-muted dark:text-gp-ink-soft">
                No contexts yet
              </p>
            )}
          </div>
        </ProfileCard>
      </div>

      {/* Summary */}
      <div className="flex flex-col gap-4 md:col-span-2">
        <SectionHeader icon="summarize" title="Summary" />
        <ProfileCard>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                Total Contexts
              </span>
              <span className="text-lg font-bold text-gp-primary">
                {contexts.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                Total Pulses
              </span>
              <span className="text-lg font-bold text-gp-primary">
                {totalPulses}
              </span>
            </div>
            {space.__typename === 'WeSpace' && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gp-ink-muted dark:text-gp-ink-soft">
                  Members
                </span>
                <span className="text-lg font-bold text-gp-primary">
                  {members.length}
                </span>
              </div>
            )}
          </div>
        </ProfileCard>
      </div>
    </div>
  )
}
