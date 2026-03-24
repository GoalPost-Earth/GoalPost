import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { initializeDB, getSession } from '@/app/api/auth/neo4j'
import { parseRequestBody } from '@/app/api/auth/utils'
import { processCsvImport } from '@/lib/imports/csv-import-service'
import {
  requireAuthenticatedImportUser,
  type CsvImportType,
} from '@/lib/imports/csv-import-utils'
import { parseError } from '@/utils'

const csvImportSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  uploadType: z.enum(['we-space', 'field-context', 'pulse']),
  csvText: z.string().min(1, 'CSV text is required'),
})

export async function POST(request: NextRequest) {
  const parsedBody = await parseRequestBody(request)

  if (!parsedBody.ok) {
    return NextResponse.json(
      { success: false, error: parsedBody.error },
      { status: parsedBody.status }
    )
  }

  const validatedBody = csvImportSchema.safeParse(parsedBody.body)

  if (!validatedBody.success) {
    return NextResponse.json(
      {
        success: false,
        error: parseError(validatedBody.error),
      },
      { status: 400 }
    )
  }

  const { userId, uploadType, csvText } = validatedBody.data as {
    userId: string
    uploadType: CsvImportType
    csvText: string
  }

  try {
    const user = requireAuthenticatedImportUser(request, userId)

    initializeDB()
    const session = getSession()

    try {
      const result = await processCsvImport({
        session,
        user,
        uploadType,
        csvText,
      })

      const status = result.success ? 200 : result.importedRows > 0 ? 207 : 400

      return NextResponse.json(result, { status })
    } finally {
      await session.close()
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : parseError(error)

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 401 }
    )
  }
}
