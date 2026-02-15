# GitHub Copilot Instructions for GoalPost

This document provides guidance for GitHub Copilot when assisting with the GoalPost codebase. It defines the project structure, coding standards, architectural patterns, and best practices.

## Project Overview

**GoalPost** is a community platform built to facilitate mutual aid networks, personal growth tracking, and values-based connections. It leverages graph database technology to model complex relationships between people, goals, resources, and communities.

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Frontend**: React 18, Chakra UI 3
- **Backend**: GraphQL (Apollo Server)
- **Database**: Neo4j (Graph Database)
- **Authentication**: Custom JWT-based system
- **Form Handling**: react-hook-form with Zod validation
- **AI/ML**: LangChain with OpenAI integration
- **Email**: Resend
- **Testing**: Jest with ts-jest
- **Linting**: ESLint + Prettier
- **Version Control**: Git with Husky pre-commit hooks

## Project Structure

```
GoalPost/
├── .github/                    # GitHub configuration
│   ├── copilot-instructions.md # This file
│   ├── ISSUE_TEMPLATE.md       # Issue template
│   └── PULL_REQUEST_TEMPLATE.md # PR template
├── docs/                       # Documentation
│   └── AI_ASSISTANT_CRUD_TOOLS.md # CRUD operations guide
├── public/                     # Static assets
├── scripts/                    # Build and utility scripts
│   ├── init-db.js             # Database initialization
│   └── README.md              # Scripts documentation
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (entities)/        # Entity route groups
│   │   │   ├── person/        # Person pages (list, detail, create, update)
│   │   │   ├── goal/          # Goal pages
│   │   │   ├── community/     # Community pages
│   │   │   ├── resource/      # Resource pages
│   │   │   ├── carepoint/     # CarePoint pages
│   │   │   └── corevalue/     # CoreValue pages
│   │   ├── api/               # REST API routes
│   │   │   └── auth/          # Authentication endpoints
│   │   ├── graphql/           # GraphQL operations
│   │   │   ├── queries/       # Query definitions
│   │   │   └── mutations/     # Mutation definitions
│   │   ├── schema/            # Zod validation schemas
│   │   ├── lib/               # App-level utilities
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/
│   │   ├── sections/          # Page sections
│   │   │   └── forms/         # Form components
│   │   └── ui/                # Reusable UI components
│   │       ├── buttons/       # Button components
│   │       ├── entity-cards/  # Entity card components
│   │       └── ...            # Other UI components
│   ├── modules/               # Feature modules
│   │   ├── agent/             # AI agent functionality
│   │   └── graph.ts           # Graph utilities
│   ├── pages/                 # Pages Router (legacy/API)
│   │   └── api/               # API routes
│   │       ├── graphql.ts     # GraphQL endpoint
│   │       ├── schema/        # GraphQL schema
│   │       └── resolvers/     # Custom resolvers
│   ├── types/                 # TypeScript type definitions
│   ├── hooks/                 # Custom React hooks
│   ├── utils/                 # Utility functions
│   └── constants/             # Application constants
├── .env.example               # Environment variables template
├── .eslintrc.json            # ESLint configuration
├── .prettierrc.json          # Prettier configuration
├── codegen.ts                # GraphQL code generation config
├── jest.config.js            # Jest test configuration
├── next.config.ts            # Next.js configuration
├── package.json              # Dependencies and scripts
└── tsconfig.json             # TypeScript configuration
```

## Coding Standards

### TypeScript

1. **Always use TypeScript** - No plain JavaScript files in `src/`
2. **Strict mode enabled** - Follow strict TypeScript rules
3. **Explicit types** - Avoid `any`; use proper types or `unknown`
4. **Interface over type** - Prefer `interface` for object shapes
5. **Use Zod for runtime validation** - Define schemas in `src/app/schema/`

### Naming Conventions

