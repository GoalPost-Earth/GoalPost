'use client'

import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Mail, MapPin, Users, Heart, Sparkles, Target } from 'lucide-react'

export interface PersonProfileData {
  id: string
  firstName: string
  lastName: string
  name: string
  email?: string
  pronouns?: string
  location?: string
  photo?: string
  status: string
  passions?: string
  traits?: string
  interests?: string
  fieldsOfCare?: string
  favorites?: string
  communities?: string[]
  connectionCount?: number
}

interface PersonCardProps {
  person: PersonProfileData
  className?: string
}

export function PersonCard({ person, className }: PersonCardProps) {
  const initials = `${person.firstName[0]}${person.lastName[0]}`.toUpperCase()

  // Parse comma-separated fields into arrays
  const parseField = (field?: string) => {
    if (!field) return []
    return field
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  const passionsList = parseField(person.passions)
  const traitsList = parseField(person.traits)
  const interestsList = parseField(person.interests)
  const fieldsList = parseField(person.fieldsOfCare)
  const favoritesList = parseField(person.favorites)

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={person.photo} alt={person.name} />
            <AvatarFallback className="text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-xl">
              {person.name}
              {person.pronouns && (
                <span className="text-muted-foreground ml-2 text-sm font-normal">
                  ({person.pronouns})
                </span>
              )}
            </CardTitle>
            {person.location && (
              <CardDescription className="mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {person.location}
              </CardDescription>
            )}
            {person.email && (
              <CardDescription className="mt-1 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {person.email}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Communities */}
        {person.communities && person.communities.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              <span>Communities</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {person.communities.map((community, idx) => (
                <span
                  key={idx}
                  className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium"
                >
                  {community}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Connection Count */}
        {person.connectionCount !== undefined && person.connectionCount > 0 && (
          <div className="text-muted-foreground text-sm">
            <Users className="mr-1 inline h-4 w-4" />
            {person.connectionCount} connection
            {person.connectionCount !== 1 ? 's' : ''}
          </div>
        )}

        {/* Passions */}
        {passionsList.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Heart className="h-4 w-4 text-red-500" />
              <span>Passions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {passionsList.map((passion, idx) => (
                <span
                  key={idx}
                  className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 rounded-md px-2 py-1 text-xs"
                >
                  {passion}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {interestsList.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span>Interests</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {interestsList.map((interest, idx) => (
                <span
                  key={idx}
                  className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-md px-2 py-1 text-xs"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Traits */}
        {traitsList.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4 text-purple-500" />
              <span>Traits</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {traitsList.map((trait, idx) => (
                <span
                  key={idx}
                  className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 rounded-md px-2 py-1 text-xs"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Fields of Care */}
        {fieldsList.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Fields of Care</div>
            <div className="flex flex-wrap gap-2">
              {fieldsList.map((field, idx) => (
                <span
                  key={idx}
                  className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 rounded-md px-2 py-1 text-xs"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Favorites */}
        {favoritesList.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Favorites</div>
            <div className="flex flex-wrap gap-2">
              {favoritesList.map((favorite, idx) => (
                <span
                  key={idx}
                  className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 rounded-md px-2 py-1 text-xs"
                >
                  {favorite}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="border-t pt-4">
          <span className="text-muted-foreground text-xs">
            Status:{' '}
            <span className="text-foreground font-medium">{person.status}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
