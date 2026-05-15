/**
 * Focal Entity Persistence API
 *
 * GET    /api/user/focal-entity  → return the authenticated user's last
 *                                  focal entity, or `{ focalEntity: null }`.
 * PUT    /api/user/focal-entity  → upsert a new focal entity for the user.
 * DELETE /api/user/focal-entity  → clear the user's focal entity.
 *
 * `FocalEntityContext` keeps a fast-first-paint cache in localStorage,
 * but this endpoint is the source of truth — switching browsers or
 * devices should not lose the user's "where I last was."
 *
 * Auth accepts JWT from either an `Authorization: Bearer ...` header
 * (what the Apollo client + GraphQL route already use) or an
 * `accessToken=` cookie. `resolveAuthenticatedUserId` in
 * `src/app/api/auth/utils.ts` is the canonical resolver. The Cypher
 * always anchors on the authenticated user so a missing or spoofed id
 * can't read or overwrite someone else's focal.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { initializeDB, getSession } from '@/app/api/auth/neo4j'
import {
  parseRequestBody,
  resolveAuthenticatedUserId,
} from '@/app/api/auth/utils'
import { isFocalEntityType } from '@/lib/focal-entity/types'

const upsertSchema = z.object({
  type: z.string().refine(isFocalEntityType, {
    message: 'Unsupported focal entity type.',
  }),
  id: z.string().min(1),
  label: z.string().max(255).optional(),
})

interface StoredFocal {
  type: string
  id: string
  label: string | null
  focusedAt: string
}

interface StoredFocalRow {
  type: string | null
  id: string | null
  label: string | null
  focusedAt: { toString: () => string } | string | null
}

function rowToFocal(row: StoredFocalRow | undefined): StoredFocal | null {
  if (!row) return null
  if (!row.type || !row.id) return null
  const focusedAt =
    typeof row.focusedAt === 'string'
      ? row.focusedAt
      : (row.focusedAt?.toString() ?? new Date().toISOString())
  return {
    type: row.type,
    id: row.id,
    label: row.label,
    focusedAt,
  }
}

export async function GET(request: NextRequest) {
  const userId = resolveAuthenticatedUserId(request)
  if (!userId) {
    return NextResponse.json(
      { error: 'Authentication required.' },
      { status: 401 }
    )
  }
  initializeDB()
  const session = getSession()
  try {
    const result = await session.run(
      `
      MATCH (u:Person:User {id: $userId})
      RETURN
        u.lastFocalType AS type,
        u.lastFocalId AS id,
        u.lastFocalLabel AS label,
        u.lastFocalAt AS focusedAt
      LIMIT 1
      `,
      { userId }
    )
    const row = result.records[0]
    const focal = rowToFocal(
      row
        ? {
            type: row.get('type'),
            id: row.get('id'),
            label: row.get('label'),
            focusedAt: row.get('focusedAt'),
          }
        : undefined
    )
    return NextResponse.json({ focalEntity: focal })
  } finally {
    await session.close()
  }
}

export async function PUT(request: NextRequest) {
  const userId = resolveAuthenticatedUserId(request)
  if (!userId) {
    return NextResponse.json(
      { error: 'Authentication required.' },
      { status: 401 }
    )
  }
  const parsed = await parseRequestBody(request)
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error },
      { status: parsed.status }
    )
  }
  const validation = upsertSchema.safeParse(parsed.body)
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.message },
      { status: 400 }
    )
  }

  initializeDB()
  const session = getSession()
  try {
    const now = new Date().toISOString()
    const result = await session.run(
      `
      MATCH (u:Person:User {id: $userId})
      SET u.lastFocalType = $type,
          u.lastFocalId = $id,
          u.lastFocalLabel = $label,
          u.lastFocalAt = datetime($focusedAt)
      RETURN
        u.lastFocalType AS type,
        u.lastFocalId AS id,
        u.lastFocalLabel AS label,
        u.lastFocalAt AS focusedAt
      `,
      {
        userId,
        type: validation.data.type,
        id: validation.data.id,
        label: validation.data.label ?? null,
        focusedAt: now,
      }
    )
    if (result.records.length === 0) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }
    const row = result.records[0]
    const focal = rowToFocal({
      type: row.get('type'),
      id: row.get('id'),
      label: row.get('label'),
      focusedAt: row.get('focusedAt'),
    })
    return NextResponse.json({ focalEntity: focal })
  } finally {
    await session.close()
  }
}

export async function DELETE(request: NextRequest) {
  const userId = resolveAuthenticatedUserId(request)
  if (!userId) {
    return NextResponse.json(
      { error: 'Authentication required.' },
      { status: 401 }
    )
  }
  initializeDB()
  const session = getSession()
  try {
    await session.run(
      `
      MATCH (u:Person:User {id: $userId})
      REMOVE u.lastFocalType, u.lastFocalId, u.lastFocalLabel, u.lastFocalAt
      `,
      { userId }
    )
    return NextResponse.json({ focalEntity: null })
  } finally {
    await session.close()
  }
}
