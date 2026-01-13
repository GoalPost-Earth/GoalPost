import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const tiles = [
  {
    title: 'AI Assistant',
    description: 'Chat with Aiden and explore GoalPost capabilities.',
    href: '/protected/assistant',
    label: 'Open Assistant',
  },
  {
    title: 'Graph Explorer',
    description: '3D interactive exploration of spaces and relationships.',
    href: '/protected/graph-explorer',
    label: 'Explore Graph',
  },
  {
    title: 'View Ontology',
    description: 'Interactive visualization of the knowledge model.',
    href: '/protected/graph',
    label: 'View Ontology',
  },
  {
    title: 'Database Stats',
    description: 'View entities, metrics, and live database information.',
    href: '/protected/stats',
    label: 'View Stats',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="container mx-auto px-6 py-16 max-w-5xl">
        <header className="space-y-8 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-slate-200">
            <span>GoalPost</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Welcome to GoalPost
            </h1>
            <p className="text-xl text-slate-3002 lg:grid-cols-4max-w-2xl">
              A meta-relational community platform powered by AI and graph
              intelligence.
            </p>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {tiles.map((tile) => (
            <Link key={tile.href} href={tile.href} className="group">
              <Card className="border-white/10 bg-white/5 backdrop-blur shadow-lg shadow-slate-950/40 h-full hover:bg-white/10 transition-all">
                <CardHeader>
                  <CardTitle className="text-xl text-white group-hover:text-blue-300 transition-colors">
                    {tile.title}
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    {tile.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="default">
                    {tile.label}
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-slate-400">
            New to GoalPost?{' '}
            <Link
              href="/auth/signup"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Create an account
            </Link>{' '}
            or{' '}
            <Link
              href="/auth/login"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
