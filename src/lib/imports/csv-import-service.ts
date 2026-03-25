import type { Session } from 'neo4j-driver'
import { canEditContent } from '@/lib/permissions/space-permissions'
import { enrichPersonFromPulses } from '@/lib/resonance/embeddings/person-enricher'
import { generatePulseEmbeddings } from '@/lib/resonance/embeddings/pulse-embedder'
import {
  createEmptySummary,
  formatRowData,
  getRowValue,
  normalizeNameForMatch,
  parseXlsxBase64,
  resolveGoalHorizon,
  resolveGoalStatus,
  resolvePulseType,
  resolveSpaceVisibility,
  resolveSpaceScope,
  validateUploadTemplateHeaders,
  type AuthenticatedImportUser,
  type CsvImportResult,
  type CsvImportRowError,
  type CsvImportType,
  type ImportSpaceVisibility,
  type SpaceScope,
} from './csv-import-utils'

interface ProcessCsvImportParams {
  session: Session
  user: AuthenticatedImportUser
  uploadType: CsvImportType
  workbookBase64: string
  accessToken: string
  graphQLEndpoint: string
}

interface GraphQLRequestContext {
  accessToken: string
  graphQLEndpoint: string
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

const CREATE_WE_SPACE_MUTATION = `
  mutation CreateImportWeSpace($input: [WeSpaceCreateInput!]!) {
    createWeSpaces(input: $input) {
      weSpaces {
        id
        name
      }
    }
  }
`

const CREATE_FIELD_CONTEXT_MUTATION = `
  mutation CreateImportFieldContext($input: [FieldContextCreateInput!]!) {
    createFieldContexts(input: $input) {
      fieldContexts {
        id
        title
      }
    }
  }
`

const CREATE_GOAL_PULSE_MUTATION = `
  mutation CreateImportGoalPulse($input: [GoalPulseCreateInput!]!) {
    createGoalPulses(input: $input) {
      goalPulses {
        id
      }
    }
  }
`

const CREATE_RESOURCE_PULSE_MUTATION = `
  mutation CreateImportResourcePulse($input: [ResourcePulseCreateInput!]!) {
    createResourcePulses(input: $input) {
      resourcePulses {
        id
      }
    }
  }
`

const CREATE_STORY_PULSE_MUTATION = `
  mutation CreateImportStoryPulse($input: [StoryPulseCreateInput!]!) {
    createStoryPulses(input: $input) {
      storyPulses {
        id
      }
    }
  }
`

async function executeGraphQLMutation<TData>(
  context: GraphQLRequestContext,
  query: string,
  variables: Record<string, unknown>
): Promise<TData> {
  const response = await fetch(context.graphQLEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${context.accessToken}`,
    },
    body: JSON.stringify({ query, variables }),
  })

  const payload = (await response.json()) as {
    data?: TData
    errors?: Array<{ message?: string }>
  }

  if (!response.ok) {
    const errorMessage =
      payload.errors?.[0]?.message || 'GraphQL request failed.'
    throw new Error(errorMessage)
  }

  if (payload.errors && payload.errors.length > 0) {
    throw new Error(payload.errors[0].message || 'GraphQL mutation failed.')
  }

  if (!payload.data) {
    throw new Error('GraphQL mutation returned no data.')
  }

  return payload.data
}

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
  graphQLContext: GraphQLRequestContext,
  userId: string,
  name: string,
  visibility: ImportSpaceVisibility
): Promise<SpaceRecord> {
  const data = await executeGraphQLMutation<{
    createWeSpaces: { weSpaces: Array<{ id: string; name: string }> }
  }>(graphQLContext, CREATE_WE_SPACE_MUTATION, {
    input: [
      {
        name,
        visibility,
        createdAt: new Date().toISOString(),
        owner: {
          connect: [{ where: { node: { id_EQ: userId } } }],
        },
      },
    ],
  })

  const createdSpace = data.createWeSpaces.weSpaces[0]

  if (!createdSpace) {
    throw new Error('Failed to create WeSpace through GraphQL mutation.')
  }

  return {
    id: createdSpace.id,
    name: createdSpace.name,
    created: true,
  }
}

async function resolveSpaceForRow(
  session: Session,
  graphQLContext: GraphQLRequestContext,
  user: AuthenticatedImportUser,
  scope: SpaceScope,
  rawWeSpaceName: string | undefined,
  rawVisibility: string | undefined,
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
    return createWeSpace(
      graphQLContext,
      user.id,
      rawWeSpaceName,
      resolveSpaceVisibility(rawVisibility)
    )
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
  graphQLContext: GraphQLRequestContext,
  userId: string,
  scope: SpaceScope,
  spaceId: string,
  title: string,
  description?: string
): Promise<ContextRecord> {
  const spaceRelationshipField = scope === 'me-space' ? 'meSpace' : 'weSpace'
  const data = await executeGraphQLMutation<{
    createFieldContexts: { fieldContexts: Array<{ id: string; title: string }> }
  }>(graphQLContext, CREATE_FIELD_CONTEXT_MUTATION, {
    input: [
      {
        title,
        emergentName: description ?? null,
        createdAt: new Date().toISOString(),
        createdBy: {
          connect: [{ where: { node: { id_EQ: userId } } }],
        },
        [spaceRelationshipField]: {
          connect: [{ where: { node: { id_EQ: spaceId } } }],
        },
      },
    ],
  })

  const createdContext = data.createFieldContexts.fieldContexts[0]

  if (!createdContext) {
    throw new Error('Failed to create FieldContext through GraphQL mutation.')
  }

  return {
    id: createdContext.id,
    title: createdContext.title,
    created: true,
  }
}

async function resolveContextForRow(
  session: Session,
  graphQLContext: GraphQLRequestContext,
  userId: string,
  scope: SpaceScope,
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

  return createContextInSpace(
    graphQLContext,
    userId,
    scope,
    spaceId,
    rawContextName,
    description
  )
}

async function createPulseForRow(
  graphQLContext: GraphQLRequestContext,
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

  const baseInput: Record<string, unknown> = {
    title,
    content,
    intensity: Number.parseFloat(row.intensity || '1') || 1,
    createdAt: new Date().toISOString(),
    createdBy: {
      connect: [{ where: { node: { id_EQ: userId } } }],
    },
    context: {
      connect: [{ where: { node: { id_EQ: contextId } } }],
    },
  }

  if (pulseType === 'goal') {
    const data = await executeGraphQLMutation<{
      createGoalPulses: { goalPulses: Array<{ id: string }> }
    }>(graphQLContext, CREATE_GOAL_PULSE_MUTATION, {
      input: [
        {
          ...baseInput,
          status: resolveGoalStatus(getRowValue(row, ['status'])),
          horizon: resolveGoalHorizon(getRowValue(row, ['horizon'])),
        },
      ],
    })

    const createdPulse = data.createGoalPulses.goalPulses[0]

    if (!createdPulse) {
      throw new Error('Failed to create Goal pulse through GraphQL mutation.')
    }

    return createdPulse.id
  }

  if (pulseType === 'resource') {
    const data = await executeGraphQLMutation<{
      createResourcePulses: { resourcePulses: Array<{ id: string }> }
    }>(graphQLContext, CREATE_RESOURCE_PULSE_MUTATION, {
      input: [
        {
          ...baseInput,
          resourceType: getRowValue(row, ['resource_type']) || 'general',
          availability: Number.parseFloat(row.availability || '1') || 1,
        },
      ],
    })

    const createdPulse = data.createResourcePulses.resourcePulses[0]

    if (!createdPulse) {
      throw new Error(
        'Failed to create Resource pulse through GraphQL mutation.'
      )
    }

    return createdPulse.id
  }

  const data = await executeGraphQLMutation<{
    createStoryPulses: { storyPulses: Array<{ id: string }> }
  }>(graphQLContext, CREATE_STORY_PULSE_MUTATION, {
    input: [baseInput],
  })

  const createdPulse = data.createStoryPulses.storyPulses[0]

  if (!createdPulse) {
    throw new Error('Failed to create Story pulse through GraphQL mutation.')
  }

  return createdPulse.id
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
      'The XLSX file could not be parsed. Fix the malformed sheet and try again.',
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

function buildTemplateValidationFailureResult(
  uploadType: CsvImportType,
  templateErrors: string[]
): CsvImportResult {
  return {
    success: false,
    message: `Template mismatch: the uploaded XLSX file is not a valid ${uploadType} template.`,
    summary: createEmptySummary(),
    importedRows: 0,
    failedRows: templateErrors.length,
    errors: templateErrors.map((message, index) => ({
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
  workbookBase64,
  accessToken,
  graphQLEndpoint,
}: ProcessCsvImportParams): Promise<CsvImportResult> {
  const graphQLContext: GraphQLRequestContext = {
    accessToken,
    graphQLEndpoint,
  }

  const { rows, parseErrors } = parseXlsxBase64(workbookBase64)

  if (parseErrors.length > 0) {
    return buildParseFailureResult(parseErrors)
  }

  if (rows.length === 0) {
    return {
      success: false,
      message: 'The uploaded XLSX file does not contain any data rows.',
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

  const templateErrors = validateUploadTemplateHeaders(uploadType, rows)
  if (templateErrors.length > 0) {
    return buildTemplateValidationFailureResult(uploadType, templateErrors)
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

        await createWeSpace(
          graphQLContext,
          user.id,
          weSpaceName,
          resolveSpaceVisibility(getRowValue(row, ['visibility']))
        )
        summary.createdWeSpaces += 1
        continue
      }

      const scope = resolveSpaceScope(
        getRowValue(row, ['space_scope', 'space_type', 'scope'])
      )
      const weSpaceName = getRowValue(row, SPACE_NAME_ALIASES)
      const visibility = getRowValue(row, ['visibility'])
      const space = await resolveSpaceForRow(
        session,
        graphQLContext,
        user,
        scope,
        weSpaceName,
        visibility,
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
          graphQLContext,
          user.id,
          scope,
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
        graphQLContext,
        user.id,
        scope,
        space.id,
        contextName,
        contextDescription
      )

      if (context.created) {
        summary.createdFieldContexts += 1
      } else {
        summary.reusedFieldContexts += 1
      }

      const pulseId = await createPulseForRow(
        graphQLContext,
        user.id,
        context.id,
        row
      )
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
