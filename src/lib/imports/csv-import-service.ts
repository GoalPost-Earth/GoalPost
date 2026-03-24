import type { Session } from 'neo4j-driver'
import { canEditContent } from '@/lib/permissions/space-permissions'
import { enrichPersonFromPulses } from '@/lib/resonance/embeddings/person-enricher'
import { generatePulseEmbeddings } from '@/lib/resonance/embeddings/pulse-embedder'
import {
  createEmptySummary,
  formatRowData,
  getRowValue,
  normalizeNameForMatch,
  parseCsvText,
  resolvePulseType,
  resolveSpaceScope,
  type AuthenticatedImportUser,
  type CsvImportResult,
  type CsvImportRowError,
  type CsvImportType,
  type SpaceScope,
} from './csv-import-utils'

interface ProcessCsvImportParams {
  session: Session
  user: AuthenticatedImportUser
  uploadType: CsvImportType
  csvText: string
}

interface SpaceRecord {
  id: string
  name: string
  created: boolean
}

interface ContextRecord {
  id: string
  title: string
  created: boolean
}

const FIELD_NAME_ALIASES = [
  'name',
  'title',
  'field_context_name',
  'context_name',
]
const SPACE_NAME_ALIASES = ['we_space_name', 'space_name', 'wespace_name']
const DESCRIPTION_ALIASES = ['description', 'emergent_name', 'details']

async function findUserMeSpace(session: Session, userId: string) {
  const result = await session.run(
    `
    MATCH (:Person {id: $userId})-[:OWNS]->(space:MeSpace)
    RETURN space.id as id, space.name as name
    LIMIT 1
    `,
    { userId }
  )

  if (result.records.length === 0) {
    return null
  }

  return {
    id: result.records[0].get('id') as string,
    name: result.records[0].get('name') as string,
  }
}

async function ensureUserMeSpace(
  session: Session,
  user: AuthenticatedImportUser
): Promise<SpaceRecord> {
  const existingSpace = await findUserMeSpace(session, user.id)

  if (existingSpace) {
    return { ...existingSpace, created: false }
  }

  const generatedName = `${user.displayName} MeSpace`
  const result = await session.run(
    `
    MATCH (person:Person {id: $userId})
    CREATE (space:Space:MeSpace {
      id: randomUUID(),
      name: $name,
      visibility: 'PRIVATE',
      createdAt: datetime()
    })
    CREATE (person)-[:OWNS]->(space)
    RETURN space.id as id, space.name as name
    `,
    {
      userId: user.id,
      name: generatedName,
    }
  )

  return {
    id: result.records[0].get('id') as string,
    name: result.records[0].get('name') as string,
    created: true,
  }
}

async function findWeSpaceByName(session: Session, normalizedName: string) {
  const result = await session.run(
    `
    MATCH (space:WeSpace)
    WHERE toLower(trim(space.name)) = $normalizedName
    RETURN space.id as id, space.name as name
    LIMIT 2
    `,
    { normalizedName }
  )

  if (result.records.length === 0) {
    return null
  }

  if (result.records.length > 1) {
    throw new Error(
      `More than one WeSpace matched the lowercase name "${normalizedName}". Rename the spaces so the import target is unambiguous.`
    )
  }

  return {
    id: result.records[0].get('id') as string,
    name: result.records[0].get('name') as string,
  }
}

async function createWeSpace(
  session: Session,
  userId: string,
  name: string
): Promise<SpaceRecord> {
  const result = await session.run(
    `
    MATCH (person:Person {id: $userId})
    CREATE (space:Space:WeSpace {
      id: randomUUID(),
      name: $name,
      visibility: 'SHARED',
      createdAt: datetime()
    })
    CREATE (person)-[:OWNS]->(space)
    RETURN space.id as id, space.name as name
    `,
    { userId, name }
  )

  return {
    id: result.records[0].get('id') as string,
    name: result.records[0].get('name') as string,
    created: true,
  }
}

async function resolveSpaceForRow(
  session: Session,
  user: AuthenticatedImportUser,
  scope: SpaceScope,
  rawWeSpaceName: string | undefined,
  uploadType: CsvImportType
): Promise<SpaceRecord> {
  if (scope === 'me-space') {
    return ensureUserMeSpace(session, user)
  }

  if (!rawWeSpaceName) {
    throw new Error(
      `This ${uploadType} row targets a WeSpace, but no WeSpace name was provided. Add a value in the we_space_name column.`
    )
  }

  const existingSpace = await findWeSpaceByName(
    session,
    normalizeNameForMatch(rawWeSpaceName)
  )

  if (!existingSpace) {
    return createWeSpace(session, user.id, rawWeSpaceName)
  }

  const canEdit = await canEditContent(session, user.id, existingSpace.id)

  if (!canEdit) {
    throw new Error(
      `A WeSpace named "${existingSpace.name}" already exists, but you are not a member, admin, or owner of that space. You cannot import ${uploadType} rows into it.`
    )
  }

  return { ...existingSpace, created: false }
}

