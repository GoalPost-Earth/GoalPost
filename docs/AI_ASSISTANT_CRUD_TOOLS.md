# AI Assistant CRUD Tools Documentation

This document provides comprehensive guidance for AI assistants working with the GoalPost codebase. It covers all CRUD (Create, Read, Update, Delete) operations, data models, and implementation patterns.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Entity Types](#entity-types)
3. [GraphQL Operations](#graphql-operations)
4. [CRUD Patterns](#crud-patterns)
5. [Form Validation](#form-validation)
6. [Authentication & API Routes](#authentication--api-routes)
7. [Code Examples](#code-examples)
8. [Best Practices](#best-practices)

## Architecture Overview

GoalPost is a Next.js application with the following tech stack:

- **Frontend**: Next.js 15, React 18, Chakra UI 3
- **Backend**: GraphQL (Apollo Server), Neo4j Graph Database
- **Authentication**: JWT-based custom auth system
- **Validation**: Zod schemas with react-hook-form
- **AI Features**: LangChain with OpenAI integration

### Key Directories

```
src/
├── app/
│   ├── (entities)/          # Entity pages (person, goal, community, etc.)
│   ├── api/                 # REST API routes (auth)
│   ├── graphql/             # GraphQL queries and mutations
│   ├── schema/              # Zod validation schemas
│   └── lib/                 # Apollo client and utilities
├── components/
│   ├── sections/forms/      # Entity form components
│   └── ui/                  # Reusable UI components
├── modules/
│   └── agent/               # AI agent and LangChain tools
└── pages/api/
    ├── graphql.ts           # GraphQL server endpoint
    └── schema/              # GraphQL schema definition
```

## Entity Types

The following entities are the core data models in GoalPost:

### 1. Person

Represents individual users and contacts in the system.

**Properties**:
- `id`: UUID
- `firstName`: String (required)
- `lastName`: String (required)
- `email`: String
- `phone`: String
- `pronouns`: String
- `location`: String
- `photo`: String (URL)
- `status`: String (ACTIVE, INACTIVE, PENDING)
- `careManual`: String (markdown)
- `avatar`: String
- `favorites`, `passions`, `traits`, `fieldsOfCare`, `interests`: String

**Relationships**:
- `connections: [Person]` - Other people (CONNECTED_TO)
- `coreValues: [CoreValue]` - Values embraced (EMBRACES)
- `goals: [Goal]` - Goals motivated by (MOTIVATED_BY)
- `providesResources: [Resource]` - Resources provided (PROVIDES)
- `communities: [Community]` - Communities belonged to (BELONGS_TO)
- `createdBy: [Person]` - Creator relationship

**Schema Location**: `src/app/schema/personSchema.tsx`

### 2. Goal

Represents objectives and aspirations.

**Properties**:
- `id`: UUID
- `name`: String (required)
- `description`: String
- `successMeasures`: String
- `photo`: String (URL)
- `status`: String (required)
- `location`: String
- `why`: String
- `time`: String

**Relationships**:
- `carePoints: [CarePoint]` - Related care points (ENABLED_BY, CARES_FOR)
- `resources: [Resource]` - Resources needed (NEEDS)
- `motivates: [Person]` - People motivated (MOTIVATED_BY inverse)
- `communities: [Community]` - Related communities

**Schema Location**: `src/app/schema/goalSchema.ts`

### 3. Community

Represents groups and organizations.

**Properties**:
- `id`: UUID
- `name`: String (required)
- `description`: String
- `photo`: String (URL)
- `location`: String
- `logo`: String (URL)

**Relationships**:
- `members: [Person]` - Members (BELONGS_TO inverse)
- `coreValues: [CoreValue]` - Values (EMBRACES)
- `goals: [Goal]` - Community goals
- `resources: [Resource]` - Community resources

**Schema Location**: `src/app/schema/communitySchema.ts`

### 4. Resource

Represents tools, services, and materials.

**Properties**:
- `id`: UUID
- `name`: String (required)
- `description`: String
- `photo`: String (URL)
- `url`: String
- `location`: String
- `cost`: String

**Relationships**:
- `providedBy: [Person]` - Providers (PROVIDES inverse)
- `carePoints: [CarePoint]` - Applied in (APPLIED_IN)
- `goals: [Goal]` - Needed by (NEEDS inverse)

**Schema Location**: `src/app/schema/resourceSchema.ts`

### 5. CarePoint

Represents areas of care and focus.

**Properties**:
- `id`: UUID
- `name`: String (required)
- `description`: String
- `photo`: String (URL)

**Relationships**:
- `goals: [Goal]` - Enables/cares for goals
- `resources: [Resource]` - Resources applied

**Schema Location**: `src/app/schema/carePointSchema.ts`

### 6. CoreValue

Represents guiding principles and values.

**Properties**:
- `id`: UUID
- `name`: String (required)
- `description`: String
- `photo`: String (URL)

**Relationships**:
- `embracedBy: [Person]` - People who embrace
- `communities: [Community]` - Communities that embrace

**Schema Location**: `src/app/schema/coreValueSchema.ts`

## GraphQL Operations

### Query Structure

All GraphQL queries are located in `src/app/graphql/queries/`:

- `PERSON_QUERIES.ts` - Person queries
- `GOAL_QUERIES.ts` - Goal queries
- `COMMUNITY_QUERIES.ts` - Community queries
- `RESOURCE_QUERIES.ts` - Resource queries
- `CAREPOINT_QUERIES.ts` - CarePoint queries
- `COREVALUE_QUERIES.ts` - CoreValue queries

**Common Query Patterns**:

```typescript
// Get single entity by ID
export const GET_PERSON = gql`
  query GetPerson($id: ID!) {
    people(where: { id: $id }) {
      id
      firstName
      lastName
      email
      # ... other fields
      communities {
        id
        name
      }
      goals {
        id
        name
      }
    }
  }
`;

// Get all entities with optional filtering
export const GET_ALL_PEOPLE = gql`
  query GetAllPeople(
    $where: PersonWhere
    $options: PersonOptions
  ) {
    people(where: $where, options: $options) {
      id
      firstName
      lastName
      # ... other fields
    }
  }
`;
```

### Mutation Structure

All GraphQL mutations are located in `src/app/graphql/mutations/`:

- `PERSON_MUTATIONS.ts` - Person mutations
- `GOAL_MUTATIONS.ts` - Goal mutations
- `COMMUNITY_MUTATIONS.ts` - Community mutations
- `RESOURCE_MUTATIONS.ts` - Resource mutations
- `CAREPOINT_MUTATIONS.ts` - CarePoint mutations
- `COREVALUE_MUTATIONS.ts` - CoreValue mutations

**Standard Mutation Patterns**:

```typescript
// CREATE
export const CREATE_PEOPLE_MUTATION = gql`
  mutation CreatePeople($input: [PersonCreateInput!]!) {
    createPeople(input: $input) {
      people {
        id
        firstName
        lastName
        # ... other fields
      }
    }
  }
`;

// UPDATE
export const UPDATE_PERSON_MUTATION = gql`
  mutation UpdatePerson(
    $where: PersonWhere
    $update: PersonUpdateInput
  ) {
    updatePeople(where: $where, update: $update) {
      people {
        id
        firstName
        lastName
        # ... other fields
      }
    }
  }
`;

// DELETE
export const DELETE_PERSON_MUTATION = gql`
  mutation DeletePerson($where: PersonWhere) {
    deletePeople(where: $where) {
      nodesDeleted
      relationshipsDeleted
    }
  }
`;
```

## CRUD Patterns

### CREATE Pattern

**File Structure** (Example: Person):
```
src/app/(entities)/person/create/page.tsx
```

**Implementation Steps**:

1. **Import necessary dependencies**:
```typescript
import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personSchema, PersonFormData } from '@/app/schema/personSchema';
import { CREATE_PEOPLE_MUTATION } from '@/app/graphql/mutations/PERSON_MUTATIONS';
```

2. **Set up form with validation**:
```typescript
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<PersonFormData>({
  resolver: zodResolver(personSchema),
});
```

3. **Set up mutation**:
```typescript
const [createPerson, { loading, error }] = useMutation(CREATE_PEOPLE_MUTATION, {
  refetchQueries: [{ query: GET_ALL_PEOPLE }],
});
```

4. **Handle form submission**:
```typescript
const onSubmit = async (data: PersonFormData) => {
  try {
    const result = await createPerson({
      variables: {
        input: [{
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          // ... other fields
          communities: {
            connect: [{ where: { node: { id: communityId } } }]
          },
          createdBy: {
            connect: { where: { node: { id: currentUserId } } }
          }
        }]
      }
    });
    
    // Navigate to detail page
    router.push(`/person/${result.data.createPeople.people[0].id}`);
  } catch (err) {
    console.error('Error creating person:', err);
  }
};
```

### READ Pattern

**Single Entity** (Detail Page):
```typescript
// File: src/app/(entities)/person/[id]/page.tsx
const { data, loading, error } = useQuery(GET_PERSON, {
  variables: { id: params.id },
});

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;

const person = data.people[0];
```

**Multiple Entities** (List Page):
```typescript
// File: src/app/(entities)/person/page.tsx
const { data, loading, error } = useQuery(GET_ALL_PEOPLE, {
  variables: {
    where: { status: 'ACTIVE' },
    options: { sort: [{ firstName: 'ASC' }] }
  }
});
```

### UPDATE Pattern

**File Structure**:
```
src/app/(entities)/person/update/[id]/page.tsx
```

**Implementation Steps**:

1. **Fetch current data**:
```typescript
const { data: currentData } = useQuery(GET_PERSON, {
  variables: { id: params.id },
});
```

2. **Initialize form with current values**:
```typescript
const form = useForm<PersonFormData>({
  resolver: zodResolver(personSchema),
  defaultValues: {
    firstName: currentData?.people[0]?.firstName || '',
    lastName: currentData?.people[0]?.lastName || '',
    // ... other fields
  }
});
```

3. **Set up update mutation**:
```typescript
const [updatePerson] = useMutation(UPDATE_PERSON_MUTATION, {
  refetchQueries: [
    { query: GET_PERSON, variables: { id: params.id } },
    { query: GET_ALL_PEOPLE }
  ],
});
```

4. **Handle update submission**:
```typescript
const onSubmit = async (data: PersonFormData) => {
  await updatePerson({
    variables: {
      where: { id: params.id },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        // ... other fields
      }
    }
  });
  
  router.push(`/person/${params.id}`);
};
```

### DELETE Pattern

**Implementation** (from `src/components/ui/buttons/delete-button.tsx`):

```typescript
const handleDelete = async () => {
  try {
    // Map entity type to appropriate mutation
    const mutation = entityTypeMutationMap[entityType];
    
    await deleteMutation({
      variables: { where: { id: entityId } },
      refetchQueries: [{ query: getListQuery(entityType) }],
    });
    
    // Create audit log
    await createLog({
      variables: {
        input: [{
          action: 'DELETE',
          entityType: entityType,
          entityId: entityId,
          timestamp: new Date().toISOString(),
        }]
      }
    });
    
    // Navigate to list page
    router.push(`/${entityType}`);
  } catch (err) {
    console.error(`Error deleting ${entityType}:`, err);
  }
};
```

## Form Validation

All forms use **Zod** schemas for validation. Schemas are located in `src/app/schema/`.

### Schema Pattern

```typescript
// Example: personSchema.tsx
import { object, string } from 'zod';
import * as z from 'zod';

export const personSchema = object({
  firstName: string().min(1, 'First name is required').trim(),
  lastName: string().min(1, 'Last name is required').trim(),
  email: string().email('Invalid email').optional(),
  phone: string().optional(),
  pronouns: string().optional(),
  location: string().optional(),
  photo: string().url('Must be a valid URL').optional(),
  status: string().min(1, 'Status is required'),
  // ... other fields
});

export type PersonFormData = z.infer<typeof personSchema>;
```

### Form Components

Reusable form components are in `src/components/sections/forms/`:

- `PersonForm.tsx` - Person entity form
- `GoalForm.tsx` - Goal entity form
- `CommunityForm.tsx` - Community entity form
- `ResourceForm.tsx` - Resource entity form
- `CarePointForm.tsx` - CarePoint entity form
- `CoreValueForm.tsx` - CoreValue entity form

**Form Component Pattern**:
```typescript
import { PersonForm } from '@/components/sections/forms/PersonForm';

<PersonForm
  onSubmit={handleSubmit}
  defaultValues={initialData}
  loading={loading}
  error={error}
/>
```

## Authentication & API Routes

### REST API Routes

Authentication routes are in `src/app/api/auth/`:

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh JWT token
- `GET /api/auth/access-token` - Get new access token
- `POST /api/auth/request-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### JWT Authentication

**Token Structure**:
- Access Token: Short-lived (15 minutes)
- Refresh Token: Long-lived (7 days)
- Stored in HTTP-only cookies

**Protected Routes**:
```typescript
// Middleware checks for valid JWT
// Located in: src/app/api/auth/utils.ts

export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error('Invalid token');
  }
}
```

## Code Examples

### Complete CREATE Example

```typescript
// File: src/app/(entities)/goal/create/page.tsx
'use client';

import { useMutation, useQuery } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { goalSchema, GoalFormData } from '@/app/schema/goalSchema';
import { CREATE_GOAL_MUTATION } from '@/app/graphql/mutations/GOAL_MUTATIONS';
import { GET_ALL_GOALS } from '@/app/graphql/queries/GOAL_QUERIES';
import { GoalForm } from '@/components/sections/forms/GoalForm';

export default function CreateGoalPage() {
  const router = useRouter();
  
  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'ACTIVE',
    }
  });

  const [createGoal, { loading, error }] = useMutation(CREATE_GOAL_MUTATION, {
    refetchQueries: [{ query: GET_ALL_GOALS }],
  });

  const onSubmit = async (data: GoalFormData) => {
    try {
      const result = await createGoal({
        variables: {
          input: [{
            name: data.name,
            description: data.description,
            successMeasures: data.successMeasures,
            status: data.status,
            location: data.location,
            why: data.why,
            time: data.time,
            photo: data.photo,
            // Connect relationships
            carePoints: {
              connect: data.carePointIds?.map(id => ({
                where: { node: { id } }
              }))
            },
            communities: {
              connect: [{ where: { node: { id: data.communityLink } } }]
            }
          }]
        }
      });

      const newGoalId = result.data.createGoals.goals[0].id;
      router.push(`/goal/${newGoalId}`);
    } catch (err) {
      console.error('Error creating goal:', err);
    }
  };

  return (
    <div>
      <h1>Create New Goal</h1>
      <GoalForm
        form={form}
        onSubmit={form.handleSubmit(onSubmit)}
        loading={loading}
        error={error}
      />
    </div>
  );
}
```

### Complete UPDATE Example

```typescript
// File: src/app/(entities)/goal/update/[id]/page.tsx
'use client';

import { useMutation, useQuery } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { goalSchema, GoalFormData } from '@/app/schema/goalSchema';
import { UPDATE_GOAL_MUTATION } from '@/app/graphql/mutations/GOAL_MUTATIONS';
import { GET_GOAL, GET_ALL_GOALS } from '@/app/graphql/queries/GOAL_QUERIES';
import { GoalForm } from '@/components/sections/forms/GoalForm';

export default function UpdateGoalPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  // Fetch current goal data
  const { data: currentData, loading: loadingData } = useQuery(GET_GOAL, {
    variables: { id: params.id },
  });

  const goal = currentData?.goals[0];

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: goal?.name || '',
      description: goal?.description || '',
      successMeasures: goal?.successMeasures || '',
      status: goal?.status || 'ACTIVE',
      location: goal?.location || '',
      why: goal?.why || '',
      time: goal?.time || '',
      photo: goal?.photo || '',
    }
  });

  const [updateGoal, { loading: updating, error }] = useMutation(UPDATE_GOAL_MUTATION, {
    refetchQueries: [
      { query: GET_GOAL, variables: { id: params.id } },
      { query: GET_ALL_GOALS }
    ],
  });

  const onSubmit = async (data: GoalFormData) => {
    try {
      await updateGoal({
        variables: {
          where: { id: params.id },
          update: {
            name: data.name,
            description: data.description,
            successMeasures: data.successMeasures,
            status: data.status,
            location: data.location,
            why: data.why,
            time: data.time,
            photo: data.photo,
          }
        }
      });

      router.push(`/goal/${params.id}`);
    } catch (err) {
      console.error('Error updating goal:', err);
    }
  };

  if (loadingData) return <div>Loading...</div>;

  return (
    <div>
      <h1>Update Goal</h1>
      <GoalForm
        form={form}
        onSubmit={form.handleSubmit(onSubmit)}
        loading={updating}
        error={error}
      />
    </div>
  );
}
```

### Relationship Management Example

```typescript
// Connecting entities during creation
const [createPerson] = useMutation(CREATE_PEOPLE_MUTATION);

