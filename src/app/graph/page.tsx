'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

interface GraphStats {
  personCount: number
  communityCount: number
  meSpaceCount: number
  weSpaceCount: number
  contextCount: number
  goalCount: number
  resourceCount: number
  storyCount: number
  resonanceCount: number
  linkCount: number
}

interface Person {
  person: string
  email: string
  spacesOwned: number
  contextsInSpaces: number
  pulsesInContexts: number
}

interface Space {
  spaceName: string
  spaceType: string
  visibility: string
  owner: string
  members: string[]
}

interface Resonance {
  resonancePattern: string
  description: string
  connections: number
}

export default function GraphVisualization() {
  const [stats, setStats] = useState<GraphStats | null>(null)
  const [people, setPeople] = useState<Person[]>([])
  const [spaces, setSpaces] = useState<Space[]>([])
  const [resonances, setResonances] = useState<Resonance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real implementation, you'd fetch from your API
    // For now, we'll use mock data based on what we created
    const mockStats: GraphStats = {
      personCount: 4,
      communityCount: 1,
      meSpaceCount: 1,
      weSpaceCount: 2,
      contextCount: 4,
      goalCount: 4,
      resourceCount: 4,
      storyCount: 3,
      resonanceCount: 5,
      linkCount: 6,
    }

    const mockPeople: Person[] = [
      {
        person: 'John Dagy',
        email: 'jaedagy@gmail.com',
        spacesOwned: 2,
        contextsInSpaces: 3,
        pulsesInContexts: 6,
      },
      {
        person: 'Naa Adjeley',
        email: 'naa@codefoundry.dev',
        spacesOwned: 0,
        contextsInSpaces: 0,
        pulsesInContexts: 4,
      },
      {
        person: 'Sarah Chen',
        email: 'sarah@example.com',
        spacesOwned: 0,
        contextsInSpaces: 0,
        pulsesInContexts: 1,
      },
      {
        person: 'Mike Rodriguez',
        email: 'mike@example.com',
        spacesOwned: 0,
        contextsInSpaces: 0,
        pulsesInContexts: 1,
      },
    ]

    const mockSpaces: Space[] = [
      {
        spaceName: "John's Personal Space",
        spaceType: 'MeSpace',
        visibility: 'PRIVATE',
        owner: 'John Dagy',
        members: [],
      },
      {
        spaceName: 'CodeFoundry Collaboration Space',
        spaceType: 'WeSpace',
        visibility: 'SHARED',
        owner: 'CodeFoundry Team',
        members: ['John Dagy', 'Naa Adjeley', 'Sarah Chen', 'CodeFoundry Team'],
      },
      {
        spaceName: 'GoalPost Project Space',
        spaceType: 'WeSpace',
        visibility: 'SHARED',
        owner: 'John Dagy',
        members: ['John Dagy', 'Naa Adjeley', 'Mike Rodriguez'],
      },
    ]

    const mockResonances: Resonance[] = [
      {
        resonancePattern: 'Focus',
        description: 'Narrowing attention toward essential priorities',
        connections: 2,
      },
      {
        resonancePattern: 'Momentum',
        description: 'Building forward energy and confidence',
        connections: 1,
      },
      {
        resonancePattern: 'Alignment',
        description: 'Goals and resources moving in harmony',
        connections: 1,
      },
      {
        resonancePattern: 'Growth',
        description: 'Learning and capability expansion',
        connections: 1,
      },
      {
        resonancePattern: 'Intensity',
        description: 'High-energy focused effort period',
        connections: 1,
      },
    ]

    setTimeout(() => {
      setStats(mockStats)
      setPeople(mockPeople)
      setSpaces(mockSpaces)
      setResonances(mockResonances)
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            GoalPost Graph Database
          </h1>
          <p className="text-muted-foreground">
            Visualizing the pulse-first relational ontology
          </p>
        </div>
        <Link href="/">
          <Button variant="outline">← Back to Chat</Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>People & Communities</CardDescription>
            <CardTitle className="text-3xl">
              {(stats?.personCount ?? 0) + (stats?.communityCount ?? 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {stats?.personCount} people, {stats?.communityCount} community
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Spaces</CardDescription>
            <CardTitle className="text-3xl">
              {(stats?.meSpaceCount ?? 0) + (stats?.weSpaceCount ?? 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {stats?.meSpaceCount} private, {stats?.weSpaceCount} shared
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Contexts</CardDescription>
            <CardTitle className="text-3xl">{stats?.contextCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Thematic containers
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pulses</CardDescription>
            <CardTitle className="text-3xl">
              {(stats?.goalCount ?? 0) +
                (stats?.resourceCount ?? 0) +
                (stats?.storyCount ?? 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {stats?.goalCount}G {stats?.resourceCount}R {stats?.storyCount}S
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Resonance</CardDescription>
            <CardTitle className="text-3xl">{stats?.resonanceCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {stats?.linkCount} connections
            </div>
          </CardContent>
        </Card>
      </div>

      {/* People Cards */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          LifeSensors (People & Communities)
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {people.map((person) => (
            <Card key={person.email}>
              <CardHeader>
                <CardTitle className="text-lg">{person.person}</CardTitle>
                <CardDescription className="text-xs">
                  {person.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spaces Owned</span>
                  <Badge variant="secondary">{person.spacesOwned}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Contexts</span>
                  <Badge variant="secondary">{person.contextsInSpaces}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pulses</span>
                  <Badge variant="secondary">{person.pulsesInContexts}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Spaces */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Spaces (Privacy Boundaries)</h2>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
          {spaces.map((space) => (
            <Card
              key={space.spaceName}
              className={
                space.spaceType === 'MeSpace'
                  ? 'border-blue-500'
                  : 'border-green-500'
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{space.spaceName}</CardTitle>
                    <CardDescription className="text-xs">
                      Owner: {space.owner}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      space.spaceType === 'MeSpace' ? 'default' : 'outline'
                    }
                  >
                    {space.spaceType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {space.visibility}
                  </Badge>
                </div>
                {space.members.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">
                      Members:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {space.members.map((member) => (
                        <Badge
                          key={member}
                          variant="outline"
                          className="text-xs"
                        >
                          {member}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Resonance Patterns */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          Resonance Patterns (AI-Discovered Meaning)
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {resonances.map((resonance) => (
            <Card
              key={resonance.resonancePattern}
              className="border-purple-500/50"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    {resonance.resonancePattern}
                  </CardTitle>
                  <Badge variant="secondary">{resonance.connections}</Badge>
                </div>
                <CardDescription className="text-xs line-clamp-2">
                  {resonance.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Pulse Type Distribution */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Pulse Distribution</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-blue-500">
                  {stats?.goalCount}
                </div>
                <div className="text-sm text-muted-foreground">Goal Pulses</div>
                <Badge variant="outline" className="bg-blue-500/10">
                  ACTIVE
                </Badge>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-green-500">
                  {stats?.resourceCount}
                </div>
                <div className="text-sm text-muted-foreground">
                  Resource Pulses
                </div>
                <Badge variant="outline" className="bg-green-500/10">
                  AVAILABLE
                </Badge>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-purple-500">
                  {stats?.storyCount}
                </div>
                <div className="text-sm text-muted-foreground">
                  Story Pulses
                </div>
                <Badge variant="outline" className="bg-purple-500/10">
                  NARRATIVE
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Architecture Flow */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Data Flow Architecture</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-center">
              <div className="flex-1">
                <div className="text-2xl font-bold mb-2">📝 Write Path</div>
                <div className="text-sm text-muted-foreground">
                  LifeSensor → Space → Context → Pulse
                </div>
              </div>
              <div className="text-4xl">→</div>
              <div className="flex-1">
                <div className="text-2xl font-bold mb-2">🤖 AI Path</div>
                <div className="text-sm text-muted-foreground">
                  Read Pulses → Discover Patterns → Create Resonance
                </div>
              </div>
              <div className="text-4xl">→</div>
              <div className="flex-1">
                <div className="text-2xl font-bold mb-2">👁️ Read Path</div>
                <div className="text-sm text-muted-foreground">
                  Query Contexts → View Resonance → Explore Meaning
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