async function findContextInSpace(
  session: Session,
  spaceId: string,
  normalizedTitle: string
) {
  const result = await session.run(
    `
    MATCH (space {id: $spaceId})-[:HAS_CONTEXT]->(context:FieldContext)
    WHERE toLower(trim(context.title)) = $normalizedTitle
    RETURN context.id as id, context.title as title
    LIMIT 2
    `,
    { spaceId, normalizedTitle }
  )

  if (result.records.length === 0) {
    return null
  }

  if (result.records.length > 1) {
    throw new Error(
      `More than one FieldContext matched the lowercase name "${normalizedTitle}" inside the target space. Rename the contexts so the import target is unambiguous.`
    )
  }

  return {
    id: result.records[0].get('id') as string,
    title: result.records[0].get('title') as string,
  }
}

async function createContextInSpace(
  session: Session,
  spaceId: string,
  title: string,
  description?: string
): Promise<ContextRecord> {
  const result = await session.run(
    `
    MATCH (space {id: $spaceId})
    WHERE space:MeSpace OR space:WeSpace
    CREATE (context:FieldContext {
      id: randomUUID(),
      title: $title,
      emergentName: $description,
      createdAt: datetime()
    })
    CREATE (space)-[:HAS_CONTEXT]->(context)
    RETURN context.id as id, context.title as title
    `,
    {
      spaceId,
      title,
      description: description ?? null,
    }
  )

  return {
    id: result.records[0].get('id') as string,
    title: result.records[0].get('title') as string,
    created: true,
  }
}

async function resolveContextForRow(
  session: Session,
  spaceId: string,
  rawContextName: string,
  description?: string
): Promise<ContextRecord> {
  const existingContext = await findContextInSpace(
    session,
    spaceId,
    normalizeNameForMatch(rawContextName)
  )

  if (existingContext) {
    return { ...existingContext, created: false }
  }

  return createContextInSpace(session, spaceId, rawContextName, description)
}

async function createPulseForRow(
  session: Session,
  userId: string,
  contextId: string,
  row: Record<string, string>
): Promise<string> {
  const pulseType = resolvePulseType(getRowValue(row, ['pulse_type', 'type']))
  const title = getRowValue(row, ['title', 'pulse_name', 'name'])
  const content = getRowValue(row, ['content', 'body', 'text', 'description'])

  if (!title) {
    throw new Error('Pulse rows require a title column with a non-empty value.')
  }

  if (!content) {
    throw new Error(
      'Pulse rows require a content column with a non-empty value.'
    )
  }

  const baseParams: Record<string, unknown> = {
    userId,
    contextId,
    title,
    content,
    intensity: Number.parseFloat(row.intensity || '1') || 1,
  }

  let labelClause = 'FieldPulse:StoryPulse'
  let extraProperties = ''

  if (pulseType === 'goal') {
    labelClause = 'FieldPulse:GoalPulse'
    baseParams.status = getRowValue(row, ['status']) || 'ACTIVE'
    baseParams.horizon = getRowValue(row, ['horizon']) || 'MID'
    extraProperties = ', status: $status, horizon: $horizon'
  } else if (pulseType === 'resource') {
    labelClause = 'FieldPulse:ResourcePulse'
    baseParams.resourceType = getRowValue(row, ['resource_type']) || 'general'
    baseParams.availability = Number.parseFloat(row.availability || '1') || 1
    extraProperties =
      ', resourceType: $resourceType, availability: $availability'
  } else if (pulseType === 'care') {
    labelClause = 'FieldPulse:CarePulse'
    baseParams.sourceType = getRowValue(row, ['source_type']) || null
    extraProperties = ', sourceType: $sourceType'
  } else if (pulseType === 'core-value') {
    labelClause = 'FieldPulse:CoreValuePulse'
  }

  const result = await session.run(
    `
    MATCH (person:Person {id: $userId})
    MATCH (context:FieldContext {id: $contextId})
    CREATE (pulse:${labelClause} {
      id: randomUUID(),
      title: $title,
      content: $content,
      intensity: $intensity,
      createdAt: datetime()
      ${extraProperties}
    })
    CREATE (context)-[:HAS_PULSE]->(pulse)
    CREATE (pulse)-[:CREATED_BY]->(person)
    RETURN pulse.id as id
    `,
    baseParams
  )

  return result.records[0].get('id') as string
}

async function postProcessCreatedPulses(
  userId: string,
  pulseIds: string[]
): Promise<string[]> {
  const warnings: string[] = []

  for (const pulseId of pulseIds) {
    try {
      await generatePulseEmbeddings(pulseId)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      warnings.push(
        `Pulse ${pulseId} was created, but embedding generation failed: ${message}`
      )
    }
  }

  if (pulseIds.length > 0) {
    try {
      await enrichPersonFromPulses(userId)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      warnings.push(
        `The import completed, but person enrichment failed after pulse creation: ${message}`
      )
    }
  }

  return warnings
}