await createPerson({
  variables: {
    input: [{
      firstName: 'John',
      lastName: 'Doe',
      // Connect to existing community
      communities: {
        connect: [{ where: { node: { id: 'community-id-123' } } }]
      },
      // Connect to existing core values
      coreValues: {
        connect: [
          { where: { node: { id: 'value-id-1' } } },
          { where: { node: { id: 'value-id-2' } } }
        ]
      },
      // Set creator
      createdBy: {
        connect: { where: { node: { id: currentUserId } } }
      }
    }]
  }
});

// Updating relationships
const [updatePerson] = useMutation(UPDATE_PERSON_MUTATION);

await updatePerson({
  variables: {
    where: { id: personId },
    update: {
      // Disconnect from old community
      communities: {
        disconnect: [{ where: { node: { id: 'old-community-id' } } }]
      }
    },
    // Then reconnect to new community
    connect: {
      communities: [{ where: { node: { id: 'new-community-id' } } }]
    }
  }
});
```

## Best Practices

### 1. Always Refetch Queries After Mutations

```typescript
const [createGoal] = useMutation(CREATE_GOAL_MUTATION, {
  refetchQueries: [
    { query: GET_ALL_GOALS },
    { query: GET_COMMUNITY_GOALS, variables: { communityId } }
  ],
});
```

### 2. Use TypeScript Types from Zod Schemas

```typescript
import { goalSchema, GoalFormData } from '@/app/schema/goalSchema';
import * as z from 'zod';

