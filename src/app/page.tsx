import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const tiles = [
  {
    title: 'AI Assistant',
    description: 'Talk with the Aiden and Braider modes, or run simulations.',
    actions: [
      {
        href: '/assistant',
        label: 'Open Assistant',
        variant: 'default' as const,
      },
      {
        href: '/api/chat/simulation',
        label: 'Simulation API',
        variant: 'ghost' as const,
      },
    ],
  },
  {
    title: 'Graph Explorer',
    description: 'Inspect people, spaces, resonances, and relationships.',
    actions: [
      { href: '/graph', label: 'View Graph', variant: 'default' as const },
      { href: '/ontology', label: 'Ontology Map', variant: 'ghost' as const },
    ],
  },
  {
    title: 'Account',
    description: 'Sign in, sign up, or recover access to your account.',
    actions: [
      { href: '/auth/login', label: 'Login', variant: 'default' as const },
      {
        href: '/auth/signup',
        label: 'Create Account',
        variant: 'ghost' as const,
      },
      {
        href: '/auth/forgot-password',
        label: 'Forgot Password',
        variant: 'ghost' as const,
      },
    ],
  },
  {
    title: 'Data & APIs',
    description: 'Review GraphQL schema, seed data, and integration docs.',
    actions: [
      { href: '/graph', label: 'Graph Stats', variant: 'ghost' as const },
      {
        href: '/api/graphql',
        label: 'GraphQL Endpoint',
        variant: 'ghost' as const,
      },
    ],
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="container mx-auto px-6 py-12 space-y-12">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
            <span>GoalPost</span>
            <span className="text-slate-400">/</span>
            <span>Navigation</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Choose where to start
            </h1>
            <p className="text-slate-300 max-w-2xl">
              Jump into the assistant, explore the graph, or manage your
              account. The links below take you straight to the primary
              experiences.
            </p>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {tiles.map((tile) => (
            <Card
              key={tile.title}
              className="border-white/10 bg-white/5 backdrop-blur shadow-lg shadow-slate-950/40"
            >
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  {tile.title}
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {tile.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {tile.actions.map((action) => (
                    <Link key={action.href} href={action.href}>
                      <Button
                        variant={action.variant}
                        className={
                          action.variant === 'ghost'
                            ? 'border border-white/20 text-slate-100'
                            : ''
                        }
                        size="sm"
                      >
                        {action.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-slate-400">
                  Direct access with clear paths; no hidden routes.
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
