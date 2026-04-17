---
description: Scaffold a React component following TDX frontend conventions — shadcn/Radix, Tailwind, proper context usage, under 400 lines
argument-hint: <component name and purpose, e.g. "FarmerCard for the field agent dashboard">
---

# New Frontend Component

Scaffold a React component for the TDX frontend following established patterns and conventions.

## Input
Component to create: $ARGUMENTS

## Before You Start

Read these files:
- `frontend/CLAUDE.md` — coding conventions, project structure
- `frontend/kb/02-design-system.md` — colors, typography, spacing, component libraries
- `frontend/kb/01-frontend-adr.md` — architecture decisions (auth, providers, context API)

## Steps

1. **Clarify scope** — Ask the user:
   - Which dashboard/page is this for? (Field Agent, Aggregator, Cash Point, Sourcing Officer)
   - What data does it display/manage?
   - Does it need to interact with any context? (Auth)
   - Is it a page component or a reusable UI component?

2. **Check existing components** — Look in `frontend/src/components/` for:
   - Similar components to follow patterns from
   - Existing `ui/` primitives to compose with (shadcn components)
   - Existing contexts that provide the data this component needs

3. **Generate the component** following these rules:

### Conventions (non-negotiable)
- `'use client'` directive if using hooks (useState, useContext, useEffect)
- TypeScript strict: no `any`, no `@ts-ignore`
- Tailwind classes only, no inline styles, no CSS modules
- Under 400 lines (target < 300) — split if larger
- Business logic in contexts or custom hooks, not in the component
- No prop drilling — use the appropriate context
- Comments explain WHY, not what

### Component Structure
```tsx
'use client';

import { /* existing ui components */ } from '@/components/ui/...';
import { /* context hooks */ } from '@/contexts/...';

interface ComponentNameProps {
  // typed props, no `any`
}

export function ComponentName({ ...props }: ComponentNameProps) {
  // hooks at the top
  // derived state
  // handlers
  // render
}
```

### Design System
- Use colors from `kb/02-design-system.md` (TDX brand palette)
- Use existing shadcn/Radix primitives from `components/ui/`
- Use lucide-react for icons (already installed)
- Use sonner for toast notifications
- Use motion (framer-motion) for animations if needed
- Mobile-first responsive design

4. **Place the file** correctly:
   - Reusable component: `frontend/src/components/ComponentName.tsx`
   - Page component: `frontend/src/app/{dashboard}/ComponentName.tsx`
   - UI primitive: `frontend/src/components/ui/component-name.tsx`

5. **Verify** — Run `pnpm build` from `frontend/` to ensure no TypeScript errors.
