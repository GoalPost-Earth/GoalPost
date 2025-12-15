'use client'

import { makeAssistantToolUI } from '@assistant-ui/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { User, Mail, Heart, Target, Users } from 'lucide-react'

// Type definitions matching Neo4j Person schema
type PersonProfile = {
  name: string
  firstName?: string
  lastName?: string
  email?: string
  pronouns?: string
  passions?: string[]
  timezone?: string
  bio?: string
}

type SearchPersonArgs = {
  name: string
}

type SearchPersonResult = {
  found: boolean
  count: number
  people?: PersonProfile[]
  message?: string
  needsDisambiguation?: boolean
}

/**
 * Beautiful profile card displayed when search_person tool is called
 * This creates a canvas-like display alongside the chat
 */
export const PersonProfileCardUI = makeAssistantToolUI<
  SearchPersonArgs,
  SearchPersonResult
>({
  toolName: 'search_person',
  render: ({ args, status, result }) => {
    // Loading state - show skeleton
    if (status.type === 'running') {
      return (
        <Card className="my-4 w-full overflow-hidden border-2 border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </CardContent>
        </Card>
      )
    }

    // Error or incomplete state
    if (status.type === 'incomplete') {
      return (
        <Card className="my-4 border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">
              Failed to search for {args.name}
            </p>
          </CardContent>
        </Card>
      )
    }

    // No result yet
    if (!result) return null

    // Person not found
    if (!result.found || !result.people || result.people.length === 0) {
      return (
        <Card className="my-4 border-muted">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              {result.message || `No profile found for "${args.name}"`}
            </p>
          </CardContent>
        </Card>
      )
    }

    // Multiple people found - show disambiguation
    if (result.needsDisambiguation && result.count > 1) {
      return (
        <Card className="my-4 border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-600" />
              Multiple matches found
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.people.map((person, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border border-amber-200 bg-white p-3 dark:bg-amber-950/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                  <User className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{person.name}</p>
                  {person.email && (
                    <p className="text-sm text-muted-foreground">
                      {person.email}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <p className="text-sm text-muted-foreground">
              {result.message || 'Please specify which person you meant.'}
            </p>
          </CardContent>
        </Card>
      )
    }

    // Single person found - show beautiful profile card
    const person = result.people[0]

    return (
      <Card className="my-4 w-full overflow-hidden border-2 border-primary/30 shadow-xl transition-all hover:shadow-2xl">
        {/* Header with gradient background */}
        <CardHeader className="bg-gradient-to-br from-primary/20 via-primary/10 to-background pb-12">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 ring-4 ring-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  {person.name}
                </CardTitle>
                {person.pronouns && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {person.pronouns}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-6 pt-6">
          {/* Bio */}
          {person.bio && (
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm leading-relaxed">{person.bio}</p>
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-3">
            {person.email && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${person.email}`}
                    className="font-medium hover:underline"
                  >
                    {person.email}
                  </a>
                </div>
              </div>
            )}

            {person.timezone && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Timezone</p>
                  <p className="font-medium">{person.timezone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Passions */}
          {person.passions && person.passions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Heart className="h-4 w-4 text-primary" />
                <span>Passions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {person.passions.map((passion, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1 text-xs"
                  >
                    {passion}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  },
})
