'use client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { useState } from 'react'

import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArrowLeft } from 'lucide-react'
import {
  GET_GRAPH_STATS,
  GET_GRAPH_PEOPLE,
  GET_GRAPH_SPACES,
  GET_GRAPH_RESONANCES,
  GET_PERSON_DETAILS,
  GET_SPACE_DETAILS,
  GET_RESONANCE_DETAILS,
} from '@/app/graphql/queries'

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
  id: string
  person: string
  email: string
  spacesOwned: number
  contextsInSpaces: number
  pulsesInContexts: number
}

interface Space {
  id: string
  spaceName: string
  spaceType: string
  visibility: string
  owner: string
  members: string[]
}

interface Resonance {
  id: string
  resonancePattern: string
  description: string
  connections: number
}

export default function StatsVisualization() {
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null)
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null)
  const [selectedResonance, setSelectedResonance] = useState<string | null>(
    null
  )

  // Fetch graph statistics
  const { data: statsData, loading: statsLoading } = useQuery(GET_GRAPH_STATS)

  // Fetch people data
  const { data: peopleData, loading: peopleLoading } =
    useQuery(GET_GRAPH_PEOPLE)

  // Fetch spaces data
  const { data: spacesData, loading: spacesLoading } =
    useQuery(GET_GRAPH_SPACES)

  // Fetch resonances data
  const { data: resonancesData, loading: resonancesLoading } =
    useQuery(GET_GRAPH_RESONANCES)

  // Fetch detail data based on selection
  const { data: personDetailsData, loading: personDetailsLoading } = useQuery(
    GET_PERSON_DETAILS,
    {
      variables: { email: selectedPerson || '' },
      skip: !selectedPerson,
    }
  )

  const { data: spaceDetailsData, loading: spaceDetailsLoading } = useQuery(
    GET_SPACE_DETAILS,
    {
      variables: { spaceId: selectedSpace || '' },
      skip: !selectedSpace,
    }
  )

  const { data: resonanceDetailsData, loading: resonanceDetailsLoading } =
    useQuery(GET_RESONANCE_DETAILS, {
      variables: { resonanceId: selectedResonance || '' },
      skip: !selectedResonance,
    })

  const loading =
    statsLoading || peopleLoading || spacesLoading || resonancesLoading

  // Transform stats data
  const stats: GraphStats | null = statsData
    ? {
        personCount: statsData.peopleAggregate?.count || 0,
        communityCount: statsData.communitiesAggregate?.count || 0,
        meSpaceCount: statsData.meSpacesAggregate?.count || 0,
        weSpaceCount: statsData.weSpacesAggregate?.count || 0,
        contextCount: statsData.fieldContextsAggregate?.count || 0,
        goalCount: statsData.goalPulsesAggregate?.count || 0,
        resourceCount: statsData.resourcePulsesAggregate?.count || 0,
        storyCount: statsData.storyPulsesAggregate?.count || 0,
        resonanceCount: statsData.fieldResonancesAggregate?.count || 0,
        linkCount: statsData.resonanceLinksAggregate?.count || 0,
      }
    : null

  // Transform people data
  const people: Person[] =
    peopleData?.people?.map((person) => {
      const spacesOwned = person.ownsSpaces?.length || 0
      let contextsInSpaces = 0
      let pulsesInContexts = 0

      person.ownsSpaces?.forEach((space) => {
        const contexts = space.contexts || []
        contextsInSpaces += contexts.length
        contexts.forEach((context) => {
          pulsesInContexts += context.pulses?.length || 0
        })
      })

      return {
        id: person.id,
        person: person.name || '',
        email: person.email || '',
        spacesOwned,
        contextsInSpaces,
        pulsesInContexts,
      }
    }) || []

  // Transform spaces data
  const spaces: Space[] = [
    ...(spacesData?.meSpaces?.map((space) => ({
      id: space.id,
      spaceName: space.name || '',
      spaceType: 'MeSpace',
      visibility: space.visibility || 'PRIVATE',
      owner: space.owner?.[0]?.name || '',
      members: space.members?.map((m) => m.name || '') || [],
    })) || []),
    ...(spacesData?.weSpaces?.map((space) => ({
      id: space.id,
      spaceName: space.name || '',
      spaceType: 'WeSpace',
      visibility: space.visibility || 'SHARED',
      owner: space.owner?.[0]?.name || '',
      members: space.members?.map((m) => m.name || '') || [],
    })) || []),
  ]

  // Transform resonances data
  const resonances: Resonance[] =
    resonancesData?.fieldResonances?.map((resonance) => ({
      id: resonance.id,
      resonancePattern: resonance.label || '',
      description: resonance.description || '',
      connections: 0,
    })) || []

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-12 w-64 bg-slate-700" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 bg-slate-700" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <ArrowLeft className="w-5 h-5 text-slate-300" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  Database Statistics
                </h1>
                <p className="text-slate-300">
                  Live metrics from the neo4j graph
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-300">
                People & Communities
              </CardDescription>
              <CardTitle className="text-3xl text-white">
                {(stats?.personCount ?? 0) + (stats?.communityCount ?? 0)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-slate-400">
                {stats?.personCount} people, {stats?.communityCount} community
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-300">
                Spaces
              </CardDescription>
              <CardTitle className="text-3xl text-white">
                {(stats?.meSpaceCount ?? 0) + (stats?.weSpaceCount ?? 0)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-slate-400">
                {stats?.meSpaceCount} private, {stats?.weSpaceCount} shared
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-300">
                Contexts
              </CardDescription>
              <CardTitle className="text-3xl text-white">
                {stats?.contextCount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-slate-400">Thematic containers</div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-300">
                Pulses
              </CardDescription>
              <CardTitle className="text-3xl text-white">
                {(stats?.goalCount ?? 0) +
                  (stats?.resourceCount ?? 0) +
                  (stats?.storyCount ?? 0)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-slate-400">
                {stats?.goalCount}G {stats?.resourceCount}R {stats?.storyCount}S
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-300">
                Resonance
              </CardDescription>
              <CardTitle className="text-3xl text-white">
                {stats?.resonanceCount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-slate-400">
                {stats?.linkCount} connections
              </div>
            </CardContent>
          </Card>
        </div>

        {/* People Cards */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-white">LifeSensors</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {people.map((person) => (
              <Card
                key={person.email}
                className="cursor-pointer border-white/10 bg-white/5 backdrop-blur hover:bg-white/10 transition-all"
                onClick={() => setSelectedPerson(person.email)}
              >
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    {person.person}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    {person.email}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Spaces Owned</span>
                    <Badge variant="secondary">{person.spacesOwned}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Contexts</span>
                    <Badge variant="secondary">{person.contextsInSpaces}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Pulses</span>
                    <Badge variant="secondary">{person.pulsesInContexts}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Spaces */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-white">Spaces</h2>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
            {spaces.map((space) => (
              <Card
                key={space.spaceName}
                className="cursor-pointer border-white/10 bg-white/5 backdrop-blur hover:bg-white/10 transition-all"
                onClick={() => setSelectedSpace(space.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg text-white">
                        {space.spaceName}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400">
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
                      <div className="text-xs font-medium text-slate-400">
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
          <h2 className="text-2xl font-bold mb-4 text-white">
            Resonance Patterns
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {resonances.map((resonance) => (
              <Card
                key={resonance.resonancePattern}
                className="border-white/10 bg-white/5 backdrop-blur cursor-pointer hover:bg-white/10 transition-all"
                onClick={() => setSelectedResonance(resonance.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-white">
                      {resonance.resonancePattern}
                    </CardTitle>
                    <Badge variant="secondary">{resonance.connections}</Badge>
                  </div>
                  <CardDescription className="text-xs line-clamp-2 text-slate-400">
                    {resonance.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Pulse Type Distribution */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-white">
            Pulse Distribution
          </h2>
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold text-blue-400">
                    {stats?.goalCount}
                  </div>
                  <div className="text-sm text-slate-400">Goal Pulses</div>
                  <Badge variant="outline" className="bg-blue-500/10">
                    ACTIVE
                  </Badge>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold text-green-400">
                    {stats?.resourceCount}
                  </div>
                  <div className="text-sm text-slate-400">Resource Pulses</div>
                  <Badge variant="outline" className="bg-green-500/10">
                    AVAILABLE
                  </Badge>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold text-purple-400">
                    {stats?.storyCount}
                  </div>
                  <div className="text-sm text-slate-400">Story Pulses</div>
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
          <h2 className="text-2xl font-bold mb-4 text-white">
            Data Architecture
          </h2>
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-center">
                <div className="flex-1">
                  <div className="text-2xl font-bold mb-2">📝 Write Path</div>
                  <div className="text-sm text-slate-400">
                    LifeSensor → Space → Context → Pulse
                  </div>
                </div>
                <div className="text-4xl">→</div>
                <div className="flex-1">
                  <div className="text-2xl font-bold mb-2">🤖 AI Path</div>
                  <div className="text-sm text-slate-400">
                    Read Pulses → Discover Patterns → Create Resonance
                  </div>
                </div>
                <div className="text-4xl">→</div>
                <div className="flex-1">
                  <div className="text-2xl font-bold mb-2">👁️ Read Path</div>
                  <div className="text-sm text-slate-400">
                    Query Contexts → View Resonance → Explore Meaning
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialogs... (keeping all the original detail dialogs) */}
        {/* Person Details Dialog */}
        <Dialog
          open={!!selectedPerson}
          onOpenChange={() => setSelectedPerson(null)}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {personDetailsData?.people?.[0]?.name || 'Person'} - Pulses
              </DialogTitle>
              <DialogDescription>
                {personDetailsData?.people?.[0]?.email}
              </DialogDescription>
            </DialogHeader>
            {personDetailsLoading ? (
              <div className="space-y-4 py-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Loading pulses...
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {personDetailsData?.people?.[0]?.ownsSpaces?.map((space) => (
                  <div key={space.id} className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">
                      {space.name}
                    </h3>
                    {space.contexts?.map((context) => (
                      <div key={context.id} className="pl-4 space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground">
                          Context: {context.title}
                        </h4>
                        <div className="space-y-2 pl-4">
                          {context.pulses?.map((pulse) => (
                            <Card key={pulse.id} className="p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="text-sm">{pulse.content}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    By:{' '}
                                    {pulse.initiatedBy?.[0]?.name || 'Unknown'}
                                  </p>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <Badge variant="outline" className="text-xs">
                                    {'status' in pulse && pulse.status
                                      ? pulse.status
                                      : 'resourceType' in pulse &&
                                          pulse.resourceType
                                        ? pulse.resourceType
                                        : 'Story'}
                                  </Badge>
                                  {pulse.intensity && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {pulse.intensity.toFixed(1)}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(pulse.createdAt).toLocaleDateString()}
                              </p>
                            </Card>
                          ))}
                          {(!context.pulses || context.pulses.length === 0) && (
                            <p className="text-sm text-muted-foreground italic">
                              No pulses in this context yet
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Space Details Dialog */}
        <Dialog
          open={!!selectedSpace}
          onOpenChange={() => setSelectedSpace(null)}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {spaceDetailsData?.meSpaces?.[0]?.name ||
                  spaceDetailsData?.weSpaces?.[0]?.name ||
                  'Space'}{' '}
                - Contents
              </DialogTitle>
              <DialogDescription>
                {spaceDetailsData?.meSpaces?.[0]?.visibility ||
                  spaceDetailsData?.weSpaces?.[0]?.visibility}
              </DialogDescription>
            </DialogHeader>
            {spaceDetailsLoading ? (
              <div className="space-y-4 py-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Loading space contents...
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {(
                  spaceDetailsData?.meSpaces?.[0]?.contexts ||
                  spaceDetailsData?.weSpaces?.[0]?.contexts ||
                  []
                ).map((context) => (
                  <div key={context.id} className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="text-lg font-semibold">{context.title}</h3>
                      <Badge variant="outline">
                        {context.pulses?.length || 0} pulses
                      </Badge>
                    </div>
                    {context.emergentName && (
                      <p className="text-sm text-muted-foreground italic">
                        Emergent: {context.emergentName}
                      </p>
                    )}
                    <div className="space-y-2 pl-4">
                      {context.pulses?.map((pulse) => (
                        <Card key={pulse.id} className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm">{pulse.content}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                By: {pulse.initiatedBy?.[0]?.name || 'Unknown'}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Badge variant="outline" className="text-xs">
                                {'status' in pulse && pulse.status
                                  ? pulse.status
                                  : 'resourceType' in pulse &&
                                      pulse.resourceType
                                    ? pulse.resourceType
                                    : 'Story'}
                              </Badge>
                              {pulse.intensity && (
                                <Badge variant="secondary" className="text-xs">
                                  {pulse.intensity.toFixed(1)}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(pulse.createdAt).toLocaleDateString()}
                          </p>
                        </Card>
                      ))}
                      {(!context.pulses || context.pulses.length === 0) && (
                        <p className="text-sm text-muted-foreground italic">
                          No pulses in this context yet
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Resonance Details Dialog */}
        <Dialog
          open={!!selectedResonance}
          onOpenChange={() => setSelectedResonance(null)}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {resonanceDetailsData?.fieldResonances?.[0]?.label ||
                  'Resonance Pattern'}
              </DialogTitle>
              <DialogDescription>
                {resonanceDetailsData?.fieldResonances?.[0]?.description}
              </DialogDescription>
            </DialogHeader>
            {resonanceDetailsLoading ? (
              <div className="space-y-4 py-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Loading resonance connections...
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    This resonance pattern was discovered by AI analysis across
                    multiple pulses. The system identified semantic and
                    contextual connections that share this common theme.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Pattern Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Pattern ID:</span>
                      <p className="font-mono text-xs">
                        {resonanceDetailsData?.fieldResonances?.[0]?.id}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <p>AI-Discovered Meaning</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Connections:
                      </span>
                      <p className="font-semibold">
                        {resonanceDetailsData?.resonanceLinks?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Connected Pulses */}
                {resonanceDetailsData?.resonanceLinks &&
                resonanceDetailsData.resonanceLinks.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-base border-b pb-2">
                      Connected Pulses
                    </h4>
                    {resonanceDetailsData.resonanceLinks.map((link) => (
                      <div
                        key={link.id}
                        className="space-y-3 p-4 border rounded-lg bg-card"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {(link.confidence * 100).toFixed(0)}% confidence
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(link.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {link.evidence && (
                          <div className="p-3 bg-muted/50 rounded text-xs italic">
                            <span className="font-medium">Evidence: </span>
                            {link.evidence}
                          </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-3">
                          {/* Source Pulse */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-muted-foreground">
                                SOURCE
                              </span>
                              <div className="h-px flex-1 bg-border"></div>
                            </div>
                            {link.source.map((pulse) => (
                              <Card
                                key={pulse.id}
                                className="p-3 bg-blue-50 dark:bg-blue-950/20"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm flex-1">
                                      {pulse.content}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className="text-xs shrink-0"
                                    >
                                      {'status' in pulse && pulse.status
                                        ? pulse.status
                                        : 'resourceType' in pulse &&
                                            pulse.resourceType
                                          ? pulse.resourceType
                                          : 'Story'}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    By:{' '}
                                    {pulse.initiatedBy?.[0]?.name || 'Unknown'}
                                  </p>
                                  {pulse.intensity && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Intensity: {pulse.intensity.toFixed(1)}
                                    </Badge>
                                  )}
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(
                                      pulse.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </Card>
                            ))}
                          </div>

                          {/* Target Pulse */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-muted-foreground">
                                TARGET
                              </span>
                              <div className="h-px flex-1 bg-border"></div>
                            </div>
                            {link.target.map((pulse) => (
                              <Card
                                key={pulse.id}
                                className="p-3 bg-green-50 dark:bg-green-950/20"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm flex-1">
                                      {pulse.content}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className="text-xs shrink-0"
                                    >
                                      {'status' in pulse && pulse.status
                                        ? pulse.status
                                        : 'resourceType' in pulse &&
                                            pulse.resourceType
                                          ? pulse.resourceType
                                          : 'Story'}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    By:{' '}
                                    {pulse.initiatedBy?.[0]?.name || 'Unknown'}
                                  </p>
                                  {pulse.intensity && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Intensity: {pulse.intensity.toFixed(1)}
                                    </Badge>
                                  )}
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(
                                      pulse.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center border rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      No pulse connections found for this resonance pattern yet.
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
