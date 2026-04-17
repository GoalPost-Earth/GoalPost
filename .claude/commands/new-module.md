---
description: Scaffold a NestJS backend module with controller, service, DTOs, RBAC guard, and audit interceptor following TDX patterns
argument-hint: <module name, e.g. "vouchers" or "inventory">
---

# New Backend Module

Scaffold a complete NestJS module for the TDX backend following established patterns and conventions.

## Input
Module to create: $ARGUMENTS

## Before You Start

Read these files to understand the patterns:
- `backend/CLAUDE.md` — project structure, conventions
- `backend/kb/01-backend-adr.md` — architecture decisions (RBAC, audit, Prisma patterns)
- `backend/kb/02-rbac-matrix.md` — which roles can access what
- `backend/kb/03-api-architecture.md` — API domains, communication patterns
- `kb/05-data-entities.md` — data model for the entity this module manages

## Steps

1. **Clarify scope** — Ask the user:
   - Which entity/entities does this module manage?
   - Which roles need access? (check `kb/02-rbac-matrix.md`)
   - What CRUD operations are needed?
   - Any special business logic (state transitions, calculations)?

2. **Check existing code** — Look at other modules in `backend/src/modules/` for patterns to follow. Reuse existing guards, decorators, interceptors.

3. **Generate the module structure**:

```
backend/src/modules/{name}/
├── {name}.module.ts          # NestJS module definition
├── {name}.controller.ts      # REST endpoints with @Roles() and @GeoScope()
├── {name}.service.ts         # Business logic, Prisma queries
├── dto/
│   ├── create-{name}.dto.ts  # Input validation with class-validator
│   └── update-{name}.dto.ts  # Partial update DTO
└── {name}.spec.ts            # Unit tests for the service
```

4. **Apply TDX patterns in every file**:
   - **Controller**: `@Roles()` decorator on every endpoint, `@UseInterceptors(AuditInterceptor)` on mutations
   - **Service**: All Prisma queries scoped by user's geographic assignment, state transitions validated against `kb/04-state-machines.md`
   - **DTOs**: Validate all input fields, use domain-appropriate types (GHS amounts as numbers, phone numbers as strings)
   - **Module**: Register controller, service, import PrismaModule

5. **Verify** — Run `pnpm build` to ensure no TypeScript errors.

## Conventions

- Use singular for entity name, plural for module name (Entity: Voucher, Module: vouchers)
- All amounts in GHS (Ghana Cedis)
- Phone numbers stored as strings (MTN MoMo format)
- Every mutation creates a ChangeLog entry AND a BusinessEvent
- Soft delete preferred over hard delete