#### Files and Directories
- **Components**: PascalCase (e.g., `PersonCard.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE files (e.g., `API_ENDPOINTS.ts`)
- **Pages (App Router)**: lowercase with hyphens (e.g., `person/[id]/page.tsx`)
- **Route groups**: Parentheses (e.g., `(entities)/person/`)

#### Code
- **Components**: PascalCase (e.g., `PersonForm`)
- **Functions**: camelCase (e.g., `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Interfaces/Types**: PascalCase (e.g., `PersonFormData`)
- **GraphQL operations**: UPPER_SNAKE_CASE (e.g., `GET_PERSON`, `CREATE_PEOPLE_MUTATION`)

### Code Organization

#### Component Structure
```typescript
// 1. Imports (external first, then internal)
import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';

import { PersonCard } from '@/components/ui/entity-cards/person-card';
import { CREATE_PEOPLE_MUTATION } from '@/app/graphql/mutations/PERSON_MUTATIONS';

// 2. Types/Interfaces
interface PersonFormProps {
  onSubmit: (data: PersonFormData) => void;
  defaultValues?: Partial<PersonFormData>;
}

// 3. Component
export function PersonForm({ onSubmit, defaultValues }: PersonFormProps) {
  // 3a. Hooks
  const form = useForm<PersonFormData>({ defaultValues });
  const [createPerson] = useMutation(CREATE_PEOPLE_MUTATION);

  // 3b. Event handlers
  const handleSubmit = async (data: PersonFormData) => {
    // Implementation
  };

  // 3c. Effects
  useEffect(() => {
    // Side effects
  }, []);

  // 3d. Render helpers
  const renderField = () => {
    // Helper function
  };

  // 3e. Return JSX
  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      {/* JSX */}
    </form>
  );
}
```

### GraphQL Conventions

#### Query Naming
```typescript
// Single entity: GET_[ENTITY]
export const GET_PERSON = gql`...`;

// Multiple entities: GET_ALL_[ENTITIES] or GET_[ENTITIES]
export const GET_ALL_PEOPLE = gql`...`;

// Filtered query: GET_[ENTITIES]_BY_[FILTER]
export const GET_PEOPLE_BY_COMMUNITY = gql`...`;
```

#### Mutation Naming
```typescript
// Create: CREATE_[ENTITIES]_MUTATION
export const CREATE_PEOPLE_MUTATION = gql`...`;

// Update: UPDATE_[ENTITY]_MUTATION
export const UPDATE_PERSON_MUTATION = gql`...`;

// Delete: DELETE_[ENTITY]_MUTATION
export const DELETE_PERSON_MUTATION = gql`...`;

// Custom action: [ACTION]_[ENTITY]_MUTATION
export const SEND_INVITE_MUTATION = gql`...`;
```

### React Best Practices

1. **Use functional components** - No class components
2. **Hooks for state management** - useState, useReducer, useContext
3. **Custom hooks for reusable logic** - Place in `src/hooks/`
4. **Memoization when needed** - useMemo, useCallback for expensive operations
5. **Error boundaries** - Wrap components that may error
6. **Suspense for async data** - Use with data fetching

### Form Handling Pattern

```typescript
// 1. Define Zod schema
export const personSchema = object({
  firstName: string().min(1, 'Required').trim(),
  lastName: string().min(1, 'Required').trim(),
  email: string().email('Invalid email').optional(),
});

export type PersonFormData = z.infer<typeof personSchema>;

// 2. Use in component with react-hook-form
const form = useForm<PersonFormData>({
  resolver: zodResolver(personSchema),
  defaultValues: { ... }
});

// 3. Handle submission
const onSubmit = async (data: PersonFormData) => {
  // Mutation logic
};

// 4. Render with error handling
<form onSubmit={form.handleSubmit(onSubmit)}>
  <input {...form.register('firstName')} />
  {form.formState.errors.firstName && (
    <span>{form.formState.errors.firstName.message}</span>
  )}
</form>
```

## Architectural Patterns

### Entity CRUD Pattern

Each entity follows a consistent CRUD structure:

```
src/app/(entities)/[entity-name]/
├── page.tsx              # List view (GET_ALL_[ENTITIES])
├── [id]/
│   ├── page.tsx          # Detail view (GET_[ENTITY])
│   └── update/
│       └── page.tsx      # Update form (UPDATE_[ENTITY])
└── create/
    └── page.tsx          # Create form (CREATE_[ENTITIES])
```

### Data Flow

```
User Input
  ↓
Form Component (react-hook-form + Zod)
  ↓
Validation
  ↓
GraphQL Mutation (Apollo Client)
  ↓
Apollo Server
  ↓
Neo4j Database
  ↓
Response
  ↓
UI Update (Refetch Queries)
```

### Authentication Flow

```
Login Form
  ↓
POST /api/auth/login
  ↓
Verify Credentials (bcrypt)
  ↓
Generate JWT (access + refresh tokens)
  ↓
Set HTTP-only Cookies
  ↓
Return User Data
  ↓
Redirect to Dashboard
```

### Neo4j Relationship Patterns

```cypher
// Person to Community
(Person)-[:BELONGS_TO]->(Community)

// Person to Goal
(Person)-[:MOTIVATED_BY]->(Goal)

// Person to Resource
(Person)-[:PROVIDES]->(Resource)

// Goal to CarePoint
(Goal)-[:ENABLED_BY|CARES_FOR]->(CarePoint)

// Resource to CarePoint
(Resource)-[:APPLIED_IN]->(CarePoint)

// Person/Community to CoreValue
(Person|Community)-[:EMBRACES]->(CoreValue)
```

## Environment Variables

### Required Variables

```bash
# Database
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-password

# Authentication
JWT_SECRET=your-secret-key-generated-with-openssl
PEPPER=your-pepper-for-password-hashing

# Email
RESEND_API_KEY=your-resend-api-key
NEXT_PUBLIC_EMAIL_FROM="GoalPost <noreply@goalpost.earth>"

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Optional: AI Features
OPENAI_API_KEY=your-openai-api-key
```

### Environment Variable Usage

- **Client-side**: Only `NEXT_PUBLIC_*` variables are accessible
- **Server-side**: All variables are accessible
- **Never commit** `.env.local` or expose secrets in code

## Testing Patterns

### Unit Tests

```typescript
// File: src/modules/agent/agent.test.ts
import { describe, it, expect } from '@jest/globals';
import { someFunction } from './agent';

describe('Agent Module', () => {
  it('should perform expected operation', () => {
    const result = someFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### Integration Tests

```typescript
// Test GraphQL mutations
import { ApolloClient } from '@apollo/client';
import { CREATE_PEOPLE_MUTATION } from '@/app/graphql/mutations/PERSON_MUTATIONS';

describe('Person Creation', () => {
  it('should create a new person', async () => {
    const result = await client.mutate({
      mutation: CREATE_PEOPLE_MUTATION,
      variables: { input: [{ firstName: 'Test', lastName: 'User' }] }
    });
    
    expect(result.data.createPeople.people[0].firstName).toBe('Test');
  });
});
```

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

## Git Workflow

### Commit Message Convention

Follow Conventional Commits:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Build process or tooling changes

**Examples**:
```
feat(person): add email validation to person form
fix(auth): resolve token refresh race condition
docs(readme): update installation instructions
refactor(graphql): simplify person query structure
```

### Branch Naming

```
feature/description-of-feature
bugfix/description-of-bug
hotfix/critical-issue
docs/documentation-update
refactor/code-improvement
```

### Pull Request Guidelines

1. **Title**: Follow commit convention (e.g., `feat(person): add profile photo upload`)
2. **Description**: Use the PR template in `.github/PULL_REQUEST_TEMPLATE.md`
3. **Tests**: Include tests for new features
4. **Documentation**: Update docs if changing APIs or behavior
5. **Review**: Request at least one review before merging

## Common Tasks

### Adding a New Entity Type

1. **Define GraphQL schema** in `src/pages/api/schema/schema.gql`
2. **Create Zod schema** in `src/app/schema/[entity]Schema.ts`
3. **Define queries** in `src/app/graphql/queries/[ENTITY]_QUERIES.ts`
4. **Define mutations** in `src/app/graphql/mutations/[ENTITY]_MUTATIONS.ts`
5. **Create form component** in `src/components/sections/forms/[Entity]Form.tsx`
6. **Create pages**:
   - List: `src/app/(entities)/[entity]/page.tsx`
   - Detail: `src/app/(entities)/[entity]/[id]/page.tsx`
   - Create: `src/app/(entities)/[entity]/create/page.tsx`
   - Update: `src/app/(entities)/[entity]/[id]/update/page.tsx`
7. **Create entity card** in `src/components/ui/entity-cards/[entity]-card.tsx`
8. **Add to navigation** (if applicable)

### Adding a New GraphQL Field

1. **Update schema** in `src/pages/api/schema/schema.gql`
2. **Update Zod schema** in `src/app/schema/[entity]Schema.ts`
3. **Update queries/mutations** to include new field
4. **Update form component** to handle new field
5. **Run codegen**: `npm run codegen`
6. **Test changes**

### Creating a Custom Resolver

1. **Create resolver file** in `src/pages/api/resolvers/[feature].ts`
2. **Export resolver function**:
```typescript
export const customResolver = async (parent, args, context) => {
  // Implementation
  return result;
};
```
3. **Register in** `src/pages/api/resolvers/index.ts`
4. **Use in GraphQL schema** with `@customResolver` directive

## Performance Considerations

### GraphQL Query Optimization

1. **Fetch only needed fields** - Don't request unnecessary data
2. **Use pagination** - Implement `options: { limit, offset }` for large lists
3. **Batch queries** - Use DataLoader pattern when available
4. **Cache management** - Configure Apollo cache policies appropriately

### React Performance

1. **Memoize expensive calculations** - useMemo, useCallback
2. **Code splitting** - Use dynamic imports for large components
3. **Lazy loading** - Load images and components on demand
4. **Optimize re-renders** - Use React.memo for pure components

### Database Performance

1. **Index frequently queried fields** - Create Neo4j indexes
2. **Limit query depth** - Prevent excessive relationship traversal
3. **Use Cypher efficiently** - Optimize custom queries

## Security Best Practices

### Authentication

1. **Always verify JWT tokens** on protected routes
2. **Use HTTP-only cookies** for token storage
3. **Implement token refresh** mechanism
4. **Hash passwords** with bcrypt (with PEPPER)

### Authorization

1. **Check user permissions** before mutations
2. **Validate ownership** of resources
3. **Sanitize user input** to prevent injection attacks

### Data Protection

1. **Never expose secrets** in client code
2. **Validate all inputs** with Zod schemas
3. **Sanitize output** to prevent XSS
4. **Use HTTPS** in production
5. **Implement rate limiting** on API routes

## Debugging Tips

### GraphQL Debugging

```typescript
// Enable Apollo Client DevTools
const client = new ApolloClient({
  cache: new InMemoryCache(),
  connectToDevTools: true,
});
```

### Neo4j Debugging

```bash
# Run Cypher queries directly
# Use Neo4j Browser or neo4j-shell
```

### Logging

```typescript
// Use Winston logger (configured in project)
import logger from '@/utils/logger';

logger.info('User created', { userId, email });
logger.error('Failed to create user', { error });
```

## AI Features

### LangChain Integration

The AI agent is located in `src/modules/agent/` and provides:

- **RAG (Retrieval-Augmented Generation)** for answering questions
- **Vector search** in Neo4j for semantic similarity
- **Cypher generation** for dynamic queries
- **Chat history** management

### Using the Agent

```typescript
import { Agent } from '@/modules/agent';

const agent = new Agent(neo4jDriver, openaiApiKey);
const response = await agent.query('What are my active goals?', sessionId);
```

## Accessibility

1. **Use semantic HTML** - Proper heading hierarchy, landmarks
2. **ARIA labels** - Add for interactive elements
3. **Keyboard navigation** - Ensure all features are keyboard accessible
4. **Color contrast** - Follow WCAG guidelines
5. **Screen reader testing** - Test with NVDA or VoiceOver

## Browser Support

- **Modern browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile**: iOS Safari, Chrome for Android
- **Not supported**: IE11

## Deployment

### Vercel (Recommended)

1. Connect GitHub repository
2. Configure environment variables
3. Deploy from main branch
4. Auto-deploy on push

### Environment-Specific Configuration

- **Development**: `.env.local`
- **Production**: Set in Vercel dashboard or hosting platform

## Additional Resources

- **Neo4j GraphQL Library**: https://neo4j.com/docs/graphql-manual/current/
- **Next.js Documentation**: https://nextjs.org/docs
- **Apollo Client**: https://www.apollographql.com/docs/react/
- **Chakra UI**: https://v3.chakra-ui.com/docs
- **LangChain**: https://js.langchain.com/docs

## Support

For questions or issues:
1. Check existing documentation
2. Search closed issues on GitHub
3. Open a new issue with detailed description
4. Contact maintainers

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-15

These instructions should be updated as the project evolves to reflect current best practices and architectural decisions.
