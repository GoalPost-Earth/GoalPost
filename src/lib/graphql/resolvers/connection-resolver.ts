import { Context } from '@/config/types'

export const connectionMutations = {
  createPersonConnection: async (
    _parent: never,
    args: {
      fromPersonId: string
      toPersonId: string
      why?: string | null
      interests?: string | null
    },
    context: Context
  ) => {
    const session = context.executionContext.session()

    try {
      const { fromPersonId, toPersonId, why, interests } = args

      if (fromPersonId === toPersonId) {
        return {
          success: false,
          message: 'You cannot connect a person to themselves',
          connection: null,
        }
      }

      const result = await session.run(
        `
        MATCH (from:Person {id: $fromPersonId})
        MATCH (to:Person {id: $toPersonId})
        MERGE (from)-[r:CONNECTED_TO]-(to)
        SET r.why = $why,
            r.interests = $interests
        RETURN {
          connectedPersonId: to.id,
          why: r.why,
          interests: r.interests
        } AS connection
        `,
        {
          fromPersonId,
          toPersonId,
          why: why ?? null,
          interests: interests ?? null,
        }
      )

      if (result.records.length === 0) {
        return {
          success: false,
          message:
            'Could not create connection. One or both people were not found.',
          connection: null,
        }
      }

      const connection = result.records[0].get('connection')

      return {
        success: true,
        message: 'Connection created successfully',
        connection,
      }
    } catch (error) {
      console.error('Error creating person connection:', error)
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to create connection',
        connection: null,
      }
    } finally {
      await session.close()
    }
  },

  updatePersonConnection: async (
    _parent: never,
    args: {
      fromPersonId: string
      toPersonId: string
      why?: string | null
      interests?: string | null
    },
    context: Context
  ) => {
    const session = context.executionContext.session()

    try {
      const { fromPersonId, toPersonId, why, interests } = args

      const result = await session.run(
        `
        MATCH (from:Person {id: $fromPersonId})-[r:CONNECTED_TO]-(to:Person {id: $toPersonId})
        SET r.why = $why,
            r.interests = $interests
        RETURN {
          connectedPersonId: to.id,
          why: r.why,
          interests: r.interests
        } AS connection
        `,
        {
          fromPersonId,
          toPersonId,
          why: why ?? null,
          interests: interests ?? null,
        }
      )

      if (result.records.length === 0) {
        return {
          success: false,
          message: 'Connection not found',
          connection: null,
        }
      }

      const connection = result.records[0].get('connection')

      return {
        success: true,
        message: 'Connection updated successfully',
        connection,
      }
    } catch (error) {
      console.error('Error updating person connection:', error)
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to update connection',
        connection: null,
      }
    } finally {
      await session.close()
    }
  },

  deletePersonConnection: async (
    _parent: never,
    args: {
      fromPersonId: string
      toPersonId: string
    },
    context: Context
  ) => {
    const session = context.executionContext.session()

    try {
      const { fromPersonId, toPersonId } = args

      const result = await session.run(
        `
        MATCH (from:Person {id: $fromPersonId})-[r:CONNECTED_TO]-(to:Person {id: $toPersonId})
        DELETE r
        RETURN count(r) AS deletedCount
        `,
        {
          fromPersonId,
          toPersonId,
        }
      )

      const deletedCount = result.records[0]?.get('deletedCount') ?? 0

      if (deletedCount === 0) {
        return {
          success: false,
          message: 'Connection not found',
        }
      }

      return {
        success: true,
        message: 'Connection deleted successfully',
      }
    } catch (error) {
      console.error('Error deleting person connection:', error)
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to delete connection',
      }
    } finally {
      await session.close()
    }
  },
}
