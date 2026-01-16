import { useMutation } from '@apollo/client/react'
import { CREATE_FIELD_CONTEXT_MUTATION } from '@/app/graphql/mutations'

export function useCreateField() {
  const [createFieldContext, { loading, error }] = useMutation(
    CREATE_FIELD_CONTEXT_MUTATION
  )

  /**
   * Create a new field and optionally link it to a space
   * @param title - The field title/description
   * @param spaceId - Optional space ID to link the field to
   */
  const createField = async (title: string, spaceId?: string) => {
    try {
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      const input: any = {
        title,
        createdAt: new Date().toISOString(),
      }

      // If spaceId is provided, connect the field to that space
      if (spaceId) {
        input.space = {
          connect: [
            {
              where: {
                node: { id_EQ: spaceId },
              },
            },
          ],
        }
      }

      const { data } = await createFieldContext({
        variables: { input: [input] },
      })

      return data?.createFieldContexts.fieldContexts[0]
    } catch (err) {
      console.error('Error creating field:', err)
      throw err
    }
  }

  return {
    createField,
    loading,
    error,
  }
}
