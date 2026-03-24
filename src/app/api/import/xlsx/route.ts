import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { initializeDB, getSession } from '@/app/api/auth/neo4j'
import { parseRequestBody } from '@/app/api/auth/utils'
import { processCsvImport } from '@/lib/imports/csv-import-service'
import {
  getImportAccessToken,
  requireAuthenticatedImportUser,
  type CsvImportType,
} from '@/lib/imports/csv-import-utils'
import { parseError } from '@/utils'

const xlsxImportSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  uploadType: z.enum(['we-space', 'field-context', 'pulse']),
  workbookBase64: z.string().min(1, 'XLSX file content is required'),
})

export async function POST(request: NextRequest) {
  const parsedBody = await parseRequestBody(request)

  if (!parsedBody.ok) {
    return NextResponse.json(
      { success: false, error: parsedBody.error },
      { status: parsedBody.status }
    )
  }

  const validatedBody = xlsxImportSchema.safeParse(parsedBody.body)

  if (!validatedBody.success) {
    return NextResponse.json(
      {
        success: false,
        error: parseError(validatedBody.error),
      },
      { status: 400 }
    )
  }

  const { userId, uploadType, workbookBase64 } = validatedBody.data as {
    userId: string
    uploadType: CsvImportType
    workbookBase64: string
  }

  try {
    const user = requireAuthenticatedImportUser(request, userId)
    const accessToken = getImportAccessToken(request)

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication token is missing. Sign in again and retry.',
        },
        { status: 401 }
      )
    }

    initializeDB()
    const session = getSession()

    try {
      const result = await processCsvImport({
        session,
        user,
        uploadType,
        workbookBase64,
        accessToken,
        graphQLEndpoint: `${request.nextUrl.origin}/api/graphql`,
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