// Type is automatically inferred
type GoalFormData = z.infer<typeof goalSchema>;
```

### 3. Handle Loading and Error States

```typescript
if (loading) return <Spinner />;
if (error) return <ErrorMessage message={error.message} />;
if (!data) return <NotFound />;
```

### 4. Validate User Permissions

```typescript
// Check if user is authenticated
const { user } = useAuth();
if (!user) {
  router.push('/auth/login');
  return null;
}

// Check if user owns the resource
if (resource.createdBy.id !== user.id) {
  return <Unauthorized />;
}
```

### 5. Create Audit Logs for Important Actions

```typescript
await createLog({
  variables: {
    input: [{
      action: 'UPDATE',
      entityType: 'Goal',
      entityId: goalId,
      userId: currentUser.id,
      changes: JSON.stringify(changedFields),
      timestamp: new Date().toISOString(),
    }]
  }
});
```

### 6. Use Optimistic UI Updates

```typescript
const [updateGoal] = useMutation(UPDATE_GOAL_MUTATION, {
  optimisticResponse: {
    updateGoals: {
      goals: [{
        id: goalId,
        name: newName,
        __typename: 'Goal'
      }]
    }
  }
});
```

### 7. Properly Type GraphQL Operations

```typescript
import { gql, TypedDocumentNode } from '@apollo/client';