function buildParseFailureResult(parseErrors: string[]): CsvImportResult {
  return {
    success: false,
    message:
      'The CSV could not be parsed. Fix the malformed rows and try again.',
    summary: createEmptySummary(),
    importedRows: 0,
    failedRows: parseErrors.length,
    errors: parseErrors.map((message, index) => ({
      row: index + 1,
      message,
      data: {},
    })),
    warnings: [],
  }
}

export async function processCsvImport({
  session,
  user,
  uploadType,
  csvText,
}: ProcessCsvImportParams): Promise<CsvImportResult> {
  const { rows, parseErrors } = parseCsvText(csvText)

  if (parseErrors.length > 0) {
    return buildParseFailureResult(parseErrors)
  }

  if (rows.length === 0) {
    return {
      success: false,
      message: 'The uploaded CSV does not contain any data rows.',
      summary: createEmptySummary(),
      importedRows: 0,
      failedRows: 1,
      errors: [
        {
          row: 1,
          message: 'At least one data row is required.',
          data: {},
        },
      ],
      warnings: [],
    }
  }

  const summary = createEmptySummary()
  const errors: CsvImportRowError[] = []
  const createdPulseIds: string[] = []

  for (const [index, row] of rows.entries()) {
    const rowNumber = index + 2

    try {
      if (uploadType === 'we-space') {
        const weSpaceName = getRowValue(row, [
          'name',
          'we_space_name',
          'space_name',
        ])

        if (!weSpaceName) {
          throw new Error(
            'WeSpace rows require a name column with a non-empty value.'
          )
        }

        const existingSpace = await findWeSpaceByName(
          session,
          normalizeNameForMatch(weSpaceName)
        )

        if (existingSpace) {
          const canEdit = await canEditContent(
            session,
            user.id,
            existingSpace.id
          )

          if (!canEdit) {
            throw new Error(
              `A WeSpace named "${existingSpace.name}" already exists, but you are not a member, admin, or owner of that space.`
            )
          }

          summary.reusedWeSpaces += 1
          continue
        }

        await createWeSpace(session, user.id, weSpaceName)
        summary.createdWeSpaces += 1
        continue
      }

      const scope = resolveSpaceScope(
        getRowValue(row, ['space_scope', 'space_type', 'scope'])
      )
      const weSpaceName = getRowValue(row, SPACE_NAME_ALIASES)
      const space = await resolveSpaceForRow(
        session,
        user,
        scope,
        weSpaceName,
        uploadType
      )

      if (space.created) {
        summary.createdWeSpaces += 1
      } else if (scope === 'we-space') {
        summary.reusedWeSpaces += 1
      }

      if (uploadType === 'field-context') {
        const contextName = getRowValue(row, FIELD_NAME_ALIASES)
        const description = getRowValue(row, DESCRIPTION_ALIASES)

        if (!contextName) {
          throw new Error(
            'Field context rows require a name column with a non-empty value.'
          )
        }

        const context = await resolveContextForRow(
          session,
          space.id,
          contextName,
          description
        )

        if (context.created) {
          summary.createdFieldContexts += 1
        } else {
          summary.reusedFieldContexts += 1
        }

        continue
      }

      const contextName = getRowValue(row, [
        'field_context_name',
        'context_name',
      ])
      const contextDescription = getRowValue(row, DESCRIPTION_ALIASES)

      if (!contextName) {
        throw new Error(
          'Pulse rows require a field_context_name column so the pulse can be attached to a FieldContext.'
        )
      }

      const context = await resolveContextForRow(
        session,
        space.id,
        contextName,
        contextDescription
      )

      if (context.created) {
        summary.createdFieldContexts += 1
      } else {
        summary.reusedFieldContexts += 1
      }

      const pulseId = await createPulseForRow(session, user.id, context.id, row)
      createdPulseIds.push(pulseId)
      summary.createdPulses += 1
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown import error'

      errors.push({
        row: rowNumber,
        message,
        data: formatRowData(row),
      })
    }
  }

  const warnings = await postProcessCreatedPulses(user.id, createdPulseIds)
  const importedRows = rows.length - errors.length
  const failedRows = errors.length

  if (failedRows === 0) {
    return {
      success: true,
      message: `Imported ${importedRows} ${uploadType} row${importedRows === 1 ? '' : 's'} successfully.`,
      summary,
      importedRows,
      failedRows,
      errors,
      warnings,
    }
  }

  if (importedRows === 0) {
    return {
      success: false,
      message: `No ${uploadType} rows were imported. Review the row-level errors and try again.`,
      summary,
      importedRows,
      failedRows,
      errors,
      warnings,
    }
  }

  return {
    success: false,
    message: `Imported ${importedRows} ${uploadType} row${importedRows === 1 ? '' : 's'}, but ${failedRows} row${failedRows === 1 ? '' : 's'} failed.`,
    summary,
    importedRows,
    failedRows,
    errors,
    warnings,
  }
}
