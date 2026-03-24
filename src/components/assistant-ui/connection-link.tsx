'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, ChevronRight } from 'lucide-react'

export interface ConnectionData {
  id: string
  firstName?: string
  lastName?: string
  name: string
  email?: string
  photo?: string
  why?: string
  interests?: string
  sharedCommunities?: string[]
}

interface ConnectionLinkProps {
  connection: ConnectionData
  variant?: 'compact' | 'detailed'
}

export function ConnectionLink({
  connection,
  variant = 'detailed',
}: ConnectionLinkProps) {
  const getInitials = (conn: ConnectionData) => {
    if (conn.firstName && conn.lastName) {
      return `${conn.firstName[0]}${conn.lastName[0]}`.toUpperCase()
    }
    const parts = conn.name.split(' ')
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : (parts[0][0] || '?').toUpperCase()
  }

  if (variant === 'compact') {
    return (
      <Link
        href={`/protected/dashboard/persons/${connection.id}`}
        className="inline-flex items-center gap-1 font-medium text-gp-primary hover:text-gp-primary/80 hover:underline cursor-pointer transition-colors"
      >
        {connection.name}
        <ChevronRight className="h-3 w-3" />
      </Link>
    )
  }

  return (
    <Link
      href={`/protected/dashboard/persons/${connection.id}`}
      className="block group rounded-md border border-border/50 bg-muted/30 hover:bg-muted/60 px-3 py-2 text-sm transition-all duration-200 hover:border-gp-primary/30 hover:shadow-md cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <Avatar className="h-8 w-8 mt-0.5 shrink-0">
            <AvatarImage src={connection.photo} alt={connection.name} />
            <AvatarFallback className="text-xs">
              {getInitials(connection)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-foreground group-hover:text-gp-primary transition-colors truncate">
              {connection.name}
            </div>
            {connection.email && (
              <div className="text-muted-foreground text-xs mt-0.5 truncate">
                {connection.email}
              </div>
            )}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-gp-primary mt-0.5 transition-colors shrink-0" />
      </div>

      {(connection.why || connection.interests) && (
        <div className="mt-2 space-y-1 ml-10">
          {connection.why && (
            <div className="text-muted-foreground text-xs">
              <span className="font-medium">Connection:</span> {connection.why}
            </div>
          )}
          {connection.interests && (
            <div className="text-muted-foreground text-xs">
              <span className="font-medium">Shared interests:</span>{' '}
              {connection.interests}
            </div>
          )}
        </div>
      )}

      {connection.sharedCommunities &&
        connection.sharedCommunities.length > 0 && (
          <div className="mt-2 ml-10 flex flex-wrap gap-1">
            {connection.sharedCommunities.map((community, idx) => (
              <span
                key={idx}
                className="bg-primary/20 text-primary/90 text-xs rounded px-2 py-0.5"
              >
                {community}
              </span>
            ))}
          </div>
        )}

      <div className="mt-2 ml-10 text-xs text-muted-foreground flex items-center gap-1 group-hover:text-gp-primary transition-colors">
        <Users className="h-3 w-3" />
        Click to view full profile
      </div>
    </Link>
  )
}