interface GetPersonData {
  people: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
}

interface GetPersonVars {
  id: string;
}

export const GET_PERSON: TypedDocumentNode<GetPersonData, GetPersonVars> = gql`
  query GetPerson($id: ID!) {
    people(where: { id: $id }) {
      id
      firstName
      lastName
    }
  }
`;
```

### 8. Handle Relationships Carefully

```typescript
// Always check if relationships exist before accessing
const personGoals = person.goals?.length > 0 
  ? person.goals 
  : [];

// Use optional chaining
const communityName = person.communities?.[0]?.name || 'No community';
```

### 9. Clean Up Resources

```typescript
useEffect(() => {
  // Set up subscription or resource
  const subscription = subscribeToMore({...});
  
  // Clean up on unmount
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### 10. Use Environment Variables Properly

```typescript
// Access environment variables
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const openaiKey = process.env.OPENAI_API_KEY;

// Never expose sensitive keys in client-side code
// Only NEXT_PUBLIC_* variables are available in the browser
```

## Additional Resources

### GraphQL Schema Location
- Full schema: `src/pages/api/schema/schema.gql`
- Type definitions generated by codegen

### Apollo Client Configuration
- Client setup: `src/app/lib/apollo-client.ts`
- Server setup: `src/pages/api/apollo.ts`

### Custom Resolvers
- Located in: `src/pages/api/resolvers/`
- Includes: embeddings, chatbot interactions, invite handling

### Testing
- Test files: `*.test.ts` or `*.test.tsx`
- Run tests: `npm test`
- Watch mode: `npm run test:watch`

### Database Initialization
- Script: `scripts/init-db.js`
- Command: `npm run init:db`

---

**Last Updated**: 2026-02-15

For questions or updates to this documentation, please contact the maintainers or open an issue in the repository.
