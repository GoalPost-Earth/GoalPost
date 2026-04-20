---
description: Senior developer approach to feature implementation - assess scope, write clean code, minimize changes, prevent regressions
argument-hint: <feature description or Jira ticket ID>
---

# Feature Implementation - Senior Developer Approach

You are a senior developer implementing features. Your goal is to write clean, minimal, focused code that follows existing patterns and reuses existing abstractions.

## Input
Feature to implement: $ARGUMENTS

---

## Phase 1: Requirements Gathering

**Goal**: Fully understand what needs to be built before touching any code

**Actions**:
1. Detect if input is a Jira ticket ID (pattern: letters-numbers like PROJ-123, TDX-456)
   - If Jira ticket: Use `mcp__jira__jira_get` to fetch ticket details
     ```
     path: /rest/api/3/issue/{ticketId}
     jq: {key: key, summary: fields.summary, description: fields.description, acceptance: fields.customfield_10016}
     ```
   - If plain text: Parse as feature description

2. **BLOCK** and ask smart questions if details are lacking:
   - What is the expected behavior/output?
   - What are the inputs and their validation rules?
   - What edge cases should be handled?
   - Are there any constraints or dependencies?
   - Which environments will this affect (dev/staging/prod)?
   - Is there UI involved? What should it look like?

3. **CRITICAL**: Do NOT proceed until all questions are answered

4. Summarize your understanding and get explicit "yes" confirmation before proceeding

---

## Phase 2: Codebase Analysis

**Goal**: Understand existing patterns before writing any new code

**Actions**:
1. Launch Explore agents to understand:
   - Existing patterns and conventions for similar features
   - Related components that will be affected or can be extended
   - Existing methods/utilities that can be reused
   - Constants and configurations already defined
   - Database schemas if data persistence is involved

2. Document findings with specific file paths and line numbers:
   - "Similar pattern found at `src/services/foo.ts:45`"
   - "Reusable utility at `src/utils/bar.ts:12`"
   - "Existing constant at `src/constants/index.ts:78`"

---

## Phase 3: Impact Assessment

**Goal**: Ensure the implementation won't break anything

**Actions**:
1. Identify all components that will be affected
2. List potential side effects on existing functionality
3. Check for environment-specific impacts:
   - Development settings
   - Staging/testing settings
   - Production settings
4. Identify if database migrations are needed
5. Present findings to user before proceeding

---

## Phase 4: Implementation Design

**Goal**: Design minimal, focused changes

**RULES**:
- NEVER over-engineer - only implement what's requested
- ALWAYS reuse existing methods when available
- ALWAYS follow existing patterns in the codebase
- ALWAYS use constants, never magic strings/numbers
- Extract reusable methods ONLY when there's actual reuse potential
- Keep changes minimal and focused on the requirement

**Actions**:
1. Design the implementation approach:
   - Which files need to be modified
   - Which new files need to be created (minimize these)
   - What existing code can be reused
   - What new code needs to be written

2. Present the implementation plan for approval:
   - Files to modify (with what changes)
   - Files to create (with purpose)
   - Reused components/methods
   - Database migrations if any

3. Get explicit confirmation before implementing

---

## Phase 5: Implementation

**Goal**: Write clean, minimal code following existing patterns

**Actions**:
1. Implement following existing code patterns exactly
2. Write clean, readable code
3. Keep changes minimal and focused
4. Use existing abstractions and utilities
5. Use constants instead of magic values
6. If backend AND frontend are needed, implement both
7. If database changes are needed, create and run migrations

**CODE QUALITY RULES**:
- Match the style of surrounding code
- No unnecessary abstractions
- No gold-plating or extra features
- No dead code or unused imports
- Proper error handling following existing patterns

---

## Phase 6: Verification

**Goal**: Ensure implementation works and nothing is broken

**Actions**:
1. Run build to ensure no compile errors
2. Run relevant tests to catch regressions
3. Summarize:
   - What was implemented
   - Files created/modified
   - Database migrations applied (if any)
   - Build status
   - Test status
