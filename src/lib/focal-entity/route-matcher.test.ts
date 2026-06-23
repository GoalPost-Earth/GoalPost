import { focalEntityFromRoute, type FocalRouteHints } from './route-matcher'
import type { FocalEntityType } from './types'

interface Case {
  pathname: string | null | undefined
  hints?: FocalRouteHints
  expected: { type: FocalEntityType; id: string } | null
  description: string
}

const cases: Case[] = [
  // Neutral / list routes
  {
    pathname: '/protected/dashboard',
    expected: null,
    description: 'dashboard root → null',
  },
  {
    pathname: '/protected/dashboard/import',
    expected: null,
    description: 'dashboard import → null',
  },
  {
    pathname: '/protected/dashboard/resonances/abc',
    expected: null,
    description: 'resonance detail → null (drawer-only)',
  },
  {
    pathname: '/protected/dashboard/documents/d-1',
    expected: null,
    description: 'document detail → null (drawer-only)',
  },
  {
    pathname: '/protected/spaces',
    expected: null,
    description: 'spaces list → null',
  },
  {
    pathname: '/protected/spaces/we-space',
    expected: null,
    description: 'we-space list → null',
  },
  {
    pathname: '/protected/assistant',
    expected: null,
    description: 'assistant → passthrough null',
  },
  {
    pathname: '/protected/graph',
    expected: null,
    description: 'graph → passthrough null',
  },
  {
    pathname: '/protected/search',
    expected: null,
    description: 'search → null',
  },
  {
    pathname: '/protected/settings',
    expected: null,
    description: 'settings → null',
  },

  // Dashboard detail routes (kept)
  {
    pathname: '/protected/dashboard/field-context/ctx-123',
    expected: { type: 'FieldContext', id: 'ctx-123' },
    description: 'dashboard field-context detail',
  },
  {
    pathname: '/protected/dashboard/persons/p-456',
    expected: { type: 'PersonPulse', id: 'p-456' },
    description: 'persons detail → provisional PersonPulse',
  },
  {
    pathname: '/protected/dashboard/pulses/p-789',
    expected: null,
    description: 'pulses detail → null (drawer-only, no dedicated route)',
  },

  // Ambiguous dashboard space route
  {
    pathname: '/protected/dashboard/space/s-1',
    expected: { type: 'WeSpace', id: 's-1' },
    description: 'dashboard space without hints → WeSpace default',
  },
  {
    pathname: '/protected/dashboard/space/s-1',
    hints: { meSpaceIds: ['s-1'] },
    expected: { type: 'MeSpace', id: 's-1' },
    description: 'dashboard space matching meSpaceIds → MeSpace',
  },
  {
    pathname: '/protected/dashboard/space/s-2',
    hints: { meSpaceIds: ['s-1'] },
    expected: { type: 'WeSpace', id: 's-2' },
    description: 'dashboard space not matching meSpaceIds → WeSpace',
  },

  // Legacy /protected/spaces/* detail routes were removed — they no longer
  // resolve to a focal entity (spaces now live at /protected/dashboard/space/[id]
  // and fields at /protected/dashboard/field-context/[id]).
  {
    pathname: '/protected/spaces/me-space/ms-1',
    expected: null,
    description: 'legacy me-space detail → null (route removed)',
  },
  {
    pathname: '/protected/spaces/we-space/ws-1',
    expected: null,
    description: 'legacy we-space detail → null (route removed)',
  },
  {
    pathname: '/protected/spaces/me-space/ms-1/fields/f-9',
    expected: null,
    description: 'legacy me-space field nested → null (route removed)',
  },
  {
    pathname: '/protected/spaces/we-space/ws-1/fields/f-9',
    expected: null,
    description: 'legacy we-space field nested → null (route removed)',
  },

  // Profile (self-focal needs hint)
  {
    pathname: '/protected/profile',
    hints: { currentUserId: 'u-123' },
    expected: { type: 'User', id: 'u-123' },
    description: 'profile with currentUserId → User self',
  },
  {
    pathname: '/protected/profile',
    expected: null,
    description: 'profile without currentUserId → null',
  },
  {
    pathname: '/protected/profile/edit',
    hints: { currentUserId: 'u-123' },
    expected: { type: 'User', id: 'u-123' },
    description: 'profile/edit with currentUserId → User self',
  },

  // Out-of-scope / edge cases
  {
    pathname: '/auth/login',
    expected: null,
    description: 'unprotected route → null',
  },
  { pathname: '/', expected: null, description: 'root → null' },
  { pathname: '', expected: null, description: 'empty → null' },
  { pathname: null, expected: null, description: 'null pathname → null' },
  {
    pathname: undefined,
    expected: null,
    description: 'undefined pathname → null',
  },

  // Robustness: query string / hash / trailing slash
  {
    pathname: '/protected/dashboard/persons/p-456?from=graph',
    expected: { type: 'PersonPulse', id: 'p-456' },
    description: 'query string is ignored',
  },
  {
    pathname: '/protected/dashboard/persons/p-456#section',
    expected: { type: 'PersonPulse', id: 'p-456' },
    description: 'hash is ignored',
  },
  {
    pathname: '/protected/dashboard/persons/p-456/',
    expected: { type: 'PersonPulse', id: 'p-456' },
    description: 'trailing slash is ignored',
  },
]

describe('focalEntityFromRoute', () => {
  test.each(cases)('$description', ({ pathname, hints, expected }) => {
    expect(focalEntityFromRoute(pathname, hints)).toEqual(expected)
  })
})
